import { config } from 'dotenv';
import { resolve } from 'path';
import { prisma } from '../lib/db';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') });

async function checkWorkflowStatus() {
  console.log('使用数据库:', process.env.DATABASE_URL || '未设置');
  console.log('');

  const targetId = process.argv[2];

  let workflows;
  if (targetId) {
    console.log(`🔍 查询特定工作流: ${targetId}\n`);
    const workflow = await prisma.workflowExecution.findUnique({
      where: { id: targetId },
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

    if (!workflow) {
      console.log(`❌ 未找到工作流: ${targetId}`);
      await prisma.$disconnect();
      return;
    }

    workflows = [workflow];
  } else {
    console.log('📋 查询最近 3 个工作流\n');
    workflows = await prisma.workflowExecution.findMany({
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
  }

  for (const wf of workflows) {
    console.log('='.repeat(80));
    console.log(`Workflow ID: ${wf.id}`);
    console.log(`Status: ${wf.status}`);
    console.log(`Current Step: ${wf.currentStep}`);
    console.log(`Created: ${wf.createdAt}`);
    console.log(`Product ID: ${wf.productId}`);
    console.log(`Listing ID: ${wf.listingId}`);

    if (wf.listing) {
      console.log(`Listing imagePrompts count: ${(wf.listing.imagePrompts as string[] || []).length}`);

      if (wf.listing.imageSet) {
        console.log(`ImageSet ID: ${wf.listing.imageSet.id}`);
        console.log(`ImageSet Status: ${wf.listing.imageSet.status}`);
        console.log(`Product Images Count: ${wf.listing.imageSet.productImages.length}`);

        wf.listing.imageSet.productImages.forEach((img, idx) => {
          console.log(`  Image ${idx + 1}:`);
          console.log(`    URL: ${img.imageUrl}`);
          console.log(`    Active: ${img.isActive}`);
        });
      } else {
        console.log('No ImageSet found');
      }
    } else {
      console.log('No Listing found');
    }

    if (wf.error) {
      console.log(`Error: ${wf.error}`);
    }
  }

  await prisma.$disconnect();
}

checkWorkflowStatus().catch(console.error);
