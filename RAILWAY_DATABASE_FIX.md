# Railway DATABASE_URL 占位符问题修复指南

## 🔴 问题现象

Worker 启动日志显示:
```
⚠️  DATABASE_URL 格式可能不正确: postgres://[user]:***@[neon_hostname]/[dbname]?sslmode=require
```

**根本原因**: DATABASE_URL 是占位符,不是真实的数据库连接字符串。

---

## ✅ 解决方案 (3 步完成)

### 步骤 1: 检查是否已添加 PostgreSQL 插件

在 Railway 项目页面:
1. 查看是否有 **PostgreSQL** 服务卡片
2. 如果**没有**,继续步骤 2
3. 如果**有**,跳到步骤 3

---

### 步骤 2: 添加 PostgreSQL 数据库插件

1. **点击 "+ New"** (右上角)
2. **选择 "Database" → "Add PostgreSQL"**
3. Railway 会自动创建 PostgreSQL 实例
4. 等待 2-3 秒,数据库状态变为 **Running** (绿色)

**预期结果**: 看到一个新的 PostgreSQL 服务卡片

---

### 步骤 3: 连接 Worker 服务与 PostgreSQL

#### 方式 A: 自动连接 (推荐)
1. **点击 Worker 服务卡片**
2. **进入 "Variables" 标签**
3. **点击 "New Variable" → "Add Reference"**
4. 选择:
   - **Service**: PostgreSQL
   - **Variable**: `DATABASE_PRIVATE_URL` (推荐,内网连接)
   - **Expose As**: `DATABASE_URL`
5. **点击 "Add"**

#### 方式 B: 手动复制 (备选)
1. **点击 PostgreSQL 服务卡片**
2. **进入 "Variables" 标签**
3. **复制 `DATABASE_PRIVATE_URL` 的值** (推荐)
   - 格式示例: `postgresql://postgres:xxx@postgres.railway.internal:5432/railway`
4. **回到 Worker 服务 → Variables 标签**
5. **编辑或新建 `DATABASE_URL`**,粘贴刚才复制的值
6. **保存**

---

### 步骤 4: 重启 Worker 服务并验证

1. Railway 会自动重启 Worker (或手动点击 **Restart**)
2. **查看 Deployments 日志**,应该看到:

**成功的日志**:
```
✅ DATABASE_URL: 已设置
📊 数据库连接 URL 诊断
==================================================
原始 URL: postgresql://postgres:***@postgres.railway.internal:5432/railway
✅ URL 格式验证通过
   协议:   postgresql
   主机:   postgres.railway.internal
   端口:   5432
   数据库: railway
==================================================
✅ 环境变量检查通过,启动 Worker...
🔌 使用 Upstash Redis (TLS): rediss://...
✅ Redis connected successfully
🚀 所有 Worker 已启动，等待任务...
```

**如果还是看到占位符错误**:
```
❌ DATABASE_URL 是占位符格式,未正确配置!
```
说明步骤 3 没有正确完成,请重新检查 Worker 服务的 Variables 标签。

---

## 🎯 快速检查清单

在 Railway Worker 服务的 **Variables** 标签页中,确认:

- [ ] `DATABASE_URL` 存在
- [ ] `DATABASE_URL` 的值**不包含** `[user]`, `[neon_hostname]`, `[dbname]` 等占位符
- [ ] `DATABASE_URL` 格式为 `postgresql://用户:密码@主机:端口/数据库`
- [ ] `REDIS_URL` 存在
- [ ] `ANTHROPIC_API_KEY` 存在

---

## 💡 为什么推荐使用 DATABASE_PRIVATE_URL?

| 特性 | DATABASE_URL (公网) | DATABASE_PRIVATE_URL (内网) |
|------|---------------------|----------------------------|
| **网络** | 走公网,可能有 IPv6 | Railway 内网,使用域名 |
| **延迟** | ~20-50ms | ~2-5ms ⚡ |
| **安全性** | 暴露在公网 | 只在内网访问 🔒 |
| **稳定性** | 依赖外网 | 内网更稳定 |
| **IPv6 问题** | 可能遇到 | 不会遇到 ✅ |

---

## 🔍 故障排查

### 问题 1: 找不到 DATABASE_PRIVATE_URL

**原因**: Railway PostgreSQL 插件版本较旧

**解决**:
1. 使用 `DATABASE_URL` 即可 (公网连接)
2. 代码会自动修复 IPv6 格式问题

### 问题 2: Worker 服务没有自动获取 DATABASE_URL

**原因**: Worker 服务与 PostgreSQL 未关联

**解决**:
1. 在 Railway 项目设置中,确认 Worker 和 PostgreSQL 在同一个 Project 下
2. 或手动复制 PostgreSQL 的连接字符串到 Worker 服务的环境变量

### 问题 3: 数据库连接后没有表

**解决**:
```bash
# 在 Railway Worker 服务的 Shell 中执行
npx prisma db push --accept-data-loss
```

---

## 📚 相关文档

- [Railway PostgreSQL 文档](https://docs.railway.app/databases/postgresql)
- [Prisma 连接字符串格式](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- `RAILWAY_DEPLOY_CHECKLIST.md` - 完整部署清单

---

**预计修复时间**: 2-5 分钟
**需要重启**: 是
