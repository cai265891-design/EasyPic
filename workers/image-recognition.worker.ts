import { Worker } from "bullmq";
import { connection } from "../lib/queues/config";
import { prisma } from "../lib/db";
import { analyzeProductImage, claudeCircuitBreaker } from "../lib/services/claude";
import { downloadImage, validateImage } from "../lib/services/storage";
import { listingGenerationQueue } from "../lib/queues";

interface ImageRecognitionJob {
  workflowId: string;
  imageUrl: string;
  adjustedPrompt?: string;
}

const worker = new Worker<ImageRecognitionJob>(
  "image-recognition",
  async (job) => {
    const { workflowId, imageUrl } = job.data;
    const startTime = Date.now();

    console.log(
      `[图片识别] 开始处理工作流 ${workflowId}, 图片: ${imageUrl}`
    );

    try {
      // 1. 更新状态为处理中
      await prisma.workflowExecution.update({
        where: { id: workflowId },
        data: {
          status: "PROCESSING",
          currentStep: "IMAGE_DOWNLOAD",
        },
      });

      // 2. 下载图片
      job.updateProgress(20);
      const imageBuffer = await downloadImage(imageUrl);
      console.log(`[图片识别] 图片下载完成，大小: ${imageBuffer.length} bytes`);

      // 3. 验证图片
      const validation = await validateImage(imageBuffer);
      if (!validation.valid) {
        throw new Error(`图片验证失败: ${validation.error}`);
      }

      // 4. 更新步骤
      await prisma.workflowExecution.update({
        where: { id: workflowId },
        data: { currentStep: "IMAGE_RECOGNITION" },
      });

      // 5. 调用 Claude Vision API（带熔断器）
      job.updateProgress(50);
      const analysis = await claudeCircuitBreaker.call(() =>
        analyzeProductImage(imageBuffer, imageUrl)
      );

      console.log(
        `[图片识别] AI 分析完成，置信度: ${analysis.confidence.toFixed(2)}`
      );

      // 6. 保存商品记录
      job.updateProgress(80);
      const product = await prisma.product.create({
        data: {
          workflowId,
          imageUrl,
          description: analysis.text,
          keywords: analysis.keywords,
          confidence: analysis.confidence,
        },
      });

      // 7. 更新工作流
      await prisma.workflowExecution.update({
        where: { id: workflowId },
        data: {
          productId: product.id,
          metadata: {
            imageRecognition: {
              completedAt: new Date().toISOString(),
              processingTime: Date.now() - startTime,
              confidence: analysis.confidence,
            },
          },
        },
      });

      // 8. 触发下一步：文案生成
      job.updateProgress(90);
      await listingGenerationQueue.add("generate", {
        workflowId,
        productId: product.id,
      });

      console.log(
        `[图片识别] 工作流 ${workflowId} 完成，用时 ${Date.now() - startTime}ms`
      );

      job.updateProgress(100);
      return {
        success: true,
        productId: product.id,
        confidence: analysis.confidence,
        processingTime: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error(`[图片识别] 工作流 ${workflowId} 失败:`, error);

      // 更新工作流状态为失败
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
    concurrency: 5, // 同时处理 5 个任务
  }
);

worker.on("completed", (job) => {
  console.log(`✅ [图片识别] 任务 ${job.id} 完成`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ [图片识别] 任务 ${job?.id} 失败:`, err.message);
});

worker.on("error", (err) => {
  console.error(`❌ [图片识别] Worker 错误:`, err);
});

console.log("🚀 图片识别 Worker 已启动");

export default worker;
