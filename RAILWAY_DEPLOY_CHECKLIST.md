# Railway Worker 部署检查清单

## ✅ 已完成的修复

### 1. Dockerfile 优化
- ✅ 修复 OpenSSL 依赖 (`openssl` 替代 `openssl1.1-compat`)
- ✅ 添加 Sharp 图片处理依赖 (`vips-dev`, `build-base`, `python3`)
- ✅ 设置 `NODE_ENV=production`
- ✅ 优化构建流程

### 2. 文件排除
- ✅ 创建 `.dockerignore` 排除不必要文件
- ✅ 减少镜像体积,加快部署速度

## 📋 Railway 环境变量配置清单

在 Railway 项目的 **Variables** 标签页中配置以下环境变量:

### 必需变量 (核心功能)
```bash
# 数据库 (使用 Railway PostgreSQL 插件自动生成)
DATABASE_URL=postgresql://...

# Redis (使用 Railway Redis 插件或 Upstash)
REDIS_URL=redis://...
# 或使用 Upstash:
# UPSTASH_REDIS_REST_URL=https://...
# UPSTASH_REDIS_REST_TOKEN=...

# Claude AI API
ANTHROPIC_API_KEY=sk-ant-...

# Cloudflare R2 存储
CLOUDFLARE_R2_ACCESS_KEY=xxx
CLOUDFLARE_R2_SECRET_KEY=xxx
CLOUDFLARE_R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET=amazon-images
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

### 可选变量 (NextAuth & Stripe - Worker 不需要)
```bash
# NextAuth (如果有 Web 服务需要)
AUTH_SECRET=...
NEXTAUTH_URL=https://...

# Stripe (如果有订阅功能)
STRIPE_API_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

## 🚀 部署步骤

### 1. 准备 Railway 项目
```bash
# 在 Railway 项目中添加服务
1. 点击 "New Service"
2. 选择 "GitHub Repo"
3. 选择你的仓库
4. Service Name: workflow-worker
```

### 2. 添加 PostgreSQL 插件
```bash
1. 点击 "+ New" → "Database" → "Add PostgreSQL"
2. Railway 自动生成 DATABASE_URL
3. 自动添加到 Worker 服务的环境变量
```

### 3. 添加 Redis 插件 (方案 A: Railway Redis)
```bash
1. 点击 "+ New" → "Database" → "Add Redis"
2. Railway 自动生成 REDIS_URL
3. 自动添加到 Worker 服务的环境变量
```

### 或使用 Upstash (方案 B: 推荐,免费额度更大)
```bash
1. 访问 https://upstash.com/ 创建 Redis 实例
2. 复制 UPSTASH_REDIS_REST_URL 和 UPSTASH_REDIS_REST_TOKEN
3. 在 Railway Variables 中添加这两个变量
```

### 4. 配置环境变量
在 Railway Worker 服务的 **Variables** 标签页中:
- ✅ DATABASE_URL (自动生成)
- ✅ REDIS_URL (自动生成)
- ➕ 手动添加 ANTHROPIC_API_KEY
- ➕ 手动添加 Cloudflare R2 配置 (5 个变量)

### 5. 确认 Dockerfile 路径
在 Railway Worker 服务的 **Settings** → **Build** 中:
- ✅ Build Method: `Dockerfile`
- ✅ Dockerfile Path: `Dockerfile` (默认值)

### 6. 触发部署
```bash
git add .
git commit -m "修复 Railway Worker 部署配置"
git push origin main
```

## 🔍 部署后验证

### 1. 检查 Worker 启动日志
```
✅ Redis connected successfully
✅ Redis ready to accept commands
🚀 图片识别 Worker 已启动
🚀 文案生成 Worker 已启动
🚀 图片生成 Worker 已启动
🚀 所有 Worker 已启动，等待任务...
```

### 2. 测试数据库连接
```bash
# 在 Railway Worker 服务的 Shell 中执行
pnpm prisma db push --accept-data-loss
```

### 3. 测试工作流
```bash
# 从你的 Web 应用或 API 发送测试请求
curl -X POST https://your-app.com/api/workflows/start \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/product.jpg",
    "category": "Electronics",
    "brand": "TestBrand"
  }'
```

## ⚠️ 常见问题

### 问题 1: `openssl1.1-compat` 找不到
**解决**: 已修复,使用 `openssl` 替代

### 问题 2: Sharp 编译失败
**解决**: 已添加 `vips-dev`, `build-base`, `python3` 依赖

### 问题 3: Redis 连接失败
**检查**:
- Railway Redis 插件已添加
- REDIS_URL 环境变量已自动注入
- 或 Upstash 的两个环境变量正确配置

### 问题 4: Prisma Client 未生成
**解决**:
- Dockerfile 中已包含 `pnpm prisma generate`
- 确认 `prisma/schema.prisma` 已复制到镜像

### 问题 5: Worker 启动后立即退出
**检查**:
- 日志中是否有错误信息
- Redis 连接是否成功
- 数据库连接是否正常

## 📊 监控指标

### Railway Metrics 面板关注:
- **CPU Usage**: 正常 < 50%,高峰 < 80%
- **Memory Usage**: 正常 < 512MB,峰值 < 1GB
- **Network**: 出站流量(图片下载/上传)
- **Logs**: 错误日志 `❌` 标记

### BullMQ Dashboard (可选)
如果需要可视化队列管理,可以部署 Bull Board:
```typescript
// 在单独的 Express 服务中
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
```

## 🎯 优化建议

### 1. 环境分离
```bash
# 开发环境
pnpm docker:dev  # 本地 Docker
pnpm workers     # 本地 Worker (watch 模式)

# 生产环境
Railway Worker Service (自动部署)
```

### 2. 日志优化
考虑集成:
- **Sentry**: 错误追踪
- **Logflare**: 日志聚合(Railway 推荐)
- **Datadog**: 全链路监控

### 3. 成本优化
- 使用 Upstash Redis 免费额度 (10,000 命令/天)
- Cloudflare R2 免费额度 (10GB 存储 + 免费出站流量)
- Railway Worker 按使用时长计费,优化 Worker 并发数

## 📚 相关文档

- 📖 `CLAUDE.md` - 项目整体架构说明
- 📖 `FIXES_SUMMARY.md` - 技术修复详情(如有)
- 📖 Railway 文档: https://docs.railway.app/
- 📖 Upstash 文档: https://docs.upstash.com/redis

---

**部署时间**: 预计 5-10 分钟
**首次构建**: 约 3-5 分钟 (包含依赖安装和编译)
**后续部署**: 约 1-2 分钟 (使用缓存层)
