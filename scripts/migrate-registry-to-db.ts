import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_SERVICE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_SERVICE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    console.error('❌ Missing Firebase credentials in .env.local');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function migrateClients() {
  console.log('🚀 Starting migration of file-based clients to Firestore...');

  const clientsDir = path.join(process.cwd(), 'clients');
  
  if (!fs.existsSync(clientsDir)) {
      console.error("Clients directory not found.");
      process.exit(1);
  }

  const entries = fs.readdirSync(clientsDir, { withFileTypes: true });
  const clientDirs = entries.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

  for (const slug of clientDirs) {
    const dirPath = path.join(clientsDir, slug);
    const configPath = path.join(dirPath, 'config.json');
    const servicesPath = path.join(dirPath, 'services.json');

    if (!fs.existsSync(configPath)) {
        console.warn(`⚠️ Skipping ${slug}: config.json not found.`);
        continue;
    }

    console.log(`Processing client: ${slug}...`);

    try {
        const configRaw = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configRaw);

        // Handle both 'name' and 'clientName'
        const clinicName = config.name || config.clientName;
        if (!clinicName) {
            console.error(`❌ Error: Clinic name not found for ${slug}`);
            continue;
        }

        // Handle services from separate file or within config.json
        let services = config.services || [];
        if (fs.existsSync(servicesPath)) {
            const servicesRaw = fs.readFileSync(servicesPath, 'utf-8');
            services = JSON.parse(servicesRaw);
        }

        const docRef = db.collection('clinics').doc(slug);

        const data = {
          name: clinicName,
          slug: slug,
          theme: config.theme,
          modules: config.modules || ['skin'],
          texts: config.texts || {},
          services: services,
          contact: config.contact || {},
          plan: 'enterprise',
          status: 'active',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        
        await docRef.set(data, { merge: true });
        console.log(`✅ Successfully migrated: ${slug}`);

    } catch (error) {
        console.error(`❌ Failed to migrate ${slug}:`, error);
    }
  }

  console.log('🏁 Migration complete!');
  process.exit(0);
}

migrateClients();
