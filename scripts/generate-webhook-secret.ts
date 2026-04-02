
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';

dotenv.config({ path: '.env.local' });

// Init Firebase
if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_SERVICE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_SERVICE_CLIENT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!privateKey || !clientEmail || !projectId) {
        console.error('❌ Missing Firebase credentials');
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

async function generateSecret() {
    const clinicId = process.argv[2];

    if (!clinicId) {
        console.error('Usage: npx tsx scripts/generate-webhook-secret.ts <clinic-slug>');
        process.exit(1);
    }

    const secret = crypto.randomBytes(32).toString('hex');
    console.log(`🔑 Generated Secret for ${clinicId}: ${secret}`);

    try {
        const docRef = db.collection('clinics').doc(clinicId);
        const doc = await docRef.get();

        if (!doc.exists) {
            console.error(`❌ Clinic '${clinicId}' not found in Firestore! Run migration first.`);
            process.exit(1);
        }

        await docRef.update({
            webhookSecret: secret,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Successfully saved secret to database.`);
        console.log(`\n📋 SEND THIS TO THE CLINIC IT TEAM:`);
        console.log(`---------------------------------------------------`);
        console.log(`Endpoint: https://curescan.pro/api/webhooks/conversion`);
        console.log(`Method: POST`);
        console.log(`Headers:`);
        console.log(`  X-Client-Id: ${clinicId}`);
        console.log(`  X-Signature: HMAC_SHA256(body, "${secret}")`);
        console.log(`---------------------------------------------------`);

    } catch (error) {
        console.error('Error updating DB:', error);
    }
}

generateSecret();
