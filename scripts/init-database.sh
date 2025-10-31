#!/bin/sh
# 数据库初始化脚本
# 在 Worker 启动前确保数据库表已创建

set -e  # 遇到错误立即退出

echo "🔍 检查数据库连接..."

# 检查 DATABASE_URL 是否设置
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL 未设置,无法初始化数据库"
  exit 1
fi

echo "✅ DATABASE_URL 已配置"

# 执行 Prisma DB Push (创建表结构)
echo "📊 初始化数据库表结构..."
npx prisma db push --accept-data-loss --skip-generate

echo "✅ 数据库表结构初始化完成"

# 可选: 检查表是否创建成功
echo "🔍 验证表结构..."
npx prisma db execute --stdin <<SQL
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
SQL

echo "✅ 数据库初始化完成,准备启动 Worker..."
