# ZapPilot Local Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-minded, mock-safe SaaS MVP for WhatsApp automation with marketing site, authentication, customer dashboard, admin controls, Prisma schema, and integration-ready services.

**Architecture:** Use a structured Next.js App Router monolith with clear domain boundaries: public marketing pages, authenticated app pages, admin pages, route handlers, Prisma persistence, and backend-only service modules for tenant, subscription, AI, and WhatsApp logic. All external dependencies must degrade gracefully into development-safe mocks when environment variables are absent.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Lucide React, React Hook Form, Zod, Prisma, Neon PostgreSQL, Auth.js, bcryptjs, Gemini API, WhatsApp Cloud API, Vercel-ready configuration.

---

## File Map

### Create

- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `postcss.config.mjs`
- `tailwind.config.ts`
- `components.json`
- `.env.example`
- `README.md`
- `middleware.ts`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `app/pricing/page.tsx`
- `app/privacy/page.tsx`
- `app/terms/page.tsx`
- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/success/page.tsx`
- `app/blocked/page.tsx`
- `app/(app)/dashboard/page.tsx`
- `app/(app)/settings/business/page.tsx`
- `app/(app)/settings/whatsapp/page.tsx`
- `app/(app)/settings/integrations/page.tsx`
- `app/(app)/assistant/page.tsx`
- `app/(app)/messages/page.tsx`
- `app/(app)/onboarding/page.tsx`
- `app/admin/page.tsx`
- `app/api/auth/[...nextauth]/route.ts`
- `app/api/webhook/whatsapp/route.ts`
- `app/api/whatsapp/send/route.ts`
- `app/api/dev/simulate-message/route.ts`
- `app/api/admin/subscriptions/route.ts`
- `app/api/business/route.ts`
- `app/api/products/route.ts`
- `app/api/faqs/route.ts`
- `components/marketing/*.tsx`
- `components/dashboard/*.tsx`
- `components/forms/*.tsx`
- `components/ui/*`
- `lib/prisma.ts`
- `lib/auth.ts`
- `lib/gemini.ts`
- `lib/whatsapp.ts`
- `lib/env.ts`
- `lib/plans.ts`
- `lib/tenant.ts`
- `lib/guards.ts`
- `lib/session.ts`
- `lib/utils.ts`
- `server/services/business-service.ts`
- `server/services/subscription-service.ts`
- `server/services/message-service.ts`
- `server/services/assistant-service.ts`
- `server/services/integrations-service.ts`
- `server/validators/*.ts`
- `types/*.ts`
- `tests/unit/*.test.ts`

### Modify

- `.gitignore`

## Task 1: Scaffold Next.js Base

**Files:**
- Create: Next.js, TypeScript, Tailwind, base config files
- Modify: `.gitignore`

- [ ] Create the Next.js App Router project in the current repository root without overwriting the committed spec/docs tree.
- [ ] Install required dependencies for product, auth, validation, Prisma, animations, icons, and forms.
- [ ] Install development dependencies for Prisma tooling, linting, testing, and TypeScript support.
- [ ] Add `.env.example` with all variables requested by the founder:
  - `DATABASE_URL=`
  - `AUTH_SECRET=`
  - `NEXTAUTH_URL=http://localhost:3000`
  - `GEMINI_API_KEY=`
  - `WHATSAPP_ACCESS_TOKEN=`
  - `WHATSAPP_PHONE_NUMBER_ID=`
  - `WHATSAPP_BUSINESS_ACCOUNT_ID=`
  - `WHATSAPP_WEBHOOK_VERIFY_TOKEN=`
  - `ADMIN_EMAILS=admin@local.test`
- [ ] Add base scripts to `package.json`:
  - `dev`
  - `build`
  - `start`
  - `lint`
  - `prisma:generate`
  - `prisma:migrate`
  - `prisma:seed`
  - `test`

## Task 2: Install shadcn/ui and Base Design System

**Files:**
- Create: `components/ui/*`, `app/globals.css`, layout primitives

- [ ] Initialize `shadcn/ui` with Tailwind configured for App Router.
- [ ] Add core primitives needed for the MVP:
  - button
  - input
  - textarea
  - label
  - card
  - badge
  - form
  - select
  - sheet
  - dialog
  - table
  - tabs
  - switch
- [ ] Define brand tokens in `app/globals.css` with a premium but commercial visual direction suitable for small businesses.
- [ ] Add reusable page shell, section container, and dashboard shell components.

## Task 3: Prisma Domain Model and Seed

**Files:**
- Create: `prisma/schema.prisma`, `prisma/seed.ts`, `lib/prisma.ts`, `types/domain.ts`

- [ ] Model enums:
  - `UserRole`
  - `SubscriptionStatus`
  - `ConversationStatus`
  - `MessageDirection`
  - `MessageSource`
  - `LeadStatus`
- [ ] Model tables:
  - `User`
  - `Business`
  - `Plan`
  - `Subscription`
  - `WhatsAppConfig`
  - `Product`
  - `FAQ`
  - `Conversation`
  - `Message`
  - `Lead`
- [ ] Add `businessId` and tenant-oriented indexes to all operational entities.
- [ ] Add seed logic for `Start`, `Pro`, and `Premium`.
- [ ] Make `lib/prisma.ts` safe in development and serverless environments by reusing a global client.

## Task 4: Environment, Mock Modes, and Integration State

**Files:**
- Create: `lib/env.ts`, `server/services/integrations-service.ts`, `types/integrations.ts`

- [ ] Parse environment variables centrally with safe defaults.
- [ ] Expose booleans for:
  - database configured
  - auth configured
  - Gemini live or mock
  - WhatsApp live or mock
  - admin email list configured
- [ ] Ensure missing values never crash import-time module evaluation.
- [ ] Add an integration summary helper consumed by the UI and by runtime services.

## Task 5: Authentication and Route Protection

**Files:**
- Create: `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `middleware.ts`, `lib/session.ts`, `lib/guards.ts`

- [ ] Configure Auth.js with credentials provider and Prisma adapter.
- [ ] Use `bcryptjs` for password hashing and verification.
- [ ] Extend session and JWT types with:
  - `user.id`
  - `user.role`
  - `user.businessId`
- [ ] Implement development-safe admin fallback:
  - if `NODE_ENV !== production` and `ADMIN_EMAILS` is empty, allow `admin@local.test` as admin
- [ ] Protect:
  - customer app routes
  - admin route
  - API mutations requiring auth
- [ ] Add helpers:
  - `requireUser`
  - `requireBusiness`
  - `requireAdmin`
  - `requireActiveSubscription`

## Task 6: Business Onboarding and Core CRUD

**Files:**
- Create: `app/signup/page.tsx`, `app/login/page.tsx`, `app/(app)/onboarding/page.tsx`, `app/api/business/route.ts`, `app/api/products/route.ts`, `app/api/faqs/route.ts`, validators and form components

- [ ] Build signup flow that:
  - creates `User`
  - creates `Business`
  - assigns pending `Subscription`
  - creates default `WhatsAppConfig`
- [ ] Build login flow using Auth.js credentials sign-in.
- [ ] Build 3-step onboarding wizard:
  - business
  - WhatsApp
  - attendant
- [ ] Persist business details, products/services, FAQs, tone, and messaging templates.
- [ ] Allow WhatsApp step to save incomplete config without blocking progress.

## Task 7: Marketing, Pricing, Legal, and Conversion Pages

**Files:**
- Create: `app/page.tsx`, `app/pricing/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/success/page.tsx`, marketing components

- [ ] Build a premium landing page using the approved brand direction:
  - hero
  - product explanation
  - niches served
  - benefits
  - chat demo
  - pricing preview
  - FAQ
  - primary and secondary CTAs
- [ ] Build pricing page for Start, Pro, and Premium with feature comparison.
- [ ] Build temporary `/privacy` and `/terms` pages with explicit “review before commercial publication” warnings.
- [ ] Build payment success page ready for future billing integration.

## Task 8: Customer Dashboard and Settings

**Files:**
- Create: `app/(app)/dashboard/page.tsx`, `app/(app)/settings/business/page.tsx`, `app/(app)/settings/whatsapp/page.tsx`, `app/(app)/settings/integrations/page.tsx`, `app/(app)/assistant/page.tsx`, `app/(app)/messages/page.tsx`, dashboard components

- [ ] Show dashboard summary:
  - onboarding status
  - plan status
  - integration status
  - latest messages
  - business profile completeness
- [ ] Build dedicated settings pages for:
  - business data
  - WhatsApp configuration
  - integrations status
  - assistant rules and content
- [ ] Build blocked plan page and redirect rules that preserve customer access while stopping automation.

## Task 9: WhatsApp Service, Webhook, and Local Simulation

**Files:**
- Create: `lib/whatsapp.ts`, `app/api/webhook/whatsapp/route.ts`, `app/api/whatsapp/send/route.ts`, `app/api/dev/simulate-message/route.ts`, `server/services/message-service.ts`

- [ ] Implement webhook `GET` verification for Meta.
- [ ] Implement webhook `POST` parsing for inbound message payloads.
- [ ] Resolve business by WhatsApp configuration and create/update conversation state.
- [ ] Persist inbound/outbound messages in the database when available.
- [ ] If database is not configured, keep runtime stable and return simulated success responses.
- [ ] Implement live send through Meta API when credentials exist.
- [ ] Implement mock send when credentials are absent.
- [ ] Add a local simulation route so inbound flow can be tested without Meta.

## Task 10: Gemini Service and Assistant Reply Logic

**Files:**
- Create: `lib/gemini.ts`, `server/services/assistant-service.ts`

- [ ] Build prompt assembly from:
  - business identity
  - business hours
  - products/services
  - FAQs
  - tone
  - conversation history
- [ ] Implement short, natural, objective answer generation.
- [ ] If Gemini key is missing, return deterministic mock replies that still obey brand and handoff rules.
- [ ] If AI is uncertain, trigger fallback:
  - short handoff message
  - mark conversation `NEEDS_HUMAN`
  - update or create lead

## Task 11: Admin Console and Manual Subscription Control

**Files:**
- Create: `app/admin/page.tsx`, `app/api/admin/subscriptions/route.ts`, `server/services/subscription-service.ts`

- [ ] Build admin overview listing:
  - registered customers
  - businesses
  - WhatsApp connection status
  - current subscription status
- [ ] Add manual actions:
  - activate plan
  - deactivate plan
  - change plan
- [ ] Enforce admin-only access server-side and in routing.

## Task 12: Testing, Verification, and Documentation

**Files:**
- Create: `README.md`, `tests/unit/*.test.ts`

- [ ] Add tests for:
  - environment parsing and mock mode fallback
  - subscription gating
  - webhook verification
  - assistant fallback behavior
  - admin guard logic
- [ ] Write a complete `README.md` covering:
  - local setup
  - how to run without real credentials
  - Neon setup
  - Gemini setup
  - WhatsApp Cloud API setup
  - Auth setup
  - admin activation
  - Vercel deployment
- [ ] Verify:
  - `npm run lint`
  - `npm run build`
  - `npm run test`
- [ ] Commit implementation in logical checkpoints after verification.
