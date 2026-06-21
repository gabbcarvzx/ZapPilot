# ZapPilot

ZapPilot is a multi-tenant SaaS for commercial WhatsApp automation with onboarding, operational dashboard, admin controls, Auth.js authentication, Prisma persistence, Gemini-backed replies, WhatsApp Cloud API integration and ASAAS billing.

The current codebase is prepared for production deployment on Vercel, while still supporting controlled local development through explicit mock mode.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- Neon PostgreSQL
- Auth.js
- WhatsApp Cloud API
- Gemini
- ASAAS
- Vercel

## Runtime modes

ZapPilot now separates runtime behavior clearly:

- `Live`: real dependency configured and enabled
- `Mock`: simulated dependency allowed only when `MOCK_MODE_ENABLED=true`
- `Not integrated yet`: dependency missing and mock mode disabled

Important rules:

- Production must not rely on implicit mock behavior
- `AUTH_SECRET` must be valid in production
- `DATABASE_URL` must be configured for production
- Health and validation endpoints never expose secrets

## Required environment variables

Use `.env.example` as the source of truth.

Critical for production:

- `AUTH_SECRET`
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `SYSTEM_VALIDATE_KEY`

Operational integrations:

- `GEMINI_API_KEY`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `ASAAS_API_KEY`
- `ASAAS_WEBHOOK_TOKEN`
- `ASAAS_SUCCESS_URL`
- `ASAAS_CANCEL_URL`

Controlled local mock:

- `MOCK_MODE_ENABLED=true`

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and explicitly enable mocks if you are not using real integrations:

```env
MOCK_MODE_ENABLED=true
```

3. Start the dev server:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

Local default admin fallback still works only outside production:

- Email: `admin@local.test`
- Password: `admin123`

## Production validation endpoints

Operational visibility:

- `GET /api/health`

Secure configuration validation:

- `GET /api/system/validate`

`/api/system/validate` requires the header below in production:

```text
x-system-validate-key: <SYSTEM_VALIDATE_KEY>
```

The endpoint:

- validates required production envs
- reports mock/live/not-integrated status
- does not send messages
- does not create charges
- does not execute destructive actions

## Billing and webhooks

Billing flow:

- `pricing -> /checkout/[plan] -> /api/billing/checkout -> ASAAS webhook -> dashboard/admin`

Hardening already implemented:

- webhook idempotency by state and `eventId`
- subscription reconciliation service
- structured logs with `requestId`
- no tokens, secrets, CPF/CNPJ or card data in logs

## Verification

Run the full validation set before shipping:

```bash
npm install
npm run lint
npm test
npm run build
```

## Deployment on Vercel

1. Push the prepared Git branch.
2. Ensure the Vercel project is linked to the repository.
3. Configure production env vars in Vercel.
4. Validate:

```text
/api/health
/api/system/validate
```

5. Confirm:

- database live
- auth live
- billing live
- WhatsApp live or intentionally blocked
- Gemini live or intentionally blocked

See [docs/PRODUCTION_CHECKLIST.md](/C:/Users/ender/Desktop/ZapPilot-billing-merge/docs/PRODUCTION_CHECKLIST.md:1) for the final go-live checklist.
