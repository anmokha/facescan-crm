/**
 * Admin role management
 * Functions to grant/revoke admin roles and manage custom claims
 */

import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { Role, Permission, getRolePermissions } from './permissions';

export interface AdminClaims {
  admin: boolean;
  role: Role;
  permissions: Permission[];
  assignedClinics?: string[];
  grantedBy?: string;
  grantedAt?: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: Role;
  permissions: Permission[];
  assignedClinics?: string[];
  createdAt: Date;
  createdBy: string;
  status: 'active' | 'suspended' | 'deleted';
  lastLoginAt?: Date;
}

/**
 * Grant admin role to a user
 */
export async function grantAdminRole(
  uid: string,
  role: Role,
  grantedByUid: string,
  assignedClinics?: string[]
): Promise<void> {
  try {
    // Get user info
    const user = await adminAuth.getUser(uid);

    // Prepare claims
    const permissions = getRolePermissions(role);
    const claims: AdminClaims = {
      admin: true,
      role: role,
      permissions: permissions,
      assignedClinics: assignedClinics,
      grantedBy: grantedByUid,
      grantedAt: new Date().toISOString(),
    };

    // Set custom claims
    await adminAuth.setCustomUserClaims(uid, claims);

    // Store in Firestore for querying
    await adminDb.collection('admin_users').doc(uid).set({
      email: user.email,
      role: role,
      permissions: permissions,
      assignedClinics: assignedClinics || [],
      createdAt: FieldValue.serverTimestamp(),
      createdBy: grantedByUid,
      status: 'active',
    }, { merge: true });

    // Audit log
    await adminDb.collection('admin_audit').add({
      action: 'GRANT_ADMIN_ROLE',
      actorUid: grantedByUid,
      targetUid: uid,
      targetEmail: user.email,
      role: role,
      assignedClinics: assignedClinics || [],
      timestamp: FieldValue.serverTimestamp(),
      success: true,
    });

    console.log(`✅ Granted ${role} to ${user.email}`);

  } catch (error: any) {
    console.error('Failed to grant admin role:', error);

    // Log failure
    await adminDb.collection('admin_audit').add({
      action: 'GRANT_ADMIN_ROLE',
      actorUid: grantedByUid,
      targetUid: uid,
      timestamp: FieldValue.serverTimestamp(),
      success: false,
      errorMessage: error.message,
    });

    throw new Error(`Failed to grant admin role: ${error.message}`);
  }
}

/**
 * Revoke admin role from a user
 */
export async function revokeAdminRole(
  uid: string,
  revokedByUid: string
): Promise<void> {
  try {
    const user = await adminAuth.getUser(uid);

    // Remove custom claims
    await adminAuth.setCustomUserClaims(uid, {
      admin: false,
      role: null,
      permissions: [],
    });

    // Update Firestore record
    await adminDb.collection('admin_users').doc(uid).update({
      status: 'deleted',
      deletedAt: FieldValue.serverTimestamp(),
      deletedBy: revokedByUid,
    });

    // Audit log
    await adminDb.collection('admin_audit').add({
      action: 'REVOKE_ADMIN_ROLE',
      actorUid: revokedByUid,
      targetUid: uid,
      targetEmail: user.email,
      timestamp: FieldValue.serverTimestamp(),
      success: true,
    });

    console.log(`✅ Revoked admin role from ${user.email}`);

  } catch (error: any) {
    console.error('Failed to revoke admin role:', error);

    await adminDb.collection('admin_audit').add({
      action: 'REVOKE_ADMIN_ROLE',
      actorUid: revokedByUid,
      targetUid: uid,
      timestamp: FieldValue.serverTimestamp(),
      success: false,
      errorMessage: error.message,
    });

    throw new Error(`Failed to revoke admin role: ${error.message}`);
  }
}

/**
 * Update admin user's assigned clinics
 */
export async function updateAssignedClinics(
  uid: string,
  clinicIds: string[],
  updatedByUid: string
): Promise<void> {
  try {
    const user = await adminAuth.getUser(uid);
    const currentClaims = user.customClaims as AdminClaims;

    if (!currentClaims?.admin) {
      throw new Error('User is not an admin');
    }

    // Update claims
    await adminAuth.setCustomUserClaims(uid, {
      ...currentClaims,
      assignedClinics: clinicIds,
    });

    // Update Firestore
    await adminDb.collection('admin_users').doc(uid).update({
      assignedClinics: clinicIds,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: updatedByUid,
    });

    // Audit log
    await adminDb.collection('admin_audit').add({
      action: 'UPDATE_ASSIGNED_CLINICS',
      actorUid: updatedByUid,
      targetUid: uid,
      targetEmail: user.email,
      changes: {
        before: currentClaims.assignedClinics || [],
        after: clinicIds,
      },
      timestamp: FieldValue.serverTimestamp(),
      success: true,
    });

    console.log(`✅ Updated assigned clinics for ${user.email}`);

  } catch (error: any) {
    console.error('Failed to update assigned clinics:', error);

    await adminDb.collection('admin_audit').add({
      action: 'UPDATE_ASSIGNED_CLINICS',
      actorUid: updatedByUid,
      targetUid: uid,
      timestamp: FieldValue.serverTimestamp(),
      success: false,
      errorMessage: error.message,
    });

    throw new Error(`Failed to update assigned clinics: ${error.message}`);
  }
}

/**
 * Get all admin users
 */
export async function getAllAdminUsers(): Promise<AdminUser[]> {
  try {
    const snapshot = await adminDb
      .collection('admin_users')
      .where('status', '==', 'active')
      .get();

    const users: AdminUser[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        email: data.email,
        role: data.role,
        permissions: data.permissions,
        assignedClinics: data.assignedClinics || [],
        createdAt: data.createdAt?.toDate(),
        createdBy: data.createdBy,
        status: data.status,
        lastLoginAt: data.lastLoginAt?.toDate(),
      };
    });

    return users;

  } catch (error) {
    console.error('Failed to fetch admin users:', error);
    return [];
  }
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(uid: string): Promise<boolean> {
  try {
    const user = await adminAuth.getUser(uid);
    const claims = user.customClaims as AdminClaims;
    return claims?.role === Role.SUPER_ADMIN;
  } catch (error) {
    return false;
  }
}

/**
 * Get admin user by UID
 */
export async function getAdminUser(uid: string): Promise<AdminUser | null> {
  try {
    const doc = await adminDb.collection('admin_users').doc(uid).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;
    return {
      uid: doc.id,
      email: data.email,
      role: data.role,
      permissions: data.permissions,
      assignedClinics: data.assignedClinics || [],
      createdAt: data.createdAt?.toDate(),
      createdBy: data.createdBy,
      status: data.status,
      lastLoginAt: data.lastLoginAt?.toDate(),
    };

  } catch (error) {
    console.error('Failed to fetch admin user:', error);
    return null;
  }
}
