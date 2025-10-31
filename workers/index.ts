/**
 * Worker 进程主入口
 * 启动所有队列的 Worker
 */

// 加载环境变量 (必须在所有其他导入之前)
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

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

if (hasError) {
  console.error('\n❌ 环境变量配置不完整,Worker 可能无法正常运行');
  console.error('请在 Railway 服务的 Variables 标签页中配置必需的环境变量\n');
  process.exit(1);
}

console.log('\n✅ 环境变量检查通过,启动 Worker...\n');

// 导入 Worker (触发启动)
import "./image-recognition.worker";
import "./listing-generation.worker";
import "./image-generation.worker";

console.log("🚀 所有 Worker 已启动，等待任务...");

// 优雅关闭
process.on("SIGTERM", async () => {
  console.log("收到 SIGTERM 信号，正在关闭 Workers...");
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("收到 SIGINT 信号，正在关闭 Workers...");
  process.exit(0);
});
