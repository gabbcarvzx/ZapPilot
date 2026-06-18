# First Client Activation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn ZapPilot Local into a commercially activatable product for the first paying customer by improving activation clarity, diagnostics, demo readiness, and operator guidance without changing architecture or adding large features.

**Architecture:** Keep the existing monolith intact and add only thin operational layers: a small diagnostic surface, demo seed data, guided UX copy, and activation-facing documentation. Reuse current services, auth, Prisma models, and dashboard routes; do not introduce new integrations or subsystem boundaries.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Auth.js, Prisma, Neon PostgreSQL, existing dashboard/services, Markdown operational docs, Vitest, ESLint.

---

## File Map

### Create

- `docs/operations/2026-06-18-first-client-activation.md`
- `tests/unit/diagnostics.test.ts`
- `prisma/demo-seed.ts`
- `components/dashboard/diagnostic-summary.tsx`
- `components/dashboard/empty-state.tsx`
- `components/ui/tooltip.tsx`

### Modify

- `README.md`
- `app/(app)/dashboard/page.tsx`
- `app/(app)/onboarding/page.tsx`
- `app/(app)/settings/integrations/page.tsx`
- `app/(app)/assistant/page.tsx`
- `app/(app)/messages/page.tsx`
- `app/admin/page.tsx`
- `components/forms/business-settings-form.tsx`
- `components/forms/whatsapp-settings-form.tsx`
- `components/forms/assistant-form.tsx`
- `lib/gemini.ts`
- `server/services/integrations-service.ts`
- `package.json`

## Task 1: Operational Docs and Activation Checklist

**Files:**
- Create: `docs/operations/2026-06-18-first-client-activation.md`
- Modify: `README.md`

- [ ] Add an operator playbook covering customer activation checklist, internal onboarding responsibilities, production activation steps, end-to-end script, and sales-readiness report.
- [ ] Extend `README.md` with a short “first customer activation” section linking to the operational playbook.
- [ ] Verify the playbook reflects the current production constraints:
  - manual plan activation
  - temporary legal pages
  - Gemini quota fallback
  - WhatsApp production-number verification dependency

## Task 2: Diagnostic Summary Surface

**Files:**
- Create: `components/dashboard/diagnostic-summary.tsx`
- Test: `tests/unit/diagnostics.test.ts`
- Modify: `server/services/integrations-service.ts`, `app/(app)/dashboard/page.tsx`, `app/(app)/settings/integrations/page.tsx`

- [ ] Add a small diagnostic summary component that shows:
  - plan status
  - WhatsApp status
  - AI status
  - database status
  - webhook verification status
- [ ] Extend the integrations service so it can compute “reply ready” vs “blocked” status per tenant using current config and subscription state.
- [ ] Surface the diagnostic summary on the dashboard and integrations page without introducing new backend architecture.
- [ ] Add a unit test for the readiness logic:
  - `ACTIVE + WhatsApp live + DB live` yields ready
  - `PENDING` yields blocked
  - Gemini failure mode still reports degraded but not broken when fallback is available

## Task 3: Demo Seed for Sales Calls

**Files:**
- Create: `prisma/demo-seed.ts`
- Modify: `package.json`

- [ ] Add a demo seed script that creates:
  - a hamburgueria tenant
  - a barbearia tenant
  - a loja de roupas tenant
- [ ] Include:
  - business profile
  - one active subscription
  - WhatsApp config in mock-safe mode
  - sample products
  - sample FAQ
  - sample conversation data when helpful for demo
- [ ] Add an npm script such as `prisma:seed:demo` so demos can be restored quickly before sales calls.

## Task 4: Guided Onboarding and Commercial UX Copy

**Files:**
- Create: `components/dashboard/empty-state.tsx`, `components/ui/tooltip.tsx`
- Modify: `app/(app)/onboarding/page.tsx`, `components/forms/business-settings-form.tsx`, `components/forms/whatsapp-settings-form.tsx`, `components/forms/assistant-form.tsx`, `app/(app)/messages/page.tsx`

- [ ] Add stronger success messages after save actions:
  - business settings saved
  - WhatsApp config saved
  - attendant content saved
- [ ] Add simple empty states for:
  - no messages yet
  - no products
  - no FAQ
  - no connected WhatsApp
- [ ] Add inline helper copy and tooltips for confusing fields:
  - verify token
  - phone number ID
  - tone of service
  - closed-hours message
- [ ] Add step guidance text on onboarding so the founder can use the product while screen-sharing with a lead.

## Task 5: Admin Activation Workflow Polish

**Files:**
- Modify: `app/admin/page.tsx`, `app/(app)/dashboard/page.tsx`

- [ ] Improve admin activation clarity by making current plan/status easier to scan.
- [ ] Add plain-language status messaging in the customer dashboard so `PENDING` clearly explains why automation is blocked.
- [ ] Add a post-activation confirmation state for operators so they know when the tenant is ready for live testing.

## Task 6: End-to-End Demo and Validation Script Support

**Files:**
- Modify: `app/(app)/messages/page.tsx`, `README.md`

- [ ] Make the message simulator area clearer for sales/demo use:
  - explain mock vs live
  - explain what the founder should observe
- [ ] Document the exact E2E validation script in `README.md` and in the operational playbook.
- [ ] Ensure the founder can use the simulator when real Meta testing is not available and switch to live validation when the client number is ready.

## Task 7: Final Commercial Readiness Review

**Files:**
- Modify: `docs/operations/2026-06-18-first-client-activation.md`

- [ ] Add a final “sell now / blocks sale / can wait” section based on the current codebase and production state.
- [ ] Reconcile the plan with the real production findings:
  - route protection fixed
  - Neon synced and seeded
  - admin activation works
  - Gemini has fallback under quota pressure
  - WhatsApp connectivity exists but commercial production usage still depends on number readiness

## Self-Review

### Spec Coverage

Covered:

- customer activation checklist
- internal onboarding flow
- operational documentation
- end-to-end test script
- diagnostic surface
- demo seed
- commercial UX polish
- final report

No major scope gaps remain for the requested activation phase.

### Placeholder Scan

No `TODO`, `TBD`, or deferred placeholders are included in the plan.

### Type Consistency

This plan reuses the current concepts already present in the app:

- `Subscription.status`
- `WhatsAppConfig`
- `Plan`
- dashboard and settings routes
- Prisma seed workflow

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-18-first-client-activation.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
