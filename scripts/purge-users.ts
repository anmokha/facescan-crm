/**
 * Bulk Purge Firebase Auth Users
 *
 * Usage:
 *   PROTECTED_EMAILS="admin@example.com,owner@example.com" npx tsx scripts/purge-users.ts
 *
 * Safety:
 * - Always protect owner/admin emails via PROTECTED_EMAILS.
 * - Run only against the intended Firebase project/environment.
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
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

const PROTECTED_EMAILS = (process.env.PROTECTED_EMAILS || 'admin@example.com,owner@example.com')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

async function purgeUsers() {
    console.log('🚀 Starting Firebase Auth purge...');
    
    let count = 0;
    let nextBatchToken: string | undefined;

    do {
        const result = await admin.auth().listUsers(100, nextBatchToken);
        
        for (const user of result.users) {
            if (user.email && PROTECTED_EMAILS.includes(user.email)) {
                console.log(`- Skipping protected user: ${user.email}`);
                continue;
            }

            await admin.auth().deleteUser(user.uid);
            console.log(`- Deleted user: ${user.email || user.uid}`);
            count++;
        }

        nextBatchToken = result.pageToken;
    } while (nextBatchToken);

    console.log(`
✅ Finished! Deleted ${count} users.`);
}

purgeUsers().catch(err => {
    console.error('Purge failed:', err);
    process.exit(1);
});
