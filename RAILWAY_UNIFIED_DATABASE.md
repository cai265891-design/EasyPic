# Railway Worker 统一使用 Supabase 数据库

## ✅ 已完成的架构优化

本项目已优化为**统一数据库架构**:
- Web 应用 (Vercel) 和 Worker 服务 (Railway) 共用 **Supabase PostgreSQL**
- 删除了 Railway 独立的 PostgreSQL 插件
- 降低成本,简化部署和维护

---

## 🏗️ 统一后的架构

```
┌──────────────────────────────────────────────────┐
│  Supabase PostgreSQL (统一数据库)                 │
│  Database: postgres                               │
│  Host: aws-1-us-east-1.pooler.supabase.com       │
│  ┌────────────────────────────────────────────┐  │
│  │ 用户认证表 (NextAuth)                       │  │
│  │  - User, Account, Session                  │  │
│  │  - VerificationToken                       │  │
│  ├────────────────────────────────────────────┤  │
│  │ 工作流系统表 (BullMQ Workers)               │  │
│  │  - WorkflowExecution                       │  │
│  │  - Product, Listing                        │  │
│  │  - ImageSet, ProductImage                  │  │
│  │  - RegenerationLog                         │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
         ↑                           ↑
         │                           │
   ┌─────────┐                ┌──────────┐
   │Web 应用 │                │Worker 服务│
   │(Vercel) │                │(Railway)  │
   └─────────┘                └──────────┘
```

---

## 📋 Railway Worker 环境变量配置

在 Railway Worker 服务的 **Variables** 标签中配置:

### 必需变量

```bash
# 数据库 - 使用 Supabase (与 Web 应用共用)
DATABASE_URL=postgres://postgres.xxx:xxx@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true

# Redis - 使用 Upstash (免费额度)
REDIS_URL=redis://default:xxx@xxx.upstash.io:6379
# 或使用 UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN

# Claude AI API
ANTHROPIC_API_KEY=sk-ant-xxx

# Cloudflare R2 存储
CLOUDFLARE_R2_ACCESS_KEY=xxx
CLOUDFLARE_R2_SECRET_KEY=xxx
CLOUDFLARE_R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET=tushenshi
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

**注意**:
- ✅ 使用 Supabase 的 **Pooler 连接** (端口 6543,带 `pgbouncer=true`)
- ✅ 确保 `sslmode=require` (Supabase 需要 SSL)
- ❌ 不要使用 Supabase 的 Direct 连接 (端口 5432) - Worker 可能会耗尽连接池

---

## 🚀 部署步骤 (首次部署或迁移)

### 1. 配置环境变量

在 Railway Worker 服务的 Variables 中:
- 添加或更新 `DATABASE_URL` 为 Supabase 连接字符串
- 配置其他必需变量 (REDIS_URL, ANTHROPIC_API_KEY 等)

### 2. 推送代码到 GitHub

```bash
git push origin main
```

Railway 会自动触发部署。

### 3. 验证部署

查看 Railway Worker 的 Deployments 日志,确认:

**成功日志示例**:
```
🔍 检查数据库连接...
✅ DATABASE_URL 已配置
📊 初始化数据库表结构...
Datasource "db": PostgreSQL database at "aws-1-us-east-1.pooler.supabase.com:6543"
✅ 数据库表结构初始化完成
✅ 环境变量检查通过,启动 Worker...
🚀 所有 Worker 已启动，等待任务...
```

### 4. 检查 Supabase 表

登录 Supabase 控制台 → Table Editor,应该能看到新增的表:
- `WorkflowExecution`
- `Product`
- `Listing`
- `ImageSet`
- `ProductImage`
- `RegenerationLog`

---

## ✅ 统一数据库的优势

### 1. 降低成本
- ❌ 删除: Railway PostgreSQL 插件 (省略 $5-10/月)
- ✅ 使用: Supabase 免费额度 (500MB 存储,足够使用)

### 2. 简化部署
- ❌ 不需要: 在 Railway 管理独立数据库
- ✅ 只需: 配置一个 DATABASE_URL 环境变量

### 3. 数据统一
- ✅ Web 应用可以直接查询工作流状态
- ✅ 用户数据和工作流数据在同一个库,方便关联查询
- ✅ 统一备份和迁移

### 4. 更好的性能
- ✅ Supabase Pooler 连接 (连接池管理)
- ✅ 全球 CDN 加速 (AWS Global)
- ✅ 自动索引优化

---

## 🔍 常见问题

### Q1: Supabase 免费额度够用吗?

**A**: 对于中小型项目完全够用:
- **存储**: 500MB (可存储数万条工作流记录)
- **带宽**: 5GB/月 (API 请求)
- **API 请求**: 无限制

如果超出,可以升级到 Pro 计划 ($25/月,2TB 传输量)。

### Q2: 会不会影响 Web 应用性能?

**A**: 不会,原因:
- Worker 和 Web 应用使用不同的连接池
- Supabase Pooler 自动管理连接,避免耗尽
- Worker 的数据库操作是异步的,不阻塞 Web 应用

### Q3: 如何监控数据库使用量?

**A**: Supabase 控制台提供详细监控:
```
Supabase 项目 → Settings → Usage
```
可以看到:
- 存储使用量
- 请求次数
- 连接数

### Q4: 数据安全吗?

**A**: 非常安全:
- ✅ SSL/TLS 加密传输 (`sslmode=require`)
- ✅ Supabase 自动备份 (每日)
- ✅ Row Level Security (RLS) 可选
- ✅ 符合 SOC 2 Type II 标准

### Q5: 如何回滚到独立数据库?

**A**: 如果需要,可以随时切换回 Railway PostgreSQL:
1. 在 Railway 添加 PostgreSQL 插件
2. 将 Worker 的 DATABASE_URL 改为 Railway 的连接字符串
3. 重新部署

---

## 📊 性能对比

| 指标 | Railway PostgreSQL | Supabase PostgreSQL |
|------|-------------------|---------------------|
| **连接延迟** | ~20-50ms (Railway 内网) | ~30-60ms (公网) |
| **连接池** | 手动管理 | Pooler 自动管理 ✅ |
| **备份** | 手动配置 | 自动每日备份 ✅ |
| **监控** | 基础监控 | 详细监控面板 ✅ |
| **成本** | $5-10/月 | 免费 (500MB) ✅ |
| **全球访问** | 单区域 | 全球 CDN ✅ |

**结论**: Supabase 在成本、功能、易用性上都更优。

---

## 🛠️ 故障排查

### 问题 1: Worker 启动时提示 DATABASE_URL 未设置

**原因**: Railway 环境变量未正确配置

**解决**:
1. 检查 Railway Worker 的 Variables 标签
2. 确认 `DATABASE_URL` 存在且值正确
3. 重启 Worker 服务

### 问题 2: 连接 Supabase 超时

**原因**: 网络问题或 Supabase 服务异常

**解决**:
1. 检查 Supabase 状态: https://status.supabase.com/
2. 检查 Railway Worker 日志是否有详细错误
3. 尝试使用 Supabase Direct 连接 (端口 5432,但不推荐)

### 问题 3: 表已存在错误

**原因**: Supabase 中已有同名表

**解决**:
```bash
# 在 Railway Worker Shell 中执行
npx prisma db push --force-reset --accept-data-loss
```

⚠️ 警告: 这会删除现有数据!

---

## 📚 相关文档

- [Supabase 数据库文档](https://supabase.com/docs/guides/database)
- [Prisma 连接池配置](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- `RAILWAY_DEPLOY_CHECKLIST.md` - Railway 部署完整清单
- `CLAUDE.md` - 项目架构说明

---

**最后更新**: 2025-10-31
**架构版本**: v2.0 (统一数据库)
