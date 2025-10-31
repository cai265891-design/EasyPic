# Vercel 部署配置指南

## ⚠️ 必须配置的环境变量

在 Vercel 项目设置 > Environment Variables 中添加以下变量:

### 1. 认证配置
```bash
AUTH_SECRET=your-auth-secret  # 生成方式: openssl rand -base64 32
```

### 2. 数据库配置 (使用 Supabase 或其他云数据库)
```bash
# Supabase 示例
DATABASE_URL='postgres://postgres.xxx:password@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true'

# 或使用 Vercel Postgres
# DATABASE_URL=postgres://...
```

**⚠️ 注意**: 不要使用 `localhost` 地址,必须使用云数据库!

### 3. Redis 配置 (使用 Upstash Redis - Vercel 推荐)

#### 方式 1: Upstash Redis (推荐)
```bash
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
```

**获取步骤**:
1. 访问 [Upstash Console](https://console.upstash.com/)
2. 创建新的 Redis 数据库
3. 选择区域 (建议选择与 Vercel 部署区域相同)
4. 复制 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN`

#### 方式 2: 其他 Redis 服务
```bash
REDIS_URL=redis://username:password@your-redis-host:6379
```

### 4. AI API 密钥 (可选,工作流功能需要)
```bash
ANTHROPIC_API_KEY=sk-ant-xxx  # 从 https://console.anthropic.com/ 获取
```

### 5. 图片存储配置 (Cloudflare R2)
```bash
CLOUDFLARE_R2_ACCESS_KEY=your-access-key
CLOUDFLARE_R2_SECRET_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET=your-bucket-name
CLOUDFLARE_R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

**获取步骤**:
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 R2 Object Storage
3. 创建存储桶,记录名称
4. 创建 API 令牌,复制 Access Key 和 Secret Key
5. 在存储桶设置中启用公开访问

### 6. Supabase (可选,用于认证)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🔧 Vercel 项目设置

### 构建配置
- **Framework Preset**: Next.js
- **Build Command**: `pnpm build` (默认)
- **Output Directory**: `.next` (默认)
- **Install Command**: `pnpm install`

### 环境
确保所有环境变量都添加到:
- ✅ Production
- ✅ Preview
- ✅ Development (可选)

## 🚨 常见问题排查

### 问题 1: "启动工作流失败" 500 错误
**可能原因**:
1. ❌ Redis 连接配置错误或缺失
2. ❌ 数据库 URL 使用了 localhost
3. ❌ 环境变量未正确配置

**解决方案**:
- 检查 Vercel 函数日志: `vercel logs --follow`
- 确认 `UPSTASH_REDIS_REST_URL` 或 `REDIS_URL` 已配置
- 确认 `DATABASE_URL` 指向云数据库

### 问题 2: Redis 连接超时
**解决方案**:
- 使用 Upstash Redis (专为 Serverless 优化)
- 确认 Redis 实例在线且可从外网访问
- 检查防火墙规则

### 问题 3: 数据库连接失败
**解决方案**:
- Supabase: 使用 Pooling URL (6543 端口),不要用直连 URL
- 添加 `?sslmode=require` 参数
- 检查数据库白名单设置

## 📝 部署检查清单

部署前确认:
- [ ] 所有必需的环境变量已在 Vercel 中配置
- [ ] 数据库已迁移 (`npx prisma db push`)
- [ ] Redis 实例可从外网访问
- [ ] Cloudflare R2 存储桶已创建并启用公开访问
- [ ] 已在 Vercel 日志中验证环境变量加载成功

部署后验证:
- [ ] 访问首页正常加载
- [ ] 测试用户登录/注册
- [ ] 测试上传图片功能
- [ ] 检查 Vercel 函数日志无错误

## 🔗 相关资源
- [Upstash Redis](https://upstash.com/)
- [Supabase](https://supabase.com/)
- [Cloudflare R2](https://www.cloudflare.com/products/r2/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
