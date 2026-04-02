import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { generatePassword, hashPassword } from '../lib/auth/passwordUtils';
import { sendSMS } from '../lib/auth/smsService';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
if (!admin.apps.length) {
  // Use service account if available, otherwise default creds
  try {
    const serviceAccount = require('../serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (e) {
    console.log('No serviceAccountKey.json found, using default credentials');
    admin.initializeApp();
  }
}

const db = getFirestore();

async function migrateCustomers() {
  console.log('Starting customer password migration...');

  const customersRef = db.collection('customers');
  const snapshot = await customersRef.get();

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();

    // Skip if already has password
    if (data.password) {
      console.log(`Skipping ${doc.id} (already has password)`);
      skippedCount++;
      continue;
    }

    try {
      // Generate password
      const plainPassword = generatePassword();
      const hashedPassword = await hashPassword(plainPassword);

      // Update customer document
      await doc.ref.update({
        password: hashedPassword,
        passwordCreatedAt: admin.firestore.Timestamp.now()
      });

      console.log(`Generated password for ${doc.id}: ${plainPassword}`);

      // Send SMS (COST: 4₽ per customer!)
      // Only send if phone number is valid E.164
      if (data.phone && /^\+7\d{10}$/.test(data.phone)) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://curescan.pro';
        const message = `Ваш пароль для входа в CureScan: ${plainPassword}\nЛогин: ${data.phone}\n\nЛичный кабинет: ${baseUrl}/portal`;
        
        // Uncomment to actually send SMS
        // await sendSMS(data.phone, message);
        console.log(`[DRY RUN] SMS would be sent to ${data.phone}`);
      } else {
        console.warn(`Invalid phone for ${doc.id}: ${data.phone}`);
      }

      migratedCount++;

      // Rate limit: 1 SMS per second to avoid carrier throttling
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error migrating ${doc.id}:`, error);
      errorCount++;
    }
  } 

  console.log('\n=== Migration Complete ===');
  console.log(`Total customers: ${snapshot.size}`);
  console.log(`Migrated: ${migratedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
}

migrateCustomers().catch(console.error);
