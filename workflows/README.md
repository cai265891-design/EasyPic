# 工作流系统 - 亚马逊商品 Listing 自动化

基于 **Postgres FSM + BullMQ + Claude API** 的工作流引擎，替代 n8n 方案。

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js App Router                      │
│                   /api/workflows/* routes                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
           ┌───────────────────────────────┐
           │  PostgreSQL (State Machine)    │
           │  - WorkflowExecution          │
           │  - Product, Listing, ImageSet │
           └───────────────┬───────────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
┌──────────────────┐              ┌──────────────────┐
│  BullMQ Queues   │              │   Redis Server   │
│  - image-recog   │◄─────────────│   (Queue Store)  │
│  - listing-gen   │              │                  │
│  - image-gen     │              └──────────────────┘
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Worker Process  │
│  (pnpm workers)  │
│                  │
│  ┌─────────────┐ │
│  │ Claude API  │ │ ← Image Recognition & Listing Gen
│  └─────────────┘ │
│  ┌─────────────┐ │
│  │ Ideogram API│ │ ← Image Generation (planned)
│  └─────────────┘ │
│  ┌─────────────┐ │
│  │ S3/R2 Store │ │ ← Image Upload
│  └─────────────┘ │
└──────────────────┘
```

## 📋 功能清单

### ✅ 已实现

- [x] PostgreSQL 数据模型（7 个表）
- [x] BullMQ 队列配置（4 个队列）
- [x] 图片识别 Worker（Claude Vision API）
- [x] 文案生成 Worker（Claude API）
- [x] S3/R2 存储服务
- [x] API 路由（启动工作流、查询状态）
- [x] 错误重试机制（指数退避）
- [x] 熔断器（Circuit Breaker）
- [x] 质量评分系统（0-100 分）
- [x] 版本控制（支持重新生成）

### 🚧 待实现

- [ ] 图片生成 Worker（Ideogram/DALL-E）
- [ ] 重新生成 API（description, listing, images）
- [ ] Dashboard 页面（查看工作流历史）
- [ ] WebSocket 实时进度推送
- [ ] 成本追踪和配额管理
- [ ] BullMQ Board 监控面板

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动基础设施

```bash
# 启动 Redis 和 PostgreSQL（使用 Docker）
pnpm docker:dev

# 或者使用本地服务
# Redis: brew install redis && brew services start redis
# PostgreSQL: 使用 Neon/Supabase 云数据库
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填写以下必需变量：

```env
# 数据库
DATABASE_URL='postgres://user:password@host:5432/dbname'

# Redis
REDIS_URL='redis://localhost:6379'

# Claude API
ANTHROPIC_API_KEY='sk-ant-xxx'

# 存储（Cloudflare R2 或 AWS S3）
CLOUDFLARE_R2_ACCESS_KEY='xxx'
CLOUDFLARE_R2_SECRET_KEY='xxx'
CLOUDFLARE_R2_BUCKET='amazon-images'
CLOUDFLARE_R2_PUBLIC_URL='https://pub-xxx.r2.dev'
```

### 4. 初始化数据库

```bash
# 生成 Prisma Client 并推送 Schema
npx prisma generate
npx prisma db push
```

### 5. 启动服务

**终端 1：Next.js 开发服务器**

```bash
pnpm dev
```

**终端 2：Worker 进程**

```bash
pnpm workers
```

## 📡 API 使用示例

### 启动新工作流

```bash
curl -X POST http://localhost:3000/api/workflows/start \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-session-cookie>" \
  -d '{
    "imageUrl": "https://example.com/product.jpg",
    "category": "Electronics",
    "brand": "MyBrand"
  }'
```

**响应：**

```json
{
  "success": true,
  "workflowId": "clxxx123",
  "jobId": "1",
  "status": "queued",
  "message": "工作流已启动，正在处理中..."
}
```

### 查询工作流状态

```bash
curl http://localhost:3000/api/workflows/clxxx123 \
  -H "Cookie: <your-session-cookie>"
```

**响应（处理中）：**

```json
{
  "id": "clxxx123",
  "status": "PROCESSING",
  "currentStep": "IMAGE_RECOGNITION",
  "progress": 30,
  "product": null,
  "listing": null,
  "images": null
}
```

**响应（完成）：**

```json
{
  "id": "clxxx123",
  "status": "COMPLETED",
  "currentStep": "LISTING_GENERATION",
  "progress": 100,
  "product": {
    "id": "prod123",
    "description": "这是一款蓝牙无线耳机...",
    "keywords": ["蓝牙", "无线", "耳机", "降噪"],
    "confidence": 0.92
  },
  "listing": {
    "id": "list123",
    "title": "MyBrand Premium Wireless Headphones...",
    "description": "Experience superior sound quality...",
    "bulletPoints": [
      "【Premium Quality】Made from high-grade materials...",
      "【Ergonomic Design】Thoughtfully designed...",
      "【Versatile Application】Perfect for multiple settings...",
      "【Easy Maintenance】Simple cleaning...",
      "【Customer Satisfaction】18-month warranty..."
    ],
    "keywords": ["wireless", "bluetooth", "headphones", "premium"],
    "qualityScore": 85,
    "approved": true
  },
  "images": null
}
```

## 🔧 开发指南

### 项目结构

```
next-saas-stripe-starter/
├── prisma/
│   └── schema.prisma          # 数据模型（新增 7 个工作流表）
├── lib/
│   ├── queues/
│   │   ├── config.ts          # Redis 连接配置
│   │   └── index.ts           # BullMQ 队列定义
│   └── services/
│       ├── claude.ts          # Claude API 客户端
│       └── storage.ts         # S3/R2 存储服务
├── workers/
│   ├── index.ts               # Worker 主入口
│   ├── image-recognition.worker.ts
│   └── listing-generation.worker.ts
├── app/api/workflows/
│   ├── start/route.ts         # POST 启动工作流
│   └── [id]/route.ts          # GET 查询工作流
└── docker-compose.dev.yml     # 本地开发环境
```

### 数据库模型说明

**WorkflowExecution**：工作流执行记录

- `status`: PENDING → PROCESSING → COMPLETED | FAILED
- `currentStep`: IMAGE_DOWNLOAD → IMAGE_RECOGNITION → LISTING_GENERATION → IMAGE_SET_GENERATION
- `version`: 版本号（用于重新生成）
- `parentId`: 指向上一个版本

**Product**：图片识别结果

- `description`: AI 生成的商品描述
- `keywords`: 提取的关键词（JSON 数组）
- `confidence`: 置信度分数（0-1）

**Listing**：亚马逊 Listing 文案

- `title`: 标题（150-200 字符）
- `description`: 详细描述（250-350 字）
- `bulletPoints`: 5 个卖点（JSON 数组）
- `qualityScore`: 质量分数（0-100）
- `approved`: 是否自动通过（score >= 80）

### 队列配置

| 队列名                    | 超时时间 | 重试次数 | 并发数 |
| ------------------------- | -------- | -------- | ------ |
| `image-recognition`       | 60s      | 3        | 5      |
| `listing-generation`      | 90s      | 3        | 3      |
| `image-generation`        | 10min    | 2        | 2      |
| `image-single-generation` | 2min     | 2        | 5      |

### Worker 工作流程

**图片识别 Worker**：

1. 从队列拉取任务
2. 更新工作流状态 → PROCESSING
3. 下载图片并验证
4. 调用 Claude Vision API
5. 保存 Product 记录
6. 触发下一步（文案生成）

**文案生成 Worker**：

1. 加载 Product 数据
2. 调用 Claude API 生成 Listing
3. 质量检查（标题、描述、卖点、关键词、合规性）
4. 计算质量分数（0-100）
5. 保存 Listing 记录
6. 触发下一步（图片生成）

## 🐛 调试技巧

### 查看 Worker 日志

Worker 日志会输出到终端，格式如下：

```
[图片识别] 开始处理工作流 clxxx123, 图片: https://...
[图片识别] 图片下载完成，大小: 245678 bytes
[图片识别] AI 分析完成，置信度: 0.92
✅ [图片识别] 任务 1 完成

[文案生成] 开始处理工作流 clxxx123
[文案生成] AI 生成完成，标题: MyBrand Premium Wireless Headphones...
[文案生成] 质量评分: 85/100, 自动通过
✅ [文案生成] 任务 2 完成
```

### 检查 Redis 队列

```bash
# 进入 Redis CLI
docker exec -it workflow-redis redis-cli

# 查看队列长度
LLEN bull:image-recognition:wait
LLEN bull:listing-generation:wait

# 查看失败的任务
LLEN bull:image-recognition:failed
```

### 使用 Prisma Studio

```bash
npx prisma studio

# 打开 http://localhost:5555
# 查看 WorkflowExecution、Product、Listing 表
```

## 📊 监控和告警

### 关键指标

- **成功率**：每个队列的成功/失败比例
- **处理时间**：P50, P95, P99 延迟
- **成本**：Claude API 调用成本
- **队列积压**：待处理任务数量

### BullMQ Board（计划中）

访问 `/api/admin/queues` 查看：

- 实时队列状态
- 任务详情和日志
- 失败任务重试
- 性能图表

## 🚨 故障排查

### 问题：Worker 无法连接 Redis

```
❌ Redis connection error: ECONNREFUSED
```

**解决方案**：

```bash
# 检查 Redis 是否运行
docker ps | grep redis

# 或重启 Redis
pnpm docker:dev
```

### 问题：Claude API 429 错误

```
❌ [图片识别] 任务 5 失败: Rate limit exceeded
```

**解决方案**：

- Worker 会自动重试（指数退避）
- 检查 Claude API 配额：https://console.anthropic.com/settings/limits

### 问题：图片下载超时

```
❌ 下载图片失败: 408 Request Timeout
```

**解决方案**：

- 检查图片 URL 是否可访问
- 增加超时时间（在 `lib/services/storage.ts` 中）

## 🔮 下一步计划

1. **图片生成 Worker**：集成 Ideogram API，生成 5 张商品展示图
2. **重新生成功能**：支持部分重新生成（只重新生成某个步骤）
3. **Dashboard UI**：可视化工作流历史和状态
4. **配额管理**：限制用户每日工作流数量（按订阅等级）
5. **成本追踪**：记录每个工作流的 AI API 成本

## 📚 参考文档

- [BullMQ 文档](https://docs.bullmq.io/)
- [Claude API 文档](https://docs.anthropic.com/claude/reference)
- [Prisma 文档](https://www.prisma.io/docs)
- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
