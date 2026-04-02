/**
 * Centralized audit logging service
 * Provides consistent logging across all admin operations
 */

import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { AuditAction, AuditLogEntry } from './schema';
import { VerifiedAdmin } from '../auth/verifyAdmin';
import { NextRequest } from 'next/server';

export class AuditLogger {
  /**
   * Log an audit event
   * All events are written to Firestore admin_audit collection
   */
  static async log(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    try {
      const logEntry: AuditLogEntry = {
        ...entry,
        timestamp: FieldValue.serverTimestamp(),
      };

      // Write to Firestore
      await adminDb.collection('admin_audit').add(logEntry);

      // Optional: Also log to external system for tamper-proofing
      // await this.logToExternalService(logEntry);

    } catch (error) {
      console.error('❌ CRITICAL: Audit logging failed:', error);

      // CRITICAL: Audit logging failure should be monitored
      // In production, send alert to ops team
      // await alertOps('Audit logging failed', error);
    }
  }

  /**
   * Log from API request
   * Automatically extracts metadata from request
   */
  static async logFromRequest(
    action: AuditAction,
    request: NextRequest,
    adminUser: VerifiedAdmin,
    options: {
      resourceType?: 'clinic' | 'lead' | 'user' | 'admin' | 'system';
      resourceId?: string;
      changes?: {
        before?: any;
        after?: any;
      };
      success: boolean;
      errorMessage?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await this.log({
      action,
      actorUid: adminUser.uid,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      ipAddress: this.getIpAddress(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ...options,
    });
  }

  /**
   * Log successful action
   */
  static async logSuccess(
    action: AuditAction,
    request: NextRequest,
    adminUser: VerifiedAdmin,
    resourceType?: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logFromRequest(action, request, adminUser, {
      resourceType: resourceType as any,
      resourceId,
      success: true,
      metadata,
    });
  }

  /**
   * Log failed action
   */
  static async logFailure(
    action: AuditAction,
    request: NextRequest,
    adminUser: VerifiedAdmin | null,
    error: Error,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!adminUser) {
      // No admin user (auth failed)
      await this.log({
        action,
        actorUid: 'unknown',
        actorEmail: undefined,
        actorRole: 'support' as any, // placeholder
        ipAddress: this.getIpAddress(request),
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: false,
        errorMessage: error.message,
        metadata,
      });
    } else {
      await this.logFromRequest(action, request, adminUser, {
        success: false,
        errorMessage: error.message,
        metadata,
      });
    }
  }

  /**
   * Log with changes (before/after)
   */
  static async logChange(
    action: AuditAction,
    request: NextRequest,
    adminUser: VerifiedAdmin,
    resourceType: 'clinic' | 'lead' | 'user' | 'admin' | 'system',
    resourceId: string,
    before: any,
    after: any
  ): Promise<void> {
    await this.logFromRequest(action, request, adminUser, {
      resourceType,
      resourceId,
      changes: { before, after },
      success: true,
    });
  }

  /**
   * Extract IP address from request
   */
  private static getIpAddress(request: NextRequest): string {
    return (
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      'unknown'
    );
  }

  /**
   * Optional: Log to external service for tamper-proofing
   * Uncomment and configure when ready
   */
  // private static async logToExternalService(entry: AuditLogEntry): Promise<void> {
  //   try {
  //     // Option 1: Log to AWS S3 for immutable storage
  //     // await s3.putObject({ ... });
  //
  //     // Option 2: Log to Splunk/Datadog/etc
  //     // await fetch('https://splunk.com/services/collector', { ... });
  //
  //     // Option 3: Log to Supabase/separate database
  //     // await supabase.from('audit_logs').insert(entry);
  //   } catch (error) {
  //     console.error('External audit logging failed:', error);
  //   }
  // }

  /**
   * Query audit logs (for audit viewer)
   */
  static async query(filters: {
    action?: AuditAction;
    actorUid?: string;
    actorEmail?: string;
    startDate?: Date;
    endDate?: Date;
    resourceType?: string;
    resourceId?: string;
    success?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<AuditLogEntry[]> {
    try {
      let query = adminDb.collection('admin_audit').orderBy('timestamp', 'desc');

      // Apply filters
      if (filters.action) {
        query = query.where('action', '==', filters.action) as any;
      }

      if (filters.actorUid) {
        query = query.where('actorUid', '==', filters.actorUid) as any;
      }

      if (filters.actorEmail) {
        query = query.where('actorEmail', '==', filters.actorEmail) as any;
      }

      if (filters.resourceType) {
        query = query.where('resourceType', '==', filters.resourceType) as any;
      }

      if (filters.resourceId) {
        query = query.where('resourceId', '==', filters.resourceId) as any;
      }

      if (filters.success !== undefined) {
        query = query.where('success', '==', filters.success) as any;
      }

      // Limit results
      const limit = filters.limit || 100;
      query = query.limit(limit) as any;

      const snapshot = await query.get();

      const logs: AuditLogEntry[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
      } as AuditLogEntry));

      // Client-side date filtering (Firestore compound queries are limited)
      let filteredLogs = logs;

      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(
          log => new Date(log.timestamp) >= filters.startDate!
        );
      }

      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(
          log => new Date(log.timestamp) <= filters.endDate!
        );
      }

      // Apply offset (pagination)
      if (filters.offset) {
        filteredLogs = filteredLogs.slice(filters.offset);
      }

      return filteredLogs;

    } catch (error) {
      console.error('Failed to query audit logs:', error);
      return [];
    }
  }

  /**
   * Get audit stats (for dashboard)
   */
  static async getStats(timeRange: '24h' | '7d' | '30d' | '90d'): Promise<{
    totalActions: number;
    failedActions: number;
    uniqueActors: Set<string>;
    topActions: Array<{ action: AuditAction; count: number }>;
    recentFailures: AuditLogEntry[];
  }> {
    const now = new Date();
    const ranges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
    };

    const startDate = new Date(now.getTime() - ranges[timeRange]);

    const logs = await this.query({ startDate, limit: 10000 });

    const stats = {
      totalActions: logs.length,
      failedActions: logs.filter(log => !log.success).length,
      uniqueActors: new Set(logs.map(log => log.actorUid)),
      topActions: [] as Array<{ action: AuditAction; count: number }>,
      recentFailures: logs.filter(log => !log.success).slice(0, 10),
    };

    // Calculate top actions
    const actionCounts: Record<string, number> = {};
    logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    stats.topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action: action as AuditAction, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }
}
