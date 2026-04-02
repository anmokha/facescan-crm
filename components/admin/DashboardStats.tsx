'use client'

import { useEffect, useState } from 'react';
import { DollarSign, Users, TrendingUp, Building2, Award, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

interface DashboardStatsData {
  totalRevenue: number;
  totalLeads: number;
  totalClinics: number;
  activeClinics: number;
  averageConversion: number;
  newLeadsToday: number;
  revenueToday: number;
  topPerformingClinic: {
    id: string;
    name: string;
    revenue: number;
  } | null;
}

export default function DashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/admin/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch stats');

        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        Failed to load dashboard stats
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Revenue */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-50 rounded-xl">
            <DollarSign className="text-green-600" size={24} />
          </div>
          <div className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
            ALL TIME
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          ₽{stats.totalRevenue.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600 mb-2">Total Revenue</div>
        <div className="text-xs text-green-600 font-medium">
          +₽{stats.revenueToday.toLocaleString()} today
        </div>
      </div>

      {/* Total Leads */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Users className="text-blue-600" size={24} />
          </div>
          <div className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
            TOTAL
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {stats.totalLeads.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600 mb-2">Total Leads</div>
        <div className="text-xs text-blue-600 font-medium">
          +{stats.newLeadsToday} today
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-50 rounded-xl">
            <TrendingUp className="text-purple-600" size={24} />
          </div>
          <div className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
            AVG
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {stats.averageConversion}%
        </div>
        <div className="text-sm text-gray-600 mb-2">Conversion Rate</div>
        <div className="text-xs text-purple-600 font-medium">
          Platform average
        </div>
      </div>

      {/* Active Clinics */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-50 rounded-xl">
            <Building2 className="text-orange-600" size={24} />
          </div>
          <div className="text-xs font-semibold text-orange-700 bg-orange-50 px-3 py-1 rounded-full">
            ACTIVE
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {stats.activeClinics} / {stats.totalClinics}
        </div>
        <div className="text-sm text-gray-600 mb-2">Active Clinics</div>
        <div className="text-xs text-orange-600 font-medium">
          {((stats.activeClinics / stats.totalClinics) * 100).toFixed(0)}% active rate
        </div>
      </div>

      {/* Top Performer */}
      {stats.topPerformingClinic && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-xl">
              <Award className="text-yellow-600" size={24} />
            </div>
            <div className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
              TOP
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1 truncate">
            {stats.topPerformingClinic.name}
          </div>
          <div className="text-sm text-gray-600 mb-2">Top Performer</div>
          <div className="text-xs text-yellow-600 font-medium">
            ₽{stats.topPerformingClinic.revenue.toLocaleString()} revenue
          </div>
        </div>
      )}

      {/* Today's Activity */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-cyan-50 rounded-xl">
            <Zap className="text-cyan-600" size={24} />
          </div>
          <div className="text-xs font-semibold text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full">
            TODAY
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {stats.newLeadsToday}
        </div>
        <div className="text-sm text-gray-600 mb-2">New Leads Today</div>
        <div className="text-xs text-cyan-600 font-medium">
          ₽{stats.revenueToday.toLocaleString()} revenue
        </div>
      </div>
    </div>
  );
}
