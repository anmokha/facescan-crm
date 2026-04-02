/**
 * API Guards Tests
 *
 * Covers critical guardrails used in high-traffic endpoints:
 * - /api/analyze rate-limit parsing
 * - /api/submit-lead anti-bot checks
 */

const test = require('node:test')
const assert = require('node:assert/strict')

const {
  resolvePositiveInt,
  isTooFastSubmission,
  shouldRequireCaptcha
} = require('../lib/api/guards')

test('resolvePositiveInt: returns fallback for invalid values', () => {
  assert.equal(resolvePositiveInt(undefined, 100), 100)
  assert.equal(resolvePositiveInt('abc', 100), 100)
  assert.equal(resolvePositiveInt(0, 100), 100)
  assert.equal(resolvePositiveInt(-3, 100), 100)
})

test('resolvePositiveInt: returns floored positive integer', () => {
  assert.equal(resolvePositiveInt('250', 100), 250)
  assert.equal(resolvePositiveInt(19.9, 100), 19)
})

test('isTooFastSubmission: detects bot-like fast submit', () => {
  const now = 1_000_000
  assert.equal(isTooFastSubmission(now - 500, 2000, now), true)
  assert.equal(isTooFastSubmission(now - 2500, 2000, now), false)
})

test('isTooFastSubmission: ignores invalid start timestamp', () => {
  const now = 1_000_000
  assert.equal(isTooFastSubmission(undefined, 2000, now), false)
  assert.equal(isTooFastSubmission('NaN', 2000, now), false)
  assert.equal(isTooFastSubmission(-10, 2000, now), false)
})

test('shouldRequireCaptcha: requires token only for unauthenticated session', () => {
  assert.equal(shouldRequireCaptcha('', false), true)
  assert.equal(shouldRequireCaptcha(null, false), true)
  assert.equal(shouldRequireCaptcha('captcha-token', false), false)
  assert.equal(shouldRequireCaptcha('', true), false)
})
