/**
 * Permission-based access control system
 * Defines all roles and their permissions
 */

export enum Permission {
  // Clinic Management
  CLINICS_CREATE = 'clinics.create',
  CLINICS_READ = 'clinics.read',
  CLINICS_UPDATE = 'clinics.update',
  CLINICS_DELETE = 'clinics.delete',

  // Lead Management
  LEADS_READ_ALL = 'leads.read.all',      // All clinics
  LEADS_READ_OWN = 'leads.read.own',      // Assigned clinics only
  LEADS_UPDATE = 'leads.update',
  LEADS_DELETE = 'leads.delete',
  LEADS_EXPORT = 'leads.export',

  // User Management
  USERS_CREATE = 'users.create',
  USERS_READ = 'users.read',
  USERS_UPDATE = 'users.update',
  USERS_DELETE = 'users.delete',
  USERS_IMPERSONATE = 'users.impersonate',

  // Admin Management
  ADMIN_GRANT_ROLE = 'admin.grant_role',
  ADMIN_REVOKE_ROLE = 'admin.revoke_role',
  ADMIN_VIEW_AUDIT = 'admin.view_audit',
  ADMIN_VIEW_ANALYTICS = 'admin.view_analytics',

  // System
  SYSTEM_SETTINGS = 'system.settings',
  BILLING_MANAGE = 'billing.manage',
}

export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  SUPPORT = 'support',
  ANALYST = 'analyst',
  SALES = 'sales',
}

/**
 * Role to permissions mapping
 * Each role has a specific set of permissions
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [
    // God mode - all permissions
    Permission.CLINICS_CREATE,
    Permission.CLINICS_READ,
    Permission.CLINICS_UPDATE,
    Permission.CLINICS_DELETE,
    Permission.LEADS_READ_ALL,
    Permission.LEADS_UPDATE,
    Permission.LEADS_DELETE,
    Permission.LEADS_EXPORT,
    Permission.USERS_CREATE,
    Permission.USERS_READ,
    Permission.USERS_UPDATE,
    Permission.USERS_DELETE,
    Permission.USERS_IMPERSONATE,
    Permission.ADMIN_GRANT_ROLE,
    Permission.ADMIN_REVOKE_ROLE,
    Permission.ADMIN_VIEW_AUDIT,
    Permission.ADMIN_VIEW_ANALYTICS,
    Permission.SYSTEM_SETTINGS,
    Permission.BILLING_MANAGE,
  ],

  [Role.ADMIN]: [
    // Can manage operations but not grant admin rights
    Permission.CLINICS_READ,
    Permission.CLINICS_UPDATE,
    Permission.LEADS_READ_ALL,
    Permission.LEADS_UPDATE,
    Permission.LEADS_EXPORT,
    Permission.USERS_READ,
    Permission.USERS_IMPERSONATE,
    Permission.ADMIN_VIEW_ANALYTICS,
  ],

  [Role.MANAGER]: [
    // Can manage assigned clinics
    Permission.CLINICS_READ,
    Permission.LEADS_READ_OWN, // Only assigned clinics
    Permission.LEADS_UPDATE,
    Permission.LEADS_EXPORT,
  ],

  [Role.SUPPORT]: [
    // Can help users but not delete data
    Permission.CLINICS_READ,
    Permission.LEADS_READ_ALL,
    Permission.USERS_IMPERSONATE,
  ],

  [Role.ANALYST]: [
    // Read-only access for analytics
    Permission.CLINICS_READ,
    Permission.LEADS_READ_ALL,
    Permission.ADMIN_VIEW_ANALYTICS,
  ],

  [Role.SALES]: [
    // Can only view assigned clinics
    Permission.CLINICS_READ,
    Permission.LEADS_READ_OWN,
  ],
};

/**
 * Get all permissions for a given role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userPermissions: Permission[],
  required: Permission
): boolean {
  return userPermissions.includes(required);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  userPermissions: Permission[],
  required: Permission[]
): boolean {
  return required.some(perm => userPermissions.includes(perm));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  userPermissions: Permission[],
  required: Permission[]
): boolean {
  return required.every(perm => userPermissions.includes(perm));
}

/**
 * Role display names for UI
 */
export const ROLE_LABELS: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'Super Admin',
  [Role.ADMIN]: 'Admin',
  [Role.MANAGER]: 'Manager',
  [Role.SUPPORT]: 'Support',
  [Role.ANALYST]: 'Analyst',
  [Role.SALES]: 'Sales',
};

/**
 * Role descriptions for UI
 */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'Full access to all features. Can manage admin users.',
  [Role.ADMIN]: 'Can manage operations and impersonate users. Cannot grant admin rights.',
  [Role.MANAGER]: 'Can manage assigned clinics and their leads.',
  [Role.SUPPORT]: 'Can view all data and impersonate users for support.',
  [Role.ANALYST]: 'Read-only access for analytics and reporting.',
  [Role.SALES]: 'Can view assigned clinics only.',
};
