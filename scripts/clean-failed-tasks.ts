/**
 * 清理失败任务
 * 删除 Redis 队列中所有 FAILED 状态的任务
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { Queue } from 'bullmq';
import { connection } from '../lib/queues/config';

config({ path: resolve(process.cwd(), '.env.local') });

async function cleanFailedTasks() {
  console.log('🧹 清理失败任务\n');
  console.log('Redis URL:', process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL || '未设置');
  console.log('');

  const queueNames = [
    'image-recognition',
    'listing-generation',
    'image-generation',
    'image-single-generation'
  ];

  let totalCleaned = 0;

  try {
    const conn = connection();

    // 测试 Redis 连接
    console.log('🔌 测试 Redis 连接...');
    try {
      await conn.ping();
      console.log('✅ Redis 连接成功\n');
    } catch (err: any) {
      console.error('❌ Redis 连接失败:', err.message);
      process.exit(1);
    }

    for (const queueName of queueNames) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📦 队列: ${queueName}`);
      console.log('='.repeat(60));

      const queue = new Queue(queueName, { connection: conn });

      try {
        // 获取失败任务数量
        const failedCount = await queue.getFailedCount();
        console.log(`  失败任务数量: ${failedCount}`);

        if (failedCount > 0) {
          // 显示失败任务详情
          console.log('\n  📋 失败任务列表:');
          const failedJobs = await queue.getFailed(0, Math.min(failedCount, 10));

          for (const job of failedJobs) {
            console.log(`    - Job ID: ${job.id}`);
            console.log(`      Workflow ID: ${job.data.workflowId || 'N/A'}`);
            console.log(`      失败原因: ${job.failedReason?.substring(0, 100)}...`);
            console.log(`      尝试次数: ${job.attemptsMade}/${job.opts.attempts}`);
            console.log('');
          }

          // 清理失败任务
          console.log(`  🗑️  正在清理 ${failedCount} 个失败任务...`);
          await queue.clean(0, 0, 'failed');

          // 验证清理结果
          const remainingFailed = await queue.getFailedCount();
          const cleaned = failedCount - remainingFailed;

          console.log(`  ✅ 已清理: ${cleaned} 个任务`);
          if (remainingFailed > 0) {
            console.log(`  ⚠️  剩余: ${remainingFailed} 个任务 (可能需要手动处理)`);
          }

          totalCleaned += cleaned;
        } else {
          console.log('  ✅ 没有失败任务');
        }
      } catch (error: any) {
        console.error(`  ❌ 清理队列失败: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ 清理完成,共清理 ${totalCleaned} 个失败任务`);
    console.log('='.repeat(60));

    await conn.quit();
  } catch (error: any) {
    console.error('\n❌ 清理失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

cleanFailedTasks();
