'use client'

import Link from 'next/link';
import { Building2, Users, FileText, ShieldAlert, BarChart3 } from 'lucide-react';

const QUICK_ACTIONS = [
  {
    href: '/admin/clinics',
    icon: Building2,
    title: 'Manage Clinics',
    description: 'View and manage all clinics',
    color: 'orange',
  },
  {
    href: '/admin/leads',
    icon: Users,
    title: 'View All Leads',
    description: 'Browse and filter all leads',
    color: 'blue',
  },
  {
    href: '/admin/analytics',
    icon: BarChart3,
    title: 'Analytics',
    description: 'Platform-wide metrics',
    color: 'green',
  },
  {
    href: '/admin/audit',
    icon: FileText,
    title: 'Audit Logs',
    description: 'Review platform activity',
    color: 'purple',
  },
  {
    href: '/admin/users',
    icon: ShieldAlert,
    title: 'Admin Users',
    description: 'Manage admin access',
    color: 'red',
  },
];

const COLOR_STYLES: Record<string, { bg: string; iconBg: string; icon: string; hover: string }> = {
  orange: {
    bg: 'bg-white',
    iconBg: 'bg-orange-50',
    icon: 'text-orange-600',
    hover: 'hover:border-orange-300',
  },
  blue: {
    bg: 'bg-white',
    iconBg: 'bg-blue-50',
    icon: 'text-blue-600',
    hover: 'hover:border-blue-300',
  },
  purple: {
    bg: 'bg-white',
    iconBg: 'bg-purple-50',
    icon: 'text-purple-600',
    hover: 'hover:border-purple-300',
  },
  red: {
    bg: 'bg-white',
    iconBg: 'bg-red-50',
    icon: 'text-red-600',
    hover: 'hover:border-red-300',
  },
  green: {
    bg: 'bg-white',
    iconBg: 'bg-green-50',
    icon: 'text-green-600',
    hover: 'hover:border-green-300',
  },
  gray: {
    bg: 'bg-white',
    iconBg: 'bg-gray-100',
    icon: 'text-gray-600',
    hover: 'hover:border-gray-300',
  },
};

export default function QuickActions() {
  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h2>
        <p className="text-gray-600">Fast access to common admin tasks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          const styles = COLOR_STYLES[action.color];

          return (
            <Link
              key={action.href}
              href={action.href}
              className={`${styles.bg} border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all ${styles.hover}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 ${styles.iconBg} rounded-lg flex-shrink-0`}>
                  <Icon className={styles.icon} size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
