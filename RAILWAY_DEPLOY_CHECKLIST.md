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

### 3. Redis 连接修复
- ✅ 自动检测 Upstash Redis 并启用 TLS (`rediss://`)
- ✅ 添加连接重试和错误处理

### 4. DATABASE_URL 验证和修复 (NEW!)
- ✅ 自动检测和修复 IPv6 地址格式错误
- ✅ 在 Worker 启动前验证所有必需环境变量
- ✅ 提供详细的错误诊断和修复建议
- ✅ 添加数据库连接诊断脚本

## 📋 Railway 环境变量配置清单

⭐ **重要**: 本项目已优化为统一数据库架构,详见 `RAILWAY_UNIFIED_DATABASE.md`

在 Railway 项目的 **Variables** 标签页中配置以下环境变量:

### 必需变量 (核心功能)
```bash
# 数据库 (使用 Supabase PostgreSQL,与 Web 应用共用)
DATABASE_URL=postgres://postgres.xxx:xxx@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true

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

### 2. 配置数据库连接 ⭐ 已优化
```bash
# ❌ 旧方案: 添加 Railway PostgreSQL 插件 (不再需要)
# ✅ 新方案: 使用 Supabase PostgreSQL (与 Web 应用共用)

1. 在 Worker 服务的 Variables 标签
2. 添加 DATABASE_URL,值为 Supabase 连接字符串
3. 保存 (Railway 自动重启)

详见: RAILWAY_UNIFIED_DATABASE.md
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

### 问题 6: DATABASE_URL IPv6 地址解析失败 ⭐ NEW!
**错误信息**:
```
PrismaClientInitializationError:
Error parsing connection string: invalid IPv6 address in database URL
```

**根本原因**:
Railway PostgreSQL 公网连接使用 IPv6 地址,格式可能不正确(缺少方括号)

**解决方案 (按优先级)**:

#### 方案 1: 使用 Railway 内网连接 (推荐) ⭐
1. 进入 Railway PostgreSQL 插件页面
2. 复制 **DATABASE_PRIVATE_URL** (格式如 `postgresql://user:pass@postgres.railway.internal:5432/db`)
3. 在 Worker 服务的 Variables 中,将 `DATABASE_URL` 的值替换为 `DATABASE_PRIVATE_URL`
4. 重启 Worker 服务

**优势**:
- ✅ 避免 IPv6 解析问题 (使用域名)
- ✅ 更快 (内网连接,延迟 ~2ms vs ~20ms)
- ✅ 更安全 (不走公网)

#### 方案 2: 代码自动修复 (已实现)
代码已添加自动检测和修复逻辑:
- `lib/db.ts`: 在 Prisma Client 初始化前自动修复 URL
- `workers/index.ts`: 启动时验证环境变量并打印诊断信息

如果看到日志 `✅ DATABASE_URL 已自动修复`,说明代码已自动处理

#### 方案 3: 手动修复 IPv6 格式
如果必须使用公网连接,确保 IPv6 地址用方括号包裹:
```bash
# ❌ 错误
DATABASE_URL=postgresql://user:pass@2001:db8::1:5432/db

# ✅ 正确
DATABASE_URL=postgresql://user:pass@[2001:db8::1]:5432/db
```

**诊断工具**:
运行以下脚本检查 DATABASE_URL 配置:
```bash
# 本地诊断
npx tsx scripts/diagnose-database.ts

# Railway Shell 中诊断
echo $DATABASE_URL
```

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
