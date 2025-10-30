/**
 * 测试完整工作流 + R2 图片上传
 *
 * 测试流程:
 * 1. 图片识别 - 下载图片并上传到 R2
 * 2. 文案生成 - 生成 Amazon listing
 * 3. 图片生成 - 使用 R2 公网 URL 作为参考图片
 *
 * 使用方法:
 * npx tsx scripts/test-workflow-with-r2.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { prisma } from '../lib/db';
import { imageRecognitionQueue } from '../lib/queues';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env.local') });

// 测试图片 URL (一个公开可访问的商品图片)
const TEST_IMAGE_URL = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';

async function testWorkflowWithR2() {
  console.log('=== 工作流 + R2 集成测试 ===\n');

  try {
    // 1. 创建工作流记录
    console.log('📋 步骤 1: 创建工作流记录...');
    const workflow = await prisma.workflowExecution.create({
      data: {
        userId: 'test-user-r2',
        imageUrl: TEST_IMAGE_URL,
        brand: 'Test Brand',
        category: 'Electronics',
        status: 'PENDING',
      },
    });
    console.log(`✅ 工作流已创建: ${workflow.id}\n`);

    // 2. 提交图片识别任务
    console.log('📋 步骤 2: 提交图片识别任务...');
    const job = await imageRecognitionQueue.add('recognize', {
      workflowId: workflow.id,
      imageUrl: TEST_IMAGE_URL,
    });
    console.log(`✅ 任务已提交: ${job.id}\n`);

    // 3. 监控工作流进度
    console.log('📋 步骤 3: 监控工作流进度...');
    console.log('💡 提示: 请启动 workers 来处理任务 (pnpm workers)\n');
    console.log('监控命令:');
    console.log(`   watch -n 2 "npx tsx scripts/check-workflow-status.ts ${workflow.id}"\n`);

    // 4. 等待 5 秒后检查一次状态
    console.log('⏳ 等待 5 秒后检查状态...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const updatedWorkflow = await prisma.workflowExecution.findUnique({
      where: { id: workflow.id },
      include: {
        product: true,
        listing: true,
      },
    });

    if (!updatedWorkflow) {
      throw new Error('工作流记录未找到');
    }

    console.log('📊 当前状态:');
    console.log(`   状态: ${updatedWorkflow.status}`);
    console.log(`   当前步骤: ${updatedWorkflow.currentStep || 'PENDING'}`);
    console.log(`   错误信息: ${updatedWorkflow.error || '无'}\n`);

    if (updatedWorkflow.product) {
      console.log('✅ 图片识别已完成');
      console.log(`   原始 URL: ${updatedWorkflow.product.imageUrl.substring(0, 60)}...`);
      console.log(`   R2 公网 URL: ${updatedWorkflow.product.publicImageUrl?.substring(0, 60)}...`);
      console.log(`   置信度: ${(updatedWorkflow.product.confidence || 0) * 100}%\n`);

      // 验证 R2 URL 是否可访问
      if (updatedWorkflow.product.publicImageUrl) {
        console.log('🔍 验证 R2 图片是否可访问...');
        try {
          const response = await fetch(updatedWorkflow.product.publicImageUrl);
          if (response.ok) {
            console.log('✅ R2 图片可访问\n');
          } else {
            console.error(`❌ R2 图片访问失败: ${response.status}\n`);
          }
        } catch (error: any) {
          console.error(`❌ R2 图片访问错误: ${error.message}\n`);
        }
      }
    }

    if (updatedWorkflow.listing) {
      console.log('✅ 文案生成已完成');
      console.log(`   标题: ${updatedWorkflow.listing.title.substring(0, 60)}...`);
      console.log(`   卖点数量: ${updatedWorkflow.listing.bulletPoints.length}\n`);
    }

    console.log('=== 测试提交成功 ===');
    console.log(`🆔 工作流 ID: ${workflow.id}`);
    console.log('\n后续步骤:');
    console.log('1. 启动 workers: pnpm workers');
    console.log(`2. 查看工作流状态: npx tsx scripts/check-workflow-status.ts ${workflow.id}`);
    console.log('3. 检查 R2 控制台,确认图片已上传到 uploads/ 目录\n');

  } catch (error: any) {
    console.error('\n❌ 测试失败:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行测试
testWorkflowWithR2().catch((error) => {
  console.error('\n💥 未捕获的错误:');
  console.error(error);
  process.exit(1);
});
