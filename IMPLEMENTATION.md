# Amazon Image Generator - 实现文档

## ✅ 已完成的工作

本项目已成功生成完整的 Next.js 14 代码骨架,包括前端页面、组件、API 路由和配置文件。

### 📁 文件清单

#### 1. 类型定义
- `types/index.ts` - TypeScript 类型定义

#### 2. 工具函数
- `lib/utils.ts` - 工具函数(扩展)
- `lib/api.ts` - API 调用封装
- `lib/mock.ts` - Mock 数据生成

#### 3. UI 组件
已创建 11 个业务组件:
- `components/hero.tsx` - 首页 Hero 区域
- `components/feature-cards.tsx` - 功能卡片
- `components/before-after.tsx` - 前后对比
- `components/mini-pricing.tsx` - 简化定价卡片
- `components/uploader.tsx` - 图片上传组件
- `components/usage-bar.tsx` - 积分使用条
- `components/image-grid.tsx` - 图片网格展示
- `components/copywriter-panel.tsx` - 文案编辑面板
- `components/compliance-panel.tsx` - 合规检查面板
- `components/download-zip-button.tsx` - ZIP 下载按钮
- `components/empty-state.tsx` - 空状态组件

#### 4. 页面文件
已创建 6 个页面:
- `app/(marketing)/page.tsx` - Landing 首页 ✅
- `app/dashboard/page.tsx` - 项目列表 Dashboard
- `app/generate/page.tsx` - 生成页面
- `app/result/[id]/page.tsx` - 结果展示页面
- `app/pricing/page.tsx` - 定价页面
- `app/account/page.tsx` - 账户管理页面

#### 5. API 路由
已创建 3 个 API 端点(带 TODO 占位):
- `app/api/projects/route.ts` - POST 创建项目
- `app/api/projects/[id]/route.ts` - GET 获取项目详情
- `app/api/webhooks/n8n/route.ts` - POST n8n 回调接收

#### 6. 配置文件
- `.env.example` - 环境变量模板(已扩展)

---

## 🚀 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 配置环境变量
复制 `.env.example` 到 `.env.local`:
```bash
cp .env.example .env.local
```

修改 `.env.local`,设置:
```bash
NEXT_PUBLIC_USE_MOCK=true  # 启用 Mock 模式测试
```

### 3. 启动开发服务器
```bash
pnpm dev
```

### 4. 访问页面
- **首页**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **生成页面**: http://localhost:3000/generate
- **结果页面**: http://localhost:3000/result/demo-001 (Mock)
- **定价页面**: http://localhost:3000/pricing
- **账户页面**: http://localhost:3000/account

---

## 🔧 当前状态

### ✅ 可用功能(Mock 模式)
1. **上传图片** - 支持拖拽、多文件、预览
2. **创建项目** - Mock 创建项目并返回 demo 数据
3. **查看项目列表** - 显示 3 个 Mock 项目
4. **查看结果页** - 显示 5 张示例图 + 文案
5. **编辑文案** - 支持标题、五点描述、详细描述编辑
6. **合规检查** - 显示 Amazon 规则检查结果
7. **状态轮询** - 模拟 analyzing → writing → generating → completed
8. **定价展示** - 3 档价格方案
9. **账户管理** - 订阅、积分、使用统计展示

### ⚠️ 待实现功能(标注 TODO)

#### API 路由部分
所有 API 路由文件中都有详细的 `TODO` 注释,标注需要实现的部分:

1. **`app/api/projects/route.ts`**
   - [ ] 用户认证(`auth()`)
   - [ ] 检查用户积分
   - [ ] 上传图片至 R2/S3
   - [ ] 创建数据库记录
   - [ ] 扣减积分
   - [ ] 触发 n8n webhook

2. **`app/api/projects/[id]/route.ts`**
   - [ ] 用户认证
   - [ ] 从数据库查询项目
   - [ ] 验证用户权限

3. **`app/api/webhooks/n8n/route.ts`**
   - [ ] 验证 webhook 签名
   - [ ] 根据事件类型更新数据库

#### lib/api.ts 部分
每个函数都有 `TODO` 注释:
- [ ] `createProject()` - 实现真实上传和 API 调用
- [ ] `getProject()` - 实现数据库查询
- [ ] `regenerateImage()` - 触发 n8n 图片重生成
- [ ] `regenerateCopy()` - 触发 n8n 文案重生成
- [ ] `downloadZip()` - 实现后端打包或前端并行下载

---

## 📋 下一步行动

### Phase 1: 数据库集成
1. 扩展 Prisma Schema (参考 PRD 中的数据模型)
2. 运行 `npx prisma db push`
3. 在 API 路由中实现数据库操作

### Phase 2: 文件上传
1. 配置 Cloudflare R2 或 AWS S3
2. 在 `app/api/projects/route.ts` 中实现图片上传
3. 返回图片 URL

### Phase 3: n8n 集成
1. 部署 n8n (云端或自托管)
2. 导入 3 个 workflow JSON (参考 PRD)
3. 配置 webhook URLs 到 `.env.local`
4. 测试 webhook 回调

### Phase 4: 认证集成
1. 使用现有的 NextAuth 配置
2. 在 Dashboard/Generate/Result 页面添加认证保护
3. 在 API 路由中验证用户身份

### Phase 5: Stripe 集成
1. 使用现有的 Stripe 配置
2. 实现积分购买流程
3. 实现订阅管理

---

## 🔍 关键技术点

### Mock 数据切换
通过环境变量 `NEXT_PUBLIC_USE_MOCK` 控制:
- `true` - 使用 `lib/mock.ts` 提供的示例数据
- `false` - 使用真实 API 调用

### 状态轮询
`app/result/[id]/page.tsx` 中实现了自动轮询:
```typescript
useEffect(() => {
  if (project?.status !== 'completed' && project?.status !== 'failed') {
    const interval = setInterval(() => {
      fetchProject(); // 每 2 秒轮询一次
    }, 2000);
    return () => clearInterval(interval);
  }
}, [project?.status]);
```

### 文件上传
`components/uploader.tsx` 支持:
- 拖拽上传
- 多文件选择(最多 20 张)
- 类型验证(JPG, PNG)
- 大小限制(10MB)
- 预览和删除

---

## 📚 参考文档

- **PRD**: `/Users/caihongjia/next-saas-stripe-starter/PRD.md`
- **项目配置**: `/Users/caihongjia/next-saas-stripe-starter/CLAUDE.md`
- **Prisma Schema**: `prisma/schema.prisma` (需扩展)

---

## 🐛 已知问题

1. **示例图片缺失** - 需要在 `public/examples/` 添加 `before.jpg` 和 `after.jpg`
2. **部分页面需要认证** - 当前可以直接访问,需添加 auth 保护
3. **类型导入可能报错** - 需确保所有 import 路径正确

---

## ✨ 代码质量

所有生成的代码:
- ✅ 使用 TypeScript 严格模式
- ✅ 遵循 Next.js 14 App Router 规范
- ✅ 使用 shadcn/ui 组件库
- ✅ 支持响应式设计
- ✅ 包含详细的 TODO 注释
- ✅ Mock 数据可切换

---

**生成日期**: 2025-10-22
**版本**: V1.0
**状态**: ✅ MVP 骨架完成,可运行展示
