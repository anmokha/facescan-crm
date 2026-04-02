/**
 * Analyze API (Core AI Endpoint)
 *
 * What this route does:
 * - accepts uploaded diagnostic images,
 * - enforces request rate limiting,
 * - resolves clinic/tenant context,
 * - composes AI system prompt with clinic-specific data,
 * - runs Gemini inference (directly or through proxy),
 * - validates and returns structured JSON for the UI.
 *
 * Why it matters:
 * This endpoint is the heart of the product experience and the main
 * value engine for lead qualification and personalized recommendations.
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/diagnostic/rateLimit'
import { logRetentionEvent } from '@/lib/diagnostic/retentionAnalytics'
import { incrementTrafficStat, incrementClinicCheckupCount } from '@/lib/server/trafficStats'
import { createHash } from 'crypto'
import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from '@/lib/i18n'
import guards from '@/lib/api/guards'

// --- Zod Schemas ---

// Basic building blocks
const ProductSchema = z.object({
  name: z.string(),
  type: z.string(),
  reason: z.string()
});

const RoutineStepSchema = z.object({
  stepName: z.string(),
  frequency: z.string(),
  instruction: z.string()
});

// Generic Analysis Result Schema (Loose validation to accommodate different types)
// We use .passthrough() or .catch() strategies if needed, but here we define the core expected structure
const BaseAnalysisSchema = z.object({
  profile: z.object({
    personal_insight: z.string().optional(),
  }).passthrough(), // Allow other fields in profile
  routine: z.array(RoutineStepSchema).optional().default([]),
  products: z.object({
    affordable: z.array(ProductSchema).optional().default([]),
    midRange: z.array(ProductSchema).optional().default([]),
    luxury: z.array(ProductSchema).optional().default([])
  }).optional(),
  closingAdvice: z.string().optional(),
  
  // Specific fields that might exist
  metrics: z.record(z.string(), z.any()).optional(),
  metrics_analysis: z.record(z.string(), z.string()).optional(),
  active_ingredients: z.array(z.string()).optional(),
  clinicTreatments: z.array(z.object({
      name: z.string(),
      price: z.string(),
      protocol_type: z.string().optional(),
      safety_note: z.string().optional(),
      reason: z.string().optional(),
      projected_improvement: z.string().optional(),
      personalized_benefits: z.string().optional()
  })).optional().default([]),
  
  generated_quiz: z.any().optional(), // Complex object, keep flexible
  hidden_analysis: z.object({
      estimated_visual_age: z.number().optional(),
      problem_severity: z.string().optional(),
      commercial_profile: z.object({
          maintenance_level: z.string(),
          investment_markers: z.array(z.string()),
          potential_value: z.string()
      }).optional(),
      premium_affinity_markers: z.array(z.string()).optional(),
      marketing_signals: z.any().optional(),
      sales_strategy: z.object({
          hook: z.string(),
          pain_point_trigger: z.string(),
          objection_handling: z.string()
      }).optional(),
      whatsapp_templates: z.object({
          care: z.string(),
          result: z.string(),
          offer: z.string()
      }).optional()
  }).optional(),
  
  // Marker coordinates for visual scanner
  markers: z.array(z.object({
      type: z.string(),
      x: z.number(),
      y: z.number(),
      label: z.string(),
      severity: z.number().optional()
  })).optional().default([]),
  comparison: z.object({
      summary: z.string().optional(),
      highlights: z.array(z.string()).optional().default([]),
      setbacks: z.array(z.string()).optional().default([]),
      praise: z.string().optional(),
      confidence: z.number().optional(),
      quality: z.string().optional()
  }).optional()
});

// --- Service Filtering Helper ---
function filterServicesForDiagnostic(services: any[], type: string): any[] {
  if (!services || services.length === 0) return [];

  const keywords: Record<string, string[]> = {
    skin: [
      // RU + EN (UAE clinics often store services in EN)
      'косметолог',
      'уход',
      'чистк',
      'пилинг',
      'массаж',
      'лифтинг',
      'омоложение',
      'аппаратная',
      'инъекционная',
      'лечение акне',
      'биоревитализация',
      'мезотерапия',
      'ботокс',
      'диспорт',
      'контурная',
      'губ',
      'derma',
      'dermatolog',
      'aesthetic',
      'cosmetolog',
      'facial',
      'peel',
      'clean',
      'acne',
      'anti-age',
      'lifting',
      'laser',
      'microneedl',
      'hydrafacial',
      'botox',
      'dysport',
      'filler',
      'skin booster',
      'mesotherapy',
      'prp',
      'rf',
      'ipl',
      'bbl',
      'smas',
      'hifu'
    ],
    hair: [
      'трихолог',
      'волос',
      'голов',
      'мезотерапия',
      'плазмо',
      'tricholog',
      'hair',
      'scalp',
      'mesotherapy',
      'prp',
      'loss',
      'growth',
      'shampoo',
      'conditioner',
      'mask',
      'care',
      'treatment'
    ],
    alopecia: [
      'трихолог',
      'волос',
      'голов',
      'мезотерапия',
      'плазмо',
      'пересадка',
      'tricholog',
      'alopecia',
      'hair',
      'scalp',
      'mesotherapy',
      'prp',
      'transplant',
      'graft',
      'fue',
      'fut',
      'minoxidil'
    ],
    mole: [
      'удаление',
      'дерматоскоп',
      'новообразован',
      'родин',
      'папиллом',
      'криодеструкция',
      'mole',
      'dermatoscop',
      'lesion',
      'nevus',
      'papilloma',
      'removal',
      'cryotherapy',
      'check',
      'scan',
      'oncology'
    ]
  };

  const relevantKeywords = keywords[type] || [];
  
  // If no specific keywords defined (unknown type), return top 10 generic services to save tokens
  if (relevantKeywords.length === 0) return services.slice(0, 10);

  const filtered = services.filter(service => {
    const text = `${service.name} ${service.category || ''} ${service.description || ''}`.toLowerCase();
    return relevantKeywords.some(kw => text.includes(kw));
  });

  // If our keyword approach fails (different language/format), fall back to top N.
  if (filtered.length === 0) return services.slice(0, 10)
  return filtered
}

// Convert uppercase type strings to lowercase for Gemini SDK
const convertSchemaToGeminiType = (schema: any): any => {
  if (typeof schema.type === 'string') {
    schema.type = schema.type.toLowerCase()
  }
  if (schema.properties) {
    for (const key in schema.properties) {
      schema.properties[key] = convertSchemaToGeminiType(schema.properties[key])
    }
  }
  if (schema.items) {
    schema.items = convertSchemaToGeminiType(schema.items)
  }
  return schema
}

// --- Usage Logging Helper ---
async function logUsage(clinicId: string, usageMetadata: any, model: string) {
    if (!usageMetadata) return;
    
    try {
        await adminDb.collection('usage_logs').add({
            clinicId,
            timestamp: new Date(),
            model,
            inputTokens: usageMetadata.promptTokenCount || 0,
            outputTokens: usageMetadata.candidatesTokenCount || 0,
            totalTokens: usageMetadata.totalTokenCount || 0,
            costEstimated: 0 
        });
    } catch (e) {
        console.error("Failed to log usage:", e);
    }
}

export async function POST(request: NextRequest) {
  const { resolvePositiveInt } = guards as any

  console.log("Analyze API started");
  
  // 0. Rate Limiting
  const ipHeader = request.headers.get('x-forwarded-for') || 'unknown';
  const ip = ipHeader.split(',')[0].trim();
  const ua = request.headers.get('user-agent') || 'unknown';
  const clientIdHeader = request.headers.get('x-client-id') || 'default'
  const rateKey = createHash('sha256').update(`${ip}|${ua}|${clientIdHeader}`).digest('hex');
  const resolvedAnalyzeLimit = resolvePositiveInt(process.env.RATE_LIMIT_MAX_ANALYZE, 100);
  const isAllowed = await checkRateLimit(rateKey, resolvedAnalyzeLimit);
  
  if (!isAllowed) {
      return NextResponse.json(
          { error: 'Too many requests. Please try again in a minute.' },
          { status: 429 }
      );
  }

  let responseLocale: Locale = DEFAULT_LOCALE

  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error("API Key missing");
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { images, diagnosticType = 'hair', locale: localeFromBody, tracking } = body
    let { customerId } = body
    if (isSupportedLocale(localeFromBody)) responseLocale = localeFromBody

    // ============ CHECK IF USER IS LOGGED IN (from header) ============
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const { verifySessionToken } = await import('@/lib/auth/sessionService');
      const token = authHeader.split(' ')[1];
      const decoded = verifySessionToken(token);
      if (decoded && decoded.customerId) {
        customerId = decoded.customerId;
        console.log('Using customerId from session token:', customerId);
      }
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 })
    }

    if (customerId) {
      try {
        const customerSnap = await adminDb.collection('customers').doc(customerId).get()
        const clinicId = customerSnap.exists ? customerSnap.data()?.clinicId : null
        void logRetentionEvent('checkup.repeat.started', {
          clinicId,
          customerId,
          meta: { diagnosticType }
        })
      } catch (eventError) {
        console.warn('Retention event failed:', eventError)
      }
    }

    // 1. Determine Context (Client)
    const clientId = clientIdHeader
    console.log(`Processing for client: ${clientId}`);
    const host = request.headers.get('host') || undefined
    let clientConfig: any = null

    // Special handling for demo mode (demo-widget subdomain or fallback)
    if (clientId === 'default' || clientId === 'demo' || clientId.startsWith('demo-')) {
        console.log('Demo mode activated - using default configuration for:', clientId);
        clientConfig = {
            id: clientId,
            name: 'CureScan Demo',
            status: 'active',
            defaultLocale: 'en-US',
            supportedLocales: ['en-US'],
            services: [],
            leadUnlockMethod: 'phone',
            primaryContactChannel: 'whatsapp'
        };
    } else {
        try {
            const { fetchClientConfig } = await import('@/lib/server/clientConfig');
            clientConfig = await fetchClientConfig(clientId, host);
        } catch (e) {
            console.error("Error fetching client config:", e);
        }

        if (!clientConfig) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        if (clientConfig.status === 'suspended') {
            return NextResponse.json({ error: 'Account suspended' }, { status: 403 })
        }

        // --- CHECKUP LIMITS (PILOT LOGIC) ---
        const isPilot = clientConfig.isPilot === true;
        const checkupLimit = clientConfig.limits?.checkups || 0;
        const currentCheckups = clientConfig.checkupCount || 0;

        if (!isPilot && clientId !== 'default' && clientId !== 'demo') {
            if (currentCheckups >= checkupLimit) {
                console.warn(`Clinic ${clientId} reached checkup limit: ${currentCheckups}/${checkupLimit}`);
                return NextResponse.json({ 
                    error: 'Checkup limit reached for this clinic.',
                    code: 'LIMIT_REACHED'
                }, { status: 403 })
            }
        }
    }

    // Track checkup start/analysis per source (best-effort).
    try {
      const clinicIdForStats = clientConfig?.uid || clientConfig?.id
      if (clinicIdForStats && clinicIdForStats !== 'default') {
        await incrementTrafficStat({ clinicId: clinicIdForStats, tracking, metric: 'checkups' })
        await incrementClinicCheckupCount(clinicIdForStats)
      }
    } catch (e) {
      console.warn('Traffic checkup tracking failed:', e)
    }

    // Resolve locale (clinic default + user override)
    const clinicSupportedLocales = (Array.isArray(clientConfig?.supportedLocales) ? clientConfig.supportedLocales : []).filter(isSupportedLocale)
    const clinicDefaultLocale: Locale = isSupportedLocale(clientConfig?.defaultLocale) ? clientConfig.defaultLocale : DEFAULT_LOCALE
    const requestedLocale: Locale | null = isSupportedLocale(localeFromBody) ? localeFromBody : null
    const resolvedLocale: Locale =
      (requestedLocale &&
        (clinicSupportedLocales.length === 0 || clinicSupportedLocales.includes(requestedLocale)) &&
        requestedLocale) ||
      clinicDefaultLocale
    responseLocale = resolvedLocale

    const localeForDates = resolvedLocale
    const outputLanguageName = resolvedLocale === 'ru-RU' ? 'Russian' : resolvedLocale === 'ar-AE' ? 'Arabic' : 'English'

    const formatDateLocalized = (isoDate: string): string => {
      try {
        return new Date(isoDate).toLocaleDateString(localeForDates, { day: 'numeric', month: 'long' })
      } catch {
        return resolvedLocale === 'ar-AE' ? 'غير معروف' : resolvedLocale === 'ru-RU' ? 'неизвестно' : 'unknown'
      }
    }
    
    // 2. Load Base Config
    const { DIAGNOSTIC_TYPES } = await import('@/config/diagnosticTypes')
    const config = DIAGNOSTIC_TYPES[diagnosticType] || DIAGNOSTIC_TYPES.hair
    
    // 3. Prepare Schema
    const geminiSchema = convertSchemaToGeminiType(JSON.parse(JSON.stringify(config.schema)))

    // 4. Construct System Prompt
    let systemPrompt = config.systemPrompt
    
    // --- HISTORY CONTEXT INJECTION START ---
    if (customerId) {
        try {
            console.log(`Fetching history for customer: ${customerId}`);
            const lastLeadSnap = await adminDb.collection('leads')
                .where('customerId', '==', customerId)
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();

            if (!lastLeadSnap.empty) {
                const lastLead = lastLeadSnap.docs[0].data();
                const lastResult = lastLead.analysisResult;
                const recently = resolvedLocale === 'ar-AE' ? 'مؤخراً' : resolvedLocale === 'ru-RU' ? 'недавно' : 'recently'
                const lastDate =
                  typeof lastLead.createdAt?.toDate === 'function'
                    ? formatDateLocalized(lastLead.createdAt.toDate().toISOString())
                    : recently;
                
                if (lastResult && lastResult.profile) {
                    const prevScore = lastResult.profile.skin_score || lastResult.profile.skinScore || 'N/A';
                    const prevConcerns = lastResult.profile.concerns || lastResult.profile.issues || 'N/A';
                    
                    systemPrompt += `\n\nCONTEXT: FOLLOW-UP CHECKUP
Client had a previous checkup on: ${lastDate}.
Previous score: ${prevScore}.
Previous concerns: ${prevConcerns}.
`;

                    if (lastLead.status === 'converted' && lastLead.soldService) {
                       systemPrompt += `\nIMPORTANT:
Between checkups the client had "${lastLead.soldService}" at our clinic.
Try to identify plausible improvements consistent with this service and explicitly validate the outcome (ROI validation).
`;
                    }
                    
                    systemPrompt += `
FOLLOW-UP INSTRUCTIONS:
1) Compare current state with the previous checkup.
2) If the score improved: praise the client and validate effort.
3) If the score did not improve: be tactful and encourage consistency.
4) Fill the "comparison" object in the JSON response:
   - summary: 1-2 sentences about change
   - highlights: 2-3 improvements
   - setbacks: 0-2 areas without progress
   - praise: short praise
   - confidence: 0-100
   - quality: good/bad/unknown
If photo quality/angle/light differs too much, set quality="bad" and keep summary neutral. Do not invent precise percentages.
`;
                }
            }
        } catch (histError) {
            console.error("Error fetching customer history:", histError);
            // Non-critical, continue without history
        }
    }
    // --- HISTORY CONTEXT INJECTION END ---

    // --- RETENTION CONTEXT INJECTION START ---
    if (customerId) {
        try {
            console.log(`Fetching treatment plan for retention context: ${customerId}`);
            const customerRef = adminDb.collection('customers').doc(customerId);
            const customerSnap = await customerRef.get();

            if (customerSnap.exists) {
                const customerData = customerSnap.data();
                const treatmentPlan = customerData?.treatmentPlan || [];

                // Filter incomplete treatments (not completed, and sessions remaining)
                const incompleteTreatments = treatmentPlan.filter((t: any) => {
                    const hasSessionsRemaining = t.totalSessions && t.completedSessions < t.totalSessions;
                    const notCompleted = !t.completedAt;
                    return notCompleted && hasSessionsRemaining;
                });

                if (incompleteTreatments.length > 0) {
                    console.log(`Found ${incompleteTreatments.length} incomplete treatments for retention`);

                    const retentionList = incompleteTreatments
                      .map((t: any) => {
                        const lastVisit = t.lastSessionDate ? `, last visit: ${formatDateLocalized(t.lastSessionDate)}` : ''
                        return `- ${t.name}: completed ${t.completedSessions || 0}/${t.totalSessions || 0} sessions${lastVisit}`
                      })
                      .join('\n')

                    const remainingSummary = incompleteTreatments
                      .map((t: any) => {
                        const total = Number(t.totalSessions || 0)
                        const completed = Number(t.completedSessions || 0)
                        const remaining = Math.max(0, total - completed)
                        return `${remaining} session(s) of ${t.name}`
                      })
                      .join(', ')

                    systemPrompt += `\n\nRETENTION CONTEXT:
The client has started treatments at our clinic but has not completed the plan:

${retentionList}

RETENTION INSTRUCTIONS:
- If you see improvements, connect them to the completed sessions/treatments (${incompleteTreatments.map((t: any) => t.name).join(', ')}).
- Motivate the client to finish the plan to maximize and stabilize results.
- Do NOT propose new items in clinicTreatments; focus on finishing ongoing plans.
- Use a "friendly bias": support the clinic and reinforce progress even if it is subtle.
- If progress isn't obvious, explain that results accumulate toward the end of a course.
- In closingAdvice explicitly mention what's left: ${remainingSummary}.
`;
                }
            }
        } catch (retentionError) {
            console.error("Error fetching retention context:", retentionError);
            // Non-critical, continue without retention context
        }
    }
    // --- RETENTION CONTEXT INJECTION END ---

    let clientName = "";
    let clientServices: any[] = [];

    let customPrompt = "";

    // Unified Config Loading (Static + Dynamic + Cached)
    if (clientId !== 'default' && clientConfig) {
        clientName = clientConfig.name;
        clientServices = clientConfig.services || [];
        customPrompt = clientConfig.customSystemPrompt || "";
    }

    if (clientName) {
      console.log(`Injecting context for: ${clientName}`);
      systemPrompt += `\n\nIMPORTANT: You are the AI assistant of clinic "${clientName}".`
      
      if (customPrompt) {
          systemPrompt += `\n\nCLINIC-SPECIFIC INSTRUCTIONS:\n${customPrompt}`;
      }

      if (clientServices.length > 0) {
          // Optimization: Filter services to reduce token usage and improve relevance
          const filteredServices = filterServicesForDiagnostic(clientServices, diagnosticType);
          
          if (filteredServices.length > 0) {
              const servicesText = JSON.stringify(filteredServices, null, 2)
              systemPrompt += `\n\nCLINIC SERVICES (relevant subset):\n${servicesText}`
              systemPrompt += `\n\nRECOMMENDATION RULES:
1) In "clinicTreatments" recommend ONLY items from CLINIC SERVICES above.
2) Pick services that best address issues seen in the photos.
3) Use the exact service name and price from the list.
4) If nothing fits, leave clinicTreatments empty.
5) PROTOCOL LOGIC: For complex issues (lines, loss of contour), suggest a protocol including Home Care advice + Clinic Procedure + Injection if available in the list.
6) SAFETY: Strictly validate Fitzpatrick type compatibility with the chosen service.`
          }
      }
    } else {
        console.log("Using default config (no client injection)");
    }

    // Dubai Seasonality & Environmental Context
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const isSummer = month >= 4 && month <= 8; // May to September
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    systemPrompt += `\n\nENVIRONMENTAL CONTEXT (Dubai):
Current Month: ${monthNames[month]}
${isSummer 
  ? "SEASON: EXTREME SUMMER. Avoid aggressive ablative lasers, deep peels, or treatments with high downtime/photosensitivity. Focus on: deep hydration (HydraFacial, Biorevitalization), SPF protection, and non-ablative rejuvenation." 
  : "SEASON: MILD/WINTER. Ideal time for corrective procedures: lasers, chemical peels, and more intensive rejuvenation plans."
}
IMPORTANT: Remind the client about AC-induced dehydration and UV protection regardless of season.`

    systemPrompt += `\n\nOUTPUT LANGUAGE:
- All user-facing strings in the JSON response MUST be written in ${outputLanguageName}.
- This requirement overrides any other language instruction.
- Do not mix languages in the same sentence.

MANDATORY DATA:
- You MUST provide a "metrics_analysis" object.
- For each of the 6 skin metrics (hydration, pores, texture, firmness, barrier, tone), you MUST write exactly 1 personalized sentence based on what you see in the photos.
- Example: "Your hydration levels are slightly low in the T-zone area."
- Do not provide generic definitions. Provide personal observations.`

    // 5. Call AI
    const proxyUrl = process.env.ANALYSIS_PROXY_URL;
    let result;
    // Use ENV variable for model, fallback to the latest preview model (Gemini 3 Flash)
    const modelName = process.env.GEMINI_MODEL || "gemini-3-flash-preview"; 

    if (proxyUrl) {
      console.log("Using Analysis Proxy:", proxyUrl);
      const proxyResponse = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          systemPrompt,
          images,
          schema: geminiSchema,
          model: modelName
        })
      });
      
      if (!proxyResponse.ok) {
          throw new Error(`Proxy error: ${proxyResponse.statusText}`);
      }
      result = await proxyResponse.json();
      
      // Log Usage from Proxy (assuming proxy forwards metadata)
      // logUsage(clientId, result.usageMetadata, modelName); 

    } else {
      console.log("Calling Analysis API directly...");
      const ai = new GoogleGenAI({ apiKey })
      const parts = [
        { text: systemPrompt },
        ...images.map((img: string) => ({
          inlineData: {
            mimeType: "image/jpeg",
            data: img
          }
        }))
      ]

      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: geminiSchema,
          systemInstruction: systemPrompt,
        },
      })

      if (!response.text) {
        throw new Error("No response generated from the model.")
      }
      const rawResult = JSON.parse(response.text)
      
      // LOG USAGE HERE - use uid from config if available
      const clinicUid = clientConfig?.uid || clientId;
      logUsage(clinicUid, response.usageMetadata, modelName);

      // 6. Zod Validation
      console.log("Validating AI response...");
      const validation = BaseAnalysisSchema.safeParse(rawResult);

      if (!validation.success) {
          console.error("Zod Validation Failed:", validation.error.format());
          // Fallback: Return raw result but log error (or you could return a sanitized error)
          // For now, we trust the raw result might still be usable by frontend despite minor schema mismatches
          // but we log heavily.
          result = rawResult;
      } else {
          result = validation.data;
      }
    }

    console.log("Analysis completed successfully");
    return NextResponse.json(result)

  } catch (error: any) {
    console.error("Analysis Error Details:", error)
    const message =
      responseLocale === 'ar-AE'
        ? 'تعذر إجراء التحليل. يرجى المحاولة مرة أخرى.'
        : responseLocale === 'ru-RU'
          ? 'Анализ не удался. Пожалуйста, попробуйте ещё раз.'
          : 'Analysis failed. Please try again.'
    return NextResponse.json(
      {
        error: message,
        details: error.message
      },
      { status: 500 }
    )
  }
}
