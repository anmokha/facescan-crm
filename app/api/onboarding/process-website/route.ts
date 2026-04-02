import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    // 1. Authenticate Request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const isAdmin = decodedToken.admin === true;

    const { websiteUrl, mode, clinicId } = await request.json();

    if (!websiteUrl) {
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
    }

    // Determine target clinic
    const targetClinicId = clinicId || uid;

    // Security check: Only admins can process other clinics
    if (targetClinicId !== uid && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Scrape with Firecrawl
    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!firecrawlKey) {
        return NextResponse.json({ error: 'Scraping service key missing' }, { status: 500 });
    }

    // --- CRAWL MODE (Deep Scan) ---
    if (mode === 'crawl') {
        console.log(`Starting Firecrawl v1 CRAWL for: ${websiteUrl}`);
        try {
            const crawlRes = await fetch('https://api.firecrawl.dev/v1/crawl', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${firecrawlKey}`
                },
                body: JSON.stringify({
                    url: websiteUrl,
                    limit: 10,
                    scrapeOptions: {
                        onlyMainContent: true,
                        formats: ['markdown']
                    }
                })
            });

            if (!crawlRes.ok) {
                const err = await crawlRes.text();
                console.error('Firecrawl Crawl Error:', err);
                return NextResponse.json({ error: 'Failed to start crawl' }, { status: 500 });
            }

            const crawlData = await crawlRes.json();
            const jobId = crawlData.id || crawlData.jobId;
            return NextResponse.json({ success: true, jobId, mode: 'crawl' });

        } catch (e: any) {
            console.error('Crawl Exception:', e);
            return NextResponse.json({ error: e.message }, { status: 500 });
        }
    }

    // --- SCRAPE MODE (Single Page) ---
    let markdown = '';
    
    console.log(`Starting Firecrawl v1 scrape for: ${websiteUrl}`);
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${firecrawlKey}`
        },
        body: JSON.stringify({
            url: websiteUrl,
            formats: ['markdown'],
            onlyMainContent: true
        })
    });

    if (!firecrawlResponse.ok) {
        const err = await firecrawlResponse.text();
        console.error('Firecrawl Error Response:', err);
        return NextResponse.json({ error: 'Failed to scrape website. Please check the URL.' }, { status: 500 });
    } else {
        const firecrawlData = await firecrawlResponse.json();
        markdown = firecrawlData.data?.markdown || '';
        console.log(`Firecrawl success. Markdown length: ${markdown.length} chars`);
        if (!markdown || markdown.length < 100) {
                return NextResponse.json({ error: 'Website content is too short or blocked. Try Deep Scan.' }, { status: 400 });
        }
    }

    let services: any[] = [];
    let usage: any = null;

    // 3. Parse with Gemini if we have markdown
    if (markdown && geminiKey) {
            const ai = new GoogleGenAI({ apiKey: geminiKey });
            
            const systemPrompt = `
              You are an expert data extraction assistant for a beauty clinic software.
              Your task is to extract the **service menu** from the provided website markdown.

              Return ONLY a raw JSON array of objects with this structure:
              [
                { "name": "Service Name", "price": "Price string", "category": "Category Name" }
              ]

              Rules:
              1. Extract the price exactly as written if available (e.g. "500 AED", "$100").
              2. IMPORTANT: If a service is listed but has NO explicit price, set "price" to "Call for price".
              3. Infer a short, generic category (e.g. "Injections", "Laser", "Face", "Body", "Consultation").
              4. Do NOT include markdown formatting (like json). Just the raw JSON string.
              5. Extract as many meaningful aesthetic/medical services as possible.
            `;

            try {
                const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash"; 
                console.log(`Calling Gemini (${modelName})...`);
                
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: [
                        { role: 'user', parts: [{ text: systemPrompt + `\n\nWEBSITE CONTENT:\n\n${markdown.slice(0, 30000)}` }] }
                    ],
                    config: {
                        responseMimeType: "application/json"
                    }
                });

                const raw = response.text || '';
                usage = response.usageMetadata;
                
                if (raw) {
                     const jsonStr = raw.replace(/```json/g, '').replace(/```/g, '').trim();
                     services = JSON.parse(jsonStr);
                     console.log(`Extracted ${services.length} services.`);
                }
            } catch (e: any) {
                console.error('Gemini Parse/API Error:', e);
                return NextResponse.json({ error: `AI extraction failed: ${e.message}` }, { status: 500 });
            }
    } else {
        return NextResponse.json({ error: 'Failed to extract content from website' }, { status: 400 });
    }

    // 4. Update Firestore
    await adminDb.collection('clinics').doc(targetClinicId).update({
        services: services,
        website: websiteUrl,
        onboardingCompletedAt: new Date(),
        priceListSource: 'website_crawl'
    });

    // 5. Log usage
    if (usage) {
        try {
            await adminDb.collection('usage_logs').add({
                clinicId: targetClinicId,
                timestamp: new Date(),
                model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
                inputTokens: usage.promptTokenCount || 0,
                outputTokens: usage.candidatesTokenCount || 0,
                totalTokens: usage.totalTokenCount || 0,
                action: 'website_scan'
            });
        } catch (e) {
            console.warn('Failed to log usage:', e);
        }
    }

    return NextResponse.json({ success: true, count: services.length });

  } catch (error: any) {
    console.error('Process Website Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}