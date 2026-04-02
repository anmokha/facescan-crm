import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

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

async function listUsers() {
    const result = await admin.auth().listUsers(10);
    console.log('Recent 10 users:');
    result.users.forEach(user => {
        console.log(`- ${user.email} (${user.uid})`);
    });
}

listUsers().catch(console.error);
