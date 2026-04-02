export type SupportedCountry = 'RU' | 'AE'

const COUNTRY_CALLING_CODE: Record<SupportedCountry, string> = {
  RU: '7',
  AE: '971'
}

export type NormalizedPhone = {
  phoneE164: string
  phoneDigits: string
  phoneCountry: SupportedCountry
}

const digitsOnly = (value: string) => (value || '').replace(/\D/g, '')

/**
 * Pragmatic normalizer for RU/AE to E.164.
 * - RU accepts: +7XXXXXXXXXX, 7XXXXXXXXXX, 8XXXXXXXXXX, (XXX) XXX-XX-XX (as 10 digits), etc.
 * - AE accepts: +9715XXXXXXXX, 9715XXXXXXXX, 05XXXXXXXX, 5XXXXXXXX (mobile), and other national formats as digits.
 */
export function normalizePhone(
  raw: string,
  country: SupportedCountry
): NormalizedPhone {
  const input = (raw || '').trim()
  const inputDigits = digitsOnly(input)

  if (!inputDigits) {
    throw new Error('Phone number is required')
  }

  if (country === 'RU') {
    let digits = inputDigits

    // Accept 10-digit local numbers (assume Russia)
    if (digits.length === 10) {
      digits = `7${digits}`
    }

    // Accept 8XXXXXXXXXX (convert to 7XXXXXXXXXX)
    if (digits.length === 11 && digits.startsWith('8')) {
      digits = `7${digits.slice(1)}`
    }

    if (digits.length !== 11 || !digits.startsWith('7')) {
      throw new Error('Invalid RU phone number')
    }

    return {
      phoneCountry: 'RU',
      phoneDigits: digits,
      phoneE164: `+${digits}`
    }
  }

  if (country === 'AE') {
    let digits = inputDigits

    // Accept "05XXXXXXXX" local mobile -> "5XXXXXXXX"
    if (digits.length === 10 && digits.startsWith('05')) {
      digits = digits.slice(1)
    }

    // Accept "5XXXXXXXX" (9 digits mobile) -> prefix 971
    if (digits.length === 9 && digits.startsWith('5')) {
      digits = `971${digits}`
    }

    // Accept full "971XXXXXXXXX"
    if (digits.startsWith('971')) {
      // UAE numbers in E.164 are typically 12 digits total (971 + 9 digits national significant number)
      if (digits.length < 12 || digits.length > 13) {
        // Keep loose for now, but still reject obviously wrong inputs
        throw new Error('Invalid AE phone number')
      }
      return {
        phoneCountry: 'AE',
        phoneDigits: digits,
        phoneE164: `+${digits}`
      }
    }

    // Fallback: if user entered national significant number without leading 0 (e.g., 50xxxxxxx or 4xxxxxxx)
    // We accept 8-10 digits and prefix 971.
    if (digits.length >= 8 && digits.length <= 10) {
      digits = `971${digits.replace(/^0+/, '')}`
      if (digits.length < 12 || digits.length > 13) {
        throw new Error('Invalid AE phone number')
      }
      return {
        phoneCountry: 'AE',
        phoneDigits: digits,
        phoneE164: `+${digits}`
      }
    }

    throw new Error('Invalid AE phone number')
  }

  // Exhaustiveness guard
  const _exhaustive: never = country
  return _exhaustive
}

export function getCountryCallingCode(country: SupportedCountry): string {
  return COUNTRY_CALLING_CODE[country]
}

