import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_SERVICE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_SERVICE_CLIENT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!privateKey || !clientEmail || !projectId) {
        console.error('Missing Firebase credentials in .env');
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

async function cleanup() {
    console.log('🚀 Starting Database Health Check & Migration...\n');

    const clinicsSnap = await db.collection('clinics').get();
    const slugsCollection = db.collection('slugs');

    console.log(`Found ${clinicsSnap.docs.length} clinics. Checking for issues...\n`);

    for (const doc of clinicsSnap.docs) {
        const data = doc.data();
        const clinicId = doc.id;
        const slug = data.slug;
        const name = data.name || 'Unnamed';

        console.log(`--- Checking: ${name} (ID: ${clinicId}) ---`);

        // 1. Check if ID is legacy (not a UID)
        // Basic check: UIDs are usually ~28 chars and look like random strings
        if (clinicId.length < 20 || !/[0-9]/.test(clinicId)) {
            console.warn(`⚠️ LEGACY ID DETECTED: This clinic uses a manual ID '${clinicId}'. Owner will NOT be able to access it via Dashboard.`);
        }

        if (!slug) {
            console.error(`❌ NO SLUG: Clinic has no slug. It will be invisible to patients.`);
            continue;
        }

        // 2. Try to reserve slug
        const slugRef = slugsCollection.doc(slug);
        const slugDoc = await slugRef.get();

        if (slugDoc.exists) {
            const existingOwner = slugDoc.data()?.uid;
            if (existingOwner !== clinicId) {
                console.error(`🚨 COLLISION!! Slug '${slug}' is used by clinic '${clinicId}', but it was already reserved by '${existingOwner}'.`);
                console.error(`   Action: You MUST rename one of these in Firebase Console.`);
            } else {
                console.log(`✅ Slug '${slug}' correctly assigned.`);
            }
        } else {
            // Reserve it now
            await slugRef.set({
                uid: clinicId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                migrated: true
            });
            console.log(`✅ Slug '${slug}' successfully reserved for this clinic.`);
        }
        console.log('');
    }

    console.log('✅ Health check complete. Review errors above.');
    process.exit(0);
}

cleanup().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
