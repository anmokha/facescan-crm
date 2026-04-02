export interface TrackingParams {
  source: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  referrer?: string;
}

export const getTrackingParams = (): TrackingParams => {
  if (typeof window === 'undefined') return { source: 'direct' };

  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer;

  // 1. Try UTM params
  const utmSource = params.get('utm_source');
  if (utmSource) {
    return {
      source: utmSource,
      medium: params.get('utm_medium') || '',
      campaign: params.get('utm_campaign') || '',
      term: params.get('utm_term') || '',
      content: params.get('utm_content') || '',
      referrer: referrer || ''
    };
  }

  // 2. Try Referrer (Organic Search / Social)
  if (referrer) {
    const refUrl = new URL(referrer);
    const hostname = refUrl.hostname;

    if (hostname.includes('google')) return { source: 'google', medium: 'organic', referrer };
    if (hostname.includes('yandex')) return { source: 'yandex', medium: 'organic', referrer };
    if (hostname.includes('instagram')) return { source: 'instagram', medium: 'referral', referrer };
    if (hostname.includes('facebook')) return { source: 'facebook', medium: 'referral', referrer };
    if (hostname.includes('vk.com')) return { source: 'vk', medium: 'referral', referrer };
    
    // Generic referral
    if (!hostname.includes(window.location.hostname)) {
        return { source: hostname, medium: 'referral', referrer };
    }
  }

  // 3. Direct / Unknown
  return { source: 'direct', referrer };
};
