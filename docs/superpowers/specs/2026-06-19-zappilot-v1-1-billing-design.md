# ZapPilot v1.1 Billing and Checkout Design Spec

## Objective

Transform the frozen v1.0 into a commercially usable SaaS with a real billing flow:

- landing
- pricing
- checkout
- ASAAS payment
- account created before payment
- limited dashboard access while pending
- automatic activation via webhook after confirmed payment

The implementation must preserve the current architecture, keep mock mode alive, and avoid large refactors.

## Product Goal

ZapPilot v1.1 must be sellable to real local businesses with a complete commercial path:

1. visitor chooses a plan
2. visitor fills a checkout form
3. system creates account, tenant root, and pending subscription
4. system creates ASAAS customer and payment flow
5. visitor pays in ASAAS sandbox
6. webhook promotes the subscription to `ACTIVE`
7. dashboard unlocks the real operational flow

The business goal is not just presentation quality. It is a production-minded conversion and recurring-revenue flow.

## Scope

### In Scope

- audit and correction of critical buttons and links
- real pricing-to-checkout flow
- checkout page per plan
- account creation before payment
- password creation during checkout
- billing integration with ASAAS sandbox
- webhook processing for subscription state changes
- limited dashboard access for `PENDING`
- full dashboard access for `ACTIVE`
- admin visibility into commercial state
- documentation for ASAAS sandbox setup
- tests for checkout, webhook, links, and pending gating

### Out of Scope

- major architectural refactor
- replacement of Auth.js or Prisma
- removal of mock mode
- advanced plan upgrade/downgrade flows
- transactional email flows
- event sourcing or a dedicated billing ledger
- full dunning automation

## Architectural Decision

### Chosen Approach

Use a server-first billing flow inside the existing Next.js App Router structure:

- page UI in `app/`
- payment route handlers in `app/api/`
- external integration client in `lib/`
- business rules in `server/services/`
- persistence through Prisma

Billing-critical logic must not depend on Server Actions in this version.

### Why This Approach

- smallest safe change set for a real sale flow
- testable billing rules in a dedicated service
- clean separation between UI, API boundary, and billing logic
- compatible with current tenant, auth, and dashboard structure

## Commercial Flow

### Official v1.1 Flow

1. visitor accesses `/pricing`
2. chooses `Start`, `Pro`, or `Premium`
3. lands on `/checkout/[plan]`
4. fills:
   - name
   - email
   - phone
   - CPF/CNPJ
   - password
   - password confirmation
5. system validates input
6. system creates or reuses:
   - `User`
   - `Business`
   - `Subscription` with `PENDING`
7. system creates or updates ASAAS customer
8. system creates ASAAS billing object and stores external IDs
9. system redirects visitor to secure ASAAS payment
10. user may log in before payment confirmation
11. dashboard remains limited while subscription is `PENDING`
12. ASAAS webhook confirms payment
13. subscription becomes `ACTIVE`
14. dashboard unlocks the complete product flow

## Account Creation Rules

### User Rules

- passwords must be hashed using `bcryptjs`
- minimum password length: 8 characters
- password confirmation must match
- email uniqueness must be preserved
- never create duplicate accounts for the same email

### Existing Email Rules

If the email already exists:

- if the latest subscription is `ACTIVE`, do not create a new operational subscription in checkout; redirect user toward dashboard/login
- if the latest subscription is `PENDING`, reuse the account and update the pending checkout
- if the latest subscription is `CANCELED` or `EXPIRED`, reuse the account and create or refresh a new `PENDING` checkout path

### Tenant Rules

The checkout creates the tenant root before payment:

- `User`
- `Business`
- `Subscription`

This allows:

- abandoned checkout recovery
- operational follow-up
- clean webhook reconciliation
- dashboard visibility with `PENDING` state

## Data Model Changes

### Business

Add:

- `document String @default("")`

Purpose:

- store CPF/CNPJ at the tenant root
- keep billing identity tied to the business
- avoid scattering commercial identity fields across unrelated tables

### Subscription

Extend `Subscription` with:

- `asaasCustomerId String?`
- `asaasSubscriptionId String?`
- `asaasPaymentId String?`
- `checkoutUrl String?`
- `paymentStatus String?`
- `paidAt DateTime?`

Keep existing fields:

- `status`
- `currentPeriodStart`
- `currentPeriodEnd`
- `activatedAt`
- `canceledAt`
- `externalReference`

### Persistence Rules

- active subscriptions must never be overwritten by a new checkout
- pending subscriptions may be reused and updated
- `externalReference` becomes the main reconciliation key
- one business has one operational billing thread for this MVP

### Migration Rules

- migration must be additive and safe
- existing tenants and subscriptions must remain valid
- no destructive schema changes

## Plan and Checkout Routing

### Pricing

The pricing page becomes a real acquisition page.

Required links:

- `Start` -> `/checkout/start`
- `Pro` -> `/checkout/pro`
- `Premium` -> `/checkout/premium`

Required CTA labels:

- `Comprar Start`
- `Comprar Pro`
- `Comprar Premium`

`Pro` must be visually highlighted as recommended.

### Checkout

Create:

- `app/checkout/[plan]/page.tsx`

This page must:

- validate plan slug
- render a premium SaaS checkout experience
- show plan summary and monthly price
- show payment security messaging
- use loading, error, and success feedback states

The page submits to:

- `app/api/billing/checkout/route.ts`

## ASAAS Integration

### Environment Variables

Add to `.env.example`:

- `ASAAS_API_KEY=`
- `ASAAS_ENV=sandbox`
- `ASAAS_WEBHOOK_TOKEN=`
- `ASAAS_SUCCESS_URL=`
- `ASAAS_CANCEL_URL=`

Sandbox is the default environment.

### Integration Files

Create:

- `lib/asaas.ts`
- `app/api/billing/checkout/route.ts`
- `app/api/webhook/asaas/route.ts`
- `server/services/billing-service.ts`

### lib/asaas.ts Responsibilities

- map sandbox vs production base URL
- authenticate requests with API key
- create or update customer
- create billing object for the chosen plan
- return checkout/payment URL
- expose thin typed helpers for the service layer

### Billing Model

v1.1 should support recurring SaaS logic.

The implementation may use ASAAS subscription or the closest recurring billing mechanism that:

- produces a secure checkout/payment path
- supports webhook confirmation
- maps cleanly to monthly SaaS access

The service must store both:

- payment-facing status
- product-facing subscription status

### Internal Status Mapping

Internal product status:

- `PENDING`
- `ACTIVE`
- `CANCELED`
- `EXPIRED`

Auxiliary payment status:

- stored in `paymentStatus`
- used for admin visibility and reconciliation

### Webhook Events

At minimum handle:

- payment confirmed
- payment overdue
- payment canceled
- subscription created
- subscription canceled

### Webhook Security

- validate request token using `ASAAS_WEBHOOK_TOKEN`
- never expose `ASAAS_API_KEY`
- log basic operational information without leaking secrets
- ignore or safely reject unknown events

## Billing Service

### Core Service

Create `server/services/billing-service.ts` as the central testable unit.

Required responsibilities:

#### `startCheckout(input)`

- validate the incoming plan and customer fields
- normalize email and document values
- find existing user by email
- protect existing active subscriptions
- create or reuse `User`
- create or reuse `Business`
- create or reuse `Subscription`
- create or reuse ASAAS customer
- create ASAAS checkout/payment flow
- save external IDs and payment URL
- return redirect information and current internal state

#### `handleAsaasWebhook(payload, headers)`

- validate webhook token
- identify the target subscription via:
  - `externalReference`
  - `asaasSubscriptionId`
  - `asaasPaymentId`
- map event to internal status
- set `ACTIVE` and payment timestamps when payment is confirmed
- set `EXPIRED` or `CANCELED` when applicable
- preserve tenant safety and idempotency

#### `getCheckoutState(...)`

- support `/success`
- support pending dashboard messaging
- support recovery paths if needed

### Idempotency Rules

- repeated webhook events must not break state
- repeated checkout submissions for the same pending account must reuse state when appropriate
- an active subscription must remain active even if the user retries checkout later

## Success Page

Update `/success` to reflect real billing states instead of manual activation.

The page must support:

- payment initiated
- payment pending
- payment approved

Required messaging:

- clear next step
- dashboard access button
- expectation that automation unlocks only after payment confirmation

If payment is still pending:

- user sees a pending explanation
- user can still access the limited dashboard

## Dashboard and Onboarding Gating

### Pending Access

Users with `PENDING` subscription may:

- log in
- view limited dashboard
- view plan/payment status
- complete basic onboarding fields
- configure business basics

Users with `PENDING` subscription may not:

- use real automation
- complete live operational release as if payment were confirmed

### Active Access

Users with `ACTIVE` subscription may:

- access the full flow
- proceed with live configuration and automation release

### UX Requirements

Pending users must see:

- explicit payment-pending banner
- clear explanation of what is blocked
- clear path to continue payment if `checkoutUrl` exists

## Admin Requirements

Update admin visibility to include:

- plan
- internal subscription status
- payment status
- ASAAS customer ID
- ASAAS subscription ID or payment ID
- manual activation still available
- manual cancellation/deactivation still available

Admin remains the fallback operational console for edge cases.

## Button and Link Audit

Audit and correct critical buttons across:

- landing
- pricing
- dashboard
- onboarding
- admin
- simulator

Requirements:

- every critical button must have a real destination or action
- async actions must show loading state
- failures must show clear error feedback
- no commercially important button may remain decorative or frozen

## UX Requirements

### Checkout UX

- premium SaaS appearance
- mobile-first layout
- clean cards
- secure-payment cue
- form validation errors in Portuguese
- summary sidebar on desktop
- summary stacked below on mobile

### Product UX

Across the audited areas, implement:

- clickable buttons
- loading state
- error state
- success state
- professional empty states
- simple form validation

## README and Environment Documentation

Update `README.md` to document:

- how to create an ASAAS account
- how to get the API key
- how to configure sandbox
- how to configure the webhook
- how to test payments
- how to switch to production later

## Testing Strategy

Required tests:

- checkout creation
- invalid plan rejection
- webhook payment-confirmed flow
- subscription becoming `ACTIVE`
- key buttons linking to the right destinations
- automation blocked when subscription is `PENDING`

Testing priorities:

- billing-service behavior
- webhook route safety
- pricing/checkout link correctness
- dashboard gating

Mock the ASAAS client at the integration boundary.

## Validation Requirements

Before completion, run:

- `npm test`
- `npm run lint`
- `npm run build`

## Risks and Constraints

- ASAAS payload/event specifics may require small mapping adjustments during implementation
- pending-account reuse must be handled carefully to avoid duplicate operational subscriptions
- login-before-payment is intentional, so dashboard gating must be strict
- mock mode must remain intact for local development and fallback paths
- v1.1 improves sellability but does not yet cover full subscription lifecycle management such as upgrades, downgrades, retries, or dunning

## Final Design Position

ZapPilot v1.1 should behave like a real commercial SaaS, not a demo:

- real plan selection
- real checkout
- real payment redirect
- real webhook activation
- safe pending access
- strict active gating
- preserved architecture
- preserved mock mode

This version is the bridge from manually activated MVP to actual paid acquisition readiness.
