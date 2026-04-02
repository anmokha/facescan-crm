/**
 * Submit Lead API (Lead Capture + Progress Update)
 *
 * Handles three main flows:
 * 1) Sales inquiry from landing CTA,
 * 2) Existing lead update (quiz/email/interaction events),
 * 3) New lead creation after analysis unlock.
 *
 * Security and quality controls:
 * - rate limiting,
 * - anti-bot checks (CAPTCHA/honeypot/timing),
 * - payload size limits for images,
 * - subscription/limit guards per clinic.
 */

import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { checkRateLimit } from '@/lib/diagnostic/rateLimit'
import { verifyRecaptcha } from '@/lib/security/recaptcha'
import { verifyTurnstile } from '@/lib/security/turnstile'
import { sendWebhook, WebhookPayload } from '@/lib/integrations/webhookService'
import { createYClientsClient } from '@/lib/integrations/yclients'
import { createHubSpotContact } from '@/lib/integrations/hubspot'
import { sendPixelConversion } from '@/lib/integrations/pixel'
import { computeProgress } from '@/lib/diagnostic/progress'
import { logRetentionEvent } from '@/lib/diagnostic/retentionAnalytics'
import { createHash, randomBytes } from 'crypto'
import { verifySessionToken } from '@/lib/auth/sessionService'
import { normalizePhone } from '@/lib/phone'
import { resolveBillingPeriod, resolveLeadLimit } from '@/lib/billing/subscription'
import { incrementTrafficStat } from '@/lib/server/trafficStats'
import guards from '@/lib/api/guards'

const createPublicToken = () => {
    const cryptoApi = globalThis.crypto
    if (cryptoApi?.randomUUID) return cryptoApi.randomUUID()
    if (cryptoApi?.getRandomValues) {
        const bytes = new Uint8Array(16)
        cryptoApi.getRandomValues(bytes)
        return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
    }
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
}

const buildTreatmentPlan = (analysisResult: any, leadId: string) => {
    if (!analysisResult?.clinicTreatments || !Array.isArray(analysisResult.clinicTreatments)) return []
    return analysisResult.clinicTreatments.slice(0, 3).map((t: any) => ({
        name: t.name,
        price: t.price,
        status: 'Planned',
        sourceLeadId: leadId
    }))
}

const MAX_IMAGES = 6
const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const MAX_TOTAL_IMAGE_BYTES = 8 * 1024 * 1024
const MIN_FORM_TIME_MS = 2000

const getBase64Bytes = (value: string) => {
    const trimmed = value.trim()
    const base64 = trimmed.includes(',') ? trimmed.split(',')[1] : trimmed
    return Buffer.byteLength(base64, 'base64')
}

export async function POST(request: Request) {
  const { resolvePositiveInt, isTooFastSubmission, shouldRequireCaptcha } = guards as any

  // 0. Rate Limiting
  const ipHeader = request.headers.get('x-forwarded-for') || 'unknown'
  const ip = ipHeader.split(',')[0].trim()
  const ua = request.headers.get('user-agent') || 'unknown'
  const rateKey = createHash('sha256').update(`${ip}|${ua}`).digest('hex')
  const resolvedSubmitLimit = resolvePositiveInt(process.env.RATE_LIMIT_MAX_SUBMIT, 100)
  const isAllowed = await checkRateLimit(rateKey, resolvedSubmitLimit)
  
  if (!isAllowed) {
      return NextResponse.json(
          { error: 'Too many requests. Please try again in a minute.' },
          { status: 429 }
      );
  }

  try {
    const body = await request.json()
    const { 
      phone: rawPhone, 
      phoneCountry,
      name,
      contact,
      email,
      clientId, 
      diagnosticType, 
      analysisResult, 
      tracking, 
      leadId, 
      leadUpdateToken,
      quizAnswers,
      images,
      recaptchaToken,
      captchaToken,
      captchaAction,
      locale,
      sessionToken,
      honeypot,
      formStartedAt
    } = body

    const isSalesInquiry = !leadId && !rawPhone && (contact || name) && !analysisResult

    let phoneE164 = ''
    let phoneDigits = ''
    let resolvedPhoneCountry: any = null
    if (!isSalesInquiry) {
      try {
        const phone = normalizePhone(rawPhone, (phoneCountry || 'RU'))
        phoneE164 = phone.phoneE164
        phoneDigits = phone.phoneDigits
        resolvedPhoneCountry = phone.phoneCountry
      } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'Invalid phone number' }, { status: 400 })
      }
    }

    const captchaProvider = (process.env.CAPTCHA_PROVIDER || 'none').toLowerCase()
    const resolvedCaptchaToken = captchaToken || recaptchaToken
    if (!leadId) {
        if (honeypot) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
        }
        if (isTooFastSubmission(formStartedAt, MIN_FORM_TIME_MS)) {
            return NextResponse.json({ error: 'Too fast' }, { status: 400 })
        }

        const session = sessionToken ? verifySessionToken(sessionToken) : null
        const hasValidSession = !!(session && phoneDigits && session.phoneDigits === phoneDigits)

        if (captchaProvider === 'turnstile') {
            if (!process.env.TURNSTILE_SECRET_KEY) {
                return NextResponse.json({ error: 'Captcha is not configured' }, { status: 500 })
            }
            // Require CAPTCHA for all unauthenticated submissions (public-case hardened behavior).
            if (shouldRequireCaptcha(resolvedCaptchaToken, hasValidSession)) {
                return NextResponse.json({ error: 'CAPTCHA token required' }, { status: 400 })
            }
            if (resolvedCaptchaToken) {
                const isHuman = await verifyTurnstile(resolvedCaptchaToken, ip)
                if (!isHuman) {
                    return NextResponse.json({ error: 'CAPTCHA verification failed' }, { status: 400 })
                }
            }
        }

        if (captchaProvider === 'recaptcha') {
            if (!process.env.RECAPTCHA_SECRET_KEY) {
                return NextResponse.json({ error: 'Captcha is not configured' }, { status: 500 })
            }
            // Require CAPTCHA for all unauthenticated submissions (public-case hardened behavior).
            if (shouldRequireCaptcha(resolvedCaptchaToken, hasValidSession)) {
                return NextResponse.json({ error: 'CAPTCHA token required' }, { status: 400 })
            }
            if (resolvedCaptchaToken) {
                const minScore = Number(process.env.RECAPTCHA_MIN_SCORE || '0.5')
                const expectedAction = typeof captchaAction === 'string' ? captchaAction : 'lead_unlock'
                const isHuman = await verifyRecaptcha(resolvedCaptchaToken, {
                    expectedAction,
                    minScore: Number.isNaN(minScore) ? 0.5 : minScore,
                    remoteIp: ip
                })
                if (!isHuman) {
                    return NextResponse.json({ error: 'CAPTCHA verification failed' }, { status: 400 })
                }
            }
        }
    }

    // === РЕЖИМ 0: B2B ЗАЯВКА (CTA с лендинга) ===
    if (isSalesInquiry) {
      await adminDb.collection('sales_inquiries').add({
        name: typeof name === 'string' ? name.trim() : null,
        contact: typeof contact === 'string' ? contact.trim() : null,
        source: 'landing_cta',
        userAgent: ua,
        ip,
        createdAt: FieldValue.serverTimestamp()
      })
      return NextResponse.json({ success: true, mode: 'sales_inquiry' })
    }

    // === РЕЖИМ 1: ОБНОВЛЕНИЕ (Шаг 2 - Квиз и Email) ===
    if (leadId) {
       const leadRef = adminDb.collection('leads').doc(leadId);
       if (!leadUpdateToken) {
          return NextResponse.json({ error: 'Unauthorized update' }, { status: 403 });
       }

       const leadSnap = await leadRef.get();
       if (!leadSnap.exists) {
          return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
       }
       const leadData = leadSnap.data();
       if (leadData?.leadUpdateToken !== leadUpdateToken) {
          return NextResponse.json({ error: 'Unauthorized update' }, { status: 403 });
       }

       // Handle WhatsApp click tracking
       if (body.action === 'whatsapp_clicked') {
          await leadRef.update({
             whatsappClicked: true,
             whatsappClickedProcedure: body.procedure || null,
             whatsappClickedAt: FieldValue.serverTimestamp()
          });
          return NextResponse.json({ success: true, action: 'whatsapp_tracked' });
       }

       // Track interest in a specific procedure (no CTA choice; just intent signal)
       if (body.action === 'treatment_viewed') {
          const procedure = typeof body.procedure === 'string' ? body.procedure.trim() : ''
          const update: any = {
            lastInterestedProcedure: procedure || null,
            lastInterestedAt: FieldValue.serverTimestamp()
          }
          if (procedure) {
            update.interestedProcedures = FieldValue.arrayUnion(procedure)
          }
          await leadRef.update(update)
          return NextResponse.json({ success: true, action: 'treatment_viewed' })
       }

       // Handle callback request
       if (body.action === 'callback_requested') {
          const procedure = typeof body.procedure === 'string' ? body.procedure.trim() : null
          await leadRef.update({
             callbackRequested: true,
             callbackRequestedAt: FieldValue.serverTimestamp(),
             callbackRequestedProcedure: procedure || null,
             waitingForCall: true,
             waitingForCallProcedure: procedure || null,
             status: 'contacted'
          });
          return NextResponse.json({ success: true, action: 'callback_requested' });
       }

       const updateData: any = {};
       if (email) updateData.email = email;
       if (quizAnswers) updateData.quiz = quizAnswers;
       if (quizAnswers || email) updateData.updatedAt = FieldValue.serverTimestamp();
       if (quizAnswers) updateData.status = 'qualified';

       await leadRef.update(updateData);

       if (email) {
          try {
             const leadSnap = await leadRef.get();
             const leadData = leadSnap.data();
             if (leadData?.customerId) {
                const customerRef = adminDb.collection('customers').doc(leadData.customerId);
                await customerRef.update({ email });
             }
          } catch (emailSyncError) {
             console.warn("Customer email sync failed:", emailSyncError);
          }
       }
       
       return NextResponse.json({ success: true, mode: 'updated' });
    }

    // === РЕЖИМ 2: СОЗДАНИЕ (Шаг 1 - Телефон и Анализ) ===
    // Phone is already normalized at the top
    if (!phoneE164) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // 1. Определяем реального владельца клиники
    let finalClinicId = clientId || 'default';
    let settings = null;
    let isOverLimit = false;

    if (clientId && clientId !== 'default') {
        try {
            const { fetchClientConfig } = await import('@/lib/server/clientConfig');
            const config = await fetchClientConfig(clientId);
            if (config) {
                finalClinicId = config.uid || config.id;
                settings = config;
            }
        } catch (e) {
            console.error("Error resolving clinic owner:", e);
        }
    }

    // Subscription checks (Graceful Degradation)
    if (settings) {
        // Prefer fresh clinic doc (cached clientConfig can be stale)
        if (finalClinicId && finalClinicId !== 'default') {
            try {
                const clinicSnap = await adminDb.collection('clinics').doc(finalClinicId).get()
                if (clinicSnap.exists) {
                    settings = { ...settings, ...(clinicSnap.data() || {}) }
                }
            } catch (e) {
                console.warn('Failed to load clinic settings for billing checks:', e)
            }
        }

        if (settings.status === 'suspended') {
            return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
        }
        const subscriptionStatus = settings.subscription?.status
        const { limit, isUnlimited } = resolveLeadLimit(settings)
        const period = resolveBillingPeriod(settings)

        const billingBlocked =
            (period.source === 'subscription' && period.isExpired) ||
            (typeof subscriptionStatus === 'string' && !['trialing', 'active'].includes(subscriptionStatus))

        if (billingBlocked) {
            isOverLimit = true
        } else if (!isUnlimited && limit > 0) {
            const leadsCountSnap = await adminDb
                .collection('leads')
                .where('clinicId', '==', finalClinicId)
                .where('createdAt', '>=', Timestamp.fromDate(period.start))
                .where('createdAt', '<', Timestamp.fromDate(period.end))
                .orderBy('createdAt', 'desc')
                .count()
                .get()

            if (leadsCountSnap.data().count >= limit) {
                isOverLimit = true
            }
        }
    }

    // 2. Подготовка данных
    if (images && Array.isArray(images)) {
        if (images.length > MAX_IMAGES) {
            return NextResponse.json({ error: 'Too many images' }, { status: 413 })
        }
        let totalBytes = 0
        for (const image of images) {
            let size = 0
            try {
                size = getBase64Bytes(image)
            } catch (e) {
                return NextResponse.json({ error: 'Invalid image payload' }, { status: 400 })
            }
            totalBytes += size
            if (size > MAX_IMAGE_BYTES) {
                return NextResponse.json({ error: 'Image too large' }, { status: 413 })
            }
            if (totalBytes > MAX_TOTAL_IMAGE_BYTES) {
                return NextResponse.json({ error: 'Total upload too large' }, { status: 413 })
            }
        }
    }

    const sanitizedResult = { ...analysisResult };
    if (sanitizedResult.profile && sanitizedResult.profile.originalImage) delete sanitizedResult.profile.originalImage; 
    if (sanitizedResult.photos) delete sanitizedResult.photos;

    // --- CUSTOMER UPSERT LOGIC START ---
    let customerId = null;
    try {
        const upsertPromise = async () => {
            const session = sessionToken ? verifySessionToken(sessionToken) : null;
            
            if (session && session.customerId) {
                // If we have a valid session, use its customerId
                console.log('Using customerId from session:', session.customerId);
                
                // Still update lastSeenAt and stats
                const customerRef = adminDb.collection('customers').doc(session.customerId);
                const customerSnap = await customerRef.get();
                
                if (customerSnap.exists) {
                    const now = FieldValue.serverTimestamp();
                    const skinScore = sanitizedResult.profile?.skin_score || 0;
                    const skinType = sanitizedResult.profile?.skinType || 'unknown';
                    
                    const localeUpdate: any = typeof locale === 'string' ? { lastLocale: locale } : {}
                    await customerRef.update({
                        lastSeenAt: now,
                        totalCheckups: FieldValue.increment(1),
                        lastSkinScore: skinScore,
                        lastSkinType: skinType,
                        ...localeUpdate
                    });
                    return session.customerId;
                }
            }

	            const customersRef = adminDb.collection('customers');
	            const q = customersRef
	                .where('clinicId', '==', finalClinicId)
	                .where('phoneDigits', '==', phoneDigits)
	                .limit(1);
            
            const customerSnap = await q.get();
            const now = FieldValue.serverTimestamp();
            const skinScore = sanitizedResult.profile?.skin_score || 0;
            const skinType = sanitizedResult.profile?.skinType || 'unknown';

	            if (!customerSnap.empty) {
	                // Update existing customer
	                const customerDoc = customerSnap.docs[0];
	                const customerData = customerDoc.data();
	                const updates: any = {
	                    lastSeenAt: now,
	                    totalCheckups: FieldValue.increment(1),
	                    lastSkinScore: skinScore,
	                    lastSkinType: skinType,
	                };
                  if (typeof locale === 'string') {
                    updates.lastLocale = locale
                    if (!customerData.preferredLocale) updates.preferredLocale = locale
                  }
	                if (!customerData.phoneE164 || !customerData.phoneDigits) {
	                    updates.phone = customerData.phone || phoneE164;
	                    updates.phoneE164 = customerData.phoneE164 || phoneE164;
	                    updates.phoneDigits = customerData.phoneDigits || phoneDigits;
	                    updates.phoneCountry = customerData.phoneCountry || resolvedPhoneCountry;
	                }
	                if (!customerData.publicToken) {
	                    updates.publicToken = createPublicToken();
	                }
	                await customerDoc.ref.update(updates);
	                return customerDoc.id;
	            } else {
	                // Create new customer
	                const newCustomerData = {
	                    clinicId: finalClinicId,
	                    phone: phoneE164,
	                    phoneE164,
	                    phoneDigits,
	                    phoneCountry: resolvedPhoneCountry,
	                    email: email || '',
                      preferredLocale: typeof locale === 'string' ? locale : null,
                      lastLocale: typeof locale === 'string' ? locale : null,
	                    firstSeenAt: now,
	                    lastSeenAt: now,
	                    totalCheckups: 1,
	                    lastSkinScore: skinScore,
	                    lastSkinType: skinType,
	                    source: tracking?.source || 'direct',
	                    publicToken: createPublicToken()
	                };
                const newCustomerRef = await customersRef.add(newCustomerData);
                return newCustomerRef.id;
            }
        };

        // Race between the operation and a 3s timeout
        const timeoutPromise = new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Customer upsert timed out')), 3000)
        );

        customerId = await Promise.race([upsertPromise(), timeoutPromise]);

    } catch (customerError) {
        console.warn("Skipping customer upsert due to error/timeout:", customerError);
        // Continue without customerId to ensure lead is saved
    }
    // --- CUSTOMER UPSERT LOGIC END ---

    // --- PROGRESS COMPUTATION (optional) ---
    let compareLeadId: string | null = null;
    let progress: any = null;
    const comparisonQuality = sanitizedResult?.comparison?.quality;

    if (customerId && !isOverLimit) {
        try {
            const previousLeadSnap = await adminDb.collection('leads')
                .where('customerId', '==', customerId)
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();

            if (!previousLeadSnap.empty) {
                const prevDoc = previousLeadSnap.docs[0];
                const prevLead = prevDoc.data();
                if (prevLead?.analysisResult) {
                    compareLeadId = prevDoc.id;
                    if (comparisonQuality !== 'bad') {
                        progress = computeProgress(sanitizedResult, prevLead.analysisResult);
                    } else {
                        progress = { quality: 'bad' };
                    }
                    if (progress) {
                        progress.quality = comparisonQuality || progress.quality || 'unknown';
                        if (typeof sanitizedResult?.comparison?.confidence === 'number') {
                            progress.confidence = sanitizedResult.comparison.confidence;
                        }
                    }
                }
            }
        } catch (progressError) {
            console.warn("Progress computation failed:", progressError);
        }
    }
    // --- PROGRESS COMPUTATION END ---
    
	    const leadUpdateTokenGenerated = randomBytes(32).toString('hex')
	    const leadData: any = {
	      customerId: customerId, // Link to customer
	      phone: phoneE164,
	      phoneE164,
	      phoneDigits,
	      phoneCountry: resolvedPhoneCountry,
	      email: email || '',
        locale: typeof locale === 'string' ? locale : null,
	      clinicId: finalClinicId,
	      diagnosticType: diagnosticType || 'unknown',
      status: isOverLimit ? 'overlimit' : 'new',
      createdAt: FieldValue.serverTimestamp(),
      analysisResult: isOverLimit ? {} : (sanitizedResult || {}), // Hide results if over limit
      compareLeadId: compareLeadId || null,
      isFollowUp: Boolean(compareLeadId),
      tracking: tracking || { source: 'direct', campaign: '' },
      revenue: 0,
      photoUrls: [] as string[], // Deprecated (keeping for schema compat)
      storagePaths: [] as string[], // Secure paths
      leadUpdateToken: leadUpdateTokenGenerated,

      // WhatsApp Consent & Tracking (Dubai Pilot)
      whatsappOptIn: body.whatsappOptIn || false,
      whatsappClicked: false, // Will be updated on click
      whatsappClickedProcedure: null,

      // Consent Metadata
      consentVersion: body.consentVersion || 'v1.0',
      consentText: body.consentText || '',
      consentTimestamp: FieldValue.serverTimestamp(),
      consentIP: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      consentUserAgent: request.headers.get('user-agent') || 'unknown'
    }

    if (!isOverLimit) {
      if (sanitizedResult?.comparison !== undefined) leadData.comparison = sanitizedResult.comparison
      if (progress !== undefined && progress !== null) leadData.progress = progress
    }

    // 3. Сохраняем в Firestore
    const docRef = await adminDb.collection('leads').add(leadData)

    // 3.05 Track lead creation per source (best-effort)
    try {
      if (finalClinicId && finalClinicId !== 'default') {
        await incrementTrafficStat({ clinicId: finalClinicId, tracking, metric: 'leads' })
      }
    } catch (e) {
      console.warn('Traffic lead tracking failed:', e)
    }

    // 3.1 Update customer journey fields (baseline + plan)
    if (customerId && !isOverLimit) {
        try {
            const customerRef = adminDb.collection('customers').doc(customerId);
            const customerSnap = await customerRef.get();
            if (customerSnap.exists) {
                const customerData = customerSnap.data() || {};
                const updates: any = {
                    lastLeadId: docRef.id,
                    lastCheckupAt: FieldValue.serverTimestamp()
                };

                if (!customerData.baselineLeadId) {
                    updates.baselineLeadId = docRef.id;
                    updates.baselineAt = FieldValue.serverTimestamp();
                    const treatmentPlan = buildTreatmentPlan(sanitizedResult, docRef.id);
                    if (treatmentPlan.length > 0) {
                        updates.treatmentPlan = treatmentPlan;
                    }
                }

                await customerRef.update(updates);
            }
        } catch (customerUpdateError) {
            console.warn("Customer journey update failed:", customerUpdateError);
        }
    }

    // 4. Загрузка ФОТО в Storage (PRIVATE)
    const uploadedUrls: string[] = [];
    const storagePaths: string[] = [];
    
    if (images && Array.isArray(images) && images.length > 0) {
        try {
            const bucket = getStorage().bucket();
            const uploadPromises = images.map(async (base64: string, index: number) => {
                try {
                    const buffer = Buffer.from(base64, 'base64');
                    const fileName = `leads/${finalClinicId}/${docRef.id}/${index}_${Date.now()}.jpg`;
                    const file = bucket.file(fileName);
                    await file.save(buffer, { metadata: { contentType: 'image/jpeg' } });
                    
                    // Generate Signed URL for Telegram (valid 7 days)
                    const [signedUrl] = await file.getSignedUrl({
                        action: 'read',
                        expires: Date.now() + 7 * 24 * 60 * 60 * 1000
                    });
                    
                    return { signedUrl, path: fileName };
                } catch (err) {
                    console.error("Image upload failed:", err);
                    return null;
                }
            });
            
            const results = await Promise.all(uploadPromises);
            results.forEach(res => { 
                if (res) {
                    uploadedUrls.push(res.signedUrl);
                    storagePaths.push(res.path);
                }
            });
            
            if (storagePaths.length > 0) {
                // Store PATHS in DB (Secure) and optionally the temporary signed URLs
                await docRef.update({ 
                    storagePaths: storagePaths,
                    photoUrls: uploadedUrls // Store signed URLs so they work for 7 days in legacy views
                });
            }
        } catch (storageError) {
            console.error("Storage error:", storageError);
        }
    }

    // 5. Уведомление в Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN
	    if (botToken && settings?.telegramChatId) {
	        let message = `🔥 *New Lead in CureScan!*

` +
	                        `📱 *Phone:* 
${phoneE164}
` +
	                        `🧬 *Type:* ${diagnosticType}
` +
	                        `📊 *Score:* ${analysisResult?.profile?.skin_score || '?'}/100
` +
	                        `🌐 *Source:* ${tracking?.source || 'direct'}

`;
        if (isOverLimit) {
             message += `⚠️ *LIMIT REACHED!* Lead saved, but analysis hidden. Upgrade plan.\n\n`;
        }
        
        if (uploadedUrls.length > 0) {
            message += `📸 *Photo (link valid 7 days):* [Open Photo](${uploadedUrls[0]})

`;
        }
                        
	        message += `[Open in WhatsApp](https://wa.me/${phoneDigits})`;

        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: settings.telegramChatId,
                text: message,
                parse_mode: 'Markdown'
            })
        }).catch(err => console.error('Telegram notification failed:', err));
    }

    // Stop here if over limit
    if (isOverLimit) {
        return NextResponse.json({ 
            success: true, 
            limitReached: true,
            leadId: docRef.id,
            leadUpdateToken: leadUpdateTokenGenerated
        });
    }

    // 6. INTEGRATION WEBHOOK
    // @ts-ignore
    const webhookUrl = settings?.integrations?.webhook_url;
    
    if (webhookUrl) {
        const hAnalysis = sanitizedResult.hidden_analysis || {};
        const isVip = (hAnalysis.premium_affinity_markers?.length > 0) || (hAnalysis.marketing_signals?.has_suspected_procedures);
        
	        const payload: WebhookPayload = {
	            event: 'lead.created',
	            lead: {
	                id: docRef.id,
	                phone: phoneE164,
	                email: email || undefined,
	                created_at: new Date().toISOString(),
                marketing_data: {
                    source: tracking?.source || 'direct',
                    campaign: tracking?.campaign || 'none'
                },
                diagnostic_result: {
                    skin_score: sanitizedResult.profile?.skin_score || 0,
                    skin_type: sanitizedResult.profile?.skinType || 'unknown',
                    visual_age: hAnalysis.estimated_visual_age || 0,
                    concerns: sanitizedResult.profile?.issues || [],
                    vip_status: !!isVip
                }
            }
        };

        sendWebhook(webhookUrl, payload).catch(err => console.error("Async webhook error:", err));
    }

    // 7. NATIVE CRM INTEGRATIONS
    // @ts-ignore
    const ycSettings = settings?.integrations?.yclients;
    // @ts-ignore
    const hsSettings = settings?.integrations?.hubspot;

	    // Prepare lead object for helpers (reusing scope variables)
	    const integrationLead = {
	        phone: phoneE164,
	        phoneDigits,
	        phoneCountry: resolvedPhoneCountry,
	        email,
	        analysisResult: sanitizedResult,
	        tracking
	    };

    if (ycSettings?.active) {
        createYClientsClient(ycSettings, integrationLead).catch(err => console.error("Async YCLIENTS error:", err));
    }

    if (hsSettings?.active) {
        createHubSpotContact(hsSettings, integrationLead).catch(err => console.error("Async HubSpot error:", err));
    }

    // 7.5 AD PIXELS (Meta, Google, TikTok)
    // @ts-ignore
    const pixelSettings = settings?.integrations?.pixels;
    if (pixelSettings) {
        sendPixelConversion(pixelSettings, { 
            ...integrationLead, 
            id: docRef.id, 
            clinicId: finalClinicId,
            diagnosticType 
        }, {
            ip,
            ua,
            fbp: tracking?.fbp,
            fbc: tracking?.fbc
        }).catch(err => console.error("Async Pixel error:", err));
    }

    if (compareLeadId && customerId) {
        void logRetentionEvent('checkup.repeat.completed', {
            clinicId: finalClinicId,
            customerId,
            leadId: docRef.id,
            meta: { compareLeadId }
        })
    }

    return NextResponse.json({ 
      success: true, 
      leadId: docRef.id,
      leadUpdateToken: leadUpdateTokenGenerated
    })

  } catch (error: any) {
    console.error('Error saving lead:', error)
    return NextResponse.json(
      { error: 'Failed to save lead', details: error.message },
      { status: 500 }
    )
  }
}
