# FaceScan CRM

FaceScan CRM is a multi-tenant SaaS platform for aesthetic clinics and medical marketing teams.

It combines an AI-powered diagnostic funnel, lead capture, attribution tracking, and clinic CRM workflows in one product.

## What the Product Solves

- Clinic websites need a high-converting diagnostic entry point
- Marketing teams need clean source-level attribution and conversion visibility
- Operators need one system to manage multiple clinic brands and locations

FaceScan CRM turns anonymous traffic into structured leads and moves those leads through a measurable conversion funnel.

## Core Capabilities

- Multi-tenant architecture with branded clinic configurations
- AI skin analysis with structured output for consistent UX
- Lead capture pipeline with anti-abuse controls
- Conversion webhook ingestion with HMAC signature verification
- Dashboard for lead operations, analytics, and admin workflows

## Technical Overview

### Tenant Routing

- Tenant is resolved in [`middleware.ts`](./middleware.ts)
- Request context is propagated via `x-client-id` and consumed by API routes
- Single codebase supports multiple clinic brands

### AI Analysis API

- Main endpoint: [`app/api/analyze/route.ts`](./app/api/analyze/route.ts)
- Includes input validation and rate-limiting guards
- Produces schema-driven response for predictable frontend rendering

### Lead & Funnel API

- Main endpoint: [`app/api/submit-lead/route.ts`](./app/api/submit-lead/route.ts)
- Handles lead creation, dedupe paths, and funnel status updates
- Applies session/captcha checks for abuse protection

### Conversion Tracking API

- Main endpoint: [`app/api/webhooks/conversion/route.ts`](./app/api/webhooks/conversion/route.ts)
- Verifies signed payloads before writing conversion events
- Maps conversions to tenant, source, and lead records

## Stack

- Next.js 14 (App Router) + TypeScript
- Firebase (Auth, Firestore, Functions)
- Tailwind CSS
- Zod validation
- Node test runner for critical guard logic

## Run Locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set minimum required variables:

- `GEMINI_API_KEY`
- `FIREBASE_SERVICE_PRIVATE_KEY`
- `FIREBASE_SERVICE_CLIENT_EMAIL`
- `NEXT_PUBLIC_FIREBASE_*`
- `CUSTOMER_JWT_SECRET`

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Project Structure

- `app/` - routes, pages, and API handlers
- `components/` - UI and domain components
- `lib/` - business logic, security, integrations
- `functions/src/` - Firebase Functions source
- `scripts/` - operational and migration scripts
