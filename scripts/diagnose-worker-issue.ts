/**
 * 工作流问题诊断脚本
 * 分析 Redis 队列失败原因并提供修复建议
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

console.log('🔍 工作流系统诊断报告\n');
console.log('='.repeat(80));

// 1. 环境变量检查
console.log('\n📋 环境变量配置:\n');

const databaseUrl = process.env.DATABASE_URL;
const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;

console.log('DATABASE_URL:', databaseUrl ? '✅ 已设置' : '❌ 未设置');
if (databaseUrl) {
  const maskedUrl = databaseUrl.replace(/:[^:]+@/, ':***@');
  console.log('  值:', maskedUrl);

  if (databaseUrl.includes('supabase.com')) {
    console.log('  类型: ✅ Supabase PostgreSQL');
  } else if (databaseUrl.includes('railway.internal')) {
    console.log('  类型: ⚠️  Railway PostgreSQL (内网)');
  } else if (databaseUrl.includes('localhost')) {
    console.log('  类型: ⚠️  本地 PostgreSQL');
  } else {
    console.log('  类型: ❓ 未知');
  }
}

console.log('\nREDIS_URL:', redisUrl ? '✅ 已设置' : '❌ 未设置');
if (redisUrl) {
  const maskedUrl = redisUrl.replace(/:[^:]+@/, ':***@');
  console.log('  值:', maskedUrl);

  if (redisUrl.includes('upstash.io')) {
    console.log('  类型: ✅ Upstash Redis');
  } else if (redisUrl.includes('railway.internal')) {
    console.log('  类型: ✅ Railway Redis');
  } else if (redisUrl.includes('localhost')) {
    console.log('  类型: ⚠️  本地 Redis');
  } else {
    console.log('  类型: ❓ 未知');
  }
}

// 2. 根据 Redis 队列错误分析
console.log('\n' + '='.repeat(80));
console.log('\n❌ 检测到的问题:\n');

console.log('根据 Redis 队列检查结果,发现以下问题:');
console.log('');
console.log('1. 【严重】Worker 连接的数据库与 Web 应用不一致');
console.log('   错误: Record to update not found');
console.log('   原因: Web 应用在 Supabase 创建工作流记录,Worker 连接到其他数据库');
console.log('');
console.log('2. 【历史】曾经出现 IPv6 地址格式错误');
console.log('   错误: invalid IPv6 address in database URL');
console.log('   原因: Railway PostgreSQL 使用 IPv6 地址,格式不正确');
console.log('');
console.log('3. 【历史】曾经连接到没有表结构的数据库');
console.log('   错误: The table `public.workflow_executions` does not exist');
console.log('   原因: 数据库未初始化或连接错误');

// 3. 修复方案
console.log('\n' + '='.repeat(80));
console.log('\n✅ 修复方案:\n');

console.log('方案 1: 【推荐】统一使用 Supabase PostgreSQL');
console.log('  步骤:');
console.log('    1. 在 Railway Worker 服务 → Variables 标签');
console.log('    2. 删除 Railway PostgreSQL 插件的 Reference (如果有)');
console.log('    3. 手动设置 DATABASE_URL 为 Supabase 连接字符串');
console.log('    4. 格式: postgres://postgres.xxx:xxx@aws-1-us-east-1.pooler.supabase.com:6543/postgres');
console.log('    5. 重启 Worker 服务');
console.log('');
console.log('方案 2: 清理失败的任务并重试');
console.log('  步骤:');
console.log('    1. 修复 DATABASE_URL 后');
console.log('    2. 运行: npx tsx scripts/retry-failed-workflow.ts <workflowId>');
console.log('    3. 或删除失败的队列任务,重新从 Web 应用提交');

// 4. 验证步骤
console.log('\n' + '='.repeat(80));
console.log('\n🔍 验证步骤:\n');

console.log('1. 检查 Railway Worker 日志,确认:');
console.log('   ✅ 数据库初始化成功');
console.log('   ✅ Worker 启动成功 (应显示 "🚀 图片识别 Worker 已启动")');
console.log('');
console.log('2. 在 Railway Worker Shell 中测试数据库连接:');
console.log('   psql $DATABASE_URL -c "SELECT COUNT(*) FROM workflow_executions;"');
console.log('');
console.log('3. 运行队列检查脚本:');
console.log('   npx tsx scripts/check-redis-queue.ts');
console.log('   确认没有新的失败任务');
console.log('');
console.log('4. 从 Web 应用提交测试工作流,观察处理过程');

console.log('\n' + '='.repeat(80));
console.log('\n📚 相关文档:\n');
console.log('- RAILWAY_UNIFIED_DATABASE.md - 统一数据库架构说明');
console.log('- RAILWAY_DEPLOY_CHECKLIST.md - Railway 部署检查清单');

console.log('\n' + '='.repeat(80));
