
type RecaptchaOptions = {
  expectedAction?: string
  minScore?: number
  remoteIp?: string
}

/**
 * Verifies Google reCAPTCHA v3 (or v2) token.
 *
 * @param token - The token received from the frontend
 * @returns boolean - True if human, False if bot
 */
export async function verifyRecaptcha(token: string, options: RecaptchaOptions = {}): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.error("❌ RECAPTCHA_SECRET_KEY is not configured in environment variables.");
    return false; 
  }

  if (!token) {
    console.warn("⚠️ No reCAPTCHA token provided for verification.");
    return false;
  }

  try {
    const query = new URLSearchParams({
      secret: secretKey,
      response: token
    })
    if (options.remoteIp) {
      query.set('remoteip', options.remoteIp)
    }
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?${query.toString()}`;
    const response = await fetch(verifyUrl, { method: 'POST' });
    const data = await response.json();

    if (!data.success) return false;

    if (options.expectedAction && data.action && data.action !== options.expectedAction) {
      return false;
    }

    if (typeof data.score === 'number' && typeof options.minScore === 'number') {
      return data.score >= options.minScore;
    }

    return true;
  } catch (error) {
    console.error("reCAPTCHA Verification Error:", error);
    return false; // Fail safe or Open safe depending on policy. Usually Fail safe for security.
  }
}
