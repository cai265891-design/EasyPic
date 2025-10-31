# Worker 部署指南 (Railway)

## 🚨 重要说明

**Vercel 不支持后台 Workers!** BullMQ Workers 需要持续运行,必须部署到支持长期进程的平台。

---

## 🚀 Railway 部署步骤

### 步骤 1: 创建 Railway 账号

1. 访问 https://railway.app/
2. 使用 GitHub 账号登录
3. 免费额度: $5/月 (足够运行 Workers)

---

### 步骤 2: 从 GitHub 部署

1. 点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 授权 Railway 访问你的 GitHub
4. 选择仓库: `cai265891-design/EasyPic`
5. 点击 "Deploy Now"

---

### 步骤 3: 配置环境变量

在 Railway 项目中,点击 "Variables" 标签,添加以下环境变量:

```bash
# ===== 数据库 =====
DATABASE_URL=postgres://postgres.kzkczxxinltosfcnesjp:JU0cC0VBpKDQQ8x2@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true

# ===== Redis (必须!) =====
REDIS_URL=redis://default:AV7KAAIncDJkMjk1MDM5ZThkYmI0NjM2YjIxOWJkOGY0NjAzOGQzOHAyMjQyNjY@splendid-walleye-24266.upstash.io:6379

# 或使用 Upstash REST URL
UPSTASH_REDIS_REST_URL=https://splendid-walleye-24266.upstash.io
UPSTASH_REDIS_REST_TOKEN=AV7KAAIncDJkMjk1MDM5ZThkYmI0NjM2YjIxOWJkOGY0NjAzOGQzOHAyMjQyNjY

# ===== AI API (可选,如果使用) =====
ANTHROPIC_API_KEY=你的Claude API Key

# ===== Cloudflare R2 =====
CLOUDFLARE_R2_ACCESS_KEY=e83ba86a51a5c71b66d71b5fe82ccbeb
CLOUDFLARE_R2_SECRET_KEY=644aaf04810528ffcf0b1409415d48285c2abfda9233701483a8b9da13d46914
CLOUDFLARE_R2_BUCKET=tushenshi
CLOUDFLARE_R2_ENDPOINT=https://36d6f9be5f397dc18dc3062f08e1d969.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://pub-51ebc0ca5d1c4e90b737d68fb96c1a28.r2.dev
```

---

### 步骤 4: 配置启动命令

在 Railway 项目设置中:

1. 点击 "Settings" → "Deploy"
2. **Start Command**: `pnpm workers:prod`
3. **Build Command**: `pnpm install` (Railway 会自动检测)
4. 保存设置

---

### 步骤 5: 触发部署

1. Railway 会自动构建和部署
2. 查看日志,应该看到:
   ```
   🚀 所有 Worker 已启动，等待任务...
   [图片识别] Worker 已启动
   [文案生成] Worker 已启动
   [图片生成] Worker 已启动
   ```

---

## ✅ 验证 Workers 是否正常运行

### 1. 查看 Railway 日志

在 Railway Dashboard 查看实时日志:
```
✅ Redis connected successfully
🚀 所有 Worker 已启动，等待任务...
```

### 2. 测试工作流

1. 访问 https://easypic.vip/generate
2. 上传图片
3. 在 Railway 日志中应该看到:
   ```
   [图片识别] 开始处理任务: workflowId=xxx
   [图片识别] 任务完成 (耗时: 3.5s)
   [文案生成] 开始处理任务: workflowId=xxx
   ```

---

## 🔧 故障排查

### 问题 1: Workers 启动失败

**检查**:
- Railway 环境变量是否配置完整
- `DATABASE_URL` 和 `REDIS_URL` 是否正确

**解决**:
```bash
# 查看 Railway 日志
railway logs
```

### 问题 2: Redis 连接失败

**检查**: Upstash Redis URL 格式

**正确格式**:
```bash
REDIS_URL=redis://default:PASSWORD@HOST:6379
```

**从 REST URL 转换**:
```bash
# Upstash REST URL
UPSTASH_REDIS_REST_URL=https://splendid-walleye-24266.upstash.io

# 转换为 Redis URL
REDIS_URL=redis://default:TOKEN@splendid-walleye-24266.upstash.io:6379
```

### 问题 3: 任务处理失败

**检查 Worker 日志**:
- 是否有错误堆栈
- AI API 是否配置正确
- Cloudflare R2 是否可访问

---

## 🌐 其他部署选项

如果不想用 Railway,也可以选择:

### Render.com
1. 创建 "Background Worker" 服务
2. 连接 GitHub 仓库
3. 设置启动命令: `pnpm workers:prod`
4. 配置环境变量

### Fly.io
```bash
fly launch
fly secrets set DATABASE_URL=xxx REDIS_URL=xxx
fly deploy
```

### Docker (自托管)
```bash
docker build -t easypic-workers .
docker run -e DATABASE_URL=xxx -e REDIS_URL=xxx easypic-workers
```

---

## 📊 监控和维护

### 查看 Worker 状态

Railway Dashboard → Metrics:
- CPU 使用率
- 内存使用
- 请求日志

### 重启 Workers

如果 Workers 卡住:
```bash
# Railway CLI
railway restart

# 或在 Dashboard 点击 "Restart"
```

---

## 💰 成本估算

**Railway 免费额度**:
- $5/月 免费额度
- Worker 服务通常消耗 $2-3/月
- 足够个人项目使用

**付费后**:
- 按使用量计费
- 约 $5-10/月 (中等流量)

---

## 🎯 总结

1. ✅ Vercel 部署前端和 API
2. ✅ Railway 部署 Workers
3. ✅ 两者通过 Redis 和数据库通信
4. ✅ 完整的异步工作流系统

**架构图**:
```
用户 → Vercel (API) → Redis Queue
                          ↓
                    Railway (Workers)
                          ↓
                    处理完成 → 写入数据库
                          ↓
                    Vercel (API) → 返回结果
```

---

**部署完成后,更新 README 并通知用户!** 🚀
