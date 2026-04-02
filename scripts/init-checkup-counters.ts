import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_SERVICE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_SERVICE_CLIENT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!privateKey || !clientEmail || !projectId) {
        console.error('Missing Firebase credentials in .env.local');
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

async function initializeCheckupFields() {
    const clinicsSnap = await db.collection('clinics').get();
    console.log(`Initializing checkup fields for ${clinicsSnap.docs.length} clinics...`);

    const batch = db.batch();
    clinicsSnap.docs.forEach(doc => {
        const data = doc.data();
        const update: any = {};
        
        if (data.checkupCount === undefined) update.checkupCount = 0;
        if (data.isPilot === undefined) update.isPilot = false;
        if (!data.limits) {
            update.limits = { leads: 50, checkups: 0 };
        } else if (data.limits.checkups === undefined) {
            update['limits.checkups'] = 0;
        }

        if (Object.keys(update).length > 0) {
            batch.update(doc.ref, update);
        }
    });

    await batch.commit();
    console.log('✅ Done!');
}

initializeCheckupFields().catch(console.error);
