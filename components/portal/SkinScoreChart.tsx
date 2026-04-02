// Skin Score Chart Component
// Shows skin score progression over time

'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface SkinScoreChartProps {
  history: any[];
}

export default function SkinScoreChart({ history }: SkinScoreChartProps) {
  const getScore = (item: any) => {
    const profile = item?.analysisResult?.profile || {};
    return Number(profile.skin_score ?? profile.skinScore ?? 0);
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <div className="text-6xl mb-4">📊</div>
        <p>Пройдите первый чекап для отображения графика</p>
      </div>
    );
  }

  if (history.length === 1) {
    return (
      <div className="text-center py-12 text-slate-500">
        <div className="text-6xl mb-4">📈</div>
        <p>График доступен после повторного чекапа</p>
        <p className="text-sm mt-2">
          Ваш текущий результат: <span className="font-bold text-blue-600">{getScore(history[0])}/100</span>
        </p>
      </div>
    );
  }

  const chartData = history
    .filter(h => {
      // Filter out items without valid score or timestamp
      if (!getScore(h)) return false;

      // Check if createdAt exists and has valid structure
      if (!h.createdAt) return false;

      // Firestore Timestamp has .seconds property
      // But serialized JSON might have different format
      const seconds = h.createdAt.seconds || h.createdAt._seconds;
      if (!seconds) {
        console.warn('Checkup without valid timestamp:', h);
        return false;
      }

      return true;
    })
    .map(h => {
      const seconds = h.createdAt.seconds || h.createdAt._seconds;
      const timestamp = new Date(seconds * 1000);

      return {
        date: format(timestamp, 'd MMM', { locale: ru }),
        fullDate: format(timestamp, 'd MMMM yyyy', { locale: ru }),
        score: getScore(h)
      };
    })
    .reverse(); // Oldest first for chart progression

  // Calculate improvement
  const firstScore = chartData[0]?.score || 0;
  const lastScore = chartData[chartData.length - 1]?.score || 0;
  const improvement = lastScore - firstScore;

  return (
    <div>
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-xl">
          <div className="text-sm text-slate-600 mb-1">Первый чекап</div>
          <div className="text-2xl font-bold text-slate-900">{firstScore}</div>
        </div>
        <div className="text-center p-4 bg-emerald-50 rounded-xl">
          <div className="text-sm text-slate-600 mb-1">Текущий результат</div>
          <div className="text-2xl font-bold text-emerald-600">{lastScore}</div>
        </div>
        <div className="text-center p-4 bg-amber-50 rounded-xl">
          <div className="text-sm text-slate-600 mb-1">Изменение</div>
          <div className={`text-2xl font-bold ${improvement >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {improvement >= 0 ? '+' : ''}{improvement}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
              formatter={(value: any) => [`${value}/100`, 'Skin Score']}
              labelFormatter={(label, payload) => {
                return payload?.[0]?.payload?.fullDate || label;
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{
                fill: '#3b82f6',
                r: 6,
                strokeWidth: 2,
                stroke: 'white'
              }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
