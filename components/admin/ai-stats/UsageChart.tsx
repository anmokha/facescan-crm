'use client';

import { TimeSeriesData } from '@/lib/admin/aiStatsService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface UsageChartProps {
  data: TimeSeriesData[];
  period: 'day' | 'week' | 'month';
}

function formatTokens(value: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + 'M';
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(0) + 'K';
  }
  return value.toString();
}

export function UsageChart({ data, period }: UsageChartProps) {
  const chartData = data.map(item => ({
    ...item,
    totalTokens: item.inputTokens + item.outputTokens,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Динамика использования
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="label" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              tickFormatter={formatTokens}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value, name) => {
                const numValue = typeof value === 'number' ? value : 0;
                const strName = typeof name === 'string' ? name : '';
                const label = strName === 'inputTokens' ? 'Input токены' : 
                             strName === 'outputTokens' ? 'Output токены' : strName;
                return [formatTokens(numValue), label];
              }}
            />
            <Legend 
              formatter={(value) => {
                return value === 'inputTokens' ? 'Input токены' : 
                       value === 'outputTokens' ? 'Output токены' : value;
              }}
            />
            <Bar 
              dataKey="inputTokens" 
              stackId="a" 
              fill="#10b981" 
              radius={[0, 0, 4, 4]}
            />
            <Bar 
              dataKey="outputTokens" 
              stackId="a" 
              fill="#f97316" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
