'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Activity, UserPlus, UserMinus, Building2, ShieldAlert, User } from 'lucide-react';
import Link from 'next/link';

interface AuditLog {
  id: string;
  action: string;
  actorEmail: string;
  timestamp: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: any;
}

const ACTION_ICONS: Record<string, any> = {
  'admin.login': ShieldAlert,
  'admin.grant_role': UserPlus,
  'admin.revoke_role': UserMinus,
  'clinic.create': Building2,
  'admin.impersonate.start': User,
  'default': Activity
};

const ACTION_LABELS: Record<string, string> = {
  'admin.login': 'logged in',
  'admin.grant_role': 'granted admin role',
  'admin.revoke_role': 'revoked admin role',
  'clinic.create': 'created clinic',
  'admin.impersonate.start': 'impersonated user',
  'lead.update': 'updated lead',
};

export default function RecentActivity() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/admin/audit?limit=10', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch logs');

        const data = await res.json();
        setLogs(data.logs || []);
      } catch (error) {
        console.error('Failed to load activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="text-gray-400" size={20} />
          <h3 className="font-bold text-gray-900 text-lg">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="text-gray-600" size={20} />
        <h3 className="font-bold text-gray-900 text-lg">Recent Activity</h3>
      </div>

      <div className="space-y-2">
        {logs.map((log) => {
          const Icon = ACTION_ICONS[log.action] || ACTION_ICONS['default'];
          const label = ACTION_LABELS[log.action] || log.action;
          const timeAgo = getTimeAgo(new Date(log.timestamp));

          return (
            <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                <Icon size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{log.actorEmail}</span>
                  {' '}<span className="text-gray-600">{label}</span>
                  {log.metadata?.targetEmail && (
                    <span className="text-blue-600"> {log.metadata.targetEmail}</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
              </div>
            </div>
          );
        })}

        {logs.length === 0 && (
          <div className="text-center py-8">
            <Activity className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 text-sm">No recent activity</p>
          </div>
        )}
      </div>

      <Link
        href="/admin/audit"
        className="block mt-6 text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        View all activity →
      </Link>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  if (!date) return 'unknown';

  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
