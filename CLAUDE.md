# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 用中文回答我
所有回答都用中文回到我

## Project Overview

Next.js 14 SaaS starter with Stripe integration, NextAuth v5, Prisma ORM, and PostgreSQL. Features subscription management, authentication, and content management via Contentlayer.

## Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Development server
pnpm dev              # Standard Next.js dev server
pnpm turbo           # Next.js dev server with Turbo mode

# Build & deploy
pnpm build           # Production build
pnpm start           # Start production server
pnpm preview         # Build and start production server

# Code quality
pnpm lint            # Run ESLint

# Database
npx prisma generate  # Generate Prisma client (runs automatically on install)
npx prisma db push   # Push schema changes to database
npx prisma studio    # Open Prisma Studio GUI

# Email development
pnpm email           # Start React Email dev server on port 3333

# Development utilities
pnpm create-user     # Create test user in local database
pnpm login-link      # Generate login link for test user

# Workflow System (New!)
pnpm docker:dev      # Start Redis & PostgreSQL in Docker
pnpm workers         # Start BullMQ workers (development mode with watch)
pnpm workers:prod    # Start BullMQ workers (production mode)
pnpm docker:down     # Stop Docker services

# Testing
pnpm test:r2         # Test Cloudflare R2 connection and upload
pnpm test:workflow   # Test complete workflow with R2 integration
```

## Architecture

### App Router Structure (Next.js 14)
- `(auth)/` - Authentication routes (login, register)
- `(marketing)/` - Public marketing pages (landing, pricing, blog)
- `(protected)/` - Authenticated routes requiring login
- `(docs)/` - Documentation pages powered by Contentlayer
- `api/` - API routes including Stripe webhooks

### Key Directories
- `actions/` - Server Actions for mutations (user updates, Stripe operations)
- `components/` - React components organized by feature (ui/, dashboard/, pricing/, etc.)
- `config/` - Configuration files for site settings, navigation menus, and subscription plans
- `lib/` - Utility functions and service integrations (db, stripe, email, session)
- `prisma/` - Database schema and migrations
- `types/` - TypeScript type definitions
- `emails/` - React Email templates
- `content/` - MDX content for blog and docs (processed by Contentlayer)

### Authentication (NextAuth v5)
- Auth configuration split between `auth.config.ts` (provider config) and `auth.ts` (full setup)
- Uses JWT strategy with Prisma adapter
- User roles defined in Prisma schema: `USER` and `ADMIN`
- Session callbacks extend user object with role from database
- Middleware in `middleware.ts` protects routes via NextAuth

### Database (Prisma + PostgreSQL)
- Schema: User, Account, Session, VerificationToken models
- Stripe integration fields on User model: `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`, `stripeCurrentPeriodEnd`
- Connection managed via `lib/db.ts` singleton pattern

### Stripe Integration
- Subscription plans configured in `config/subscriptions.ts`
- Plan IDs loaded from environment variables
- Webhook handler at `app/api/webhooks/stripe/route.ts`
- Server actions in `actions/` handle customer portal and subscription generation
- Subscription status checked via `lib/subscription.ts` helper

### Environment Variables
- Validated using `@t3-oss/env-nextjs` in `env.mjs`
- Required vars include: AUTH_SECRET, DATABASE_URL, Stripe keys, OAuth credentials, Resend API key
- Copy `.env.example` to `.env.local` and populate before running

### Content Management (Contentlayer)
- Blog and docs content authored in MDX under `content/`
- Configuration in `contentlayer.config.ts`
- Syntax highlighting via Shiki, rehype plugins for code formatting
- TOC generation for docs via custom remark plugin

### Styling
- Tailwind CSS with custom config in `tailwind.config.ts`
- Shadcn/ui components in `components/ui/`
- Theme management via `next-themes`
- Component variants using `class-variance-authority`

### Email
- Templates in `emails/` using React Email
- Sent via Resend API (configured in `lib/email.ts`)
- Dev server available via `pnpm email`

## Important Patterns

### Server Actions
Server actions in `actions/` follow pattern:
- Import auth session via `auth()` from `@/auth`
- Validate input with Zod schemas
- Return structured response with success/error state

### Configuration Files
Navigation menus and site settings live in `config/`:
- `site.ts` - Site metadata
- `dashboard.ts` - Dashboard sidebar nav
- `marketing.ts` - Marketing nav
- `subscriptions.ts` - Stripe pricing plans
- `docs.ts` - Docs sidebar nav

### Type Safety
- Prisma generates types automatically
- Custom types in `types/` extend generated types
- Environment variables type-checked via `env.mjs`

## Package Manager

This project uses **pnpm**. Always use `pnpm` commands, not `npm` or `yarn`.

---

## Workflow System Architecture (NEW)

### Overview
The workflow system implements an Amazon product listing automation pipeline using:
- **PostgreSQL FSM**: State machine stored in database via Prisma
- **BullMQ + Redis**: Async task queue for job processing
- **Claude Vision API**: Product image recognition
- **Ideogram/DALL-E**: Product image generation (planned)
- **Cloudflare R2 / AWS S3**: Image storage

### Workflow Execution Flow

```
用户上传图片 → 工作流 1 (图片识别) → 工作流 2 (生成 Listing) → 工作流 3 (生成商品展示图) → 完成
```

### Database Models

Key models in `prisma/schema.prisma`:
- `WorkflowExecution` - State machine, tracks workflow status (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`)
- `Product` - Image recognition results (description, keywords, confidence)
- `Listing` - Amazon listing content (title, description, bullet_points × 5, keywords)
- `ImageSet` + `ProductImage` - Generated product images (5 images per listing)
- `RegenerationLog` - Tracks regeneration history and costs

### Queues

Defined in `lib/queues/index.ts`:
- `image-recognition` - Image analysis (60s timeout, 3 retries)
- `listing-generation` - Listing generation (90s timeout, 3 retries)
- `image-generation` - Batch image generation (10min timeout, 2 retries)
- `image-single-generation` - Single image regeneration (2min timeout, 2 retries)

### Workers

Located in `workers/` directory:
- `image-recognition.worker.ts` - Downloads image, calls Claude Vision API, saves to DB, triggers listing generation
- `listing-generation.worker.ts` - Generates listing copy, performs quality checks (score 0-100), triggers image generation
- Worker concurrency: 3-5 parallel jobs per queue
- Start workers: `pnpm workers` (development) or `pnpm workers:prod` (production)

### API Routes

Core routes:
- `POST /api/workflows/start` - Start new workflow (requires auth)
- `GET /api/workflows/[id]` - Get workflow status and all results (includes product, listing, images)

Regeneration routes (planned):
- `POST /api/workflows/[id]/regenerate/description` - Regenerate product description with adjusted prompt
- `POST /api/workflows/[id]/regenerate/listing` - Regenerate listing with tone/market adjustments
- `POST /api/workflows/[id]/regenerate/images` - Regenerate all or selective images (indices 0-4)

### Services

Core services in `lib/services/`:
- `claude.ts` - Claude API client with circuit breaker, handles vision analysis and listing generation
- `storage.ts` - S3/R2 upload, image processing with Sharp.js (resize, thumbnail, watermark)

### Environment Variables

Required vars (add to `.env.local`):
```
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=sk-ant-xxx

# Cloudflare R2 配置 (从 R2 控制台 > 管理 R2 API 令牌 获取)
CLOUDFLARE_R2_ACCESS_KEY=xxx           # Access Key ID
CLOUDFLARE_R2_SECRET_KEY=xxx           # Secret Access Key
CLOUDFLARE_R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com  # S3 API Endpoint
CLOUDFLARE_R2_BUCKET=amazon-images     # 存储桶名称
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev  # 公开访问 URL (在存储桶设置中启用)
```

**获取 Cloudflare R2 配置**:
1. 登录 Cloudflare → 进入 R2
2. 创建存储桶,记录存储桶名称
3. 点击"管理 R2 API 令牌" → 创建 API 令牌
4. 复制 Access Key ID、Secret Access Key 和 Endpoint
5. 在存储桶设置中启用"公开访问",复制公开 URL

### Development Setup

1. Start infrastructure:
```bash
pnpm docker:dev  # Starts Redis + PostgreSQL in Docker
```

2. Run database migrations:
```bash
npx prisma db push
```

3. Start workers in separate terminal:
```bash
pnpm workers
```

4. Start Next.js dev server:
```bash
pnpm dev
```

### Key Features

- **Version Control**: Each regeneration creates new version, preserves old data for A/B comparison
- **Partial Regeneration**: Can regenerate individual images without redoing entire workflow
- **Quality Scoring**: Auto-approves listings with score ≥ 80/100
- **Circuit Breaker**: Prevents cascading failures when AI APIs are down (opens after 5 failures, 1min cooldown)
- **Retry Logic**: Exponential backoff for transient errors (2s, 4s, 8s intervals)
- **Progress Tracking**: Real-time progress updates via job.updateProgress()

### Monitoring

Workers log to console with structured format:
- `[图片识别]` prefix for image recognition worker
- `[文案生成]` prefix for listing generation worker
- Logs include: workflowId, processing time, errors

### Testing Workflow

To test the complete flow:

1. Send POST request to `/api/workflows/start`:
```json
{
  "imageUrl": "https://example.com/product.jpg",
  "category": "Electronics",
  "brand": "MyBrand"
}
```

2. Get `workflowId` from response

3. Poll `/api/workflows/{workflowId}` to track progress:
   - status: PENDING → PROCESSING → COMPLETED
   - progress: 0% → 30% (recognition) → 60% (listing) → 100%

4. Final response includes:
   - product.description (AI-generated description)
   - listing.title, listing.bulletPoints[5], listing.description
   - images.items[5] (when image generation is implemented)
