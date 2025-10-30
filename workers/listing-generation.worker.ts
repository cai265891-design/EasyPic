import { Worker } from "bullmq";
import { connection } from "../lib/queues/config";
import { prisma } from "../lib/db";
import { generateListing, claudeCircuitBreaker } from "../lib/services/claude";
import { downloadImage } from "../lib/services/storage";
import { getImageGenerationQueue } from "../lib/queues";
import { listingGenerationLogger as logger } from "../lib/logger";

interface ListingGenerationJob {
  workflowId: string;
  productId: string;
  adjustments?: {
    tone?: string;
    targetMarket?: string;
    emphasize?: string[];
  };
  userFeedback?: string;
  version?: number;
}

const worker = new Worker<ListingGenerationJob>(
  "listing-generation",
  async (job) => {
    const { workflowId, productId, adjustments, userFeedback, version = 1 } =
      job.data;
    const startTime = Date.now();

    logger.workflowStart(workflowId, { productId, version, jobId: job.id });

    try {
      // 1. 获取商品和工作流数据
      logger.stepStart('查询工作流数据', workflowId);
      const workflow = await prisma.workflowExecution.findUnique({
        where: { id: workflowId },
        include: { product: true },
      });

      if (!workflow || !workflow.product) {
        logger.stepError('查询工作流数据', workflowId, new Error('数据不存在'));
        throw new Error("找不到工作流或商品数据");
      }
      logger.stepComplete('查询工作流数据', workflowId, 0, {
        hasProduct: !!workflow.product,
        category: workflow.category,
        brand: workflow.brand
      });

      // 2. 更新状态
      await prisma.workflowExecution.update({
        where: { id: workflowId },
        data: { currentStep: "LISTING_GENERATION" },
      });
      logger.dbQuery('更新当前步骤为 LISTING_GENERATION', workflowId);

      // 3. 下载图片
      job.updateProgress(20);
      logger.stepStart('下载产品图片', workflowId);
      const downloadStart = Date.now();
      const imageBuffer = await downloadImage(workflow.product.imageUrl);
      logger.stepComplete('下载产品图片', workflowId, Date.now() - downloadStart, {
        size: imageBuffer.length,
        sizeKB: (imageBuffer.length / 1024).toFixed(2)
      });

      // 4. 调用 Claude API 生成文案
      job.updateProgress(40);
      logger.stepStart('调用 Claude API 生成文案', workflowId);
      logger.apiCall('Claude Listing Generation', workflowId, {
        productDescLength: workflow.product!.description.length,
        hasAdjustments: !!adjustments,
        hasFeedback: !!userFeedback
      });

      const apiStart = Date.now();
      const listing = await claudeCircuitBreaker.call(() =>
        generateListing({
          productDescription: workflow.product!.description,
          imageBuffer,
          category: workflow.category || undefined,
          brand: workflow.brand || undefined,
          productName: workflow.productName || undefined,
          features: workflow.features || undefined,
          specifications: workflow.specifications || undefined,
          targetMarket: adjustments?.targetMarket,
          tone: adjustments?.tone,
          emphasize: adjustments?.emphasize,
          userFeedback,
        })
      );
      const apiDuration = Date.now() - apiStart;

      logger.apiResponse('Claude Listing Generation', workflowId, apiDuration, {
        titleLength: listing.title.length,
        bulletPointsCount: listing.bullet_points.length,
        keywordsCount: listing.keywords.length,
        hasImagePrompts: !!(listing.image_prompts && listing.image_prompts.length > 0)
      });
      logger.stepComplete('AI 文案生成', workflowId, apiDuration, {
        title: listing.title.substring(0, 50) + '...'
      });

      // 5. 质量检查
      job.updateProgress(70);
      logger.stepStart('质量评分', workflowId);
      const qualityScore = calculateQualityScore(listing);
      const approved = qualityScore >= 80;
      logger.stepComplete('质量评分', workflowId, 0, {
        score: qualityScore,
        approved,
        status: approved ? '自动通过' : '需要审核'
      });

      // 6. 保存 Listing (包含图片提示词)
      logger.stepStart('保存 Listing 到数据库', workflowId);
      const savedListing = await prisma.listing.create({
        data: {
          productId,
          workflowId,
          title: listing.title,
          description: listing.description,
          bulletPoints: listing.bullet_points,
          keywords: listing.keywords,
          imagePrompts: listing.image_prompts || [], // 保存 AI 生成的图片提示词
          qualityScore,
          approved,
          version,
        },
      });
      logger.dbQuery('创建 Listing 记录', workflowId, { listingId: savedListing.id });
      logger.stepComplete('保存 Listing', workflowId, 0, {
        listingId: savedListing.id,
        imagePromptsCount: (listing.image_prompts || []).length
      });

      // 7. 更新工作流
      logger.stepStart('更新工作流元数据', workflowId);
      await prisma.workflowExecution.update({
        where: { id: workflowId },
        data: {
          listingId: savedListing.id,
          metadata: {
            ...((workflow.metadata as any) || {}),
            listingGeneration: {
              completedAt: new Date().toISOString(),
              processingTime: Date.now() - startTime,
              qualityScore,
              approved,
            },
          },
        },
      });
      logger.dbQuery('更新工作流元数据', workflowId);

      // 8. 触发下一步：图片生成
      job.updateProgress(90);
      logger.stepStart('触发图片生成队列', workflowId);
      const nextJob = await getImageGenerationQueue().add("generate-batch", {
        workflowId,
        listingId: savedListing.id,
        bulletPoints: listing.bullet_points,
        imageUrl: workflow.product.imageUrl,
      });
      logger.queueEvent('添加图片生成任务', workflowId, nextJob.id, {
        listingId: savedListing.id,
        bulletPointsCount: listing.bullet_points.length
      });

      const totalTime = Date.now() - startTime;
      logger.workflowComplete(workflowId, totalTime, {
        listingId: savedListing.id,
        qualityScore,
        approved
      });

      job.updateProgress(100);
      return {
        success: true,
        listingId: savedListing.id,
        qualityScore,
        approved,
        processingTime: totalTime,
      };
    } catch (error: any) {
      logger.workflowError(workflowId, error, {
        processingTime: Date.now() - startTime,
        productId
      });

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
    concurrency: 3,
  }
);

/**
 * 计算 Listing 质量分数
 */
function calculateQualityScore(listing: {
  title: string;
  description: string;
  bullet_points: string[];
  keywords: string[];
}): number {
  let score = 0;

  // 标题检查 (20 分)
  const titleLength = listing.title.length;
  if (titleLength >= 150 && titleLength <= 200) {
    score += 20;
  } else if (titleLength >= 100 && titleLength < 250) {
    score += 15;
  } else {
    score += 5;
  }

  // 描述检查 (20 分)
  const descLength = listing.description.length;
  if (descLength >= 250) {
    score += 20;
  } else if (descLength >= 200) {
    score += 15;
  } else {
    score += 5;
  }

  // 卖点检查 (40 分)
  if (listing.bullet_points.length === 5) {
    score += 10;
    const allValid = listing.bullet_points.every(
      (bp) => bp.length >= 30 && bp.length <= 200
    );
    if (allValid) {
      score += 30;
    } else {
      score += 15;
    }
  }

  // 关键词检查 (10 分)
  if (listing.keywords.length >= 5) {
    score += 10;
  } else if (listing.keywords.length >= 3) {
    score += 5;
  }

  // 合规检查 (10 分) - 检查禁用词
  const bannedWords = ["#1", "best", "perfect", "guarantee", "100%"];
  const hasBannedWords = bannedWords.some(
    (word) =>
      listing.title.toLowerCase().includes(word.toLowerCase()) ||
      listing.description.toLowerCase().includes(word.toLowerCase())
  );

  if (!hasBannedWords) {
    score += 10;
  }

  return Math.min(score, 100);
}

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

logger.success('🚀 文案生成 Worker 已启动', {
  data: { concurrency: 3, queueName: 'listing-generation' }
});

export default worker;
