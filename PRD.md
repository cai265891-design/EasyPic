# 产品需求文档 (PRD)
## AI 亚马逊主图生成器（Amazon Image & Copy Generator）

---

## 📋 文档信息

| 项目 | 内容 |
|------|------|
| 产品名称 | AI 亚马逊主图生成器 |
| 版本 | V1.0 |
| 创建日期 | 2025-10-22 |
| 产品负责人 | - |
| 目标上线时间 | - |

---

## 一、产品概述

### 1.1 产品定位

AI 亚马逊主图生成器是一款面向跨境电商卖家的 SaaS 工具，通过 AI 技术自动生成符合亚马逊主图标准的商品图片和高转化率文案。用户只需上传图片，即可一键生成 5 张专业主图 + 优化后的商品描述，大幅降低制图和文案成本。

### 1.2 产品价值

- **效率提升**：从传统 2-3 小时缩短至 5 分钟内完成
- **成本节约**：无需专业美工和文案团队
- **质量保证**：自动符合亚马逊主图规范（白底图、尺寸、分辨率等）
- **转化优化**：AI 生成 SEO 友好的卖点文案

---

## 二、用户分析

### 2.1 目标用户画像

| 用户类型 | 特征描述 | 使用场景 | 月需求量 |
|----------|----------|----------|----------|
| **中小型亚马逊卖家** | 1-3 人团队，无专职设计师 | 新品上架、图片优化 | 50-200 张图 |
| **店铺运营人员** | 负责多个店铺运营，时间紧张 | 批量上传商品 | 100-500 张图 |
| **跨境电商服务商** | 为多个客户提供图片服务 | 外包项目交付 | 500+ 张图 |
| **选品测试用户** | 需要快速测试多个产品 | 低成本试错 | 20-50 张图 |

### 2.2 用户痛点与需求

#### 核心痛点

1. **制图成本高**
   - 外包设计费用：20-50 元/张
   - 内部美工时间成本高
   - 修改反复沟通成本

2. **主图规则复杂**
   - 亚马逊主图要求严格（白底、纯色背景、尺寸 1000x1000px+）
   - 不同类目有特殊要求
   - 违规导致 Listing 被下架风险

3. **文案撰写困难**
   - 不懂 SEO 关键词布局
   - 无法提炼产品核心卖点
   - 英文文案表达不专业

4. **效率低下**
   - 从 1688 下载图 → PS 抠图 → 添加文字 → 导出，流程繁琐
   - 批量处理困难

#### 用户期望

- ✅ 一键生成，无需学习成本
- ✅ 自动符合亚马逊规范
- ✅ 支持批量处理
- ✅ 提供多种风格模板
- ✅ 生成 SEO 优化文案

---

## 三、产品功能设计

### 3.1 核心功能架构

```
输入层（Input）
└── 图片上传（支持批量）

处理层（AI Processing）
├── 图片处理
│   ├── 背景移除（抠图）
│   ├── 智能裁剪与构图
│   ├── 尺寸标准化（1000x1000px+）
│   ├── 场景图生成（AI 合成）
│   └── 细节图增强
├── 文案生成
│   ├── 标题优化（SEO 关键词）
│   ├── 五点描述（Bullet Points）
│   ├── 产品描述（Description）
│   └── 多语言支持（英文优先）
└── 合规检测
    ├── 亚马逊主图规则校验
    └── 违禁元素检测

输出层（Output）
├── 5 张主图（可编辑、可重新生成）
├── 商品文案（可编辑、可复制）
└── 批量导出（ZIP 下载）
```

### 3.2 详细功能说明

#### 功能 1：智能图片生成

**输入方式：**
- 上传本地图片（支持 JPG、PNG、拖拽上传）
- 批量上传（最多 20 张）

**生成规则：**

| 图片类型 | 要求 | 生成逻辑 |
|----------|------|----------|
| **主图 1（白底图）** | 纯白背景、产品居中、无水印 | AI 抠图 + 白底合成 |
| **主图 2（场景图）** | 产品使用场景 | AI 生成场景背景 + 产品合成 |
| **主图 3（细节图）** | 特写功能细节 | AI 识别关键部位放大 |
| **主图 4（对比图）** | 尺寸标注或对比 | 添加尺寸标注/前后对比 |
| **主图 5（卖点图）** | 核心卖点文字展示 | 提取卖点 + 图文排版 |

**技术要求：**
- 输出分辨率：≥ 1000x1000px（推荐 2000x2000px）
- 格式：JPG/PNG
- 文件大小：≤ 10MB
- 自动符合亚马逊主图规范

#### 功能 2：AI 文案生成

**生成内容：**

1. **商品标题（Title）**
   - 长度：150-200 字符
   - 包含核心关键词 + 品牌 + 卖点
   - 符合亚马逊 SEO 规则

2. **五点描述（Bullet Points）**
   - 5 条关键卖点
   - 每条 200-250 字符
   - 突出产品优势、使用场景、材质工艺等

3. **产品描述（Description）**
   - 详细介绍（500-1000 字）
   - HTML 格式（可选）
   - 包含使用说明、注意事项等

**文案优化策略：**
- SEO 关键词自动嵌入
- 情感化表达（提升转化率）
- 符合目标市场语言习惯（美式英语/英式英语）

**用户可选输入（帮助 AI 生成更精准文案）：**
- 产品名称/标题
- 核心卖点（3-5 个关键词）
- 产品参数（材质、尺寸、重量等）
- 目标市场（美国/英国/日本等）

#### 功能 3：亚马逊规则校验

**自动检测项：**
- ✅ 主图背景是否纯白（RGB 255, 255, 255）
- ✅ 产品占比是否 ≥ 85%
- ✅ 是否包含水印、Logo、促销文字
- ✅ 分辨率是否达标
- ✅ 文案是否包含违禁词

**违规提示：**
- 实时标注不符合项
- 提供修改建议
- 一键修复

#### 功能 4：批量处理与导出

- 支持批量上传多个图片
- 生成结果批量预览
- 一键打包下载（ZIP 格式）
- 支持导出 CSV 文件（包含文案）

---

## 四、产品架构设计

### 4.1 技术栈（基于现有项目）

| 层级 | 技术选型 |
|------|----------|
| **前端** | Next.js 14 (App Router)、React、Tailwind CSS |
| **后端** | Next.js API Routes（业务逻辑）+ n8n（AI 工作流引擎） |
| **工作流引擎** | n8n（自托管/云端）|
| **数据库** | PostgreSQL + Prisma ORM |
| **认证** | NextAuth v5 |
| **支付** | Stripe（订阅制收费） |
| **AI 服务** | - 图片生成：Stability AI / Midjourney API / DALL·E<br>- 抠图：Remove.bg API / Cloudinary AI<br>- 文案生成：OpenAI GPT-4 / Claude API |
| **文件存储** | Cloudflare R2 / AWS S3 |

### 4.2 数据模型设计（Prisma Schema 扩展）

```prisma
model User {
  // ... 现有字段
  credits        Int      @default(0)  // 积分余额
  projects       Project[]
}

model Project {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  name           String   // 项目名称
  status         String   // "processing" | "completed" | "failed"
  images         Image[]
  copywriting    Copywriting?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Image {
  id             String   @id @default(cuid())
  projectId      String
  project        Project  @relation(fields: [projectId], references: [id])
  type           String   // "original" | "main1" | "scene" | "detail" | "compare" | "feature"
  url            String   // 图片存储 URL
  thumbnail      String?  // 缩略图
  width          Int
  height         Int
  fileSize       Int
  createdAt      DateTime @default(now())
}

model Copywriting {
  id             String   @id @default(cuid())
  projectId      String   @unique
  project        Project  @relation(fields: [projectId], references: [id])
  title          String   @db.Text
  bulletPoints   Json     // 数组存储 5 点描述
  description    String   @db.Text
  language       String   @default("en")
  createdAt      DateTime @default(now())
}

model CreditLog {
  id             String   @id @default(cuid())
  userId         String
  amount         Int      // 正数=充值，负数=消费
  type           String   // "purchase" | "generate_image" | "generate_copy"
  projectId      String?
  createdAt      DateTime @default(now())
}
```

### 4.3 n8n 工作流架构设计

#### 整体架构

```
┌──────────────────┐
│   Next.js 前端    │
│   (用户界面)      │
└────────┬─────────┘
         │ HTTP Request
         ▼
┌──────────────────┐
│  Next.js 后端     │
│  - 用户认证       │
│  - 积分扣减       │
│  - 数据库操作     │
└────────┬─────────┘
         │ Webhook
         ▼
┌──────────────────┐
│   n8n 工作流      │ ◄─────┐
│   (AI 处理引擎)   │       │
└────────┬─────────┘       │
         │                  │
         ├─────► Workflow 1: 图片识别
         ├─────► Workflow 2: 文案生成
         └─────► Workflow 3: 图片生成
                            │
         ┌──────────────────┘
         │ Callback Webhook
         ▼
┌──────────────────┐
│  Next.js 后端     │
│  - 接收结果       │
│  - 存储至数据库   │
│  - 通知前端       │
└──────────────────┘
```

#### 核心工作流设计

**n8n 将负责以下 3 个独立工作流：**

---

### 📊 Workflow 1: 图片识别与分析

**触发方式：** Webhook（由 Next.js 调用）

**输入数据：**
```json
{
  "projectId": "cuid_xxx",
  "imageUrl": "https://r2.example.com/uploads/xxx.jpg",
  "userInputs": {
    "productName": "无线蓝牙耳机",
    "category": "电子产品",
    "features": ["降噪", "长续航"]
  }
}
```

**工作流节点：**

```
Webhook 触发
  ↓
下载图片（HTTP Request）
  ↓
图片识别（OpenAI Vision / Claude Vision）
  - 识别产品类型
  - 识别产品主要特征
  - 识别颜色、材质
  - 识别可突出的细节点
  ↓
数据整合（Code Node）
  - 合并用户输入 + AI 识别结果
  - 生成结构化产品信息
  ↓
存储至数据库（Postgres Node）
  - 更新 Project 表
  ↓
触发 Workflow 2（Webhook 调用）
  ↓
返回结果（Respond to Webhook）
```

**输出数据：**
```json
{
  "projectId": "cuid_xxx",
  "analysis": {
    "productType": "Wireless Earbuds",
    "mainColor": "Black",
    "material": "Plastic, Metal",
    "keyFeatures": ["Charging Case", "Touch Control", "LED Display"],
    "detailPoints": ["Ear Tips", "Charging Port", "Control Buttons"]
  }
}
```

---

### ✍️ Workflow 2: 商品文案生成

**触发方式：** Webhook（由 Workflow 1 或 Next.js 调用）

**输入数据：**
```json
{
  "projectId": "cuid_xxx",
  "analysis": { ... },
  "userInputs": { ... },
  "language": "en",
  "targetMarket": "US"
}
```

**工作流节点：**

```
Webhook 触发
  ↓
构建 Prompt（Code Node）
  - 根据产品分析生成文案提示词
  - 包含 SEO 关键词要求
  - 包含亚马逊文案规范
  ↓
并行生成（Split Into Batches）
  ├─► GPT-4: 生成标题（OpenAI Node）
  │     - 150-200 字符
  │     - 包含关键词
  │
  ├─► GPT-4: 生成五点描述（OpenAI Node）
  │     - 5 条卖点
  │     - 每条 200-250 字符
  │
  └─► GPT-4: 生成产品描述（OpenAI Node）
        - 500-1000 字
        - HTML 格式
  ↓
数据聚合（Merge Node）
  ↓
文案校验（Code Node）
  - 检查违禁词
  - 检查字符长度
  - 格式化输出
  ↓
存储至数据库（Postgres Node）
  - 插入 Copywriting 表
  ↓
返回结果（Respond to Webhook）
```

**输出数据：**
```json
{
  "projectId": "cuid_xxx",
  "copywriting": {
    "title": "Wireless Bluetooth Earbuds 5.3...",
    "bulletPoints": [
      "Crystal Clear Sound Quality with...",
      "30H Playtime with Charging Case...",
      "Advanced Noise Cancellation...",
      "IPX7 Waterproof Design...",
      "One-Step Pairing for iOS & Android..."
    ],
    "description": "<p>Experience premium audio...</p>"
  }
}
```

---

### 🎨 Workflow 3: 5 张主图生成

**触发方式：** Webhook（由 Next.js 调用）

**输入数据：**
```json
{
  "projectId": "cuid_xxx",
  "originalImageUrl": "https://r2.example.com/uploads/xxx.jpg",
  "analysis": { ... },
  "copywriting": { ... },
  "style": "modern"
}
```

**工作流节点：**

```
Webhook 触发
  ↓
下载原图（HTTP Request）
  ↓
═══════════════════════════════════════
   并行生成 5 张主图（Split Into Batches）
═══════════════════════════════════════
  │
  ├─► 主图 1: 白底图
  │   ├─ Remove.bg API（抠图）
  │   ├─ Code Node（合成白底）
  │   ├─ Sharp Node（调整尺寸 2000x2000）
  │   └─ 上传至 R2（HTTP Request）
  │
  ├─► 主图 2: 场景图
  │   ├─ Remove.bg API（抠图）
  │   ├─ Stability AI（生成场景背景）
  │   │   - Prompt: "lifestyle scene with [product]"
  │   ├─ Code Node（合成产品 + 场景）
  │   ├─ Sharp Node（调整尺寸）
  │   └─ 上传至 R2
  │
  ├─► 主图 3: 细节图
  │   ├─ Code Node（根据 analysis.detailPoints 裁剪）
  │   ├─ Sharp Node（放大关键细节）
  │   ├─ Code Node（添加标注线）
  │   └─ 上传至 R2
  │
  ├─► 主图 4: 对比图
  │   ├─ Code Node（生成尺寸标注）
  │   ├─ Sharp Node（合成对比布局）
  │   └─ 上传至 R2
  │
  └─► 主图 5: 卖点图
      ├─ Remove.bg API（抠图）
      ├─ Code Node（提取 bulletPoints 前 3 条）
      ├─ Sharp Node（图文排版）
      │   - 产品图 + 文字卖点
      │   - 使用模板样式
      └─ 上传至 R2
  │
  ↓
═══════════════════════════════════════
聚合结果（Merge Node）
  ↓
图片校验（Code Node）
  - 检查尺寸（≥ 1000x1000）
  - 检查文件大小（≤ 10MB）
  - 检查白底图背景色（RGB 255,255,255）
  ↓
存储至数据库（Postgres Node）
  - 批量插入 Image 表
  ↓
返回结果（Respond to Webhook）
```

**输出数据：**
```json
{
  "projectId": "cuid_xxx",
  "images": [
    {
      "type": "main1",
      "url": "https://cdn.example.com/xxx_main1.jpg",
      "width": 2000,
      "height": 2000,
      "fileSize": 856432
    },
    { "type": "scene", ... },
    { "type": "detail", ... },
    { "type": "compare", ... },
    { "type": "feature", ... }
  ]
}
```

---

### 🔄 完整调用流程（MVP）

```
用户上传图片
  ↓
Next.js 前端 → Next.js 后端
  ├─ 验证用户登录
  ├─ 检查积分余额（≥ 10）
  ├─ 上传图片至 R2
  ├─ 创建 Project 记录（status: "processing"）
  └─ 扣减 10 积分
  ↓
触发 n8n Workflow 1（图片识别）
  - Webhook: POST https://n8n.example.com/webhook/analyze-image
  ↓
Workflow 1 返回产品分析结果
  ↓
自动触发 Workflow 2（文案生成）
  - 内部 Webhook 调用
  ↓
Workflow 2 返回文案数据
  - 存储至数据库
  ↓
Next.js 后端触发 Workflow 3（图片生成）
  - Webhook: POST https://n8n.example.com/webhook/generate-images
  ↓
Workflow 3 返回 5 张图片 URL
  - 存储至数据库
  - 更新 Project.status = "completed"
  ↓
Next.js 后端通知前端（WebSocket/轮询）
  ↓
前端展示结果
```

---

### 4.4 Next.js 与 n8n 集成方案

#### Next.js API Route 示例

```typescript
// app/api/projects/generate/route.ts
export async function POST(req: Request) {
  const session = await auth()
  const { imageFile, productName, features } = await req.json()

  // 1. 验证用户和积分
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (user.credits < 10) {
    return Response.json({ error: '积分不足' }, { status: 400 })
  }

  // 2. 上传图片至 R2
  const imageUrl = await uploadToR2(imageFile)

  // 3. 创建项目记录
  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: productName || '未命名项目',
      status: 'processing'
    }
  })

  // 4. 扣减积分
  await prisma.user.update({
    where: { id: user.id },
    data: { credits: { decrement: 10 } }
  })

  await prisma.creditLog.create({
    data: {
      userId: user.id,
      amount: -10,
      type: 'generate_image',
      projectId: project.id
    }
  })

  // 5. 调用 n8n Workflow 1
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_ANALYZE
  await fetch(n8nWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId: project.id,
      imageUrl,
      userInputs: { productName, features }
    })
  })

  return Response.json({ projectId: project.id })
}
```

#### n8n Webhook 回调接口

```typescript
// app/api/webhooks/n8n/callback/route.ts
export async function POST(req: Request) {
  const { projectId, type, data } = await req.json()

  // 验证 webhook 签名（安全性）
  const signature = req.headers.get('x-n8n-signature')
  if (!verifyN8nSignature(signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  switch (type) {
    case 'analysis_completed':
      // 存储产品分析结果
      await prisma.project.update({
        where: { id: projectId },
        data: { analysis: data }
      })
      break

    case 'copywriting_completed':
      // 存储文案
      await prisma.copywriting.create({
        data: {
          projectId,
          title: data.title,
          bulletPoints: data.bulletPoints,
          description: data.description
        }
      })
      break

    case 'images_completed':
      // 存储图片
      await prisma.image.createMany({
        data: data.images.map(img => ({
          projectId,
          type: img.type,
          url: img.url,
          width: img.width,
          height: img.height,
          fileSize: img.fileSize
        }))
      })

      // 更新项目状态
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'completed' }
      })
      break
  }

  return Response.json({ success: true })
}
```

---

### 4.5 n8n 部署方案

#### 方案对比

| 方案 | 优势 | 劣势 | 推荐场景 |
|------|------|------|----------|
| **n8n Cloud** | - 无需运维<br>- 自动扩展<br>- 快速启动 | - 月费 $20+<br>- 执行次数限制 | MVP 快速验证 |
| **自托管（Docker）** | - 完全控制<br>- 无执行限制<br>- 成本可控 | - 需要运维<br>- 需配置域名/SSL | 正式上线 |
| **Railway/Render** | - 一键部署<br>- 自动 SSL<br>- 按需计费 | - 月费 $10-30 | 小规模生产 |

**MVP 推荐：** n8n Cloud（快速启动）→ 迁移至自托管（规模化后）

#### 自托管部署（Docker Compose）

```yaml
# docker-compose.yml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=${N8N_HOST}
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://${N8N_HOST}/
      - GENERIC_TIMEZONE=Asia/Shanghai
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    restart: always
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=n8n
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  n8n_data:
  postgres_data:
```

---

## 五、用户界面设计（UI/UX）

### 5.1 页面结构

```
├── 首页（Landing Page）
│   ├── Hero Section（价值主张）
│   ├── 功能介绍（3 大核心功能）
│   ├── 生成示例（Before/After 对比）
│   ├── 定价表格
│   └── CTA（开始免费试用）
│
├── 工作台（Dashboard）
│   ├── 项目列表（历史生成记录）
│   ├── 新建项目入口
│   └── 积分余额显示
│
├── 生成页面（Generator）
│   ├── 图片上传区域
│   │   ├── 拖拽上传
│   │   └── 批量上传（最多 20 张）
│   ├── 产品信息输入（可选）
│   │   ├── 产品名称
│   │   ├── 核心卖点（关键词）
│   │   └── 产品参数（材质、尺寸等）
│   ├── 参数配置（可选）
│   │   ├── 产品类目
│   │   ├── 风格选择（简约/高端/活力等）
│   │   └── 语言选择
│   └── 生成按钮
│
├── 结果页面（Result）
│   ├── 图片预览区（5 张主图网格展示）
│   │   ├── 单张放大查看
│   │   ├── 重新生成按钮
│   │   └── 编辑按钮（简单标注工具）
│   ├── 文案展示区
│   │   ├── 标题（可编辑）
│   │   ├── 五点描述（可编辑）
│   │   ├── 产品描述（可编辑）
│   │   └── 复制按钮
│   └── 导出按钮（ZIP 下载）
│
├── 定价页面（Pricing）
│   ├── 订阅套餐（月付/年付）
│   └── 积分包购买
│
└── 个人中心（Account）
    ├── 订阅管理（Stripe Customer Portal）
    ├── 积分明细
    └── 使用统计
```

### 5.2 关键页面线框图描述

#### 生成页面（Generator）

```
┌─────────────────────────────────────────────┐
│  【新建项目】                               │
├─────────────────────────────────────────────┤
│  [拖拽上传区域]                             │
│  将图片拖到此处，或 [📎 选择文件]          │
│  支持 JPG、PNG 格式，最多 20 张            │
├─────────────────────────────────────────────┤
│  产品信息（可选，帮助 AI 生成更精准文案）  │
│  产品名称：[__________________________]    │
│  核心卖点：[__________________________]    │
│  产品参数：[__________________________]    │
├─────────────────────────────────────────────┤
│  生成设置：                                 │
│  产品类目：[下拉选择] 家居/服装/电子...    │
│  图片风格：[下拉选择] 简约/高端/活力...    │
│  文案语言：[下拉选择] 英文/西班牙语...     │
├─────────────────────────────────────────────┤
│           [🚀 开始生成] (消耗 10 积分)      │
└─────────────────────────────────────────────┘
```

#### 结果页面（Result）

```
┌─────────────────────────────────────────────┐
│  【生成结果】 项目：无线蓝牙耳机           │
├─────────────────────────────────────────────┤
│  图片预览：                                 │
│  ┌───┬───┬───┬───┬───┐                     │
│  │ 1 │ 2 │ 3 │ 4 │ 5 │  (缩略图)           │
│  └───┴───┴───┴───┴───┘                     │
│  [↻ 重新生成] [✏️ 编辑] [⬇️ 下载全部]       │
├─────────────────────────────────────────────┤
│  商品文案：                                 │
│  标题：                                     │
│  ┌─────────────────────────────────────┐   │
│  │ Wireless Bluetooth Earbuds...       │   │
│  └─────────────────────────────────────┘   │
│  [📋 复制]                                  │
│                                             │
│  五点描述：                                 │
│  • Crystal Clear Sound Quality...          │
│  • 30H Playtime with Charging Case...      │
│  ... (可展开编辑)                           │
│                                             │
│  [📋 复制全部文案] [⬇️ 导出为 CSV]          │
└─────────────────────────────────────────────┘
```

---

## 六、商业模式设计

### 6.1 定价策略

#### 订阅制（推荐）

| 套餐 | 价格 | 包含积分/月 | 适合人群 |
|------|------|-------------|----------|
| **免费版** | $0 | 50 积分（5 个项目） | 试用用户 |
| **基础版** | $29/月 | 300 积分（30 个项目） | 个人卖家 |
| **专业版** | $99/月 | 1200 积分（120 个项目） | 小团队 |
| **企业版** | $299/月 | 5000 积分（500 个项目） | 服务商 |

#### 积分消耗规则

| 操作 | 消耗积分 |
|------|----------|
| 生成 1 个项目（5 张图 + 文案） | 10 积分 |
| 单独重新生成 1 张图 | 2 积分 |
| 单独重新生成文案 | 2 积分 |
| 批量生成（10 个商品） | 80 积分（20% 折扣） |

#### 额外积分包

- 100 积分：$15
- 500 积分：$60（20% 折扣）
- 2000 积分：$200（33% 折扣）

### 6.2 收入预测（保守估计）

**假设：**
- 第 1 个月获得 100 个付费用户
- 用户分布：基础版 60%、专业版 30%、企业版 10%
- 月流失率：15%

| 月份 | 付费用户 | 月收入 (MRR) | 累计收入 |
|------|----------|--------------|----------|
| M1 | 100 | $5,460 | $5,460 |
| M3 | 250 | $13,650 | $32,000 |
| M6 | 500 | $27,300 | $120,000 |
| M12 | 1000 | $54,600 | $400,000+ |

---

## 七、技术实现要点

### 7.1 AI 服务选型

#### 图片生成

| 服务 | 优势 | 成本 | 推荐度 |
|------|------|------|--------|
| **Remove.bg API** | 抠图精准、速度快 | $0.20/张 | ⭐⭐⭐⭐⭐ |
| **Cloudinary AI** | 一站式图片处理 | $0.15/张 | ⭐⭐⭐⭐ |
| **Stability AI** | 场景图生成质量高 | $0.05/次 | ⭐⭐⭐⭐⭐ |

#### 文案生成

| 服务 | 优势 | 成本 | 推荐度 |
|------|------|------|--------|
| **OpenAI GPT-4** | 质量最优、SEO 友好 | $0.03/1K tokens | ⭐⭐⭐⭐⭐ |
| **Claude 3.5** | 长文本生成稳定 | $0.015/1K tokens | ⭐⭐⭐⭐ |
| **Cohere** | 性价比高 | $0.01/1K tokens | ⭐⭐⭐ |

### 7.2 n8n 工作流实现细节

#### Workflow 1 节点配置（图片识别）

**节点清单：**

1. **Webhook 节点**
   - Method: POST
   - Path: `/webhook/analyze-image`
   - Response Mode: When Last Node Finishes
   - 接收参数：projectId, imageUrl, userInputs

2. **HTTP Request 节点** - 下载图片
   - Method: GET
   - URL: `{{ $json.imageUrl }}`
   - Response Format: Binary
   - Binary Property: data

3. **OpenAI Vision 节点**
   - Model: gpt-4-vision-preview
   - Prompt:
     ```
     分析这张商品图片，提取以下信息（以 JSON 格式返回）：
     - productType: 产品类型（英文）
     - mainColor: 主要颜色
     - material: 材质
     - keyFeatures: 关键特征（数组，至少 3 个）
     - detailPoints: 可突出的细节点（数组，至少 3 个）
     - suggestedScenes: 建议的使用场景（数组，2-3 个）
     ```
   - 图片输入：从上一节点获取

4. **Code 节点** - 数据整合
   ```javascript
   const analysis = JSON.parse($input.first().json.response);
   const userInputs = $('Webhook').first().json.body.userInputs;

   return [{
     json: {
       projectId: $('Webhook').first().json.body.projectId,
       analysis: {
         ...analysis,
         userProductName: userInputs.productName,
         userFeatures: userInputs.features
       }
     }
   }];
   ```

5. **Postgres 节点** - 存储分析结果
   - Operation: executeQuery
   - Query:
     ```sql
     UPDATE "Project"
     SET "analysis" = $1::jsonb
     WHERE id = $2
     ```

6. **HTTP Request 节点** - 触发 Workflow 2
   - Method: POST
   - URL: `{{ $env.N8N_WEBHOOK_COPYWRITING }}`
   - Body: JSON

---

#### Workflow 2 节点配置（文案生成）

**Prompt 模板（Code 节点生成）：**

```javascript
const analysis = $json.analysis;

// 标题 Prompt
const titlePrompt = `
作为亚马逊商品文案专家，根据以下产品信息生成一个吸引人的商品标题：

产品类型：${analysis.productType}
关键特征：${analysis.keyFeatures.join(', ')}
用户提供的卖点：${analysis.userFeatures.join(', ')}

要求：
- 长度：150-200 字符
- 包含核心关键词
- 符合亚马逊 SEO 规则
- 突出差异化卖点
- 目标市场：美国

示例格式：[Brand] + [Product Type] + [Key Feature 1] + [Key Feature 2] + [Use Case]
`;

// 五点描述 Prompt
const bulletPointsPrompt = `
生成 5 条亚马逊 Bullet Points，每条 200-250 字符：

产品信息：
- 类型：${analysis.productType}
- 特征：${analysis.keyFeatures.join(', ')}
- 使用场景：${analysis.suggestedScenes.join(', ')}

要求：
- 每条突出一个核心卖点
- 使用情感化语言
- 包含具体数据（如续航时间、尺寸等）
- 解决用户痛点
- 符合亚马逊规范（不使用 "best", "lowest price" 等禁用词）

格式：
1. [核心功能] - [具体说明]
2. [使用体验] - [场景描述]
3. [材质工艺] - [质量保证]
4. [兼容性] - [适用范围]
5. [售后服务] - [品牌承诺]
`;

return [{ json: { titlePrompt, bulletPointsPrompt } }];
```

**OpenAI 节点配置：**
- Model: gpt-4
- Temperature: 0.7
- Max Tokens: 1000
- 并行执行 3 个 GPT-4 节点（标题、五点、描述）

---

#### Workflow 3 节点配置（图片生成）

**主图 1（白底图）分支：**

```javascript
// Code 节点 - 合成白底
const sharp = require('sharp');
const binaryData = $input.first().binary.data;

// Remove.bg 返回的透明 PNG
const whiteBackground = await sharp({
  create: {
    width: 2000,
    height: 2000,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  }
})
.composite([{
  input: binaryData,
  gravity: 'center'
}])
.png()
.toBuffer();

return [{
  binary: {
    data: whiteBackground
  }
}];
```

**主图 2（场景图）分支：**

1. **Remove.bg API** - 抠图
2. **Stability AI 节点**
   - Model: stable-diffusion-xl-1024-v1-0
   - Prompt 示例：
     ```
     A lifestyle photo of {{$json.analysis.productType}} on a modern desk,
     natural lighting, clean background, professional photography,
     high resolution, product photography style
     ```
   - Negative Prompt: `low quality, blurry, watermark, text`
   - Width/Height: 1024x1024

3. **Code 节点** - 图片合成
   ```javascript
   const sharp = require('sharp');
   const productImage = $('Remove.bg').first().binary.data;
   const background = $('Stability AI').first().binary.data;

   const composited = await sharp(background)
     .resize(2000, 2000)
     .composite([{
       input: await sharp(productImage).resize(1400, 1400).toBuffer(),
       gravity: 'center'
     }])
     .jpeg({ quality: 90 })
     .toBuffer();

   return [{ binary: { data: composited } }];
   ```

**主图 5（卖点图）分支：**

```javascript
const sharp = require('sharp');
const { createCanvas, registerFont } = require('canvas');

// 创建文字图层
const canvas = createCanvas(2000, 2000);
const ctx = canvas.getContext('2d');

// 背景
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, 2000, 2000);

// 产品图（左侧）
const productImg = await sharp($('Remove.bg').first().binary.data)
  .resize(1000, 1400, { fit: 'contain' })
  .toBuffer();

ctx.drawImage(productImg, 50, 300);

// 卖点文字（右侧）
const bulletPoints = $json.copywriting.bulletPoints.slice(0, 3);
ctx.fillStyle = '#333333';
ctx.font = 'bold 48px Arial';

let yPosition = 400;
bulletPoints.forEach((point, index) => {
  // 序号圆圈
  ctx.beginPath();
  ctx.arc(1100, yPosition, 30, 0, 2 * Math.PI);
  ctx.fillStyle = '#FF9900';
  ctx.fill();

  // 文字
  ctx.fillStyle = '#333333';
  ctx.fillText(`${index + 1}`, 1090, yPosition + 10);

  // 卖点文字（自动换行）
  const words = point.split(' ');
  let line = '';
  let lineY = yPosition;

  words.forEach(word => {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 700) {
      ctx.fillText(line, 1150, lineY);
      line = word + ' ';
      lineY += 60;
    } else {
      line = testLine;
    }
  });
  ctx.fillText(line, 1150, lineY);

  yPosition += 400;
});

return [{ binary: { data: canvas.toBuffer() } }];
```

---

### 7.3 性能优化

#### n8n 工作流优化

- **并行执行**：使用 Split Into Batches 节点并行生成 5 张图片
- **错误处理**：为每个 AI 节点添加 Error Trigger，失败时自动重试 3 次
- **超时设置**：为 HTTP Request 节点设置 120 秒超时
- **队列管理**：n8n 内置队列，自动处理并发请求

#### 其他优化

- **CDN 加速**：生成图片存储至 Cloudflare R2 + CDN
- **缓存策略**：相同图片 30 天内缓存复用（通过图片 hash 判断）
- **限流保护**：Next.js 中间件限制每个用户每小时最多 20 次生成请求

---

## 八、风险与挑战

### 8.1 技术风险

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| AI 生成质量不稳定 | 用户满意度下降 | - 多次生成取最佳结果<br>- 提供手动编辑工具 |
| API 成本过高 | 利润率低 | - 批量调用获取折扣<br>- 自建模型（长期） |
| 并发处理瓶颈 | 生成速度慢 | - 分布式任务队列<br>- GPU 服务器扩容 |

### 8.2 业务风险

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| 市场需求不足 | 无法获客 | - 前期免费额度吸引用户<br>- 社群营销（亚马逊卖家群） |
| 竞品抄袭 | 市场份额被抢占 | - 快速迭代新功能<br>- 建立品牌护城河 |
| 亚马逊规则变更 | 生成图片不合规 | - 实时监控官方政策<br>- 快速更新校验规则 |

### 8.3 合规风险

- **版权问题**：提示用户确保上传图片拥有使用权
- **数据隐私**：遵守 GDPR/CCPA，不存储用户原图超过 30 天
- **AI 生成内容声明**：在文案中标注"AI 生成，建议人工审核"

---

## 九、开发路线图（MVP → 完整版）

### Phase 1: MVP（4-6 周）

**核心功能：**
- ✅ 上传图片生成 5 张主图（白底图 + 4 张变体）
- ✅ AI 生成基础文案（标题 + 五点描述）
- ✅ 用户注册/登录（NextAuth）
- ✅ 基础订阅支付（Stripe）
- ✅ 积分系统

**技术实现：**
- 前端：Next.js 14 + Tailwind CSS
- 后端：API Routes + Prisma
- AI：Remove.bg API + GPT-4
- 存储：Cloudflare R2

**MVP 不包含：**
- ❌ 1688 链接爬取（后续版本添加）
- ❌ 批量生成（后续版本添加）
- ❌ 高级编辑工具（后续版本添加）

### Phase 2: 功能增强（6-8 周）

- ✅ 1688 链接爬取
- ✅ 批量生成
- ✅ 图片编辑工具（标注、文字）
- ✅ 多风格模板
- ✅ 亚马逊规则校验增强

### Phase 3: 规模化（8-12 周）

- ✅ 多语言支持（西班牙语、德语、日语）
- ✅ API 开放（允许第三方集成）
- ✅ Chrome 插件（在 1688/亚马逊页面直接生成）
- ✅ 团队协作功能
- ✅ 自定义品牌 Logo 水印

### Phase 4: 生态拓展（12+ 周）

- ✅ 支持更多平台（eBay、Shopify、独立站）
- ✅ AI 视频生成（产品视频）
- ✅ 数据分析（生成图片点击率追踪）

---

## 十、成功指标（KPI）

### 产品指标

| 指标 | 目标（3 个月） | 目标（6 个月） |
|------|----------------|----------------|
| 注册用户数 | 5,000 | 20,000 |
| 付费用户数 | 300 | 1,500 |
| 月活跃用户（MAU） | 2,000 | 10,000 |
| 付费转化率 | 6% | 8% |
| 用户留存率（30 天） | 40% | 50% |
| 平均每用户生成项目数 | 15 | 30 |

### 技术指标

- 图片生成平均耗时：< 60 秒
- 系统可用性：99.5%
- API 成功率：> 98%

### 财务指标

- MRR（月度经常性收入）：$15,000（6 个月）
- CAC（客户获取成本）：< $50
- LTV（用户生命周期价值）：> $300
- 毛利率：> 60%

---

## 十一、竞品分析

### 现有竞品

| 产品 | 核心功能 | 定价 | 优势 | 劣势 |
|------|----------|------|------|------|
| **PickFu** | A/B 测试主图 | $50/次 | 真人测试数据 | 不生成图片，只测试 |
| **Canva** | 图片设计工具 | $12.99/月 | 模板丰富 | 需手动设计，无 AI 自动生成 |
| **Helium 10** | 亚马逊运营工具 | $99/月 | 功能全面 | 主图生成功能弱 |
| **Designify** | AI 抠图工具 | $0.50/张 | 抠图质量高 | 无文案生成、无亚马逊优化 |

### 差异化优势

1. **专注亚马逊场景**：自动符合平台规则，减少试错成本
2. **一站式解决方案**：图片 + 文案一键生成
3. **性价比高**：单项目成本 < $1，远低于外包
4. **傻瓜式操作**：无需设计经验

---

## 十二、营销推广策略

### 目标渠道

1. **亚马逊卖家社群**
   - Facebook 群组（如"Amazon FBA Sellers"）
   - 微信跨境电商群
   - Reddit r/FulfillmentByAmazon

2. **内容营销**
   - YouTube 教程视频（如何快速制作主图）
   - 博客 SEO 文章（"2025 亚马逊主图优化指南"）
   - 案例分享（Before/After 对比）

3. **付费广告**
   - Google Ads（关键词："亚马逊主图制作"）
   - Facebook Ads（定向跨境电商卖家）

4. **合作推广**
   - 与货代、ERP 软件合作导流
   - 联盟营销（20% 佣金）

### 冷启动策略

- **限时免费**：前 1000 名用户赠送 200 积分
- **推荐奖励**：邀请好友各得 50 积分
- **KOL 合作**：赞助跨境电商博主测评

---

## 十三、附录

### 技术依赖清单

#### Next.js 项目依赖

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "prisma": "^5.x",
    "next-auth": "5.x",
    "@stripe/stripe-js": "^2.x",
    "@aws-sdk/client-s3": "^3.x"
  }
}
```

#### n8n 工作流依赖

n8n 内置节点：
- Webhook
- HTTP Request
- OpenAI (官方节点)
- Postgres
- Code (JavaScript)
- Split Into Batches
- Merge
- Error Trigger

需要安装的社区节点：
- n8n-nodes-remove-bg (Remove.bg API)
- n8n-nodes-stability-ai (Stability AI)

需要在 Code 节点中使用的 npm 包：
- sharp（图片处理）
- canvas（文字渲染）

#### 环境变量配置

```bash
# Next.js
DATABASE_URL=postgresql://...
AUTH_SECRET=xxx
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
CLOUDFLARE_R2_ACCESS_KEY=xxx
CLOUDFLARE_R2_SECRET_KEY=xxx
N8N_WEBHOOK_ANALYZE=https://n8n.example.com/webhook/analyze-image
N8N_WEBHOOK_COPYWRITING=https://n8n.example.com/webhook/generate-copy
N8N_WEBHOOK_IMAGES=https://n8n.example.com/webhook/generate-images
N8N_SIGNATURE_SECRET=xxx

# n8n
OPENAI_API_KEY=sk-xxx
REMOVEBG_API_KEY=xxx
STABILITY_API_KEY=sk-xxx
POSTGRES_HOST=xxx
POSTGRES_DATABASE=xxx
POSTGRES_USER=xxx
POSTGRES_PASSWORD=xxx
```

---

### 外部服务预算（MVP）

#### API 服务成本

| 服务 | 月使用量（估算） | 单价 | 月成本 | 备注 |
|------|------------------|------|--------|------|
| **Remove.bg** | 10,000 张 | $0.20/张 | $2,000 | 每个项目调用 6 次（5 张主图 + 1 次分析） |
| **OpenAI GPT-4 Vision** | 10,000 次 | $0.01/次 | $100 | 图片分析 |
| **OpenAI GPT-4** | 200 万 tokens | $0.03/1K | $60 | 文案生成（标题、五点、描述） |
| **Stability AI** | 10,000 次 | $0.05/次 | $500 | 场景图生成 |
| **Cloudflare R2** | 100GB 存储 + 1TB 流量 | - | $10 | 图片存储 + CDN |
| **n8n Cloud** | 5000 次执行/月 | $20/月 | $20 | MVP 阶段，后期可迁移至自托管 |
| **PostgreSQL** | 共享数据库 | - | $0 | 复用现有 Supabase/Vercel Postgres |
| **小计** | - | - | **$2,690** | 按 1000 个项目/月计算 |

#### 成本优化方案

**方案 1：使用更经济的 API**

| 服务替换 | 原成本 | 新成本 | 节省 |
|----------|--------|--------|------|
| Remove.bg → Cloudinary AI Background Remove | $2,000 | $1,500 | -$500 |
| GPT-4 → GPT-4o-mini (文案生成) | $60 | $15 | -$45 |
| Stability AI → DALL-E 3 (批量折扣) | $500 | $400 | -$100 |
| **优化后月成本** | $2,690 | **$2,045** | **-$645** |

**方案 2：自托管 n8n + 缓存优化**

- n8n Cloud → 自托管：-$20/月
- 相同产品图片缓存复用：减少 30% API 调用
- 预估优化后月成本：**$1,430**

#### 单项目成本分析

```
每个项目（5 张图 + 文案）成本：
- Remove.bg：6 次 × $0.20 = $1.20
- GPT-4 Vision：1 次 × $0.01 = $0.01
- GPT-4：~500 tokens × $0.03/1K = $0.015
- Stability AI：1 次 × $0.05 = $0.05
- Cloudflare R2：~10MB × $0.001/GB = $0.001
- n8n：$0.004/次执行 × 3 = $0.012

总计：约 $1.28/项目
```

**定价策略验证：**
- 售价：10 积分 = $2.90（基础版月均价）
- 成本：$1.28
- 毛利润：$1.62
- **毛利率：55.9%** ✅ 符合目标（>60% 可通过规模化达成）

---

### n8n 工作流导出/导入

为方便快速部署，PRD 完成后需提供：

1. **workflow-1-analyze.json** - 图片识别工作流
2. **workflow-2-copywriting.json** - 文案生成工作流
3. **workflow-3-images.json** - 图片生成工作流

每个 JSON 文件包含完整的节点配置，可直接导入 n8n。

---

---

## ✅ PRD 完成

**下一步行动：**
1. 评审 PRD，确认核心功能优先级
2. 设计 UI/UX 原型（Figma）
3. 启动 MVP 开发
4. 准备 AI API 测试账号
5. 搭建数据库 Schema

---

**文档维护者：** [您的团队]
**最后更新：** 2025-10-22

**版本历史：**
- V1.0（2025-10-22）：初始版本，MVP 不包含 1688 链接爬取功能
- V1.1（2025-10-22）：新增 n8n 工作流架构设计
  - 添加 3 个 n8n 工作流设计（图片识别、文案生成、图片生成）
  - 添加 Next.js 与 n8n 集成方案
  - 添加详细的节点配置和代码示例
  - 更新成本预算（包含 n8n 相关成本）
  - 明确技术栈：Next.js（业务逻辑）+ n8n（AI 处理引擎）
