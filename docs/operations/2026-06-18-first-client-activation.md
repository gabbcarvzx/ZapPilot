# ZapPilot Local First Client Activation Playbook

## Objective

Move `ZapPilot Local` from functional MVP to first-customer commercial operation with a repeatable activation process, a controlled demo flow, and minimal operational risk.

## Commercial Position

Current focus is not feature expansion. Current focus is:

- activate the first paying customer
- reduce onboarding friction
- make setup operationally repeatable
- improve demo readiness for sales calls
- validate the business offer in a real customer environment

## 1. Customer Activation Checklist

### Step 1: Account Creation

Owner:

- Customer

Actions:

- Create account with business name, contact email, and password
- Confirm access to login

Expected time:

- `3 to 5 minutes`

Success criteria:

- Customer can log in
- Business record exists
- Subscription is created in `PENDING`

### Step 2: Plan Selection

Owner:

- Customer chooses
- Founder confirms commercial package

Actions:

- Confirm plan: `Start`, `Pro`, or `Premium`
- Align what is included so there is no expectation mismatch

Expected time:

- `5 to 10 minutes`

Success criteria:

- Chosen plan is documented
- Customer understands what will and will not be active

### Step 3: Manual Plan Activation

Owner:

- Founder/admin

Actions:

- Access `/admin`
- Find the business
- Set subscription status to `ACTIVE`
- Confirm correct plan is assigned

Expected time:

- `2 minutes`

Success criteria:

- Subscription is `ACTIVE`
- Automation is no longer blocked by plan status

### Step 4: Business Configuration

Owner:

- Customer fills data
- Founder reviews quality

Actions:

- Business name
- Niche
- Address
- Phone
- WhatsApp number
- Business hours
- Welcome message
- Closed-hours message
- Tone of service

Expected time:

- `10 to 15 minutes`

Success criteria:

- Business profile is complete
- Messages are commercially usable
- Hours reflect real operation

### Step 5: WhatsApp Configuration

Owner:

- Founder usually configures
- Customer provides Meta assets and access if needed

Actions:

- Fill `Business Account ID`
- Fill `Phone Number ID`
- Fill `Access Token`
- Fill `Verify Token`
- Mark integration active
- Confirm webhook URL is configured in Meta

Expected time:

- `10 to 20 minutes`

Success criteria:

- Webhook verification returns `200`
- Meta phone configuration is valid
- Panel no longer depends on mock mode for WhatsApp

### Step 6: AI Configuration

Owner:

- Founder

Actions:

- Confirm Gemini key is present in production
- Confirm business context is strong enough for AI use
- Review products and FAQ quality
- Confirm fallback to human is acceptable

Expected time:

- `5 to 10 minutes`

Success criteria:

- AI route is technically available
- Business context is sufficient for safe replies
- Team understands free-tier quota risk

### Step 7: Final Validation

Owner:

- Founder/admin

Actions:

- Send a real test message
- Confirm inbound receipt
- Confirm response generation
- Confirm outbound delivery
- Confirm conversation persistence

Expected time:

- `10 minutes`

Success criteria:

- End-to-end flow works
- Conversation is visible in the panel
- Customer accepts response quality

## 2. Internal Onboarding Flow

## Founder Responsibilities

### Before Customer Call

- Verify production URL is healthy
- Confirm `ACTIVE` plan can be applied manually
- Confirm environment variables are present
- Confirm webhook verification works
- Prepare one niche-specific demo account if needed

Expected time:

- `10 minutes`

### During Customer Activation

- Guide plan selection
- Review business messages for sales clarity
- Configure admin-controlled fields
- Validate WhatsApp and webhook
- Supervise first live test

Expected time:

- `20 to 35 minutes`

### After Activation

- Review stored messages
- Check if automation should remain active immediately
- Log issues and objections from the customer
- Schedule a 24-hour follow-up

Expected time:

- `10 minutes`

## Customer Responsibilities

- Provide business information
- Approve the chosen plan
- Provide products/services and FAQ
- Provide or approve WhatsApp/Meta access inputs
- Send the live validation message

Expected time:

- `20 to 30 minutes`

## 3. Operational Documentation

### How to Activate Plan `ACTIVE`

1. Log in with admin account
2. Open `/admin`
3. Find the correct business row
4. Choose the plan
5. Change status to `ACTIVE`
6. Save
7. Reopen dashboard or check subscription in database if needed

### How to Register a Company

1. Customer signs up
2. Business record is created automatically
3. Founder reviews the account
4. Customer completes onboarding fields

### How to Register Products

1. Open `Atendente automático`
2. Fill product name
3. Fill description
4. Fill price
5. Save
6. Review if the copy is clear for customer-facing replies

### How to Register FAQ

1. Open `Atendente automático`
2. Fill question
3. Fill answer
4. Save
5. Confirm answers are short, factual, and sellable

### How to Connect WhatsApp

1. Open `Configuração do WhatsApp`
2. Fill Meta IDs and token fields
3. Mark as active
4. Save
5. Configure the webhook URL in Meta:
   `https://zappilotchat.vercel.app/api/webhook/whatsapp`
6. Verify token and webhook challenge
7. Run a real inbound test

## 4. End-to-End Test Script

### Test Story

1. Customer or founder sends a WhatsApp message to the connected business number
2. WhatsApp Cloud API sends the webhook event
3. The app receives `POST /api/webhook/whatsapp`
4. The system resolves the business by WhatsApp configuration
5. The system stores the inbound message
6. The system checks subscription status
7. The assistant builds the business context
8. Gemini or fallback logic generates the response
9. The app sends the outbound message through Meta
10. The outbound message is persisted
11. Conversation appears in `/messages`

### Minimum Test Cases

- Greeting message
- Price question
- Hours question
- FAQ question
- Unknown question triggering human handoff
- Test while subscription is `PENDING` to confirm automation block

### Exact Validation Script

#### Mock Mode

1. Open `/messages`
2. Run the simulator with a greeting
3. Run the simulator with a price question
4. Run the simulator with a business-hours question
5. Run the simulator with a FAQ question
6. Run the simulator with an unknown request that should still end in a safe answer or human escalation
7. Review:
   - reply quality
   - product mention accuracy
   - hours accuracy
   - FAQ usefulness
   - clear handoff language when certainty is low

#### Live Mode

1. Confirm plan is `ACTIVE`
2. Confirm WhatsApp credentials and webhook are configured
3. Send the same message script from the real customer number
4. Confirm inbound webhook receipt
5. Confirm outbound delivery
6. Confirm conversation persistence in `/messages`
7. Set the plan back to `PENDING` for one validation message and verify automation stays blocked

## 5. Diagnostic Panel Requirements

The diagnostic surface should show, at a glance:

- subscription status
- WhatsApp integration status
- AI mode: `live` or `fallback`
- database mode: `connected` or `mock`
- webhook verification status

The diagnostic surface must answer:

- can this tenant reply right now?
- if not, what exact dependency is blocking it?

## 6. Demo Seed Strategy

Three demo tenants should exist:

### Hamburgueria

- fast-order use case
- prices and delivery questions
- high commercial immediacy

### Barbearia

- appointment and availability use case
- service list and booking questions
- lower message volume, clearer FAQ

### Loja de Roupas

- catalog and stock-interest use case
- shipping and pickup questions
- retail tone and discovery flow

Demo seed goals:

- support sales demonstrations
- reduce setup time in lead calls
- show niche flexibility without building new features

## 7. Commercial Experience Improvements

Improvements allowed in this phase:

- stronger success messages
- cleaner empty states
- guided onboarding copy
- tooltips for confusing fields
- plain-language explanations around setup and status

These changes should help:

- reduce operator confusion
- lower lead friction in demos
- make the product feel safer and more guided

## 8. Commercial Readiness Review

### Sell Now

- route protection is fixed and validated
- production deploy is active on Vercel
- Neon is synced and seeded for real persistence
- admin activation works for manual plan release
- dashboard, onboarding, diagnostics, and simulator are commercially presentable
- Gemini has fallback behavior under quota pressure

### Blocks Sale

- each real tenant still depends on completing business setup before activation is honest
- WhatsApp commercial usage still depends on production-number readiness and final live validation with the customer number
- temporary `/privacy` and `/terms` pages still weaken commercial confidence in a formal close

### Can Wait

- automated billing
- deeper analytics
- multi-business accounts
- richer RBAC
- advanced reports
- multiple attendants

## Recommended Activation Sequence

For the first paying customer, use this order:

1. commercial agreement and plan choice
2. account creation
3. manual subscription activation
4. business setup
5. products and FAQ
6. WhatsApp connection
7. live message test
8. observation window for first 24 hours

## Immediate Goal

The first validation milestone is not scale. It is:

- one real customer
- one connected WhatsApp number
- one business fully configured
- one successful end-to-end message flow
- one clear proof that the customer sees business value
