/**
 * Worker 进程主入口
 * 启动所有队列的 Worker
 */

// 加载环境变量 (必须在所有其他导入之前)
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

// 数据库初始化 (必须在验证环境变量前执行)
import { initDatabase } from "../lib/utils/init-database";

// 验证和修复环境变量
import { printDatabaseUrlDiagnostics } from "../lib/utils/database-url";

console.log("\n🔍 环境变量检查...\n");

// 1. 检查必需的环境变量
const requiredEnvVars = [
  { key: 'DATABASE_URL', description: '数据库连接' },
  { key: 'REDIS_URL', description: 'Redis 连接' },
  { key: 'ANTHROPIC_API_KEY', description: 'Claude AI API' },
];

let hasError = false;

requiredEnvVars.forEach(({ key, description }) => {
  if (!process.env[key]) {
    console.error(`❌ 缺少环境变量: ${key} (${description})`);
    hasError = true;
  } else {
    console.log(`✅ ${key}: 已设置`);
  }
});

// 2. 验证并修复 DATABASE_URL
if (process.env.DATABASE_URL) {
  printDatabaseUrlDiagnostics(process.env.DATABASE_URL);
}

// 3. 检查可选但推荐的环境变量
const optionalEnvVars = [
  { key: 'CLOUDFLARE_R2_ACCESS_KEY', description: 'Cloudflare R2 存储 (图片上传)' },
  { key: 'CLOUDFLARE_R2_BUCKET', description: 'R2 存储桶名称' },
];

console.log('\n📋 可选配置:\n');
optionalEnvVars.forEach(({ key, description }) => {
  if (!process.env[key]) {
    console.warn(`⚠️  未设置: ${key} (${description})`);
  } else {
    console.log(`✅ ${key}: 已设置`);
  }
});

// 检查 DATABASE_URL 是否是占位符
if (process.env.DATABASE_URL?.includes('[user]') ||
    process.env.DATABASE_URL?.includes('[neon_hostname]') ||
    process.env.DATABASE_URL?.includes('[dbname]')) {
  console.error('\n❌ DATABASE_URL 是占位符格式,未正确配置!');
  console.error('\n📋 Railway PostgreSQL 配置步骤:');
  console.error('   1. 在 Railway 项目中点击 "+ New"');
  console.error('   2. 选择 "Database" → "Add PostgreSQL"');
  console.error('   3. Railway 会自动生成 DATABASE_URL 环境变量');
  console.error('   4. 确认 DATABASE_URL 已自动注入到 Worker 服务');
  console.error('\n💡 提示: 在 PostgreSQL 插件页面查看 Variables 标签,');
  console.error('   应该有 DATABASE_URL 和 DATABASE_PRIVATE_URL\n');
  process.exit(1);
}

if (hasError) {
  console.error('\n❌ 环境变量配置不完整,Worker 可能无法正常运行');
  console.error('请在 Railway 服务的 Variables 标签页中配置必需的环境变量\n');
  process.exit(1);
}

console.log('\n✅ 环境变量检查通过\n');

// ============================================
// 异步启动流程 (先初始化数据库,再启动 Worker)
// ============================================

(async () => {
  try {
    // 1. 初始化数据库
    await initDatabase();

    // 2. 导入并启动 Worker
    console.log('🚀 启动 Worker...\n');
    await import("./image-recognition.worker");
    await import("./listing-generation.worker");
    await import("./image-generation.worker");

    console.log("✅ 所有 Worker 已启动，等待任务...\n");
  } catch (error: any) {
    console.error('\n❌ Worker 启动失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

// 优雅关闭
process.on("SIGTERM", async () => {
  console.log("收到 SIGTERM 信号，正在关闭 Workers...");
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("收到 SIGINT 信号，正在关闭 Workers...");
  process.exit(0);
});
