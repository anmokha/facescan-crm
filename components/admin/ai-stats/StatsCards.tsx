'use client';

import { AIStatsSummary } from '@/lib/admin/aiStatsService';
import { Zap, ArrowDown, ArrowUp, DollarSign, Activity } from 'lucide-react';

interface StatsCardsProps {
  summary: AIStatsSummary;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

function formatCost(cost: number): string {
  if (cost < 0.01) {
    return '< $0.01';
  }
  return '$' + cost.toFixed(2);
}

export function StatsCards({ summary }: StatsCardsProps) {
  const cards = [
    {
      title: 'Всего запросов',
      value: formatNumber(summary.totalRequests),
      icon: Activity,
      color: 'blue',
    },
    {
      title: 'Input токены',
      value: formatNumber(summary.totalInputTokens),
      icon: ArrowDown,
      color: 'green',
    },
    {
      title: 'Output токены',
      value: formatNumber(summary.totalOutputTokens),
      icon: ArrowUp,
      color: 'orange',
    },
    {
      title: 'Ориентировочная стоимость',
      value: formatCost(summary.estimatedCost),
      icon: DollarSign,
      color: 'purple',
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; icon: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'text-orange-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-600' },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const colors = colorClasses[card.color];
        const Icon = card.icon;
        
        return (
          <div
            key={card.title}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                <p className={`text-2xl font-bold mt-1 ${colors.text}`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${colors.bg}`}>
                <Icon className={`w-6 h-6 ${colors.icon}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
