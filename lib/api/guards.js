/**
 * API Guard Utilities
 *
 * Small pure helpers used by critical API routes (`analyze`, `submit-lead`).
 * Keeping these rules isolated makes behavior explicit and testable.
 */

/**
 * Resolve a positive integer from env/runtime input.
 * Falls back when value is missing, NaN, or non-positive.
 */
function resolvePositiveInt(input, fallback) {
  const value = Number(input)
  if (!Number.isFinite(value)) return fallback
  if (value <= 0) return fallback
  return Math.floor(value)
}

/**
 * Returns true if form was submitted too quickly (bot-like behavior).
 */
function isTooFastSubmission(formStartedAt, minDurationMs, nowMs = Date.now()) {
  const startedAtMs = typeof formStartedAt === 'number' ? formStartedAt : Number(formStartedAt)
  if (!Number.isFinite(startedAtMs) || startedAtMs <= 0) return false
  return nowMs - startedAtMs < minDurationMs
}

/**
 * CAPTCHA is required when there is no valid session and no CAPTCHA token.
 */
function shouldRequireCaptcha(captchaToken, hasValidSession) {
  return !captchaToken && !hasValidSession
}

module.exports = {
  resolvePositiveInt,
  isTooFastSubmission,
  shouldRequireCaptcha
}
