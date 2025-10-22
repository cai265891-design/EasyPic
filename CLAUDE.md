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
