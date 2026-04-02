'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Phone, Building2, FileText } from 'lucide-react';
import Link from 'next/link';

interface Lead {
  id: string;
  phone: string;
  clinicId: string;
  clinicName?: string;
  diagnosticType: string;
  status: string;
  createdAt: string;
}

const DIAGNOSTIC_LABELS: Record<string, string> = {
  'skin': 'Skin Analysis',
  'hair': 'Hair Analysis',
  'acne': 'Acne Analysis',
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  'new': { bg: 'bg-blue-50', text: 'text-blue-700' },
  'contacted': { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  'converted': { bg: 'bg-green-50', text: 'text-green-700' },
  'lost': { bg: 'bg-gray-50', text: 'text-gray-700' },
};

export default function RecentLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchLeads = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/admin/leads?limit=10', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch leads');

        const data = await res.json();
        setLeads(data.leads || []);
      } catch (error) {
        console.error('Failed to load leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Phone className="text-gray-400" size={20} />
          <h3 className="font-bold text-gray-900 text-lg">Recent Leads</h3>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
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
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <Phone className="text-gray-600" size={20} />
        <h3 className="font-bold text-gray-900 text-lg">Recent Leads</h3>
      </div>

      <div className="space-y-2">
        {leads.map((lead) => {
          const diagnosticLabel = DIAGNOSTIC_LABELS[lead.diagnosticType] || lead.diagnosticType;
          const statusStyle = STATUS_STYLES[lead.status] || STATUS_STYLES['new'];
          const timeAgo = getTimeAgo(new Date(lead.createdAt));

          return (
            <div key={lead.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
                <Phone size={16} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900">{lead.phone}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                    {lead.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Building2 size={12} />
                    {lead.clinicName || 'Unknown Clinic'}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={12} />
                    {diagnosticLabel}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
              </div>
            </div>
          );
        })}

        {leads.length === 0 && (
          <div className="text-center py-8">
            <Phone className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 text-sm">No recent leads</p>
          </div>
        )}
      </div>

      <Link
        href="/admin/leads"
        className="block mt-6 text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        View all leads →
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
