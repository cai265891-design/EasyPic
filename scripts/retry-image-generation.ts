import { imageGenerationQueue } from "../lib/queues";
import { prisma } from "../lib/db";

/**
 * 手动重新触发图片生成任务
 */
async function retryImageGeneration(workflowId: string) {
  try {
    console.log(`[重试图片] 开始处理工作流 ${workflowId}...`);

    // 1. 查询工作流数据
    const workflow = await prisma.workflowExecution.findUnique({
      where: { id: workflowId },
      include: {
        product: true,
        listing: true,
      },
    });

    if (!workflow) {
      throw new Error(`工作流 ${workflowId} 不存在`);
    }

    if (!workflow.listing) {
      throw new Error(`工作流 ${workflowId} 缺少 Listing 数据`);
    }

    console.log(`[重试图片] 工作流状态: ${workflow.status}`);
    console.log(`[重试图片] Listing ID: ${workflow.listing.id}`);

    // 2. 删除已有的 ImageSet (如果有的话)
    const existingImageSet = await prisma.imageSet.findUnique({
      where: { listingId: workflow.listing.id },
      include: {
        productImages: true,
      },
    });

    if (existingImageSet) {
      console.log(`[重试图片] 删除现有的 ImageSet: ${existingImageSet.id}`);
      await prisma.imageSet.delete({
        where: { id: existingImageSet.id },
      });
    }

    // 3. 重置工作流状态为 PROCESSING
    await prisma.workflowExecution.update({
      where: { id: workflowId },
      data: {
        status: "PROCESSING",
        currentStep: "IMAGE_SET_GENERATION",
        error: null,
      },
    });

    // 4. 创建新的图片生成任务
    const job = await imageGenerationQueue.add("generate-batch", {
      workflowId,
      listingId: workflow.listing.id,
      bulletPoints: workflow.listing.bulletPoints,
      imageUrl: workflow.imageUrl,
      brand: workflow.brand || undefined,
      version: workflow.version,
    });

    console.log(`✅ [重试图片] 图片生成任务已创建: ${job.id}`);
    console.log(`[重试图片] 请查看 worker 日志以跟踪进度`);
  } catch (error: any) {
    console.error(`❌ [重试图片] 失败:`, error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 从命令行参数获取 workflowId
const workflowId = process.argv[2];

if (!workflowId) {
  console.error("用法: tsx scripts/retry-image-generation.ts <workflowId>");
  process.exit(1);
}

retryImageGeneration(workflowId);
