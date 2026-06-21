# Production Checklist

## Core runtime

- `AUTH_SECRET` configured with a strong value
- `DATABASE_URL` configured for the production database
- `NEXTAUTH_URL` set to the final public domain
- `SYSTEM_VALIDATE_KEY` configured
- `MOCK_MODE_ENABLED=false` in production

## Billing

- `ASAAS_API_KEY` configured
- `ASAAS_WEBHOOK_TOKEN` configured
- `ASAAS_SUCCESS_URL` configured
- `ASAAS_CANCEL_URL` configured
- ASAAS webhook target points to `/api/webhook/asaas`
- Duplicate webhook replay tested safely

## WhatsApp

- `WHATSAPP_WEBHOOK_VERIFY_TOKEN` configured
- Tenant credentials or global credentials reviewed
- Webhook target points to `/api/webhook/whatsapp`
- No real message is sent during validation-only checks

## AI

- `GEMINI_API_KEY` configured
- Operational diagnostics show Gemini `Live` or clearly blocked

## Security

- `.env` is ignored and not committed
- no tokens or secrets are versioned
- `/api/health` returns safe JSON only
- `/api/system/validate` requires `x-system-validate-key` in production
- logs do not expose token, secret, cpf/cnpj, card or raw payloads

## Operational validation

Run:

```bash
npm install
npm run lint
npm test
npm run build
```

Then validate:

```text
GET /api/health
GET /api/system/validate
```

Expected:

- database healthy
- auth healthy
- billing healthy or clearly degraded
- WhatsApp healthy or clearly degraded
- Gemini healthy or clearly degraded
- `secretsExposed=false`

## Go-live checks

- checkout route returns safe payload
- webhook ASAAS activates subscription
- duplicate webhook does not duplicate activation
- pending subscription blocks paid resources
- active subscription releases paid resources
- dashboard shows current plan and regularization CTA when needed
- admin shows estimated revenue and commercial distribution

## Vercel

- repository connected to the correct Vercel project
- production branch confirmed
- preview/production env vars configured
- latest push confirmed in the Vercel deployment pipeline
