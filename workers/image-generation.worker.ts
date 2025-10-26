import { Worker } from "bullmq";
import { connection } from "../lib/queues/config";
import { prisma } from "../lib/db";
import {
  generateProductImages,
  generateProductImage, // 单张图片生成函数
  claudeCircuitBreaker,
} from "../lib/services/claude";
import { downloadImage, uploadProductImage } from "../lib/services/storage";

interface ImageGenerationJob {
  workflowId: string;
  listingId: string;
  bulletPoints: string[];
  imageUrl: string;
  brand?: string;
  version?: number;
}

const worker = new Worker<ImageGenerationJob>(
  "image-generation",
  async (job) => {
    const { workflowId, listingId, bulletPoints, imageUrl, brand, version = 1 } =
      job.data;
    const startTime = Date.now();

    console.log(`[图片生成] 开始处理工作流 ${workflowId}`);

    try {
      // 1. 获取工作流、商品和 Listing 数据
      const workflow = await prisma.workflowExecution.findUnique({
        where: { id: workflowId },
        include: {
          product: true,
          listing: true, // 获取 Listing 数据(包含 AI 生成的图片提示词)
        },
      });

      if (!workflow || !workflow.product) {
        throw new Error("找不到工作流或商品数据");
      }

      if (!workflow.listing) {
        throw new Error("找不到 Listing 数据,请先完成文案生成");
      }

      // 2. 更新状态
      await prisma.workflowExecution.update({
        where: { id: workflowId },
        data: { currentStep: "IMAGE_SET_GENERATION" },
      });

      // 3. 获取 AI 生成的图片提示词
      const imagePrompts = workflow.listing.imagePrompts as string[] || [];

      if (imagePrompts.length === 0) {
        console.warn("[图片生成] 警告: Listing 中没有图片提示词,使用默认生成方式");
      } else {
        console.log(`[图片生成] 使用 AI 生成的 ${imagePrompts.length} 个图片提示词`);
      }

      // 4. 调用 AI 批量生成 5 张图片
      job.updateProgress(20);
      console.log(`[图片生成] 开始生成 5 张商品图片...`);

      // 优先使用公网 URL (publicImageUrl),如果不存在则回退到本地 URL
      const referenceImageUrl = workflow.product!.publicImageUrl || imageUrl;

      // 检查是否是本地地址
      const isLocalUrl = referenceImageUrl.includes('localhost') || referenceImageUrl.includes('127.0.0.1');
      if (isLocalUrl) {
        console.warn(`[图片生成] ⚠️  检测到本地图片 URL: ${referenceImageUrl}`);
        console.warn(`[图片生成] ⚠️  API 无法访问本地地址,将不传递参考图片`);
      } else {
        console.log(`[图片生成] ✅ 使用公网参考图片: ${referenceImageUrl.substring(0, 80)}...`);
      }

      // 如果是本地 URL,不传递给 API(API 无法访问 localhost)
      const finalReferenceUrl = isLocalUrl ? undefined : referenceImageUrl;

      // 如果有 AI 生成的 prompts,直接使用;否则回退到默认生成方式
      const generatedImages = imagePrompts.length > 0
        ? await Promise.all(
            imagePrompts.map((prompt) =>
              claudeCircuitBreaker.call(() =>
                generateProductImage(prompt, finalReferenceUrl) // 使用公网 URL
              )
            )
          )
        : await claudeCircuitBreaker.call(() =>
            generateProductImages({
              productDescription: workflow.product!.description,
              bulletPoints,
              brand: brand || workflow.brand || undefined,
              style: "professional Amazon product photography",
              referenceImageUrl: finalReferenceUrl, // 使用公网 URL
            })
          );

      console.log(
        `[图片生成] AI 生成完成，共 ${generatedImages.length} 张图片`
      );

      // 4. 创建 ImageSet 记录
      job.updateProgress(40);
      const imageSet = await prisma.imageSet.create({
        data: {
          listingId,
          jobId: job.id!,
          version,
        },
      });

      // 5. 下载 AI 生成的图片并上传到 S3/R2
      job.updateProgress(50);
      const uploadedImages: {
        imageUrl: string;
        thumbnailUrl: string;
        prompt: string;
        index: number;
      }[] = [];

      const failedImages: { index: number; error: string }[] = [];

      for (let i = 0; i < generatedImages.length; i++) {
        const generated = generatedImages[i];
        console.log(`[图片生成] 处理第 ${i + 1}/5 张图片...`);

        try {
          // 验证 imageUrl 是否有效
          if (!generated.imageUrl || generated.imageUrl.trim() === "") {
            throw new Error(`AI 返回的图片 URL 为空`);
          }

          // 临时方案:直接使用 AI 生成的图片 URL,跳过 S3 上传
          // TODO: 配置 S3/R2 后再启用上传功能

          // 保存 ProductImage 记录
          await prisma.productImage.create({
            data: {
              imageSetId: imageSet.id,
              imageUrl: generated.imageUrl,
              thumbnailUrl: generated.imageUrl,
              prompt: generated.prompt,
              bulletPoint: bulletPoints[i] || "",
              style: "professional Amazon product photography",
              index: i,
            },
          });

          // 数据库保存成功后再添加到数组
          uploadedImages.push({
            imageUrl: generated.imageUrl,
            thumbnailUrl: generated.imageUrl, // 暂时使用原图作为缩略图
            prompt: generated.prompt,
            index: i,
          });

          job.updateProgress(50 + (i + 1) * 8); // 50% → 90%
        } catch (error: any) {
          const errorMsg = error.message || String(error);
          console.error(`[图片生成] 第 ${i + 1} 张图片处理失败:`, errorMsg);
          console.error(`[图片生成] 错误详情:`, error);
          console.error(`[图片生成] 错误堆栈:`, error.stack);
          failedImages.push({ index: i, error: errorMsg });
        }
      }

      console.log(
        `[图片生成] 成功上传 ${uploadedImages.length}/${generatedImages.length} 张图片`
      );

      // 如果所有图片都失败,抛出错误
      if (uploadedImages.length === 0) {
        const errorMsg = `所有图片生成失败: ${failedImages.map(f => `图片${f.index + 1}: ${f.error}`).join("; ")}`;
        console.error(`[图片生成] ${errorMsg}`);
        throw new Error(errorMsg);
      }

      // 6. 更新 ImageSet 状态为完成
      const imageSetStatus = uploadedImages.length === generatedImages.length ? "completed" : "partial";
      await prisma.imageSet.update({
        where: { id: imageSet.id },
        data: {
          status: imageSetStatus,
        },
      });

      // 7. 更新工作流状态为完成
      job.updateProgress(95);
      await prisma.workflowExecution.update({
        where: { id: workflowId },
        data: {
          status: "COMPLETED",
          currentStep: "IMAGE_SET_GENERATION",
          error: failedImages.length > 0
            ? `部分图片生成失败 (${uploadedImages.length}/${generatedImages.length} 成功): ${failedImages.map(f => `图片${f.index + 1}`).join(", ")}`
            : null,
          metadata: {
            ...((workflow.metadata as any) || {}),
            imageGeneration: {
              completedAt: new Date().toISOString(),
              processingTime: Date.now() - startTime,
              imagesGenerated: uploadedImages.length,
              imagesFailed: failedImages.length,
              failedDetails: failedImages,
            },
          },
        },
      });

      console.log(
        `[图片生成] 工作流 ${workflowId} 完成，用时 ${Date.now() - startTime}ms`
      );

      job.updateProgress(100);
      return {
        success: true,
        imageSetId: imageSet.id,
        imagesGenerated: uploadedImages.length,
        processingTime: Date.now() - startTime,
      };
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      console.error(`[图片生成] 工作流 ${workflowId} 失败:`, errorMsg);
      console.error(`[图片生成] 完整错误:`, error);

      // 区分不同类型的错误
      let errorType = "UNKNOWN";
      if (errorMsg.includes("Circuit breaker")) {
        errorType = "CIRCUIT_BREAKER";
      } else if (errorMsg.includes("API 请求失败")) {
        errorType = "API_REQUEST_ERROR";
      } else if (errorMsg.includes("未返回图片 URL")) {
        errorType = "INVALID_RESPONSE";
      } else if (errorMsg.includes("超时")) {
        errorType = "TIMEOUT";
      }

      await prisma.workflowExecution.update({
        where: { id: workflowId },
        data: {
          status: "FAILED",
          error: `[${errorType}] ${errorMsg}`,
        },
      });

      throw error;
    }
  },
  {
    connection,
    concurrency: 2, // 同时处理 2 个任务（图片生成较耗时）
  }
);

worker.on("completed", (job) => {
  console.log(`✅ [图片生成] 任务 ${job.id} 完成`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ [图片生成] 任务 ${job?.id} 失败:`, err.message);
});

worker.on("error", (err) => {
  console.error(`❌ [图片生成] Worker 错误:`, err);
});

console.log("🚀 图片生成 Worker 已启动");

export default worker;
