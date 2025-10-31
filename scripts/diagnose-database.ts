/**
 * 数据库连接诊断脚本
 * 用于排查 DATABASE_URL 配置问题
 *
 * 运行方式:
 * npx tsx scripts/diagnose-database.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// 加载环境变量
config({ path: resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { printDatabaseUrlDiagnostics, sanitizeDatabaseUrl } from "../lib/utils/database-url";

async function main() {
  console.log('\n🔍 数据库连接诊断工具\n' + '='.repeat(60));

  // 1. 检查环境变量
  if (!process.env.DATABASE_URL) {
    console.error('\n❌ DATABASE_URL 未设置');
    console.error('请在 .env.local 或环境变量中配置 DATABASE_URL\n');
    process.exit(1);
  }

  // 2. 打印 URL 诊断信息
  printDatabaseUrlDiagnostics(process.env.DATABASE_URL);

  // 3. 尝试修复 URL
  console.log('🔧 尝试修复 DATABASE_URL...\n');
  try {
    const originalUrl = process.env.DATABASE_URL;
    const sanitizedUrl = sanitizeDatabaseUrl(originalUrl);

    if (sanitizedUrl !== originalUrl) {
      console.log('✅ URL 已自动修复');
      console.log('修复前:', originalUrl.replace(/:[^:]+@/, ':***@'));
      console.log('修复后:', sanitizedUrl.replace(/:[^:]+@/, ':***@'));
      process.env.DATABASE_URL = sanitizedUrl;
    } else {
      console.log('✅ URL 格式正确,无需修复');
    }
  } catch (error: any) {
    console.error('❌ URL 修复失败:', error.message);
    process.exit(1);
  }

  // 4. 测试 Prisma Client 连接
  console.log('\n🔌 测试 Prisma Client 连接...\n');

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    console.log('正在连接数据库...');
    const startTime = Date.now();

    // 执行简单查询测试连接
    await prisma.$queryRaw`SELECT 1 as test`;

    const duration = Date.now() - startTime;
    console.log(`✅ 数据库连接成功! (耗时 ${duration}ms)`);

    // 5. 检查数据库表
    console.log('\n📊 检查数据库表...\n');

    try {
      const tables = await prisma.$queryRaw<{ tablename: string }[]>`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `;

      console.log(`✅ 找到 ${tables.length} 个表:`);
      tables.forEach(({ tablename }) => {
        console.log(`   - ${tablename}`);
      });

      // 检查 Workflow 相关表
      const workflowTables = ['WorkflowExecution', 'Product', 'Listing', 'ImageSet', 'ProductImage'];
      const missingTables = workflowTables.filter(
        table => !tables.some(t => t.tablename.toLowerCase() === table.toLowerCase())
      );

      if (missingTables.length > 0) {
        console.warn('\n⚠️  缺少以下 Workflow 表:');
        missingTables.forEach(table => console.warn(`   - ${table}`));
        console.warn('\n提示: 运行 `npx prisma db push` 创建缺失的表');
      } else {
        console.log('\n✅ 所有 Workflow 表已存在');
      }
    } catch (error: any) {
      console.warn('⚠️  无法检查表结构:', error.message);
    }

    // 6. 测试 WorkflowExecution 表查询
    console.log('\n🔍 测试 WorkflowExecution 表访问...\n');
    try {
      const count = await prisma.workflowExecution.count();
      console.log(`✅ WorkflowExecution 表可访问,当前记录数: ${count}`);
    } catch (error: any) {
      console.error('❌ 无法访问 WorkflowExecution 表:', error.message);
      console.error('提示: 运行 `npx prisma db push` 同步数据库结构');
    }

  } catch (error: any) {
    console.error('\n❌ 数据库连接失败!\n');

    if (error.message.includes('invalid IPv6 address')) {
      console.error('问题: IPv6 地址格式错误');
      console.error('解决方案:');
      console.error('  1. 检查 DATABASE_URL 中的 IPv6 地址是否用方括号包裹');
      console.error('  2. 或使用 Railway DATABASE_PRIVATE_URL (内网连接)');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
      console.error('问题: 无法连接到数据库服务器');
      console.error('解决方案:');
      console.error('  1. 检查网络连接');
      console.error('  2. 检查数据库服务器是否运行');
      console.error('  3. 检查防火墙设置');
    } else if (error.message.includes('authentication')) {
      console.error('问题: 认证失败');
      console.error('解决方案:');
      console.error('  1. 检查用户名和密码是否正确');
      console.error('  2. 检查密码中的特殊字符是否已 URL 编码');
    } else {
      console.error('错误详情:', error.message);
    }

    console.error('\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ 诊断完成!\n');
}

main().catch((error) => {
  console.error('诊断脚本执行失败:', error);
  process.exit(1);
});
