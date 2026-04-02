'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import { PeriodSelector } from '@/components/admin/ai-stats/PeriodSelector';
import { StatsCards } from '@/components/admin/ai-stats/StatsCards';
import { UsageChart } from '@/components/admin/ai-stats/UsageChart';
import { ClinicsTable } from '@/components/admin/ai-stats/ClinicsTable';
import { PeriodType, AIStatsResponse } from '@/lib/admin/aiStatsService';
import { Brain, Loader2, AlertCircle } from 'lucide-react';

export default function AIStatsPage() {
  const [period, setPeriod] = useState<PeriodType>('day');
  const [data, setData] = useState<AIStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [period]);

  async function fetchStats() {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/ai-stats?period=${period}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Необходима авторизация');
        }
        if (response.status === 403) {
          throw new Error('Недостаточно прав');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки данных');
      }
      
      const stats = await response.json();
      setData(stats);
    } catch (err: any) {
      setError(err.message || 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }

  function formatDateRange(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    };
    
    if (period === 'day') {
      return startDate.toLocaleDateString('ru-RU', options);
    }
    
    return `${startDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} — ${endDate.toLocaleDateString('ru-RU', options)}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        <PageHeader
          title="AI Статистика"
          description="Мониторинг использования AI и расходов на токены"
          breadcrumbs={[{ label: 'AI Статистика' }]}
          icon={<Brain className="text-purple-600" size={24} />}
          actions={
            <PeriodSelector value={period} onChange={setPeriod} />
          }
        />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Загрузка статистики...</span>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Date Range */}
            <p className="text-sm text-gray-500">
              Период: {formatDateRange(data.dateRange.start, data.dateRange.end)}
            </p>

            {/* Stats Cards */}
            <StatsCards summary={data.summary} />

            {/* Usage Chart */}
            <UsageChart data={data.timeSeries} period={period} />

            {/* Clinics Table */}
            <ClinicsTable clinics={data.clinics} />
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Нет данных для отображения</p>
          </div>
        )}
      </div>
    </div>
  );
}
