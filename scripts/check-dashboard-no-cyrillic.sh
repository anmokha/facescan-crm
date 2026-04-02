#!/usr/bin/env bash
set -euo pipefail

# Guardrail: prevent Russian UI strings creeping back into the clinic dashboard UI.
# NOTE: we currently exclude `app/dashboard/leads/page.tsx` because it contains non-UI parsing regexes.

if rg -n "[А-Яа-яЁё]" \
  app/dashboard \
  components/admin/ClinicSettingsForm.tsx \
  components/admin/LeadDetailsModal.tsx \
  -S -g '!app/dashboard/leads/page.tsx'; then
  echo ""
  echo "Cyrillic detected in dashboard sources. Move UI strings to i18n (`lib/i18n/messages.ts`)."
  exit 1
fi
