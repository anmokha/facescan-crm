'use client';

import { PeriodType } from '@/lib/admin/aiStatsService';

interface PeriodSelectorProps {
  value: PeriodType;
  onChange: (period: PeriodType) => void;
}

const PERIODS: { value: PeriodType; label: string }[] = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
];

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
      {PERIODS.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            value === period.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
