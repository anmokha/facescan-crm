'use client'

import { DollarSign, TrendingUp, Target, BarChart3 } from 'lucide-react'

interface RevenueStatsProps {
  totalRevenue: number;
  convertedCount: number;
  totalLeads: number;
  estimatedRevenue: number;
  averageCheck?: number;
}

export default function RevenueStats({
  totalRevenue,
  convertedCount,
  totalLeads,
  estimatedRevenue,
  averageCheck = 5000
}: RevenueStatsProps) {
  const conversionRate = totalLeads > 0 ? ((convertedCount / totalLeads) * 100).toFixed(1) : '0.0';
  const actualAverageCheck = convertedCount > 0 ? (totalRevenue / convertedCount).toFixed(0) : '0';
  const revenueQuality = totalRevenue > 0 ? ((totalRevenue / estimatedRevenue) * 100).toFixed(0) : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Real Revenue */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <DollarSign className="text-green-600" size={24} />
          </div>
          <div className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
            ACTUAL
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          ₽{totalRevenue.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">
          Real Revenue
        </div>
        <div className="text-xs text-green-600 mt-2 font-medium">
          {convertedCount} conversions
        </div>
      </div>

      {/* Estimated Revenue */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Target className="text-blue-600" size={24} />
          </div>
          <div className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
            ESTIMATED
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          ₽{estimatedRevenue.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">
          Estimated Revenue
        </div>
        <div className="text-xs text-blue-600 mt-2 font-medium">
          @ ₽{averageCheck.toLocaleString()} avg check
        </div>
      </div>

      {/* Revenue Quality */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-50 rounded-lg">
            <TrendingUp className="text-purple-600" size={24} />
          </div>
          <div className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-full border border-purple-200">
            QUALITY
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {revenueQuality}%
        </div>
        <div className="text-sm text-gray-600">
          Revenue Quality
        </div>
        <div className="text-xs text-purple-600 mt-2 font-medium">
          {Number(revenueQuality) >= 100 ? 'Exceeds' : 'Below'} estimate
        </div>
      </div>

      {/* Average Check */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-50 rounded-lg">
            <BarChart3 className="text-orange-600" size={24} />
          </div>
          <div className="text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
            METRICS
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          ₽{actualAverageCheck}
        </div>
        <div className="text-sm text-gray-600">
          Actual Avg Check
        </div>
        <div className="text-xs text-orange-600 mt-2 font-medium">
          {conversionRate}% conversion rate
        </div>
      </div>
    </div>
  );
}
