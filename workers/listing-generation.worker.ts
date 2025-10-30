import { Worker } from "bullmq";
import { connection } from "../lib/queues/config";
import { prisma } from "../lib/db";
import { generateListing, claudeCircuitBreaker } from "../lib/services/claude";
import { downloadImage } from "../lib/services/storage";
import { imageGenerationQueue } from "../lib/queues";

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

    console.log(`[文案生成] 开始处理工作流 ${workflowId}`);

    try {
      // 1. 获取商品和工作流数据
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
        data: { currentStep: "LISTING_GENERATION" },
      });

      // 3. 下载图片
      job.updateProgress(20);
      const imageBuffer = await downloadImage(workflow.product.imageUrl);

      // 4. 调用 Claude API 生成文案
      job.updateProgress(40);
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

      console.log(`[文案生成] AI 生成完成，标题: ${listing.title.substring(0, 50)}...`);

      // 5. 质量检查
      job.updateProgress(70);
      const qualityScore = calculateQualityScore(listing);
      const approved = qualityScore >= 80;

      console.log(
        `[文案生成] 质量评分: ${qualityScore}/100, ${approved ? "自动通过" : "需要审核"}`
      );

      // 6. 保存 Listing (包含图片提示词)
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

      // 7. 更新工作流
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

      // 8. 触发下一步：图片生成
      job.updateProgress(90);
      await imageGenerationQueue.add("generate-batch", {
        workflowId,
        listingId: savedListing.id,
        bulletPoints: listing.bullet_points,
        imageUrl: workflow.product.imageUrl,
      });

      console.log(
        `[文案生成] 工作流 ${workflowId} 完成，用时 ${Date.now() - startTime}ms`
      );

      job.updateProgress(100);
      return {
        success: true,
        listingId: savedListing.id,
        qualityScore,
        approved,
        processingTime: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error(`[文案生成] 工作流 ${workflowId} 失败:`, error);

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
  console.log(`✅ [文案生成] 任务 ${job.id} 完成`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ [文案生成] 任务 ${job?.id} 失败:`, err.message);
});

console.log("🚀 文案生成 Worker 已启动");

export default worker;
