/**
 * 数据库初始化工具
 * 在 Worker 启动前确保数据库表已创建
 */

import { execSync } from 'child_process';

export async function initDatabase(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 数据库初始化检查');
  console.log('='.repeat(60) + '\n');

  // 1. 检查 DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL 未设置,无法初始化数据库');
    console.error('请在 Railway Variables 中配置 DATABASE_URL\n');
    process.exit(1);
  }

  // 隐藏密码部分
  const maskedUrl = process.env.DATABASE_URL.replace(/:[^:]+@/, ':***@');
  console.log(`✅ DATABASE_URL 已配置`);
  console.log(`   ${maskedUrl}\n`);

  // 2. 执行 Prisma DB Push
  console.log('📊 正在创建/更新数据库表结构...\n');

  try {
    const output = execSync('npx prisma db push --accept-data-loss --skip-generate', {
      encoding: 'utf-8',
      stdio: ['inherit', 'pipe', 'pipe'],  // 继承 stdin,捕获 stdout 和 stderr
      env: process.env,
    });

    // 输出 Prisma 的执行结果
    console.log(output);

    console.log('\n✅ 数据库表结构同步完成\n');
  } catch (error: any) {
    console.error('\n❌ 数据库初始化失败!\n');

    // 解析 Prisma 错误
    if (error.message.includes('P1001')) {
      console.error('🔴 错误: 无法连接到数据库服务器');
      console.error('   - 检查 DATABASE_URL 是否正确');
      console.error('   - 检查网络连接');
      console.error('   - 检查 Supabase 防火墙设置\n');
    } else if (error.message.includes('P1003')) {
      console.error('🔴 错误: 数据库不存在');
      console.error('   - 检查 DATABASE_URL 中的数据库名称\n');
    } else if (error.message.includes('authentication')) {
      console.error('🔴 错误: 数据库认证失败');
      console.error('   - 检查用户名和密码是否正确\n');
    } else {
      console.error('🔴 错误详情:');
      console.error(error.message);
      console.error('\n');
    }

    console.error('💡 提示: 请检查 Railway Variables 中的 DATABASE_URL 配置\n');
    process.exit(1);
  }

  // 3. 验证表是否创建成功
  console.log('🔍 验证表结构...\n');

  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // 查询工作流相关表
    const tableNames = [
      'users',
      'workflow_executions',
      'products',
      'listings',
      'image_sets',
      'product_images',
    ];

    console.log('检查关键表:');
    for (const tableName of tableNames) {
      try {
        await prisma.$queryRawUnsafe(`SELECT 1 FROM "${tableName}" LIMIT 1`);
        console.log(`   ✅ ${tableName}`);
      } catch (error) {
        console.log(`   ⚠️  ${tableName} (表可能不存在或为空)`);
      }
    }

    await prisma.$disconnect();

    console.log('\n✅ 表结构验证完成\n');
  } catch (error: any) {
    console.warn('⚠️  无法验证表结构:', error.message);
    console.warn('   但这不影响 Worker 启动,继续...\n');
  }

  console.log('='.repeat(60));
  console.log('✅ 数据库初始化完成,准备启动 Worker');
  console.log('='.repeat(60) + '\n');
}
