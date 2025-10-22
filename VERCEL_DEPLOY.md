# Vercel 部署指南

## 最小环境变量配置

为了在 Vercel 成功部署并运行 Mock 模式，您需要在 Vercel 项目设置中配置以下环境变量:

### 必需变量

```bash
# App URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Mock 模式 (启用 Mock 数据)
NEXT_PUBLIC_USE_MOCK=true
```

### 可选变量 (如果要使用真实功能)

```bash
# NextAuth (如果需要登录功能)
AUTH_SECRET=your-secret-here-min-32-chars
NEXTAUTH_URL=https://your-app.vercel.app

# Database (如果需要数据库)
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Google OAuth (可选)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret

# GitHub OAuth (可选)
GITHUB_OAUTH_TOKEN=your-github-token

# Email (可选)
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@yourdomain.com

# Stripe (可选)
STRIPE_API_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID=price_xxx
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID=price_xxx
NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID=price_xxx
NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID=price_xxx

# n8n Webhooks (如果需要真实 AI 生成)
N8N_WEBHOOK_ANALYZE=https://your-n8n.com/webhook/analyze-image
N8N_WEBHOOK_COPYWRITING=https://your-n8n.com/webhook/generate-copy
N8N_WEBHOOK_IMAGES=https://your-n8n.com/webhook/generate-images
N8N_SIGNATURE_SECRET=your-webhook-secret
```

## 快速部署步骤

### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "feat: add Amazon Image Generator"
git push origin main
```

### 2. 在 Vercel 导入项目

1. 访问 https://vercel.com/new
2. 选择您的 GitHub 仓库
3. 点击 "Import"

### 3. 配置环境变量

在 Vercel 项目设置页面:

1. 进入 **Settings** → **Environment Variables**
2. 添加以下两个必需变量:

   ```
   NEXT_PUBLIC_APP_URL = https://your-project.vercel.app
   NEXT_PUBLIC_USE_MOCK = true
   ```

3. 点击 **Save**

### 4. 部署

Vercel 会自动开始部署。等待几分钟后，您的应用就可以访问了。

## 测试部署

部署成功后，访问以下页面测试:

- **首页**: `https://your-app.vercel.app/`
- **Dashboard**: `https://your-app.vercel.app/dashboard`
- **生成器**: `https://your-app.vercel.app/generate`
- **结果页 (Mock)**: `https://your-app.vercel.app/result/demo-001`
- **定价**: `https://your-app.vercel.app/pricing`
- **账户**: `https://your-app.vercel.app/account`

## 常见问题

### Q: 部署失败，提示 "Invalid environment variables"

**A**: 确保至少设置了 `NEXT_PUBLIC_APP_URL`。将其他所有变量改为可选后，这应该是唯一必需的变量。

### Q: 页面加载但图片显示不出来

**A**: Mock 模式依赖 `public/examples/before.jpg` 和 `public/examples/after.jpg`。这些是占位图片，您需要:

1. 在本地项目的 `public/examples/` 目录中添加示例图片
2. 重新提交并推送代码
3. Vercel 会自动重新部署

或者临时使用外部图片 URL 修改 `lib/mock.ts` 中的图片路径。

### Q: 如何从 Mock 模式切换到真实模式?

**A**: 在 Vercel 环境变量中:

1. 将 `NEXT_PUBLIC_USE_MOCK` 改为 `false`
2. 配置所有必需的真实 API 密钥 (n8n, Stripe, 数据库等)
3. 重新部署

### Q: 部署后访问任何页面都显示 404

**A**: 检查以下几点:

1. 确保使用了正确的路由 (`/dashboard`, `/generate` 等)
2. 检查 Vercel 构建日志,确保没有编译错误
3. 确认 `app/` 目录下的所有 `page.tsx` 文件都已提交

## 下一步

部署成功后:

1. ✅ 测试所有 Mock 功能
2. 添加真实的示例图片到 `public/examples/`
3. 根据需要逐步配置真实的后端服务 (数据库、n8n、Stripe)
4. 将 `NEXT_PUBLIC_USE_MOCK` 设为 `false` 并测试真实功能

## 回滚到之前版本

如果新部署出现问题,在 Vercel Dashboard:

1. 进入 **Deployments**
2. 找到之前的成功部署
3. 点击 **三个点** → **Promote to Production**
