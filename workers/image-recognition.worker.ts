import { Worker } from "bullmq";
import { connection } from "../lib/queues/config";
import { prisma } from "../lib/db";
import { analyzeProductImage, claudeCircuitBreaker } from "../lib/services/claude";
import { downloadImage, validateImage, uploadProductImage } from "../lib/services/storage";
import { getListingGenerationQueue } from "../lib/queues";
import { imageRecognitionLogger as logger } from "../lib/logger";

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

    logger.workflowStart(workflowId, { imageUrl, jobId: job.id });

    try {
      // 1. 更新状态为处理中
      logger.stepStart('更新工作流状态', workflowId);
      await prisma.workflowExecution.update({
        where: { id: workflowId },
        data: {
          status: "PROCESSING",
          currentStep: "IMAGE_DOWNLOAD",
        },
      });
      logger.dbQuery('更新工作流状态为 PROCESSING', workflowId);

      // 2. 下载图片
      job.updateProgress(20);
      logger.stepStart('下载图片', workflowId, { imageUrl });
      const stepStart = Date.now();
      const imageBuffer = await downloadImage(imageUrl);
      logger.stepComplete('下载图片', workflowId, Date.now() - stepStart, {
        size: imageBuffer.length,
        sizeKB: (imageBuffer.length / 1024).toFixed(2)
      });

      // 3. 验证图片
      logger.stepStart('验证图片', workflowId);
      const validation = await validateImage(imageBuffer);
      if (!validation.valid) {
        logger.stepError('验证图片', workflowId, new Error(validation.error || '未知错误'));
        throw new Error(`图片验证失败: ${validation.error}`);
      }
      logger.stepComplete('验证图片', workflowId, 0, {
        format: validation.metadata?.format,
        width: validation.metadata?.width,
        height: validation.metadata?.height
      });

      // 4. 更新步骤
      await prisma.workflowExecution.update({
        where: { id: workflowId },
        data: { currentStep: "IMAGE_RECOGNITION" },
      });
      logger.dbQuery('更新当前步骤为 IMAGE_RECOGNITION', workflowId);

      // 5. 调用 Claude Vision API（带熔断器）
      job.updateProgress(50);
      logger.stepStart('调用 Claude Vision API', workflowId);
      logger.apiCall('Claude Vision', workflowId, { imageSize: imageBuffer.length });

      const apiStart = Date.now();
      const analysis = await claudeCircuitBreaker.call(() =>
        analyzeProductImage(imageBuffer, imageUrl)
      );
      const apiDuration = Date.now() - apiStart;

      logger.apiResponse('Claude Vision', workflowId, apiDuration, {
        confidence: analysis.confidence,
        keywordsCount: analysis.keywords.length,
        descriptionLength: analysis.text.length
      });
      logger.stepComplete('AI 图片分析', workflowId, apiDuration, {
        confidence: analysis.confidence.toFixed(2)
      });

      // 6. 上传原图到 R2/S3，获取公网 URL
      job.updateProgress(70);
      let publicImageUrl: string | undefined;

      try {
        logger.stepStart('上传图片到 R2', workflowId);

        const userId = (await prisma.workflowExecution.findUnique({
          where: { id: workflowId },
          select: { userId: true }
        }))?.userId || 'unknown';

        const uploadPath = `uploads/${userId}/${workflowId}/original`;
        const uploadStart = Date.now();
        const uploadResult = await uploadProductImage(imageBuffer, uploadPath, {
          generateThumbnail: false, // 原图不需要缩略图
          resize: { width: 2000, height: 2000 },
        });

        publicImageUrl = uploadResult.imageUrl;
        logger.stepComplete('上传图片到 R2', workflowId, Date.now() - uploadStart, {
          url: publicImageUrl,
          path: uploadPath
        });
      } catch (uploadError: any) {
        logger.warn('上传图片到 R2 失败，将使用本地 URL', {
          workflowId,
          error: uploadError,
          data: { message: '图片生成可能无法使用参考图' }
        });
      }

      // 7. 保存商品记录
      job.updateProgress(80);
      logger.stepStart('保存商品记录到数据库', workflowId);
      const product = await prisma.product.create({
        data: {
          workflowId,
          imageUrl,
          publicImageUrl, // 保存公网 URL
          description: analysis.text,
          keywords: analysis.keywords,
          confidence: analysis.confidence,
        },
      });
      logger.dbQuery('创建 Product 记录', workflowId, { productId: product.id });
      logger.stepComplete('保存商品记录', workflowId, 0, { productId: product.id });

      // 8. 更新工作流
      logger.stepStart('更新工作流元数据', workflowId);
      await prisma.workflowExecution.update({
        where: { id: workflowId },
        data: {
          productId: product.id,
          metadata: {
            imageRecognition: {
              completedAt: new Date().toISOString(),
              processingTime: Date.now() - startTime,
              confidence: analysis.confidence,
              publicImageUrl, // 记录公网 URL
            },
          },
        },
      });
      logger.dbQuery('更新工作流元数据', workflowId);

      // 9. 触发下一步：文案生成
      job.updateProgress(90);
      logger.stepStart('触发文案生成队列', workflowId);
      const nextJob = await getListingGenerationQueue().add("generate", {
        workflowId,
        productId: product.id,
      });
      logger.queueEvent('添加文案生成任务', workflowId, nextJob.id, { productId: product.id });

      const totalTime = Date.now() - startTime;
      logger.workflowComplete(workflowId, totalTime, {
        productId: product.id,
        confidence: analysis.confidence,
        publicImageUrl
      });

      job.updateProgress(100);
      return {
        success: true,
        productId: product.id,
        confidence: analysis.confidence,
        processingTime: totalTime,
      };
    } catch (error: any) {
      logger.workflowError(workflowId, error, {
        processingTime: Date.now() - startTime,
        imageUrl
      });

      // 更新工作流状态为失败
      try {
        await prisma.workflowExecution.update({
          where: { id: workflowId },
          data: {
            status: "FAILED",
            error: error.message || String(error),
          },
        });
        logger.dbQuery('更新工作流状态为 FAILED', workflowId);
      } catch (dbError: any) {
        logger.error('更新失败状态时数据库错误', { workflowId, error: dbError });
      }

      throw error;
    }
  },
  {
    connection: connection(),
    concurrency: 5, // 同时处理 5 个任务
  }
);

worker.on("completed", (job) => {
  logger.queueEvent('任务完成', job.data.workflowId, job.id, {
    returnValue: job.returnvalue
  });
});

worker.on("failed", (job, err) => {
  logger.queueEvent('任务失败', job?.data?.workflowId || 'unknown', job?.id, {
    error: err.message,
    stack: err.stack
  });
});

worker.on("error", (err) => {
  logger.error('Worker 内部错误', { error: err });
});

logger.success('🚀 图片识别 Worker 已启动', {
  data: { concurrency: 5, queueName: 'image-recognition' }
});

export default worker;
