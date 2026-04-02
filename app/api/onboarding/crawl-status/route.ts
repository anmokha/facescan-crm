import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { GoogleGenAI } from '@google/genai';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const clinicId = searchParams.get('clinicId');
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const isAdmin = decodedToken.admin === true;

    // Determine target clinic
    const targetClinicId = clinicId || uid;

    // Security check: Only admins can check status for other clinics
    if (targetClinicId !== uid && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!jobId) {
        return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    if (!firecrawlKey) return NextResponse.json({ error: 'Config error' }, { status: 500 });

    // 2. Check Firecrawl v1 Status
    const fcRes = await fetch(`https://api.firecrawl.dev/v1/crawl/${jobId}`, {
        headers: { 'Authorization': `Bearer ${firecrawlKey}` }
    });
    
    if (!fcRes.ok) {
        const err = await fcRes.text();
        console.error('Firecrawl Check Error:', err);
        return NextResponse.json({ status: 'failed', error: 'Crawl check failed' });
    }

    const fcData = await fcRes.json();
    const status = fcData.status || 'active'; // active, completed, failed

    if (status === 'completed') {
        console.log('Crawl completed. Processing v1 data...');
        // v1 structure: { status: 'completed', data: [ { markdown: '...', metadata: { sourceURL: '...' } }, ... ] }
        const pages = fcData.data || [];
        const visitedUrls = pages.map((p: any) => p.metadata?.sourceURL || p.url);
        const combinedMarkdown = pages
            .map((p: any) => `--- PAGE: ${p.metadata?.sourceURL || p.url} ---
${p.markdown}`)
            .join('\n\n');

        // 4. Gemini Extraction
        const geminiKey = process.env.GEMINI_API_KEY;
        let services: any[] = [];
        let geminiRawResponse = '';
        let usage: any = null;

        if (geminiKey && combinedMarkdown) {
            const ai = new GoogleGenAI({ apiKey: geminiKey });
            const systemPrompt = `
              You are an expert data extraction assistant for a beauty clinic software.
              Your task is to extract the **service menu** from the provided website markdown (multiple pages).

              **CRITICAL FILTER:** Focus specifically on **FACIAL TREATMENTS** and **AESTHETICS** (skin, eyes, lips, neck, anti-aging, acne, pigmentation).
              - INCLUDE: Botox, Fillers, Facials, Lasers (Face), Peels, Threads, Mesotherapy, PRP (Face/Hair), Dermatology.
              - EXCLUDE: Body slimming (unless relevant to skin quality), Dentistry, General Medicine, Gynecology, Homeopathy, Surgery (unless explicit aesthetic face surgery like Blepharoplasty).

              Return ONLY a raw JSON array of objects:
              [
                { "name": "Service Name", "price": "Price string", "category": "Category Name" }
              ]

              Rules:
              1. Extract price exactly as written. If NO price, set "price" to "Call for price".
              2. Infer categories (e.g. "Injections", "Laser", "Skin Care", "Anti-Aging").
              3. Merge duplicates if found on multiple pages.
              4. Return purely raw JSON.
            `;

            try {
                const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
                
                const result = await ai.models.generateContent({
                    model: modelName,
                    contents: [
                        { role: 'user', parts: [{ text: systemPrompt + `\n\nWEBSITE CONTENT (${pages.length} pages scanned):\n\n${combinedMarkdown.slice(0, 50000)}` }] }
                    ],
                    config: {
                        responseMimeType: "application/json"
                    }
                });

                geminiRawResponse = result.text || '';
                usage = result.usageMetadata;

                if (geminiRawResponse) {
                     const jsonStr = geminiRawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                     services = JSON.parse(jsonStr);
                }
            } catch (e: any) {
                console.error('Gemini Crawl Parse Error:', e);
                geminiRawResponse = `Error: ${e.message}`;
            }
        }

        // 5. Update DB & Save Debug Log
        const batch = adminDb.batch();
        
        // Update Clinic Profile
        const clinicRef = adminDb.collection('clinics').doc(targetClinicId);
        batch.update(clinicRef, {
            services: services,
            priceListSource: 'website_crawl_deep',
            lastCrawlAt: new Date()
        });

        // Save Debug Log
        const logRef = adminDb.collection('scan_debug_logs').doc(jobId);
        batch.set(logRef, {
            jobId,
            userId: uid,
            clinicId: targetClinicId,
            timestamp: new Date(),
            mode: 'deep_crawl',
            pagesCount: pages.length,
            visitedUrls: visitedUrls,
            totalMarkdownLength: combinedMarkdown.length,
            extractedServicesCount: services.length,
            geminiRawResponse: geminiRawResponse.slice(0, 5000)
        });

        // 6. Log usage if available
        if (usage) {
            const usageRef = adminDb.collection('usage_logs').doc();
            batch.set(usageRef, {
                clinicId: targetClinicId,
                timestamp: new Date(),
                model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
                inputTokens: usage.promptTokenCount || 0,
                outputTokens: usage.candidatesTokenCount || 0,
                totalTokens: usage.totalTokenCount || 0,
                action: 'website_scan_deep'
            });
        }

        await batch.commit();

        return NextResponse.json({ status: 'completed', services, pagesCount: pages.length });
    }

    // Return active status
    return NextResponse.json({ status: status, current: fcData.current || 0, total: fcData.total || 0 });

  } catch (error: any) {
    console.error('Crawl Status Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}