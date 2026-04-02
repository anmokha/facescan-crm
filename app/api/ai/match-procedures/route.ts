import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyAdminToken } from '@/lib/auth/verifyAdmin';

/**
 * POST /api/ai/match-procedures
 * AI Semantic Matching for social content
 */
export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request);
    const body = await request.json();
    const { text, availableProcedures } = body;

    if (!text || !availableProcedures || !Array.isArray(availableProcedures)) {
      return NextResponse.json({ error: 'Missing text or availableProcedures' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
    });

    const systemPrompt = `
      You are a specialized medical aesthetic assistant. 
      Given a review text or social media caption, identify which procedures from the provided list are mentioned or highly relevant.
      Return ONLY a JSON array of matched procedure names exactly as they appear in the list.
      If no procedures match, return an empty array [].

      Available procedures:
      ${availableProcedures.join(', ')}
    `;

    const prompt = `Text to analyze: "${text}"`;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const responseText = response.response.text();
    const matchedProcedures = JSON.parse(responseText);

    return NextResponse.json({ matchedProcedures });
  } catch (error: any) {
    console.error('AI Match Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
