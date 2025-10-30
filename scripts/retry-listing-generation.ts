import { listingGenerationQueue } from "../lib/queues";
import { prisma } from "../lib/db";

/**
 * 手动重新触发失败的文案生成任务
 */
async function retryListingGeneration(workflowId: string) {
  try {
    console.log(`[重试文案] 开始处理工作流 ${workflowId}...`);

    // 1. 查询工作流数据
    const workflow = await prisma.workflowExecution.findUnique({
      where: { id: workflowId },
      include: {
        product: true,
      },
    });

    if (!workflow) {
      throw new Error(`工作流 ${workflowId} 不存在`);
    }

    if (!workflow.product) {
      throw new Error(`工作流 ${workflowId} 缺少 Product 数据`);
    }

    console.log(`[重试文案] 工作流状态: ${workflow.status}`);
    console.log(`[重试文案] Product ID: ${workflow.product.id}`);

    // 2. 重置工作流状态为 PROCESSING
    await prisma.workflowExecution.update({
      where: { id: workflowId },
      data: {
        status: "PROCESSING",
        currentStep: "LISTING_GENERATION",
        error: null,
      },
    });

    // 3. 创建新的文案生成任务
    const job = await listingGenerationQueue.add("generate-listing", {
      workflowId,
      productId: workflow.product.id,
      version: workflow.version,
    });

    console.log(`✅ [重试文案] 文案生成任务已创建: ${job.id}`);
    console.log(`[重试文案] 请查看 worker 日志以跟踪进度`);
  } catch (error: any) {
    console.error(`❌ [重试文案] 失败:`, error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 从命令行参数获取 workflowId
const workflowId = process.argv[2];

if (!workflowId) {
  console.error("用法: tsx scripts/retry-listing-generation.ts <workflowId>");
  process.exit(1);
}

retryListingGeneration(workflowId);
