/**
 * Admin Migration Script
 *
 * Purpose:
 * Grant admin roles to a predefined set of existing users.
 *
 * Usage:
 *   MIGRATION_ADMIN_EMAILS="admin@example.com,owner@example.com" npx tsx scripts/migrate-existing-admins.ts
 *
 * Notes:
 * - Keep the email list in env for public-safe code (no personal addresses in repo).
 * - Intended as a one-time migration after deploying auth/roles changes.
 */

import { adminAuth } from '../lib/firebaseAdmin';
import { grantAdminRole } from '../lib/auth/adminRoles';
import { Role } from '../lib/auth/permissions';

// Existing admins to migrate (loaded from env for safer public sharing)
const EXISTING_ADMINS = (process.env.MIGRATION_ADMIN_EMAILS || 'admin@example.com,owner@example.com')
  .split(',')
  .map((email) => email.trim())
  .filter(Boolean)
  .map((email) => ({
    email,
    role: Role.SUPER_ADMIN,
  }));

async function migrateAdmins() {
  console.log('🚀 Starting admin migration...\n');

  let successCount = 0;
  let failCount = 0;

  for (const admin of EXISTING_ADMINS) {
    try {
      console.log(`Processing ${admin.email}...`);

      // Get user by email
      let user;
      try {
        user = await adminAuth.getUserByEmail(admin.email);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          console.log(`  ⚠️  User not found, creating new user...`);
          user = await adminAuth.createUser({
            email: admin.email,
            emailVerified: true,
            disabled: false,
          });
          console.log(`  ✅ Created user: ${user.uid}`);
        } else {
          throw error;
        }
      }

      // Grant admin role
      // Use 'system' as grantedBy for migration
      await grantAdminRole(user.uid, admin.role, 'system-migration');

      console.log(`  ✅ Granted ${admin.role} to ${admin.email}\n`);
      successCount++;

    } catch (error: any) {
      console.error(`  ❌ Failed for ${admin.email}:`, error.message, '\n');
      failCount++;
    }
  }

  console.log('\n=== Migration Summary ===');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${EXISTING_ADMINS.length}`);

  if (failCount === 0) {
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n⚠️  IMPORTANT NEXT STEPS:');
    console.log('1. Verify admin users can login');
    console.log('2. Test admin panel access');
    console.log('3. Remove hardcoded SUPER_ADMINS array from app/admin/layout.tsx');
    console.log('4. Deploy updated code');
  } else {
    console.log('\n⚠️  Migration completed with errors. Please review failed users.');
  }

  process.exit(failCount > 0 ? 1 : 0);
}

// Run migration
migrateAdmins().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
