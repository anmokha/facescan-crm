/**
 * Admin Access Repair Script
 *
 * Purpose:
 * Re-apply admin custom claims and `admin_users` records for a list of emails.
 *
 * Usage:
 *   ADMIN_EMAILS="admin@example.com,owner@example.com" npx tsx scripts/fix-admin-access.ts
 */

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
            privateKey: privateKey.replace(/\n/g, '\n'),
        }),
    });
}

const auth = admin.auth();
const db = admin.firestore();

// Public-safe configuration: emails are passed via environment variable.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@example.com,owner@example.com')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

// Permissions copied from lib/auth/permissions.ts
const ALL_PERMISSIONS = [
    'clinics.create', 'clinics.read', 'clinics.update', 'clinics.delete',
    'leads.read.all', 'leads.read.assigned', 'leads.update', 'leads.delete', 'leads.export',
    'users.create', 'users.read', 'users.update', 'users.delete', 'users.impersonate',
    'admin.grant_role', 'admin.revoke_role', 'admin.view_audit', 'admin.view_analytics',
    'system.settings', 'billing.manage'
];

async function fixAdmins() {
    for (const email of ADMIN_EMAILS) {
        try {
            console.log(`\nProcessing ${email}...`);
            const user = await auth.getUserByEmail(email);
            
            // 1. Set Custom Claims
            await auth.setCustomUserClaims(user.uid, {
                admin: true,
                role: 'super_admin',
                permissions: ALL_PERMISSIONS
            });
            console.log(`✅ Custom claims set for ${user.uid}`);

            // 2. Add to admin_users collection
            await db.collection('admin_users').doc(user.uid).set({
                email: email,
                role: 'super_admin',
                permissions: ALL_PERMISSIONS,
                assignedClinics: [],
                status: 'active',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: 'fix-script'
            }, { merge: true });
            console.log(`✅ Firestore record updated`);

        } catch (error: any) {
            console.error(`❌ Error for ${email}:`, error.message);
        }
    }
}

fixAdmins().then(() => {
    console.log('\nAll done!');
    process.exit(0);
});
