/**
 * Find User UID by Email
 *
 * Usage:
 *   npx tsx scripts/find-user-uid.ts admin@example.com
 *   # or
 *   TARGET_EMAIL=admin@example.com npx tsx scripts/find-user-uid.ts
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { adminAuth } = await import('../lib/firebaseAdmin');
  const email = process.argv[2] || process.env.TARGET_EMAIL || 'admin@example.com';
  try {
    const user = await adminAuth.getUserByEmail(email);
    console.log(`User found: ${user.email} -> UID: ${user.uid}`);
  } catch (error) {
    console.error(`Error finding user ${email}:`, error);
  }
}

main();
