import { Worker } from "bullmq";
import { connection } from "../lib/queues/config";
import { prisma } from "../lib/db";
import {
  generateProductImages,
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
      // 1. 获取工作流和商品数据
      const workflow = await prisma.workflowExecution.findUnique({
        where: { id: workflowId },
        include: { product: true },
      });

      if (!workflow || !workflow.product) {
        throw new Error("找不到工作流或商品数据");
      }

      // 2. 更新状态
      await prisma.workflowExecution.update({
        where: { id: workflowId },
        data: { currentStep: "IMAGE_SET_GENERATION" },
      });

      // 3. 调用 AI 批量生成 5 张图片
      job.updateProgress(20);
      console.log(`[图片生成] 开始生成 5 张商品图片...`);

      const generatedImages = await claudeCircuitBreaker.call(() =>
        generateProductImages({
          productDescription: workflow.product!.description,
          bulletPoints,
          brand: brand || workflow.brand || undefined,
          style: "professional Amazon product photography",
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

      for (let i = 0; i < generatedImages.length; i++) {
        const generated = generatedImages[i];
        console.log(`[图片生成] 处理第 ${i + 1}/5 张图片...`);

        try {
          // 下载 AI 生成的图片
          const imageBuffer = await downloadImage(generated.imageUrl);

          // 上传到 S3/R2
          const path = `products/${workflowId}/images/v${version}-${i}`;
          const uploaded = await uploadProductImage(imageBuffer, path, {
            generateThumbnail: true,
            resize: { width: 2000, height: 2000 },
          });

          uploadedImages.push({
            imageUrl: uploaded.imageUrl,
            thumbnailUrl: uploaded.thumbnailUrl,
            prompt: generated.prompt,
            index: i,
          });

          // 保存 ProductImage 记录
          await prisma.productImage.create({
            data: {
              imageSetId: imageSet.id,
              imageUrl: uploaded.imageUrl,
              thumbnailUrl: uploaded.thumbnailUrl,
              prompt: generated.prompt,
              index: i,
            },
          });

          job.updateProgress(50 + (i + 1) * 8); // 50% → 90%
        } catch (error: any) {
          console.error(`[图片生成] 第 ${i + 1} 张图片处理失败:`, error.message);
          // 继续处理其他图片，不中断整个流程
        }
      }

      console.log(
        `[图片生成] 成功上传 ${uploadedImages.length}/${generatedImages.length} 张图片`
      );

      // 6. 更新工作流状态为完成
      job.updateProgress(95);
      await prisma.workflowExecution.update({
        where: { id: workflowId },
        data: {
          imageSetId: imageSet.id,
          status: "COMPLETED",
          currentStep: "IMAGE_SET_GENERATION",
          metadata: {
            ...((workflow.metadata as any) || {}),
            imageGeneration: {
              completedAt: new Date().toISOString(),
              processingTime: Date.now() - startTime,
              imagesGenerated: uploadedImages.length,
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
      console.error(`[图片生成] 工作流 ${workflowId} 失败:`, error);

      await prisma.workflowExecution.update({
        where: { id: workflowId },
        data: {
          status: "FAILED",
          error: error.message || String(error),
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
