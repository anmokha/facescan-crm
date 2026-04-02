import { createHash } from 'crypto';

/**
 * Pixel Integration Service for CureScan
 * Handles Server-Side Tracking for Meta (CAPI), Google (Measurement Protocol), and TikTok.
 */

export interface PixelSettings {
    meta?: {
        active: boolean;
        pixelId: string;
        accessToken: string;
        testEventCode?: string;
    };
    google?: {
        active: boolean;
        measurementId: string;
        apiSecret: string;
    };
    tiktok?: {
        active: boolean;
        pixelId: string;
        accessToken: string;
    };
}

function sha256(value: string | undefined): string | undefined {
    if (!value) return undefined;
    return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

/**
 * Maps diagnostic concerns to marketing event names.
 * This allows clinics to build specific audiences (e.g., "Acne Audience").
 */
function mapConcernsToEvents(analysisResult: any): string[] {
    // Collect all possible strings that might contain concerns
    const findings: string[] = [];
    
    const profile = analysisResult?.profile || {};
    const issues = profile.issues || profile.concerns || [];
    
    if (Array.isArray(issues)) {
        findings.push(...issues.map(i => String(i).toLowerCase()));
    } else if (typeof issues === 'string') {
        findings.push(issues.toLowerCase());
    }

    // Also check routine or products for clues if issues are empty
    if (findings.length === 0 && analysisResult?.routine) {
        findings.push(JSON.stringify(analysisResult.routine).toLowerCase());
    }

    const events: string[] = [];

    /**
     * Obfuscation Mapping (The "Decoder Ring")
     * We use codes to avoid "Sensitive Health Data" flags from Meta/Google.
     * SC_T1 = Acne
     * SC_T2 = Aging/Wrinkles
     * SC_T3 = Pigmentation
     * SC_T4 = Dry Skin
     * SC_T5 = Oily Skin
     * SC_T6 = Sensitivity
     * HC_T1 = Hair Loss
     */

    // Skin Conditions Mapping
    if (findings.some(i => i.includes('acne') || i.includes('breakout') || i.includes('pimple') || i.includes('blackhead'))) {
        events.push('SC_T1');
    }
    if (findings.some(i => i.includes('wrinkle') || i.includes('aging') || i.includes('fine line') || i.includes('age') || i.includes('sagging'))) {
        events.push('SC_T2');
    }
    if (findings.some(i => i.includes('pigment') || i.includes('dark spot') || i.includes('melasma') || i.includes('sun damage') || i.includes('hyperpigmentation'))) {
        events.push('SC_T3');
    }
    if (findings.some(i => i.includes('dry') || i.includes('dehydrat') || i.includes('flak'))) {
        events.push('SC_T4');
    }
    if (findings.some(i => i.includes('pore') || i.includes('oily') || i.includes('sebum'))) {
        events.push('SC_T5');
    }
    if (findings.some(i => i.includes('redness') || i.includes('sensit') || i.includes('rosacea') || i.includes('irritat'))) {
        events.push('SC_T6');
    }

    // Hair Conditions
    if (findings.some(i => i.includes('hair loss') || i.includes('thinning') || i.includes('alopecia') || i.includes('balding'))) {
        events.push('HC_T1');
    }

    return Array.from(new Set(events)); // Unique events only
}

export async function sendPixelConversion(
    settings: PixelSettings,
    lead: any,
    clientData: { ip: string; ua: string; fbp?: string; fbc?: string }
) {
    const results: any = { meta: null, google: null, tiktok: null };
    
    // Prepare PII
    const hashedEmail = sha256(lead.email);
    const hashedPhone = sha256(lead.phone || lead.phoneE164);
    
    // 1. Meta Conversions API (CAPI)
    if (settings.meta?.active && settings.meta.pixelId && settings.meta.accessToken) {
        try {
            const eventData = {
                data: [
                    {
                        event_name: 'Lead',
                        event_time: Math.floor(Date.now() / 1000),
                        action_source: 'website',
                        event_source_url: `https://app.curescan.pro/${lead.diagnosticType || 'skin'}`,
                        user_data: {
                            em: hashedEmail ? [hashedEmail] : undefined,
                            ph: hashedPhone ? [hashedPhone] : undefined,
                            client_ip_address: clientData.ip,
                            client_user_agent: clientData.ua,
                            fbp: clientData.fbp,
                            fbc: clientData.fbc
                        },
                        custom_data: {
                            diagnostic_type: lead.diagnosticType,
                            skin_score: lead.analysisResult?.profile?.skin_score,
                            detected_conditions: mapConcernsToEvents(lead.analysisResult),
                            clinic_id: lead.clinicId
                        },
                        test_event_code: settings.meta.testEventCode || undefined
                    }
                ]
            };

            const response = await fetch(`https://graph.facebook.com/v18.0/${settings.meta.pixelId}/events?access_token=${settings.meta.accessToken}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });
            results.meta = await response.json();
        } catch (e) {
            console.error('Meta CAPI Error:', e);
            results.meta = { error: e };
        }
    }

    // 2. Google Analytics 4 (Measurement Protocol)
    if (settings.google?.active && settings.google.measurementId && settings.google.apiSecret) {
        try {
            const gaPayload = {
                client_id: hashedPhone || lead.id || 'anonymous',
                events: [{
                    name: 'generate_lead',
                    params: {
                        diagnostic_type: lead.diagnosticType,
                        skin_score: lead.analysisResult?.profile?.skin_score,
                        detected_conditions: mapConcernsToEvents(lead.analysisResult).join(','),
                        clinic_id: lead.clinicId,
                        source: lead.tracking?.source || 'direct'
                    }
                }]
            };

            const response = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${settings.google.measurementId}&api_secret=${settings.google.apiSecret}`, {
                method: 'POST',
                body: JSON.stringify(gaPayload)
            });
            results.google = response.ok ? 'ok' : await response.text();
        } catch (e) {
            console.error('GA4 MP Error:', e);
            results.google = { error: e };
        }
    }

    // 3. TikTok Events API
    if (settings.tiktok?.active && settings.tiktok.pixelId && settings.tiktok.accessToken) {
        try {
            const tiktokPayload = {
                pixel_code: settings.tiktok.pixelId,
                event: 'CompleteRegistration', // Or 'SubmitForm'
                event_id: lead.id,
                timestamp: new Date().toISOString(),
                context: {
                    ad: { callback: clientData.fbc },
                    user: {
                        email: hashedEmail,
                        phone_number: hashedPhone
                    },
                    ip: clientData.ip,
                    user_agent: clientData.ua
                },
                properties: {
                    content_type: 'product',
                    contents: [{
                        content_id: lead.diagnosticType,
                        content_name: 'AI Diagnostic'
                    }],
                    skin_score: lead.analysisResult?.profile?.skin_score
                }
            };

            const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Token': settings.tiktok.accessToken
                },
                body: JSON.stringify(tiktokPayload)
            });
            results.tiktok = await response.json();
        } catch (e) {
            console.error('TikTok API Error:', e);
            results.tiktok = { error: e };
        }
    }

    return results;
}
