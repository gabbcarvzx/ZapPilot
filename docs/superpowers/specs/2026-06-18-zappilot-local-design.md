# ZapPilot Local Design Spec

## Objective

Build `ZapPilot Local`, a commercial SaaS for small businesses to deploy an automated WhatsApp attendant with a premium, simple, and conversion-focused experience. The product must be viable for real-world sale, prepared for multi-tenant isolation, manual subscription activation in v1, and future evolution into a broader recurring-revenue SaaS.

## Product Scope

### Target Customer

Small local businesses that need to automate first contact, answer common questions, capture leads, and maintain commercial responsiveness on WhatsApp without hiring a full support team.

### Core Promise

Connect a business WhatsApp number, configure the business context, and let the platform respond with short, natural, business-aware messages while escalating uncertain cases to a human.

### MVP Scope

The first version includes:

- Public marketing site with landing page and pricing
- Credential-based authentication
- Single-business onboarding wizard
- Customer dashboard
- Business configuration
- WhatsApp Cloud API configuration
- Automated attendant configuration
- Conversation and message history
- Admin page for manual subscription activation/deactivation
- Integrations status page
- Gemini-backed response generation
- WhatsApp webhook receive/verify/send flows
- Subscription-aware automation blocking
- Development-safe mock modes for absent external integrations

The first version does not include:

- Automated billing collection
- Agency or multi-business accounts
- Advanced RBAC beyond `CUSTOMER` and `ADMIN`
- Queue workers or event bus
- Native analytics beyond core conversation visibility

## Architectural Decision

### Chosen Approach

Use a structured monolith in `Next.js App Router` with clear domain boundaries:

- Frontend pages and components in the app itself
- Backend logic via route handlers, server actions where appropriate, and service modules
- Persistence with `Prisma + Neon PostgreSQL`
- Authentication with `Auth.js`
- External integrations isolated in dedicated backend service modules

### Why This Approach

- Lowest operational complexity for a sellable MVP
- Compatible with Vercel free deployment
- Keeps codebase cohesive while preserving future extraction points
- Fastest route to production without coupling business logic to UI code

### Future Extraction Points

The code should be structured so these areas can be extracted later without redesigning the domain:

- WhatsApp message processing worker
- AI response generation service
- Billing service
- Reporting/analytics pipeline

## SaaS Domain Model

### Account Model

V1 will use:

- `1 user account = 1 business = 1 subscription`

This is intentionally simpler for onboarding, billing readiness, data isolation, and UX. The database and services will still preserve business-centric boundaries so the product can later evolve into organization or multi-location support.

### Tenant Isolation Rules

All business-domain entities must be scoped by `businessId`.

Tenant rules:

- The frontend is never trusted to define the active tenant for protected business operations
- The backend resolves the active `businessId` from the authenticated session
- Cross-tenant access must be impossible via direct ID enumeration
- Private queries and mutations must always include business ownership checks
- Operational tables must use indexes optimized for tenant-scoped lookups

## Data Model

### Entities

#### User

Stores account identity and access role.

Key fields:

- `id`
- `name`
- `email`
- `passwordHash`
- `role` (`CUSTOMER` or `ADMIN`)
- `createdAt`
- `updatedAt`

#### Business

Stores the tenant root and the commercial/business context.

Key fields:

- `id`
- `ownerUserId`
- `name`
- `slug`
- `niche`
- `address`
- `phone`
- `whatsappNumber`
- `businessHoursJson`
- `welcomeMessage`
- `closedMessage`
- `tone`
- `isOnboardingComplete`
- `createdAt`
- `updatedAt`

#### Plan

Static catalog of commercial plans.

Key fields:

- `id`
- `code` (`START`, `PRO`, `PREMIUM`)
- `name`
- `priceCents`
- `currency`
- `description`
- `featuresJson`
- `isActive`

#### Subscription

Tracks business access to the product.

Key fields:

- `id`
- `businessId`
- `planId`
- `status` (`PENDING`, `ACTIVE`, `CANCELED`, `EXPIRED`)
- `currentPeriodStart`
- `currentPeriodEnd`
- `activatedAt`
- `canceledAt`
- `externalReference`
- `createdAt`
- `updatedAt`

#### WhatsAppConfig

Stores official Meta integration configuration.

Key fields:

- `id`
- `businessId`
- `metaBusinessAccountId`
- `metaPhoneNumberId`
- `metaAppId`
- `verifyToken`
- `accessToken`
- `webhookStatus`
- `isActive`
- `createdAt`
- `updatedAt`

#### Product

Stores products or services sold by the business.

Key fields:

- `id`
- `businessId`
- `name`
- `description`
- `price`
- `isActive`
- `sortOrder`
- `createdAt`
- `updatedAt`

#### FAQ

Stores reusable business Q&A context.

Key fields:

- `id`
- `businessId`
- `question`
- `answer`
- `sortOrder`
- `createdAt`
- `updatedAt`

#### Conversation

Represents the thread with one lead/customer phone number.

Key fields:

- `id`
- `businessId`
- `contactPhone`
- `contactName`
- `status` (`OPEN`, `NEEDS_HUMAN`, `CLOSED`)
- `lastMessageAt`
- `leadId`
- `createdAt`
- `updatedAt`

#### Message

Stores inbound and outbound messages.

Key fields:

- `id`
- `businessId`
- `conversationId`
- `direction` (`INBOUND`, `OUTBOUND`)
- `source` (`USER`, `BOT`, `HUMAN`, `SYSTEM`)
- `content`
- `metaJson`
- `sentAt`
- `createdAt`

#### Lead

Stores captured commercial lead information.

Key fields:

- `id`
- `businessId`
- `conversationId`
- `name`
- `phone`
- `notes`
- `status` (`NEW`, `QUALIFIED`, `NEEDS_HUMAN`, `CONVERTED`)
- `createdAt`
- `updatedAt`

### Indexing Requirements

Required tenant-oriented indexing:

- every operational table indexed by `businessId`
- composite indexes such as `businessId + createdAt`, `businessId + status`, and `businessId + contactPhone` where relevant
- unique constraints scoped by tenant where applicable

## Plans and Monetization

### Plan Catalog

#### Start

- `R$ 49/month`
- simple automated replies
- business hours
- basic catalog
- human handoff button or instruction

#### Pro

- `R$ 97/month`
- everything from Start
- Gemini AI responses
- lead capture
- conversation history
- niche personalization

#### Premium

- `R$ 197/month`
- everything from Pro
- multiple attendants (data model/readiness only in v1)
- sales funnel readiness
- reports readiness
- advanced configuration

### Billing Strategy for V1

Billing is manually managed by admin in v1.

This means:

- no automated checkout is required for initial release
- data structures must still be ready for Stripe or Mercado Pago later
- plan status enforcement must already exist in backend logic
- payment success page can exist as a commercial continuation page even before real payment automation

### Subscription Enforcement

If subscription status is not `ACTIVE`:

- customer can access the panel according to route rules
- automation must not respond automatically to inbound messages
- outbound send routes must be blocked or limited according to plan logic
- customer is redirected to `/blocked` where appropriate

## Authentication and Authorization

### Authentication

Use `Auth.js` with credentials login in v1.

Requirements:

- `Prisma Adapter`
- password hashing using `bcryptjs`
- secure session handling
- protected private routes
- support for admin role segregation

### Authorization

Required protection layers:

- route protection via middleware
- server-side guard for authenticated pages
- admin-only guard for `/admin`
- business ownership checks for all business mutations
- plan-status guard for automation features

## UX and Product Flow

### Public Pages

- landing page
- pricing page
- login page
- signup page

### Private Customer Pages

- dashboard
- business settings
- WhatsApp settings
- automated attendant builder
- messages/history
- payment success
- blocked plan page

### Admin Page

- `/admin`

Capabilities:

- list registered customers
- view businesses
- inspect connected WhatsApp status
- activate subscription manually
- deactivate subscription manually

## Onboarding Flow

### Wizard Structure

The onboarding wizard has exactly 3 steps:

1. `Business`
2. `WhatsApp`
3. `Attendant`

### Step 1: Business

Collect:

- business name
- niche
- business hours
- address
- phone/WhatsApp contact

### Step 2: WhatsApp

Collect and validate:

- Meta phone number ID
- Meta business account ID
- access token
- verification token

Behavior:

- user can proceed with partial setup if not fully connected yet
- dashboard remains usable
- automation and real send are blocked until config is valid
- setup UI must clearly show when the app is in mock mode

### Step 3: Attendant

Collect:

- service tone
- welcome message
- out-of-hours message
- products/services
- FAQs

## WhatsApp Integration

### Required API Routes

- `app/api/webhook/whatsapp/route.ts`
- `app/api/whatsapp/send/route.ts`

### Webhook Verification

The webhook route must support Meta verification challenge handling and token verification.

### Incoming Message Processing

Processing flow:

1. validate webhook payload structure
2. identify the Meta phone number connection
3. resolve the target business
4. create or reuse the conversation
5. store inbound message
6. check subscription status
7. if plan inactive, stop before automation
8. build business context
9. choose reply logic
10. send outbound response through WhatsApp API
11. store outbound message

### Development-Safe Behavior

When WhatsApp credentials are absent:

- the app must remain bootable
- webhook routes must still support local test payloads
- a mock send path must simulate outbound delivery
- conversation persistence and automation flows must still be testable locally

### Outbound Send Service

The send route and internal service must:

- run server-side only
- use Meta access token securely
- validate payload with Zod
- refuse operation when config is incomplete or inactive
- persist the sent message

## AI Integration

### Gemini Service

Create `lib/gemini.ts` for server-side response generation.

### AI Behavior

The model must behave as a commercial attendant for the configured business.

Prompt inputs:

- business name
- niche
- business hours
- product/service list
- FAQ list
- tone
- welcome and closed messages
- latest conversation context

Response rules:

- short
- natural
- objective
- business-oriented
- do not invent unavailable business information
- if uncertain, escalate to human

### Fallback Strategy

When the AI cannot answer confidently:

- send a short handoff message
- mark the conversation as `NEEDS_HUMAN`
- capture or update lead data if possible
- avoid fabricating information

### Development-Safe Behavior

When `GEMINI_API_KEY` is absent:

- the app must use deterministic mock AI responses
- the mock must still respect business tone and handoff rules
- no page or API route may crash because the key is absent

## Design System and Frontend

### Stack

- `Next.js App Router`
- `TypeScript`
- `Tailwind CSS`
- `shadcn/ui`
- `Framer Motion`
- `Lucide React`
- `React Hook Form`
- `Zod`

### Visual Direction

The interface must be:

- premium
- modern
- mobile-first
- commercial
- appropriate for paid acquisition traffic

### Landing Page Sections

- strong hero
- simple product explanation
- supported niches
- business benefits
- chat visual demo
- pricing teaser
- FAQ
- CTA to get started

### Dashboard Principles

- minimal friction
- quick visibility of setup status
- clear subscription state
- simple configuration forms
- modern cards and strong visual hierarchy

### Integrations Status Page

Create `/settings/integrations` to display:

- database configuration status
- auth configuration status
- Gemini configuration status
- WhatsApp configuration status
- current mode (`mock` or `live`) for each integration
- clear next steps for completing setup

## Security Requirements

- secrets only in environment variables
- no frontend exposure of Meta or Gemini secrets
- all forms validated with Zod
- all private routes protected
- logic separated into server-side services
- structured error handling
- secure password hashing
- tenant-safe queries only
- missing environment variables must degrade gracefully in development and never crash the full application

## File Structure

```text
app/
  (marketing)/
  (auth)/
  (app)/
  admin/
  api/
components/
  marketing/
  dashboard/
  forms/
  ui/
lib/
  auth.ts
  prisma.ts
  gemini.ts
  whatsapp.ts
  tenant.ts
  plans.ts
  guards.ts
  utils.ts
server/
  services/
  validators/
types/
prisma/
docs/
```

## Required Important Files

- `README.md`
- `.env.example`
- `prisma/schema.prisma`
- `app/api/webhook/whatsapp/route.ts`
- `app/api/whatsapp/send/route.ts`
- `lib/gemini.ts`
- `lib/whatsapp.ts`
- `lib/prisma.ts`
- `lib/auth.ts`

## Deployment Readiness

### Target Platform

- Vercel free tier for app hosting
- Neon free tier for PostgreSQL
- Gemini free tier for AI
- official WhatsApp Cloud API

### Required Environment Variables

At minimum:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `GEMINI_API_KEY`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `ADMIN_EMAILS`

The implementation may introduce additional environment variables if required by Auth.js or local development.

### Development Defaults

The development experience must support:

- `NEXTAUTH_URL=http://localhost:3000`
- empty integration secrets without boot failure
- mock admin access in local development when `ADMIN_EMAILS` is empty
- explicit UI messaging that mock mode is active

## Testing Strategy

Minimum expected test coverage for MVP:

- schema/service validation tests
- auth guard tests
- webhook verification tests
- webhook processing tests for inactive vs active plan behavior
- AI prompt shaping tests where practical

The implementation should prioritize high-value tests around tenant safety, plan gating, and messaging behavior.

## Implementation Order

1. scaffold the base app and install dependencies
2. configure design system and base layout
3. define Prisma schema and seed plans
4. configure Auth.js and route protection
5. build public pages
6. build signup/login and onboarding wizard
7. build dashboard and settings pages
8. implement business/product/FAQ persistence
9. implement WhatsApp receive/send services and routes
10. implement Gemini service and fallback behavior
11. implement admin page and manual activation
12. implement integrations status page
13. add temporary privacy and terms pages
14. write final docs and deployment instructions

## Repository and Delivery Requirements

- initialize Git before implementation
- create an initial commit containing the approved specification
- create a detailed implementation plan before code generation
- keep the architecture simple now but with clean boundaries for future scale
- ensure the project is fully usable in development mode without real external credentials
- ensure absent integrations never crash the application
- ship `.env.example` with all documented variables
- ship temporary `/privacy` and `/terms` pages with explicit revision warnings before commercial publication

## External Information Required From the Founder

To complete local setup, real integration, and production deployment, the founder must provide:

- Neon PostgreSQL connection string
- Auth secret for production
- app base URL for local and production environments
- Gemini API key
- Meta WhatsApp Cloud API access token
- Meta phone number ID
- Meta business account ID
- Meta app ID if required by the chosen app configuration
- webhook verify token value
- one or more admin email addresses
- brand copy adjustments if commercial messaging should differ from the default implementation
- any business-specific legal pages or compliance copy if needed before launch

For this implementation stage, the following defaults are accepted:

- `NEXTAUTH_URL=http://localhost:3000`
- `ADMIN_EMAILS=admin@local.test`
- real WhatsApp and Gemini credentials can be added later without changing application structure

## Risks and Constraints

- Vercel serverless is acceptable for MVP volume, but high inbound concurrency may later require queueing or background processing
- Manual billing is commercially acceptable for v1, but recurring automation must be implemented before scale
- WhatsApp Cloud API operational limits and review requirements are external dependencies
- AI output quality depends on business configuration quality; poor setup leads to weak replies

## Final Design Position

This MVP should be built as a production-minded commercial SaaS, not a demo. The implementation must prioritize:

- tenant isolation
- subscription enforcement
- secure secret handling
- onboarding conversion
- commercial clarity
- clean extraction boundaries for future scale
