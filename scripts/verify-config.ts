/**
 * 验证 Vercel 部署配置
 * 运行: npx tsx scripts/verify-config.ts
 */

import { prisma } from "@/lib/db";

const REQUIRED_VARS = [
  'AUTH_SECRET',
  'DATABASE_URL',
] as const;

const WORKFLOW_VARS = [
  'REDIS_URL',
  'UPSTASH_REDIS_REST_URL',
  'ANTHROPIC_API_KEY',
] as const;

const STORAGE_VARS = [
  'CLOUDFLARE_R2_ACCESS_KEY',
  'CLOUDFLARE_R2_SECRET_KEY',
  'CLOUDFLARE_R2_BUCKET',
  'CLOUDFLARE_R2_ENDPOINT',
  'CLOUDFLARE_R2_PUBLIC_URL',
] as const;

async function verifyConfig() {
  console.log('🔍 验证配置...\n');

  // 1. 检查必需环境变量
  console.log('📋 必需环境变量:');
  let hasAllRequired = true;
  for (const varName of REQUIRED_VARS) {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    console.log(`  ${status} ${varName}: ${value ? '已配置' : '未配置'}`);
    if (!value) hasAllRequired = false;
  }

  // 2. 检查 Redis 配置
  console.log('\n📋 Redis 配置 (二选一):');
  const hasUpstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
  const hasRedis = process.env.REDIS_URL;
  console.log(`  ${hasUpstash ? '✅' : '⚪'} Upstash Redis: ${hasUpstash ? '已配置' : '未配置'}`);
  console.log(`  ${hasRedis ? '✅' : '⚪'} 自定义 Redis: ${hasRedis ? '已配置' : '未配置'}`);

  // 3. 检查工作流配置
  console.log('\n📋 工作流系统 (可选):');
  for (const varName of WORKFLOW_VARS) {
    const value = process.env[varName];
    const status = value ? '✅' : '⚪';
    console.log(`  ${status} ${varName}: ${value ? '已配置' : '未配置'}`);
  }

  // 4. 检查存储配置
  console.log('\n📋 图片存储 (可选):');
  for (const varName of STORAGE_VARS) {
    const value = process.env[varName];
    const status = value ? '✅' : '⚪';
    console.log(`  ${status} ${varName}: ${value ? '已配置' : '未配置'}`);
  }

  // 5. 测试数据库连接
  console.log('\n🔌 测试数据库连接...');
  try {
    await prisma.$connect();
    console.log('  ✅ 数据库连接成功');
    await prisma.$disconnect();
  } catch (error: any) {
    console.error('  ❌ 数据库连接失败:', error.message);
    hasAllRequired = false;
  }

  // 6. 测试 Redis 连接
  if (hasUpstash || hasRedis) {
    console.log('\n🔌 测试 Redis 连接...');
    try {
      const { ensureConnection } = await import('@/lib/queues/config');
      const redis = await ensureConnection();
      await redis.ping();
      console.log('  ✅ Redis 连接成功');
    } catch (error: any) {
      console.error('  ❌ Redis 连接失败:', error.message);
    }
  }

  // 7. 总结
  console.log('\n' + '='.repeat(60));
  if (hasAllRequired) {
    console.log('✅ 基础配置完成,可以部署到 Vercel');
    if (hasUpstash || hasRedis) {
      console.log('✅ 工作流系统已配置,可以使用图片识别功能');
    } else {
      console.log('⚠️  工作流系统未配置,无法使用图片识别功能');
      console.log('   请参考 VERCEL_DEPLOYMENT.md 配置 Redis');
    }
  } else {
    console.log('❌ 配置不完整,请先配置缺失的环境变量');
    console.log('   详见 VERCEL_DEPLOYMENT.md');
  }
  console.log('='.repeat(60));

  process.exit(hasAllRequired ? 0 : 1);
}

verifyConfig().catch((error) => {
  console.error('验证失败:', error);
  process.exit(1);
});
