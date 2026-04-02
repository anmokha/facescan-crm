import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import * as admin from 'firebase-admin';

async function purgeCollection(db: admin.firestore.Firestore, collectionPath: string) {
    const collectionRef = db.collection(collectionPath);
    const snapshot = await collectionRef.get();
    
    if (snapshot.empty) return;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}

async function main() {
    const { adminDb } = await import('../lib/firebaseAdmin');
    
    if (process.env.FIREBASE_SERVICE_CLIENT_EMAIL === undefined) {
        console.error('Error: Firebase credentials not found.');
        process.exit(1);
    }

    const collectionsToPurge = [
        'leads',
        'clinics',
        'slugs',
        'analytics_events',
        'admin_audit',
        'admin_users',
        'customers',
        'sources',
        'traffic_stats',
        'usage_logs'
    ];

    console.log('Starting full database purge...');

    for (const collection of collectionsToPurge) {
        try {
            await purgeCollection(adminDb, collection);
            console.log(`- Collection ${collection} purged.`);
        } catch (error) {
            console.error(`- Error purging collection ${collection}:`, error);
        }
    }

    console.log('Database is now clean!');
    process.exit(0);
}

main();