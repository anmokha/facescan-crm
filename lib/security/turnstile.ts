/**
 * Verifies Cloudflare Turnstile token.
 *
 * @param token - The token received from the frontend
 * @param ip - Optional client IP for extra validation
 * @returns boolean - True if human, False if bot
 */
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  if (!secretKey) {
    console.error('TURNSTILE_SECRET_KEY is not configured in environment variables.')
    return false
  }

  if (!token) {
    console.warn('No Turnstile token provided for verification.')
    return false
  }

  try {
    const formData = new FormData()
    formData.append('secret', secretKey)
    formData.append('response', token)
    if (ip) formData.append('remoteip', ip)

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData
    })
    const data = await response.json()
    return Boolean(data?.success)
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return false
  }
}
