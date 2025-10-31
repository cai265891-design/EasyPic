# Vercel 500 错误修复总结

## 🐛 问题描述
在 Vercel 部署后,上传图片时出现 500 错误:
```
Failed to create project: Error: 启动工作流失败
api/workflows/start: Failed to load resource: the server responded with a status of 500
```

## 🔍 根本原因分析

### 问题 1: Redis 连接配置不兼容 Serverless 环境
**文件**: `lib/queues/config.ts`

**问题**:
- 使用 `lazyConnect: false` 导致冷启动时阻塞
- 未正确处理 Upstash Redis 的 TLS 连接
- 缺少异步连接方法,导致 API 路由在连接建立前就尝试使用 Redis

**影响**:
- Serverless 函数初始化超时
- Redis 连接失败导致 BullMQ 队列初始化失败

### 问题 2: API 路由缺少错误处理
**文件**: `app/api/workflows/start/route.ts`

**问题**:
- 没有等待 Redis 连接建立就尝试创建队列任务
- 错误信息不够详细,难以调试
- 没有设置 Serverless 函数超时时间

### 问题 3: 环境变量配置不完整
**问题**:
- `.env.local` 使用 `localhost` 地址,无法在 Vercel 使用
- 缺少 Upstash Redis 的正确配置方式
- 缺少部署指南文档

## ✅ 修复内容

### 1. Redis 连接配置优化
**文件**: `lib/queues/config.ts`

**改进**:
- ✅ 添加 Upstash Redis 自动检测和 TLS 配置
- ✅ 改用 `lazyConnect: true` 适配 Serverless 环境
- ✅ 新增 `ensureConnection()` 异步方法
- ✅ 优化重试策略 (500ms-2s 间隔,最多 3 次)
- ✅ 添加详细日志便于调试

**关键代码**:
```typescript
// 自动检测 Upstash Redis
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const upstashHost = process.env.UPSTASH_REDIS_REST_URL.replace('https://', '');
  redisUrl = `rediss://:${process.env.UPSTASH_REDIS_REST_TOKEN}@${upstashHost}:6379`;
  redisOptions.tls = { rejectUnauthorized: false };
}

// 异步连接方法
export async function ensureConnection(): Promise<Redis> {
  const conn = getConnection();
  if (conn.status === 'ready') return conn;
  await conn.connect();
  return conn;
}
```

### 2. API 路由增强错误处理
**文件**: `app/api/workflows/start/route.ts`

**改进**:
- ✅ 添加 Redis 连接检查和重试逻辑
- ✅ 设置 `maxDuration = 30` 秒
- ✅ 增强错误日志,包含环境变量配置状态
- ✅ 返回 503 状态码(服务不可用)而非 500(服务器错误)
- ✅ 连接失败时更新工作流状态为 FAILED

**关键代码**:
```typescript
// 确保 Redis 连接已建立
try {
  await ensureConnection();
} catch (redisError) {
  // 标记工作流为失败
  await prisma.workflowExecution.update({
    where: { id: workflow.id },
    data: { status: "FAILED", errorMessage: `Redis 连接失败: ${redisError.message}` },
  });
  return NextResponse.json({ error: "无法连接到任务队列服务" }, { status: 503 });
}
```

### 3. 部署文档和工具

**新增文件**:
- ✅ `VERCEL_DEPLOYMENT.md` - 完整的 Vercel 部署指南
- ✅ `scripts/verify-config.ts` - 环境变量验证脚本
- ✅ `FIXES_SUMMARY.md` (本文件) - 问题修复总结

**部署指南包含**:
1. 必需的环境变量清单
2. Upstash Redis 配置步骤
3. Supabase 数据库配置
4. Cloudflare R2 存储配置
5. 常见问题排查方法
6. 部署检查清单

## 🚀 部署步骤

### 1. 配置 Upstash Redis (推荐)
1. 访问 https://console.upstash.com/
2. 创建新的 Redis 数据库
3. 复制以下环境变量到 Vercel:
   ```bash
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```

### 2. 配置数据库
使用 Supabase 或其他云数据库:
```bash
DATABASE_URL='postgres://user:pass@host:6543/db?sslmode=require&pgbouncer=true'
```

⚠️ **注意**: 不要使用 `localhost` 地址!

### 3. 验证配置
部署前运行:
```bash
npx tsx scripts/verify-config.ts
```

### 4. 部署到 Vercel
```bash
git add .
git commit -m "修复 Vercel 部署 Redis 连接问题"
git push
```

Vercel 会自动触发部署。

### 5. 验证部署
1. 查看 Vercel 函数日志:
   ```bash
   vercel logs --follow
   ```

2. 检查日志中的 Redis 连接状态:
   ```
   🔌 使用 Upstash Redis: xxx.upstash.io
   ✅ Redis connected successfully
   ✅ Redis ready to accept commands
   ```

3. 测试上传图片功能

## 📊 修改文件清单

- ✅ `lib/queues/config.ts` - Redis 连接配置优化
- ✅ `app/api/workflows/start/route.ts` - API 路由错误处理
- ✅ `VERCEL_DEPLOYMENT.md` - 部署指南 (新增)
- ✅ `scripts/verify-config.ts` - 配置验证脚本 (新增)
- ✅ `CLAUDE.md` - 添加验证命令
- ✅ `FIXES_SUMMARY.md` - 本文件 (新增)

## 🔧 技术细节

### Upstash Redis vs 标准 Redis
| 特性 | 标准 Redis | Upstash Redis |
|------|-----------|---------------|
| 协议 | redis:// | rediss:// (TLS) |
| 端口 | 6379 | 6379 |
| 认证 | 用户名+密码 | 仅密码 |
| TLS | 可选 | 必需 |
| Serverless | 不友好 | ✅ 优化 |

### Serverless 环境注意事项
1. **冷启动**: 函数休眠后首次调用需要初始化,使用 `lazyConnect: true`
2. **连接池**: Serverless 不适合长连接,使用 `maxRetriesPerRequest: null`
3. **超时**: 设置 `maxDuration` 避免函数执行超时
4. **离线队列**: 启用 `enableOfflineQueue` 缓冲连接建立前的命令

## 🎯 后续优化建议

1. **添加健康检查 API**:
   ```typescript
   // app/api/health/route.ts
   export async function GET() {
     const redis = await ensureConnection();
     await redis.ping();
     return NextResponse.json({ status: 'ok' });
   }
   ```

2. **添加 Sentry 错误追踪**:
   ```bash
   pnpm add @sentry/nextjs
   ```

3. **考虑使用 Vercel KV**:
   ```bash
   # Vercel 原生 Redis 服务,零配置
   vercel env pull .env.local
   ```

4. **工作流降级策略**:
   - Redis 不可用时,直接调用 Claude API (同步处理)
   - 数据库轮询作为降级方案

## 📞 问题反馈
如果部署后仍有问题,请提供:
1. Vercel 函数日志 (`vercel logs`)
2. 错误截图
3. 环境变量配置状态 (运行 `verify-config.ts`)

---
**修复完成时间**: 2025-10-31
**修复人**: Claude Code
