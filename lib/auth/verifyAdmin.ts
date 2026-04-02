/**
 * Admin authentication middleware
 * Verifies Firebase ID tokens and checks admin permissions
 */

import { adminAuth } from '@/lib/firebaseAdmin';
import { NextRequest } from 'next/server';
import { Permission, Role } from './permissions';

export interface VerifiedAdmin {
  uid: string;
  email: string | undefined;
  role: Role;
  permissions: Permission[];
  assignedClinics?: string[];
}

/**
 * Verify admin token from Authorization header
 * Throws error if token is invalid or user is not an admin
 */
export async function verifyAdminToken(request: NextRequest): Promise<VerifiedAdmin> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing Authorization header');
  }

  const token = authHeader.substring(7);

  try {
    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check if user has admin claim
    if (!decodedToken.admin) {
      throw new Error('User is not an admin');
    }

    // Extract admin claims
    const adminUser: VerifiedAdmin = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role as Role,
      permissions: decodedToken.permissions as Permission[] || [],
      assignedClinics: decodedToken.assignedClinics as string[] || undefined,
    };

    return adminUser;

  } catch (error: any) {
    // Log the error but don't expose details to client
    console.error('Token verification failed:', error.message);

    if (error.code === 'auth/id-token-expired') {
      throw new Error('Token expired');
    } else if (error.code === 'auth/argument-error') {
      throw new Error('Invalid token format');
    } else {
      throw new Error('Invalid token');
    }
  }
}

/**
 * Backwards-compatible alias used by admin API routes.
 */
export async function verifyAdminRequest(request: NextRequest): Promise<VerifiedAdmin> {
  return verifyAdminToken(request)
}

/**
 * Check if admin has a specific permission
 */
export function hasPermission(
  adminUser: VerifiedAdmin,
  requiredPermission: Permission
): boolean {
  // Super admins have all permissions
  if (adminUser.role === Role.SUPER_ADMIN) {
    return true;
  }

  return adminUser.permissions.includes(requiredPermission);
}

/**
 * Check if admin has any of the specified permissions
 */
export function hasAnyPermission(
  adminUser: VerifiedAdmin,
  requiredPermissions: Permission[]
): boolean {
  if (adminUser.role === Role.SUPER_ADMIN) {
    return true;
  }

  return requiredPermissions.some(perm =>
    adminUser.permissions.includes(perm)
  );
}

/**
 * Check if admin has all of the specified permissions
 */
export function hasAllPermissions(
  adminUser: VerifiedAdmin,
  requiredPermissions: Permission[]
): boolean {
  if (adminUser.role === Role.SUPER_ADMIN) {
    return true;
  }

  return requiredPermissions.every(perm =>
    adminUser.permissions.includes(perm)
  );
}

/**
 * Check if admin has access to a specific clinic
 * Returns true if:
 * - User has LEADS_READ_ALL permission, OR
 * - Clinic is in user's assignedClinics list
 */
export function hasAccessToClinic(
  adminUser: VerifiedAdmin,
  clinicId: string
): boolean {
  // Users with LEADS_READ_ALL can access any clinic
  if (hasPermission(adminUser, Permission.LEADS_READ_ALL)) {
    return true;
  }

  // Check if clinic is in assigned list
  return adminUser.assignedClinics?.includes(clinicId) || false;
}

/**
 * Require specific permission or throw error
 */
export function requirePermission(
  adminUser: VerifiedAdmin,
  requiredPermission: Permission
): void {
  if (!hasPermission(adminUser, requiredPermission)) {
    throw new Error(`Missing required permission: ${requiredPermission}`);
  }
}

/**
 * Require any of the specified permissions or throw error
 */
export function requireAnyPermission(
  adminUser: VerifiedAdmin,
  requiredPermissions: Permission[]
): void {
  if (!hasAnyPermission(adminUser, requiredPermissions)) {
    throw new Error(`Missing required permissions: ${requiredPermissions.join(', ')}`);
  }
}

/**
 * Require access to clinic or throw error
 */
export function requireClinicAccess(
  adminUser: VerifiedAdmin,
  clinicId: string
): void {
  if (!hasAccessToClinic(adminUser, clinicId)) {
    throw new Error(`No access to clinic: ${clinicId}`);
  }
}

/**
 * Get list of clinics admin has access to
 * Returns 'all' if user has LEADS_READ_ALL permission
 */
export function getAccessibleClinics(adminUser: VerifiedAdmin): string[] | 'all' {
  if (hasPermission(adminUser, Permission.LEADS_READ_ALL)) {
    return 'all';
  }

  return adminUser.assignedClinics || [];
}
