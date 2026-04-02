/**
 * Audit logging schema
 * Defines all trackable actions and log entry structure
 */

import { Role } from '../auth/permissions';

export enum AuditAction {
  // Authentication
  ADMIN_LOGIN = 'admin.login',
  ADMIN_LOGOUT = 'admin.logout',
  ADMIN_LOGIN_FAILED = 'admin.login_failed',

  // User Management
  CREATE_ADMIN_USER = 'admin.user.create',
  UPDATE_ADMIN_USER = 'admin.user.update',
  DELETE_ADMIN_USER = 'admin.user.delete',
  GRANT_ADMIN_ROLE = 'admin.role.grant',
  REVOKE_ADMIN_ROLE = 'admin.role.revoke',
  UPDATE_ASSIGNED_CLINICS = 'admin.assigned_clinics.update',

  // Impersonation
  IMPERSONATE_USER = 'admin.impersonate.start',
  EXIT_IMPERSONATION = 'admin.impersonate.end',

  // Clinic Management
  CREATE_CLINIC = 'clinic.create',
  UPDATE_CLINIC = 'clinic.update',
  DELETE_CLINIC = 'clinic.delete',
  VIEW_CLINIC = 'clinic.view',

  // Lead Management
  VIEW_LEADS = 'leads.view',
  EXPORT_LEADS = 'leads.export',
  UPDATE_LEAD = 'leads.update',
  DELETE_LEAD = 'leads.delete',

  // System
  VIEW_AUDIT_LOG = 'admin.audit.view',
  EXPORT_AUDIT_LOG = 'admin.audit.export',
  SYSTEM_SETTINGS_CHANGE = 'system.settings.change',
}

export interface AuditLogEntry {
  id?: string;
  action: AuditAction;

  // Who
  actorUid: string;
  actorEmail: string | undefined;
  actorRole: Role;
  impersonating?: boolean;
  originalAdminUid?: string; // If impersonating

  // What
  resourceType?: 'clinic' | 'lead' | 'user' | 'admin' | 'system';
  resourceId?: string;
  changes?: {
    before?: any;
    after?: any;
  };

  // When
  timestamp: any; // Firestore Timestamp

  // Where
  ipAddress: string;
  userAgent: string;
  location?: string; // From IP geolocation

  // Context
  metadata?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

/**
 * Action labels for UI display
 */
export const ACTION_LABELS: Record<AuditAction, string> = {
  [AuditAction.ADMIN_LOGIN]: 'Admin Login',
  [AuditAction.ADMIN_LOGOUT]: 'Admin Logout',
  [AuditAction.ADMIN_LOGIN_FAILED]: 'Login Failed',

  [AuditAction.CREATE_ADMIN_USER]: 'Create Admin User',
  [AuditAction.UPDATE_ADMIN_USER]: 'Update Admin User',
  [AuditAction.DELETE_ADMIN_USER]: 'Delete Admin User',
  [AuditAction.GRANT_ADMIN_ROLE]: 'Grant Admin Role',
  [AuditAction.REVOKE_ADMIN_ROLE]: 'Revoke Admin Role',
  [AuditAction.UPDATE_ASSIGNED_CLINICS]: 'Update Assigned Clinics',

  [AuditAction.IMPERSONATE_USER]: 'Start Impersonation',
  [AuditAction.EXIT_IMPERSONATION]: 'Exit Impersonation',

  [AuditAction.CREATE_CLINIC]: 'Create Clinic',
  [AuditAction.UPDATE_CLINIC]: 'Update Clinic',
  [AuditAction.DELETE_CLINIC]: 'Delete Clinic',
  [AuditAction.VIEW_CLINIC]: 'View Clinic',

  [AuditAction.VIEW_LEADS]: 'View Leads',
  [AuditAction.EXPORT_LEADS]: 'Export Leads',
  [AuditAction.UPDATE_LEAD]: 'Update Lead',
  [AuditAction.DELETE_LEAD]: 'Delete Lead',

  [AuditAction.VIEW_AUDIT_LOG]: 'View Audit Log',
  [AuditAction.EXPORT_AUDIT_LOG]: 'Export Audit Log',
  [AuditAction.SYSTEM_SETTINGS_CHANGE]: 'Change System Settings',
};

/**
 * Action severity levels for filtering/alerting
 */
export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export const ACTION_SEVERITY: Record<AuditAction, AuditSeverity> = {
  [AuditAction.ADMIN_LOGIN]: AuditSeverity.LOW,
  [AuditAction.ADMIN_LOGOUT]: AuditSeverity.LOW,
  [AuditAction.ADMIN_LOGIN_FAILED]: AuditSeverity.MEDIUM,

  [AuditAction.CREATE_ADMIN_USER]: AuditSeverity.HIGH,
  [AuditAction.UPDATE_ADMIN_USER]: AuditSeverity.MEDIUM,
  [AuditAction.DELETE_ADMIN_USER]: AuditSeverity.CRITICAL,
  [AuditAction.GRANT_ADMIN_ROLE]: AuditSeverity.HIGH,
  [AuditAction.REVOKE_ADMIN_ROLE]: AuditSeverity.HIGH,
  [AuditAction.UPDATE_ASSIGNED_CLINICS]: AuditSeverity.MEDIUM,

  [AuditAction.IMPERSONATE_USER]: AuditSeverity.HIGH,
  [AuditAction.EXIT_IMPERSONATION]: AuditSeverity.LOW,

  [AuditAction.CREATE_CLINIC]: AuditSeverity.MEDIUM,
  [AuditAction.UPDATE_CLINIC]: AuditSeverity.LOW,
  [AuditAction.DELETE_CLINIC]: AuditSeverity.CRITICAL,
  [AuditAction.VIEW_CLINIC]: AuditSeverity.LOW,

  [AuditAction.VIEW_LEADS]: AuditSeverity.LOW,
  [AuditAction.EXPORT_LEADS]: AuditSeverity.MEDIUM,
  [AuditAction.UPDATE_LEAD]: AuditSeverity.LOW,
  [AuditAction.DELETE_LEAD]: AuditSeverity.MEDIUM,

  [AuditAction.VIEW_AUDIT_LOG]: AuditSeverity.LOW,
  [AuditAction.EXPORT_AUDIT_LOG]: AuditSeverity.MEDIUM,
  [AuditAction.SYSTEM_SETTINGS_CHANGE]: AuditSeverity.HIGH,
};
