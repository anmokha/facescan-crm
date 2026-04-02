
import { NextRequest, NextResponse } from 'next/server'
import { fetchClientConfig } from '@/lib/server/clientConfig'
import { incrementTrafficStat } from '@/lib/server/trafficStats'
import { getWeightedProspectClinic } from '@/lib/server/tds'

export async function GET(request: NextRequest) {
  // Middleware already determines the client ID (SLUG) and puts it in the header
  const slug = request.headers.get('x-client-id') || 'default'
  const host = request.headers.get('host') || ''

  try {
    let client = await fetchClientConfig(slug, host);

    // TDS LOGIC: If no specific client requested (default), rotate prospect clinics
    if (slug === 'default' && !client) {
        client = await getWeightedProspectClinic();
    }

    if (client) {
      // Track a "click" (entry) for funnel analytics (per source/campaign).
      // We piggyback on this endpoint because checkup page calls it once on load with UTMs in the querystring.
      try {
        const params = request.nextUrl.searchParams
        const tracking = {
          source: params.get('utm_source') || 'direct',
          medium: params.get('utm_medium') || '',
          campaign: params.get('utm_campaign') || '',
          term: params.get('utm_term') || '',
          content: params.get('utm_content') || '',
          referrer: request.headers.get('referer') || ''
        }
        const clinicId = client.uid || client.id
        if (clinicId && clinicId !== 'default') {
          await incrementTrafficStat({ clinicId, tracking, metric: 'clicks' })
        }
      } catch (e) {
        console.warn('Traffic click tracking failed:', e)
      }

      return NextResponse.json({
        id: client.id,
        clinicId: client.uid || client.id,
        slug: client.slug || client.id,
        name: client.name,
        logoUrl: client.theme?.logoUrl || null,
        modules: client.modules || ['skin'],
        theme: client.theme,
        texts: client.texts || {},
        defaultCountry: client.defaultCountry || null,
        defaultLocale: client.defaultLocale || 'en-US',
        supportedLocales: client.supportedLocales || null,
        leadUnlockMethod: client.leadUnlockMethod || null,
        primaryContactChannel: client.primaryContactChannel || null,
        whatsappNumber: client.whatsappNumber || null,
        instagramHandle: client.instagramHandle || null,
        contactPhone: client.contactPhone || null
      })
    }
    
    // 3. Default Demo
    return NextResponse.json({
      id: 'default',
      name: 'CureScan Demo',
      modules: ['skin'],
      defaultCountry: 'AE',
      leadUnlockMethod: 'phone',
      primaryContactChannel: 'whatsapp',
      theme: null
    })
    
  } catch (error) {
    console.error('Failed to load client config:', error)
    return NextResponse.json({ error: 'Failed to load config' }, { status: 500 })
  }
}
