'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  X,
  AlertCircle,
  CheckCircle,
  ShieldAlert,
  UserPlus,
  UserMinus,
  Building2,
  User,
  Activity
} from 'lucide-react';
import PageHeader from './PageHeader';

interface AuditLog {
  id: string;
  action: string;
  actorEmail: string;
  actorRole: string;
  timestamp: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: any;
  success: boolean;
  errorMessage?: string;
  ipAddress?: string;
}

const ACTION_ICONS: Record<string, any> = {
  'admin.login': ShieldAlert,
  'admin.role.grant': UserPlus,
  'admin.role.revoke': UserMinus,
  'clinic.create': Building2,
  'admin.impersonate.start': User,
  'default': Activity
};

const ACTION_LABELS: Record<string, string> = {
  'admin.login': 'Admin Login',
  'admin.logout': 'Admin Logout',
  'admin.role.grant': 'Grant Admin Role',
  'admin.role.revoke': 'Revoke Admin Role',
  'clinic.create': 'Create Clinic',
  'clinic.update': 'Update Clinic',
  'clinic.delete': 'Delete Clinic',
  'leads.view': 'View Leads',
  'leads.update': 'Update Lead',
  'admin.impersonate.start': 'Start Impersonation',
  'admin.audit.view': 'View Audit Log',
};

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  medium: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const getSeverity = (action: string): keyof typeof SEVERITY_COLORS => {
  if (action.includes('delete') || action.includes('revoke')) return 'critical';
  if (action.includes('grant') || action.includes('create')) return 'high';
  if (action.includes('update')) return 'medium';
  return 'low';
};

export default function AuditLogViewer() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [successFilter, setSuccessFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchLogs = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/admin/audit?limit=500', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch logs');

        const data = await res.json();
        setLogs(data.logs || []);
        setFilteredLogs(data.logs || []);
      } catch (error) {
        console.error('Failed to load audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  // Apply filters
  useEffect(() => {
    let filtered = [...logs];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.actorEmail?.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.resourceId?.toLowerCase().includes(query)
      );
    }

    // Action filter
    if (actionFilter) {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Success filter
    if (successFilter) {
      const isSuccess = successFilter === 'true';
      filtered = filtered.filter(log => log.success === isSuccess);
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(log => new Date(log.timestamp) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => new Date(log.timestamp) <= toDate);
    }

    setFilteredLogs(filtered);
  }, [logs, searchQuery, actionFilter, successFilter, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearchQuery('');
    setActionFilter('');
    setSuccessFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Action', 'Actor', 'Role', 'Success', 'Resource Type', 'Resource ID', 'IP Address', 'Error'];
    const rows = filteredLogs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.action,
      log.actorEmail || '',
      log.actorRole || '',
      log.success ? 'Success' : 'Failed',
      log.resourceType || '',
      log.resourceId || '',
      log.ipAddress || '',
      log.errorMessage || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueActions = Array.from(new Set(logs.map(log => log.action))).sort();

  const activeFiltersCount = [searchQuery, actionFilter, successFilter, dateFrom, dateTo].filter(Boolean).length;

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="text-gray-400" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        </div>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Audit Logs"
        description={`Showing ${filteredLogs.length} of ${logs.length} events`}
        breadcrumbs={[{ label: 'Audit Logs' }]}
        icon={<FileText className="text-blue-600" size={24} />}
        actions={
          <>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-colors ${
                showFilters
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter size={18} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white text-blue-600 text-xs font-bold rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <button
              onClick={exportToCSV}
              disabled={filteredLogs.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              Export CSV
            </button>
          </>
        }
      />

      {/* Search & Filters Container */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by email, action, or resource ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Action Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Actions</option>
                  {uniqueActions.map(action => (
                    <option key={action} value={action}>
                      {ACTION_LABELS[action] || action}
                    </option>
                  ))}
                </select>
              </div>

              {/* Success Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={successFilter}
                  onChange={(e) => setSuccessFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="true">Success</option>
                  <option value="false">Failed</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                <X size={16} />
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Audit Log Timeline */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 text-sm">
              {logs.length === 0 ? 'No audit logs found' : 'No logs match your filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const Icon = ACTION_ICONS[log.action] || ACTION_ICONS['default'];
              const label = ACTION_LABELS[log.action] || log.action;
              const severity = getSeverity(log.action);
              const severityStyle = SEVERITY_COLORS[severity];
              const timestamp = new Date(log.timestamp);

              return (
                <div
                  key={log.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${severityStyle.border} ${severityStyle.bg} hover:shadow-md transition-shadow`}
                >
                  {/* Icon */}
                  <div className={`p-2 ${log.success ? 'bg-white' : 'bg-red-100'} rounded-lg flex-shrink-0`}>
                    {log.success ? (
                      <Icon size={20} className={severityStyle.text} />
                    ) : (
                      <AlertCircle size={20} className="text-red-600" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-semibold ${severityStyle.text}`}>
                            {label}
                          </span>
                          {!log.success && (
                            <span className="text-xs font-medium px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                              FAILED
                            </span>
                          )}
                          <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full uppercase">
                            {severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">{log.actorEmail}</span>
                          {log.metadata?.targetEmail && (
                            <span className="text-gray-600">
                              {' → '}<span className="font-medium text-blue-600">{log.metadata.targetEmail}</span>
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-medium text-gray-900">
                          {timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-600">
                          {timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Role:</span> {log.actorRole}
                      </span>
                      {log.resourceType && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Resource:</span> {log.resourceType}
                        </span>
                      )}
                      {log.resourceId && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium">ID:</span> {log.resourceId}
                        </span>
                      )}
                      {log.ipAddress && (
                        <span className="flex items-center gap-1">
                          <span className="font-medium">IP:</span> {log.ipAddress}
                        </span>
                      )}
                    </div>

                    {/* Error Message */}
                    {!log.success && log.errorMessage && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        <span className="font-medium">Error:</span> {log.errorMessage}
                      </div>
                    )}
                  </div>

                  {/* Success Indicator */}
                  {log.success && (
                    <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
