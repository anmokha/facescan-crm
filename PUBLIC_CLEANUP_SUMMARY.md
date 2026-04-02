<!--
  Public Cleanup Summary

  Documents what was intentionally changed while preparing this fork
  for public portfolio publication.
-->

# Public Cleanup Summary

## Kept (core logic)

- `app/`, `components/`, `lib/`, `functions/src/`
- `middleware.ts`
- Firebase config/rules files
- Build/runtime configs (`package.json`, `tsconfig.json`, `next.config.js`, etc.)

## Removed / Excluded

- Local env files (`.env`, `.env.local`)
- HAR/network dump artifacts
- Local data exports and scanning outputs
- `functions/node_modules` from source copy

## Sanitized

- Hardcoded personal/admin emails in scripts/docs
- Admin scripts now use env-based email lists (`ADMIN_EMAILS`, `MIGRATION_ADMIN_EMAILS`, `PROTECTED_EMAILS`)
- JWT session secret fallback removed in `lib/auth/sessionService.ts`
- CAPTCHA bypass logic removed in `app/api/submit-lead/route.ts`

## Documentation / readability

- Added human-readable module headers in core files:
  - `middleware.ts`
  - `app/api/analyze/route.ts`
  - `app/api/submit-lead/route.ts`
  - `app/api/webhooks/conversion/route.ts`
  - `lib/server/clientConfig.ts`
  - `lib/firebaseAdmin.ts`
  - `app/page.tsx`
  - `app/layout.tsx`

