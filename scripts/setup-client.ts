
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

// Simple .env loader if not running in Next.js context
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
  console.error('❌ Error: GEMINI_API_KEY is not set in environment or .env file');
  process.exit(1);
}

const clientName = process.argv[2];
if (!clientName) {
  console.error('❌ Error: Please provide a client name (e.g., "npm run setup-client epilux")');
  process.exit(1);
}

const clientsDir = path.join(process.cwd(), 'clients');
const clientDir = path.join(clientsDir, clientName);

if (!fs.existsSync(clientDir)) {
  console.error(`❌ Error: Client directory not found: ${clientDir}`);
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

async function processClient() {
  console.log(`🚀 Starting setup for client: ${clientName}`);

  // 1. Read images
  const files = fs.readdirSync(clientDir).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
  if (files.length === 0) {
    console.error('❌ Error: No images found in client directory');
    process.exit(1);
  }

  console.log(`📸 Found ${files.length} images. Analyzing with Gemini...`);

  const imageParts = files.map(file => {
    const filePath = path.join(clientDir, file);
    const mimeType = file.endsWith('.png') ? 'image/png' : 'image/jpeg';
    const data = fs.readFileSync(filePath).toString('base64');
    return {
      inlineData: {
        mimeType,
        data
      }
    };
  });

  // 2. Define schema for config and services
  const extractionSchema = {
    type: "OBJECT",
    properties: {
      clientName: { type: "STRING", description: "Official name of the clinic/business" },
      theme: {
        type: "OBJECT",
        properties: {
          primary50: { type: "STRING", description: "Lightest shade (backgrounds)" },
          primary100: { type: "STRING" },
          primary200: { type: "STRING" },
          primary500: { type: "STRING", description: "Main brand color" },
          primary600: { type: "STRING" },
          primary700: { type: "STRING", description: "Darkest shade (text/active)" }
        },
        required: ["primary50", "primary100", "primary200", "primary500", "primary600", "primary700"]
      },
      services: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            category: { type: "STRING", description: "e.g., Laser Hair Removal, Facials" },
            name: { type: "STRING", description: "Service name" },
            price: { type: "STRING", description: "Price string (e.g., '5000 ₽')" },
            description: { type: "STRING", description: "Short description if available" }
          },
          required: ["name", "category"]
        }
      },
      contact: {
        type: "OBJECT",
        properties: {
          phone: { type: "STRING" },
          address: { type: "STRING" }
        }
      }
    },
    required: ["clientName", "theme", "services"]
  };

  const systemPrompt = `
    You are a brand implementation specialist. 
    Analyze the provided screenshots of a beauty clinic's website.
    
    1. EXTRACT the visual identity:
       - Identify the primary brand color.
       - Generate a Tailwind-compatible color palette based on this primary color (50, 100, 200, 500, 600, 700).
       - primary50 should be very light (nearly white), primary500 is the main brand color.
    
    2. EXTRACT the services offered:
       - List all specific treatments mentioned (especially laser hair removal, cosmetology, etc.).
       - Extract prices if visible.
       - Group them logically.
    
    3. EXTRACT contact info (phone, address).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        role: "user",
        parts: [
            { text: systemPrompt },
            ...imageParts
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

    // 3. Write Config
    const configPath = path.join(clientDir, 'config.json');
    const configData = {
      id: clientName,
      name: data.clientName,
      theme: data.theme,
      contact: data.contact,
      modules: ["skin", "hair"] // Default enabled modules
    };
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
    console.log(`✅ Config written to ${configPath}`);

    // 4. Write Services
    const servicesPath = path.join(clientDir, 'services.json');
    fs.writeFileSync(servicesPath, JSON.stringify(data.services, null, 2));
    console.log(`✅ Services written to ${servicesPath}`);

  } catch (err) {
    console.error('❌ Failed to process client:', err);
    process.exit(1);
  }
}

processClient();
