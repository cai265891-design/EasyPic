import { config } from 'dotenv';
import { resolve } from 'path';
import { prisma } from '../lib/db';

config({ path: resolve(process.cwd(), '.env.local') });

async function getWorkflowData() {
  const workflowId = process.argv[2] || 'cmhd4bdvf0003136201ibwjtg';

  const workflow = await prisma.workflowExecution.findUnique({
    where: { id: workflowId },
    include: {
      product: true,
      listing: true,
    },
  });

  if (!workflow) {
    console.log('工作流未找到');
    return;
  }

  console.log('='.repeat(80));
  console.log('工作流基本信息');
  console.log('='.repeat(80));
  console.log('工作流 ID:', workflow.id);
  console.log('状态:', workflow.status);
  console.log('当前步骤:', workflow.currentStep);
  console.log('创建时间:', workflow.createdAt);
  console.log('品牌:', workflow.brand || '无');
  console.log('分类:', workflow.category || '无');
  console.log('原始图片 URL:', workflow.imageUrl);
  console.log('');

  console.log('='.repeat(80));
  console.log('1. 图片识别结果 (Product)');
  console.log('='.repeat(80));
  if (workflow.product) {
    console.log('Product ID:', workflow.product.id);
    console.log('原始图片 URL:', workflow.product.imageUrl);
    console.log('R2 公网 URL:', workflow.product.publicImageUrl || '无');
    console.log('置信度:', ((workflow.product.confidence || 0) * 100).toFixed(2) + '%');
    console.log('');
    console.log('商品描述:');
    console.log(workflow.product.description);
    console.log('');
    console.log('关键词:');
    console.log(JSON.stringify(workflow.product.keywords, null, 2));
  } else {
    console.log('商品数据不存在');
  }
  console.log('');

  console.log('='.repeat(80));
  console.log('2. 文案生成结果 (Listing)');
  console.log('='.repeat(80));
  if (workflow.listing) {
    console.log('Listing ID:', workflow.listing.id);
    console.log('质量评分:', workflow.listing.qualityScore + '/100');
    console.log('');
    console.log('标题 (Title):');
    console.log(workflow.listing.title);
    console.log('');
    console.log('商品描述 (Description):');
    console.log(workflow.listing.description);
    console.log('');
    console.log('卖点 (Bullet Points):');
    const bulletPoints = workflow.listing.bulletPoints as string[];
    bulletPoints.forEach((point, index) => {
      console.log(`  ${index + 1}. ${point}`);
    });
    console.log('');
    console.log('关键词 (Keywords):');
    console.log(JSON.stringify(workflow.listing.keywords, null, 2));
    console.log('');
    console.log('图片提示词 (Image Prompts):');
    const imagePrompts = workflow.listing.imagePrompts as string[];
    if (imagePrompts && imagePrompts.length > 0) {
      imagePrompts.forEach((prompt, index) => {
        console.log(`\n  === 提示词 ${index + 1} ===`);
        console.log(`  ${prompt}`);
      });
    } else {
      console.log('  无');
    }
  } else {
    console.log('Listing 数据不存在');
  }
  console.log('');

  console.log('='.repeat(80));
  console.log('工作流元数据 (Metadata)');
  console.log('='.repeat(80));
  if (workflow.metadata) {
    console.log(JSON.stringify(workflow.metadata, null, 2));
  } else {
    console.log('无元数据');
  }

  await prisma.$disconnect();
}

getWorkflowData().catch(console.error);
