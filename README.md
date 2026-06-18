# ZapPilot Local

ZapPilot Local is a commercial SaaS MVP for small businesses that want a WhatsApp automatic attendant with a premium marketing site, customer dashboard, admin controls, Gemini-ready replies, and WhatsApp Cloud API structure.

The project is designed to work in development even when external integrations are not configured yet.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style component structure
- Framer Motion
- Lucide React
- React Hook Form
- Zod
- Prisma
- Neon PostgreSQL
- Auth.js
- Gemini API
- WhatsApp Cloud API
- Vercel-ready deployment

## Development Strategy

This repository is intentionally mock-safe:

- If `DATABASE_URL` is empty, the app still boots and uses in-memory data for demo flows.
- If `GEMINI_API_KEY` is empty, AI replies run in deterministic mock mode.
- If WhatsApp credentials are empty, webhook and send flows run in simulated mode.
- If `ADMIN_EMAILS` is empty in development, `admin@local.test` is treated as local admin.

Default local login:

- Email: `admin@local.test`
- Password: `admin123`

## Environment Variables

Use `.env.example` as the base:

```env
DATABASE_URL=
AUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
ADMIN_EMAILS=admin@local.test
```

## Running Locally

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npm run prisma:generate
```

3. Start development server:

```bash
npm run dev
```

4. Open:

```text
http://localhost:3000
```

## Prisma + Neon Setup

The project is already configured for PostgreSQL via Prisma.

When you are ready to use Neon:

1. Create a Neon project.
2. Copy the PostgreSQL connection string.
3. Put it in `DATABASE_URL`.
4. Run:

```bash
npm run prisma:migrate
npm run prisma:seed
```

If `DATABASE_URL` is empty, the app uses the mock store instead of crashing.

## Auth Setup

For local development:

- `NEXTAUTH_URL=http://localhost:3000`
- `AUTH_SECRET` can be added later, but should be present for production

Generate a production-safe secret with a command such as:

```bash
openssl rand -base64 32
```

## Gemini Setup

To enable real AI replies:

1. Create a Gemini API key.
2. Add it to `GEMINI_API_KEY`.
3. Restart the app.

Without the key, the assistant stays in mock mode and still supports local testing.

## WhatsApp Cloud API Setup

To enable live WhatsApp sending and webhook processing:

1. Create or configure your Meta app.
2. Get:
   - access token
   - phone number ID
   - business account ID
   - webhook verify token
3. Fill:
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_BUSINESS_ACCOUNT_ID`
   - `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
4. Publish your app URL and webhook route:

```text
/api/webhook/whatsapp
```

Local testing without Meta:

- use `/messages`
- use the simulator form
- or call `/api/dev/simulate-message`

## Admin Activation

Admin access is controlled by `ADMIN_EMAILS`.

Examples:

```env
ADMIN_EMAILS=admin@local.test
```

or

```env
ADMIN_EMAILS=owner@empresa.com,operacao@empresa.com
```

If `ADMIN_EMAILS` is empty in development, the app falls back to `admin@local.test`.

## Production Deploy on Vercel

1. Push the repository.
2. Import the project into Vercel.
3. Set all environment variables in the Vercel dashboard.
4. Add the real production URL to `NEXTAUTH_URL`.
5. If using Neon, add the production `DATABASE_URL`.
6. Deploy.

Recommended production checklist:

- add real `AUTH_SECRET`
- add real `DATABASE_URL`
- add real Gemini key
- add real WhatsApp credentials
- replace temporary `/privacy` and `/terms` content
- validate admin emails
- test webhook verification on the final domain

## Verification Commands

```bash
npm run prisma:generate
npm run lint
npm run test
npm run build
```

## Important Files

- `prisma/schema.prisma`
- `lib/prisma.ts`
- `lib/auth.ts`
- `lib/gemini.ts`
- `lib/whatsapp.ts`
- `app/api/webhook/whatsapp/route.ts`
- `app/api/whatsapp/send/route.ts`
- `.env.example`

## Notes

- Temporary legal pages exist at `/privacy` and `/terms`.
- The current billing flow is admin-driven for v1.
- The architecture is simple now, but already separated into auth, business, assistant, subscription, messaging, and integrations services.
