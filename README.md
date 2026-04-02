<!--
  CureScan Public Case Fork

  Employer-facing README:
  - explains product/business context,
  - highlights architecture and technical decisions,
  - shows ownership and execution depth,
  - keeps setup instructions straightforward.
-->

# CureScan Public Case Fork

Production-scale multi-tenant SaaS for aesthetic clinics: AI diagnostics, lead capture, conversion tracking, and admin analytics.

## Product Context

CureScan solves a real B2B problem:
- clinics need a branded diagnostic funnel,
- marketing teams need source-level attribution,
- operators need one admin system to manage many clinic tenants.

The platform turns traffic into structured leads and helps teams move those leads through a measurable funnel.

## My Scope (What This Repo Demonstrates)

- Multi-tenant architecture with shared core + tenant overrides
- Edge middleware tenant routing (`x-client-id` propagation)
- AI analysis pipeline with schema-validated structured response
- Lead capture pipeline with anti-abuse controls and funnel state updates
- Conversion webhook ingestion with HMAC verification
- Firebase-backed admin/security model (roles, rules, counters)

## Architecture Highlights

### 1. Tenant Resolution Layer
- Request host/query is resolved into tenant context in [`middleware.ts`](./middleware.ts)
- Tenant context is passed downstream via headers
- App supports branded tenant behavior without code forks

### 2. AI Analysis Core
- Main endpoint: [`app/api/analyze/route.ts`](./app/api/analyze/route.ts)
- Uses guardrails: rate limiting + schema validation (Zod)
- Injects clinic-specific context into prompting layer

### 3. Lead Pipeline
- Main endpoint: [`app/api/submit-lead/route.ts`](./app/api/submit-lead/route.ts)
- Supports lead creation and progression events
- Includes anti-bot controls and subscription-aware behavior

### 4. Conversion Attribution
- Webhook endpoint: [`app/api/webhooks/conversion/route.ts`](./app/api/webhooks/conversion/route.ts)
- Signed payload verification via HMAC
- Conversion writes mapped back to lead/clinic funnel

## Engineering Decisions and Trade-offs

- **Single codebase over per-tenant forks**
  - Pros: faster rollout, consistent features
  - Cons: stricter responsibility boundaries needed in config/routing

- **Structured AI output with schema validation**
  - Pros: predictable frontend rendering
  - Cons: extra complexity in prompt/schema evolution

- **Guard logic extracted into testable helpers**
  - Pros: easier regression testing for critical API behavior
  - Cons: additional module boundaries to maintain

## Public-Case Hardening Applied

- Removed private runtime artifacts and dumps
- Sanitized personal emails in scripts/docs
- Removed JWT fallback secret in session service
- Removed CAPTCHA bypass behavior in lead submission
- Added public-safe `.gitignore`, `LICENSE`, CI workflow, and tests

See details: [`PUBLIC_CLEANUP_SUMMARY.md`](./PUBLIC_CLEANUP_SUMMARY.md)

## Local Setup

```bash
npm install
npm run dev
```

### Required env (minimum)

Copy `.env.example` to `.env.local` and set:
- `GEMINI_API_KEY`
- `FIREBASE_SERVICE_PRIVATE_KEY`
- `FIREBASE_SERVICE_CLIENT_EMAIL`
- `NEXT_PUBLIC_FIREBASE_*`
- `CUSTOMER_JWT_SECRET`

## Quality Gates

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Repository Structure (Core)

- `app/` — Next.js app routes + API routes
- `components/` — UI and feature components
- `lib/` — domain services, auth, security, integrations
- `functions/src/` — Firebase Functions source
- `scripts/` — operational scripts (sanitized)

