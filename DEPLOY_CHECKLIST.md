# 🚀 Vercel 部署检查清单

## ✅ 部署前准备

### 1️⃣ 检查本地环境变量
```bash
node scripts/check-env.mjs
```

如果看到 `✅ 基础配置完成`,继续下一步。

### 2️⃣ 准备云服务

#### 必需服务:

**Upstash Redis** (推荐 - 免费额度足够开发使用)
- 访问: https://console.upstash.com/
- 创建 Redis 数据库
- 选择区域: `US East (N. Virginia)` (与 Vercel 默认区域相同)
- 记录:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`

**Supabase PostgreSQL** (推荐 - 免费额度 500MB)
- 访问: https://supabase.com/dashboard
- 创建新项目
- 进入 Project Settings > Database
- 复制 Connection Pooling URL (格式: `postgres://...@...pooler.supabase.com:6543/...`)
- 记录为 `DATABASE_URL`

#### 可选服务 (工作流功能需要):

**Anthropic API** (Claude AI)
- 访问: https://console.anthropic.com/
- 获取 API Key
- 记录为 `ANTHROPIC_API_KEY`

**Cloudflare R2** (图片存储 - 免费 10GB)
- 已配置 ✅

### 3️⃣ 配置 Vercel 环境变量

登录 Vercel Dashboard > 选择项目 > Settings > Environment Variables

添加以下变量 (针对 **Production**, **Preview**, **Development** 三个环境):

```bash
# ===== 必需配置 =====
AUTH_SECRET=65tmOELQr4MOrbcYpeKA5/0lk3rM0aDfBwGvXVU6IDc=

# 使用 Supabase URL (不是 localhost!)
DATABASE_URL=postgres://postgres.xxx:password@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true

# ===== Redis 配置 (二选一) =====
# 方式1: Upstash Redis (推荐)
UPSTASH_REDIS_REST_URL=https://splendid-walleye-24266.upstash.io
UPSTASH_REDIS_REST_TOKEN=AV7KAAIncDJkMjk1MDM5ZThkYmI0NjM2YjIxOWJkOGY0NjAzOGQzOHAyMjQyNjY

# 方式2: 自定义 Redis (如果不用 Upstash)
# REDIS_URL=redis://username:password@your-redis-host:6379

# ===== 工作流系统 (可选) =====
ANTHROPIC_API_KEY=sk-ant-xxx  # 从 https://console.anthropic.com/ 获取

# ===== 图片存储 =====
CLOUDFLARE_R2_ACCESS_KEY=e83ba86a51a5c71b66d71b5fe82ccbeb
CLOUDFLARE_R2_SECRET_KEY=644aaf04810528ffcf0b1409415d48285c2abfda9233701483a8b9da13d46914
CLOUDFLARE_R2_BUCKET=tushenshi
CLOUDFLARE_R2_ENDPOINT=https://36d6f9be5f397dc18dc3062f08e1d969.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://pub-51ebc0ca5d1c4e90b737d68fb96c1a28.r2.dev

# ===== 其他配置 =====
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_USE_MOCK=false
EMAIL_FROM="SaaS Starter <onboarding@resend.dev>"

# Supabase (如果使用)
NEXT_PUBLIC_SUPABASE_URL=https://kzkczxxinltosfcnesjp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4️⃣ 推送数据库 Schema

在 Vercel 部署前,先推送数据库结构:

```bash
# 使用 Supabase URL
DATABASE_URL='postgres://...' npx prisma db push
```

### 5️⃣ 提交代码并部署

```bash
git add .
git commit -m "修复 Vercel 部署 Redis 连接问题"
git push origin main
```

Vercel 会自动检测推送并开始部署。

---

## 📊 部署后验证

### 1️⃣ 查看构建日志

访问 Vercel Dashboard > 选择部署 > 查看日志

**检查点**:
- ✅ 构建成功 (Build successful)
- ✅ 无环境变量错误
- ✅ Prisma Client 生成成功

### 2️⃣ 查看函数日志

```bash
vercel logs --follow
```

或在 Vercel Dashboard > Logs 中查看。

**期望看到**:
```
🔌 使用 Upstash Redis: splendid-walleye-24266.upstash.io
✅ Redis connected successfully
✅ Redis ready to accept commands
```

### 3️⃣ 测试功能

访问你的 Vercel 部署地址:

1. **首页加载**: https://your-app.vercel.app
   - ✅ 页面正常显示
   - ✅ 无 500 错误

2. **用户注册/登录**:
   - ✅ 可以注册新用户
   - ✅ 可以登录

3. **上传图片** (工作流功能):
   - ✅ 图片上传成功
   - ✅ 工作流启动 (返回 workflowId)
   - ✅ 查看函数日志无错误

4. **查看工作流状态**:
   ```
   GET https://your-app.vercel.app/api/workflows/{workflowId}
   ```
   - ✅ 返回工作流状态
   - ✅ 图片识别结果

---

## 🐛 常见问题排查

### ❌ 问题1: "启动工作流失败" 500 错误

**排查步骤**:

1. **查看函数日志**:
   ```bash
   vercel logs --follow
   ```

2. **检查常见错误**:

   **错误**: `Redis connection error: connect ETIMEDOUT`
   **原因**: Redis URL 配置错误或 Redis 服务不可用
   **解决**:
   - 确认 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN` 已配置
   - 测试 Upstash Redis 是否在线

   **错误**: `database "xxx" does not exist`
   **原因**: 数据库未创建或 URL 错误
   **解决**:
   - 检查 `DATABASE_URL` 格式
   - 确认已运行 `npx prisma db push`

   **错误**: `Environment variable not found: DATABASE_URL`
   **原因**: Vercel 环境变量未配置
   **解决**:
   - 进入 Vercel Dashboard > Settings > Environment Variables
   - 确认所有必需变量已添加

### ❌ 问题2: Redis 连接超时

**原因**: Upstash Redis 配置格式错误

**解决**:
- 检查环境变量是否包含引号 (不应该有)
- 正确格式:
  ```bash
  UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
  # 不要用:
  # UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
  ```

### ❌ 问题3: 数据库连接失败

**原因**: 使用了 localhost 或直连 URL

**解决**:
- Supabase 必须使用 **Connection Pooling** URL
- 格式: `postgres://...@...pooler.supabase.com:6543/...`
- 必须包含 `?sslmode=require&pgbouncer=true`

### ❌ 问题4: 构建时 Redis 初始化错误

**原因**: 构建阶段不应该连接 Redis

**解决**: 已修复,代码会跳过构建阶段的连接
```typescript
if (process.env.NEXT_PHASE === 'phase-production-build') {
  throw new Error('Redis connection should not be initialized during build');
}
```

---

## 🔧 高级配置

### Vercel 构建设置

- **Framework Preset**: Next.js
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`
- **Node.js Version**: 18.x (默认)

### Serverless 函数配置

已在代码中配置:
```typescript
export const maxDuration = 30; // 30秒超时
export const dynamic = 'force-dynamic'; // 禁用静态生成
export const runtime = 'nodejs'; // Node.js 运行时
```

### 启用边缘日志

Vercel Dashboard > Settings > Logs > Enable "Real-time Logs"

---

## 📞 获取帮助

如果遇到问题:

1. **检查日志**:
   ```bash
   vercel logs --follow
   ```

2. **运行诊断脚本**:
   ```bash
   node scripts/check-env.mjs
   ```

3. **查看文档**:
   - `VERCEL_DEPLOYMENT.md` - 详细部署指南
   - `FIXES_SUMMARY.md` - 问题修复说明

4. **提供信息**:
   - 错误截图
   - Vercel 函数日志
   - 环境变量配置状态

---

**最后更新**: 2025-10-31
