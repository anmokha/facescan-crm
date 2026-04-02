import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebaseAdmin'

export async function POST(request: NextRequest) {
  try {
    // 1. Admin Authentication Check
    const session = cookies().get('__session')?.value;
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = await adminAuth.verifySessionCookie(session, true).catch(() => null);
    if (!decoded?.admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const { text } = await request.json()

    if (!text || text.length < 10) {
      return NextResponse.json({ error: 'Text too short' }, { status: 400 })
    }

    const ai = new GoogleGenAI({ apiKey })
    
    // System prompt to force JSON extraction
    const systemPrompt = `
      You are a data extraction assistant. 
      Your task is to extract a list of medical/cosmetic services from the provided text.
      
      Return ONLY a raw JSON array of objects with this structure:
      [
        { "name": "Service Name", "price": "1000 ₽", "category": "Category Name" }
      ]
      
            Rules:
      
            1. Extract the price exactly as written (with currency symbol).
      
            2. If category is not clear, use "General".
      
            3. Do NOT include markdown formatting (like \`\`\`json). Just the raw JSON string.
      
            4. If no services are found, return [].
      
          `

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp", // Fast model for tool use
      contents: {
          parts: [
              { text: systemPrompt },
              { text: `EXTRACT FROM THIS TEXT:

${text}` }
          ]
      },
      config: {
          responseMimeType: "application/json"
      }
    })

    if (!response.text) throw new Error("No response")

    const raw = response.text
    // Clean up potential markdown code blocks if the model ignores instructions
    const jsonStr = raw.replace(/```json/g, '').replace(/```/g, '').trim()
    const services = JSON.parse(jsonStr)

    return NextResponse.json({ services })

  } catch (error: any) {
    console.error("Parse Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
