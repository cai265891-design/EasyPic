#!/usr/bin/env node
/**
 * 快速检查环境变量配置
 * 运行: node scripts/check-env.mjs
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// 加载 .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const REQUIRED_VARS = [
  'AUTH_SECRET',
  'DATABASE_URL',
];

const REDIS_VARS = [
  ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
  ['REDIS_URL'],
];

const WORKFLOW_VARS = [
  'ANTHROPIC_API_KEY',
];

const STORAGE_VARS = [
  'CLOUDFLARE_R2_ACCESS_KEY',
  'CLOUDFLARE_R2_SECRET_KEY',
  'CLOUDFLARE_R2_BUCKET',
  'CLOUDFLARE_R2_ENDPOINT',
  'CLOUDFLARE_R2_PUBLIC_URL',
];

console.log('🔍 检查环境变量配置...\n');

// 1. 检查必需变量
console.log('📋 必需环境变量:');
let hasAllRequired = true;
for (const varName of REQUIRED_VARS) {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  console.log(`  ${status} ${varName}: ${value ? '已配置' : '未配置'}`);
  if (!value) hasAllRequired = false;
}

// 2. 检查 Redis 配置 (任一组即可)
console.log('\n📋 Redis 配置 (任选一组):');
let hasRedis = false;
for (const group of REDIS_VARS) {
  const hasGroup = group.every(v => process.env[v]);
  const status = hasGroup ? '✅' : '⚪';
  console.log(`  ${status} ${group.join(' + ')}: ${hasGroup ? '已配置' : '未配置'}`);
  if (hasGroup) hasRedis = true;
}

// 3. 检查工作流变量
console.log('\n📋 工作流系统 (可选):');
for (const varName of WORKFLOW_VARS) {
  const value = process.env[varName];
  const status = value ? '✅' : '⚪';
  console.log(`  ${status} ${varName}: ${value ? '已配置' : '未配置'}`);
}

// 4. 检查存储变量
console.log('\n📋 图片存储 (可选):');
let hasStorage = true;
for (const varName of STORAGE_VARS) {
  const value = process.env[varName];
  const status = value ? '✅' : '⚪';
  console.log(`  ${status} ${varName}: ${value ? '已配置' : '未配置'}`);
  if (!value) hasStorage = false;
}

// 5. 验证 URL 格式
console.log('\n🔍 验证配置格式:');
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  if (dbUrl.includes('localhost')) {
    console.log('  ⚠️  DATABASE_URL 使用 localhost - Vercel 部署时需要改为云数据库');
  } else {
    console.log('  ✅ DATABASE_URL 格式正确');
  }
}

if (process.env.REDIS_URL?.includes('localhost') && !hasRedis) {
  console.log('  ⚠️  REDIS_URL 使用 localhost - Vercel 部署时需要使用 Upstash 或其他云 Redis');
}

// 6. 总结
console.log('\n' + '='.repeat(60));
if (hasAllRequired) {
  console.log('✅ 基础配置完成');

  if (hasRedis) {
    console.log('✅ Redis 已配置 - 工作流系统可用');
  } else {
    console.log('⚠️  Redis 未配置 - 工作流功能不可用');
  }

  if (hasStorage) {
    console.log('✅ 图片存储已配置 - 完整功能可用');
  } else {
    console.log('⚪ 图片存储未配置 - 图片生成功能不可用');
  }

  console.log('\n📖 准备部署到 Vercel:');
  console.log('   1. 复制所有环境变量到 Vercel 项目设置');
  console.log('   2. 确保使用云数据库和 Upstash Redis');
  console.log('   3. 详细步骤见 VERCEL_DEPLOYMENT.md');
} else {
  console.log('❌ 配置不完整');
  console.log('   请配置缺失的必需环境变量');
  console.log('   参考 .env.local 文件中的注释');
}
console.log('='.repeat(60));

process.exit(hasAllRequired ? 0 : 1);
