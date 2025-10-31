# Railway Worker 部署指南 (BullMQ 后台任务)

## 📋 概述

本项目使用 Railway 部署 BullMQ Worker 进程,处理图片识别、文案生成等异步任务。

## 🏗️ 架构说明

```
Vercel (Next.js Web App) → Redis → Railway (BullMQ Workers)
                                ↓
                           PostgreSQL (Supabase)
```

- **Vercel**: 托管 Next.js 应用,接收用户请求,将任务推送到 Redis 队列
- **Redis**: 任务队列存储 (使用 Upstash Redis)
- **Railway**: 运行 Worker 进程,从 Redis 拉取任务并处理
- **Supabase**: PostgreSQL 数据库,存储工作流状态和结果

---

## ⚙️ Railway 部署配置

### 1. 创建 Railway 项目

1. 访问 [Railway.app](https://railway.app/)
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择你的代码仓库

### 2. 配置服务

#### 选项 A: 单一服务 (简单,推荐新手)
在 Railway 项目中创建 **1 个服务**:
- **Worker 服务**: 运行 BullMQ Workers

#### 选项 B: 多服务 (可选,适合大规模)
- **Image Recognition Worker**: 图片识别
- **Listing Generation Worker**: 文案生成
- **Image Generation Worker**: 图片生成

### 3. 配置 Worker 服务

#### 启动命令
```bash
pnpm workers:prod
```

#### 健康检查 (可选)
- **路径**: `/` (不适用,Worker 无 HTTP 端口)
- **建议**: 禁用 HTTP 健康检查,或使用自定义脚本

#### 重启策略
- **Always**: Worker 崩溃后自动重启

---

## 🔐 环境变量配置

在 Railway 服务的 **Variables** 标签页中添加:

### 必需变量

```bash
# 数据库连接 (Supabase Connection Pooler)
DATABASE_URL=postgres://postgres.xxx:password@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true

# Redis 连接 (Upstash Redis)
REDIS_URL=redis://default:password@your-redis.upstash.io:6379

# Claude AI API (图片识别和文案生成)
ANTHROPIC_API_KEY=sk-ant-xxx
```

### 可选变量 (图片存储)

```bash
# Cloudflare R2 配置
CLOUDFLARE_R2_ACCESS_KEY=your-access-key
CLOUDFLARE_R2_SECRET_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET=your-bucket-name
CLOUDFLARE_R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

---

## 🐛 常见问题排查

### 问题 1: ❌ 数据库连接超时

**错误日志**:
```
🔴 错误: 数据库连接超时
   - Supabase 连接可能不稳定
   - 检查网络连接或防火墙设置
```

**原因**:
使用 PgBouncer URL (端口 6543) 执行 `prisma db push` 会导致超时,因为 PgBouncer 运行在 **Transaction Mode**,不支持某些 Prisma 操作。

**解决方案** (已自动修复):
Worker 启动脚本会自动将 PgBouncer URL 转换为 Direct Connection:
- ✅ **PgBouncer** (6543端口) → 用于应用连接
- ✅ **Direct Connection** (5432端口) → 用于 Schema 推送

**验证**:
查看 Railway 日志,应看到:
```
⚠️  检测到 PgBouncer 连接 (端口 6543)
   正在转换为 Direct Connection (端口 5432)...
✅ 数据库表结构同步完成 (使用 Direct Connection)
```

---

### 问题 2: ❌ Redis 连接失败

**错误日志**:
```
Error: connect ETIMEDOUT
```

**解决方案**:
1. 确认 `REDIS_URL` 格式正确:
   ```bash
   redis://default:password@host:6379
   ```
2. 测试 Redis 连接:
   ```bash
   redis-cli -u "$REDIS_URL" ping
   ```
3. 使用 Upstash Redis (专为 Serverless 优化)

---

### 问题 3: ❌ ANTHROPIC_API_KEY 未设置

**错误日志**:
```
❌ 缺少环境变量: ANTHROPIC_API_KEY (Claude AI API)
```

**解决方案**:
1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 创建 API Key
3. 在 Railway Variables 中添加:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-xxx
   ```

---

### 问题 4: ⚠️ Worker 启动但不处理任务

**可能原因**:
1. Redis 队列中没有任务 (正常)
2. Worker 和 Web App 使用不同的 Redis 实例

**排查步骤**:
1. 确认 Vercel 和 Railway 使用 **相同的 REDIS_URL**
2. 在 Railway 日志中查看是否有任务处理记录:
   ```
   [图片识别] 开始处理: workflow-xxx
   ```

---

## 📊 监控和日志

### 查看 Worker 日志
1. 进入 Railway 项目
2. 点击 Worker 服务
3. 查看 **Deployments** 标签页 → **View Logs**

### 日志格式示例
```
🔍 环境变量检查...
✅ DATABASE_URL: 已设置
✅ REDIS_URL: 已设置
✅ ANTHROPIC_API_KEY: 已设置

📊 数据库连接 URL 诊断
==================================================
✅ URL 格式验证通过
   协议:   postgres
   主机:   aws-1-us-east-1.pooler.supabase.com
   端口:   6543

⚠️  检测到 PgBouncer 连接 (端口 6543)
   正在转换为 Direct Connection (端口 5432)...

✅ 数据库表结构同步完成 (使用 Direct Connection)

🚀 启动 Worker...
✅ 所有 Worker 已启动,等待任务...
```

---

## 🚀 部署检查清单

**部署前**:
- [ ] 确认 `DATABASE_URL` 使用 Supabase Pooling URL (端口 6543)
- [ ] 确认 `REDIS_URL` 与 Vercel 配置一致
- [ ] 确认 `ANTHROPIC_API_KEY` 已设置
- [ ] (可选) 确认 Cloudflare R2 配置完整

**部署后**:
- [ ] 查看 Railway 日志,确认 Worker 启动成功
- [ ] 在 Vercel 应用中测试上传图片,触发工作流
- [ ] 在 Railway 日志中验证任务被处理:
  ```
  [图片识别] 开始处理: workflow-xxx
  [图片识别] 识别成功: 商品描述...
  [文案生成] 生成 Listing: xxx
  ```

---

## 🔗 相关资源

- [Railway 文档](https://docs.railway.app/)
- [BullMQ 文档](https://docs.bullmq.io/)
- [Supabase 连接池配置](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Upstash Redis](https://upstash.com/)

---

## 💡 最佳实践

1. **数据库连接管理**:
   - Web App (Vercel): 使用 PgBouncer (6543端口)
   - Worker (Railway): 自动转换为 Direct Connection (5432端口) 进行 Schema 操作

2. **错误处理**:
   - Worker 自动重试失败任务 (最多 3 次)
   - 查看 Railway 日志排查持续失败的任务

3. **资源优化**:
   - 单一 Worker 服务即可处理所有队列 (并发度: 3-5)
   - 高负载场景可拆分为多个专用 Worker

4. **成本控制**:
   - Railway 免费计划: $5/月额度 (约 500 小时运行时间)
   - Worker 空闲时消耗资源极少
   - 建议设置资源限制 (CPU: 0.5核, 内存: 512MB)
