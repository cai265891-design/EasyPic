import { prisma } from '../lib/db';

async function debugWorkflow() {
  try {
    console.log('使用数据库:', process.env.DATABASE_URL || '未设置');
    console.log('正在查询最近的工作流...\n');

    const workflows = await prisma.workflowExecution.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        product: true,
        listing: {
          include: {
            imageSet: {
              include: {
                productImages: {
                  orderBy: { index: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    if (workflows.length === 0) {
      console.log('❌ 数据库中没有工作流记录');
      return;
    }

    for (const wf of workflows) {
      console.log('='.repeat(80));
      console.log(`📋 Workflow ID: ${wf.id}`);
      console.log(`📊 Status: ${wf.status}`);
      console.log(`🔄 Current Step: ${wf.currentStep}`);
      console.log(`📅 Created: ${wf.createdAt.toISOString()}`);
      console.log(`🏷️  Product ID: ${wf.productId || 'N/A'}`);
      console.log(`📝 Listing ID: ${wf.listingId || 'N/A'}`);

      // 错误信息
      if (wf.error) {
        console.log(`\n❌ Error: ${wf.error}`);
      }

      // Metadata
      if (wf.metadata && typeof wf.metadata === 'object') {
        console.log(`\n📦 Metadata:`, JSON.stringify(wf.metadata, null, 2));
      }

      // Listing 信息
      if (wf.listing) {
        const imagePrompts = wf.listing.imagePrompts as string[] || [];
        console.log(`\n📝 Listing imagePrompts count: ${imagePrompts.length}`);

        if (wf.listing.imageSet) {
          console.log(`\n🖼️  ImageSet ID: ${wf.listing.imageSet.id}`);
          console.log(`   Status: ${wf.listing.imageSet.status}`);
          console.log(`   Product Images Count: ${wf.listing.imageSet.productImages.length}`);

          if (wf.listing.imageSet.productImages.length > 0) {
            console.log(`\n   Images:`);
            wf.listing.imageSet.productImages.forEach((img, idx) => {
              console.log(`     ${idx + 1}. URL: ${img.imageUrl.substring(0, 80)}...`);
              console.log(`        Active: ${img.isActive}, Index: ${img.index}`);
            });
          } else {
            console.log(`   ⚠️  没有生成的图片!`);
          }
        } else {
          console.log(`\n⚠️  No ImageSet found`);
        }
      } else {
        console.log(`\n⚠️  No Listing found`);
      }

      console.log('');
    }

    console.log('='.repeat(80));
    console.log('✅ 查询完成');

  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugWorkflow();
