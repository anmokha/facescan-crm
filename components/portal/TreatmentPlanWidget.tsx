// Treatment Plan Widget Component
// Shows procedures from clinic with progress

'use client';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CheckCircle2, Clock } from 'lucide-react';

interface TreatmentPlanWidgetProps {
  treatmentPlan: any[];
}

export default function TreatmentPlanWidget({ treatmentPlan }: TreatmentPlanWidgetProps) {
  if (!treatmentPlan || treatmentPlan.length === 0) {
    return null;
  }

  // Filter out treatments that don't have real clinic data
  // (totalSessions = 0 means it's from AI recommendations, not actual clinic assignments)
  const realTreatments = treatmentPlan.filter(t => {
    const total = t.totalSessions || 0;
    return total > 0; // Only show treatments with actual sessions assigned
  });

  if (realTreatments.length === 0) {
    return null; // Don't show widget if no real treatments
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Процедуры в клинике</h2>

      <div className="space-y-4">
        {realTreatments.map((treatment, idx) => {
          const completed = treatment.completedSessions || 0;
          const total = treatment.totalSessions || 0;
          const progress = total > 0 ? (completed / total) * 100 : 0;
          const isCompleted = treatment.completedAt || completed >= total;

          return (
            <div
              key={idx}
              className={`p-6 border-2 rounded-2xl ${
                isCompleted
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-blue-200 bg-blue-50/50'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <Clock className="w-6 h-6 text-blue-600" />
                  )}
                  <div className="font-bold text-slate-900 text-lg">{treatment.name}</div>
                </div>

                <div
                  className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {isCompleted ? 'Завершено ✓' : 'В процессе'}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                  <span>
                    {completed} из {total} сеансов
                  </span>
                  <span className="font-bold">{Math.round(progress)}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Last session date */}
              {treatment.lastSessionDate && (() => {
                try {
                  const date = new Date(treatment.lastSessionDate);
                  if (!isNaN(date.getTime())) {
                    return (
                      <div className="text-xs text-slate-500">
                        Последний визит:{' '}
                        {format(date, 'd MMMM yyyy', { locale: ru })}
                      </div>
                    );
                  }
                } catch (error) {
                  console.error('Invalid lastSessionDate:', treatment.lastSessionDate);
                }
                return null;
              })()}

              {/* Price if available */}
              {treatment.price && (
                <div className="text-sm font-bold text-slate-700 mt-2">
                  Стоимость: {treatment.price}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-slate-700">
        <p className="font-bold mb-1">Рекомендация</p>
        <p>
          Для достижения максимального эффекта важно завершить полный курс процедур.
          Свяжитесь с клиникой для записи на следующий сеанс.
        </p>
      </div>
    </div>
  );
}
