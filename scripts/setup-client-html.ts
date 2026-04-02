
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

// Simple .env loader
if (fs.existsSync('.env')) {
  const envConfig = fs.readFileSync('.env', 'utf-8');
  envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !process.env[key]) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('❌ Error: GEMINI_API_KEY is not set');
  process.exit(1);
}

const clientName = process.argv[2];
if (!clientName) {
  console.error('❌ Error: Please provide a client name (e.g., "npm run setup-client-html laserliks")');
  process.exit(1);
}

const clientsDir = path.join(process.cwd(), 'clients');
const clientDir = path.join(clientsDir, clientName);
const htmlPath = path.join(clientDir, 'service.html');

if (!fs.existsSync(htmlPath)) {
  console.error(`❌ Error: service.html not found in ${clientDir}`);
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

async function processHtmlClient() {
  console.log(`🚀 Starting HTML setup for client: ${clientName}`);
  
  // Read HTML
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  console.log(`📄 Read ${htmlContent.length} bytes of HTML. Analyzing...`);

  // We can't send the WHOLE html if it's huge, so let's try to strip scripts and styles first
  // or just send a reasonable chunk. Gemini 1.5 Pro has 1-2M context window, so 5000 lines is nothing.
  // It will eat it easily.

  const extractionSchema = {
    type: "OBJECT",
    properties: {
      clientName: { type: "STRING", description: "Official name from title or meta" },
      theme: {
        type: "OBJECT",
        properties: {
          primary50: { type: "STRING" },
          primary100: { type: "STRING" },
          primary200: { type: "STRING" },
          primary500: { type: "STRING", description: "Main brand color extracted from styles/meta" },
          primary600: { type: "STRING" },
          primary700: { type: "STRING" }
        },
        required: ["primary50", "primary100", "primary200", "primary500", "primary600", "primary700"]
      },
      services: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            category: { type: "STRING" },
            name: { type: "STRING" },
            price: { type: "STRING" },
            description: { type: "STRING" }
          },
          required: ["name", "category"]
        }
      },
      contact: {
        type: "OBJECT",
        properties: {
          phone: { type: "STRING" }
        }
      },
      texts: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          subtitle: { type: "STRING" },
          uploadTitle: { type: "STRING" },
          uploadSubtitle: { type: "STRING" },
          buttonAnalyze: { type: "STRING" },
          ctaTitle: { type: "STRING" },
          ctaDescription: { type: "STRING" }
        }
      }
    },
    required: ["clientName", "theme", "services"]
  };

  const systemPrompt = `
    You are a web scraper and brand expert.
    Analyze the provided raw HTML of a beauty clinic's price list page.
    
    1. EXTRACT the brand identity:
       - Find the main brand color (check meta theme-color, style tags, or css variables).
       - Generate a Tailwind palette (50-700).
       - Get the exact clinic name.
    
    2. EXTRACT the full service menu:
       - Extract ONLY the top 30-40 most important services (to avoid response limits).
       - Prioritize: Laser Hair Removal, Facials, Peels, Injections.
       - Look for tables, lists, or div structures containing service names and prices.
       - Group them by category (headers usually precede lists).
       - Clean up prices (remove garbage, keep currency symbol).
    
    3. GENERATE marketing texts (Russian):
       - Based on the clinic's vibe, write a Title, Subtitle, and CTA for an AI Diagnostic tool.
       - "title": e.g. "AI-Диагностика Кожи от [Name]"
       - "subtitle": "Персональный план лечения за 30 секунд"
       - "ctaDescription": "Скидка на первый визит" (if you find info about discounts, use it, otherwise generic).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        role: "user",
        parts: [
            { text: systemPrompt },
            { text: htmlContent }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: extractionSchema,
      }
    });

    if (!response.text) {
        throw new Error("No response text from Gemini");
    }

    const data = JSON.parse(response.text);

    // Save as JSON first (as backup/reference)
    const configPath = path.join(clientDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
    console.log(`✅ Config (JSON) written to ${configPath}`);

    // Output the TS code block to append to registry.ts
    console.log('\n⬇️  COPY THIS INTO clients/registry.ts  ⬇️\n');
    
    const tsCode = `
  ${clientName}: {
    id: "${clientName}",
    name: "${data.clientName}",
    theme: ${JSON.stringify(data.theme, null, 4)},
    modules: ["skin"],
    contact: ${JSON.stringify(data.contact, null, 4)},
    texts: ${JSON.stringify(data.texts, null, 4)},
    services: ${JSON.stringify(data.services, null, 4)}
  },
    `;
    
    console.log(tsCode);
    console.log('\n⬆️  COPY END  ⬆️\n');

  } catch (err) {
    console.error('❌ Failed to process HTML:', err);
    process.exit(1);
  }
}

processHtmlClient();
