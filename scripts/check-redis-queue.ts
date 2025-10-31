/**
 * 检查 Redis 队列状态
 * 查看各个队列中的任务数量和状态
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { Queue } from 'bullmq';
import { connection } from '../lib/queues/config';

config({ path: resolve(process.cwd(), '.env.local') });

async function checkQueues() {
  console.log('📊 检查 BullMQ 队列状态\n');
  console.log('Redis URL:', process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL || '未设置');
  console.log('');

  const queueNames = [
    'image-recognition',
    'listing-generation',
    'image-generation',
    'image-single-generation'
  ];

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
        const [waiting, active, completed, failed, delayed] = await Promise.all([
          queue.getWaitingCount(),
          queue.getActiveCount(),
          queue.getCompletedCount(),
          queue.getFailedCount(),
          queue.getDelayedCount(),
        ]);

        console.log(`  等待中 (waiting):  ${waiting}`);
        console.log(`  处理中 (active):   ${active}`);
        console.log(`  已完成 (completed): ${completed}`);
        console.log(`  已失败 (failed):    ${failed}`);
        console.log(`  延迟中 (delayed):   ${delayed}`);

        // 获取等待中的任务
        if (waiting > 0) {
          console.log('\n  📋 等待中的任务:');
          const waitingJobs = await queue.getWaiting(0, 5); // 获取前5个
          for (const job of waitingJobs) {
            console.log(`    - Job ID: ${job.id}`);
            console.log(`      Data:`, JSON.stringify(job.data, null, 2).split('\n').join('\n      '));
          }
        }

        // 获取处理中的任务
        if (active > 0) {
          console.log('\n  ⚙️  处理中的任务:');
          const activeJobs = await queue.getActive(0, 5);
          for (const job of activeJobs) {
            console.log(`    - Job ID: ${job.id}`);
            console.log(`      Data:`, JSON.stringify(job.data, null, 2).split('\n').join('\n      '));
          }
        }

        // 获取失败的任务
        if (failed > 0) {
          console.log('\n  ❌ 失败的任务 (最近5个):');
          const failedJobs = await queue.getFailed(0, 5);
          for (const job of failedJobs) {
            console.log(`    - Job ID: ${job.id}`);
            console.log(`      Data:`, JSON.stringify(job.data, null, 2).split('\n').join('\n      '));
            console.log(`      错误: ${job.failedReason}`);
            console.log('');
          }
        }
      } catch (error: any) {
        console.error(`  ❌ 查询队列失败: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 队列检查完成');

    await conn.quit();
  } catch (error: any) {
    console.error('\n❌ 检查失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkQueues();
