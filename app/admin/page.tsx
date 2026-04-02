import DashboardStats from '@/components/admin/DashboardStats';
import RecentActivity from '@/components/admin/RecentActivity';
import RecentLeads from '@/components/admin/RecentLeads';
import QuickActions from '@/components/admin/QuickActions';
import PageHeader from '@/components/admin/PageHeader';
import { LayoutDashboard } from 'lucide-react';

export default async function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          title="Platform Overview"
          description="Real-time insights across all clinics"
          icon={<LayoutDashboard className="text-blue-600" size={24} />}
        />

        {/* KPI Cards */}
        <DashboardStats />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Recent Activity */}
          <RecentActivity />

          {/* Recent Leads */}
          <RecentLeads />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  );
}
