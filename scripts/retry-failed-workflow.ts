import { imageGenerationQueue } from "../lib/queues";
import { prisma } from "../lib/db";

/**
 * 手动重新触发失败的图片生成任务
 */
async function retryFailedWorkflow(workflowId: string) {
  try {
    console.log(`[重试] 开始处理工作流 ${workflowId}...`);

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

    console.log(`[重试] 工作流状态: ${workflow.status}`);
    console.log(`[重试] Listing ID: ${workflow.listing.id}`);

    // 2. 重置工作流状态为 PROCESSING
    await prisma.workflowExecution.update({
      where: { id: workflowId },
      data: {
        status: "PROCESSING",
        currentStep: "IMAGE_SET_GENERATION",
        error: null,
      },
    });

    // 3. 创建新的图片生成任务
    const job = await imageGenerationQueue.add(
      `image-generation-${workflowId}`,
      {
        workflowId,
        listingId: workflow.listing.id,
        bulletPoints: workflow.listing.bulletPoints,
        imageUrl: workflow.imageUrl,
        brand: workflow.brand || undefined,
        version: workflow.version,
      }
    );

    console.log(`✅ [重试] 图片生成任务已创建: ${job.id}`);
    console.log(`[重试] 请查看 worker 日志以跟踪进度`);
  } catch (error: any) {
    console.error(`❌ [重试] 失败:`, error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 从命令行参数获取 workflowId
const workflowId = process.argv[2];

if (!workflowId) {
  console.error("用法: tsx scripts/retry-failed-workflow.ts <workflowId>");
  process.exit(1);
}

retryFailedWorkflow(workflowId);
