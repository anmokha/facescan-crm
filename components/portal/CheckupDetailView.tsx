'use client';

import { AnalysisResult, ClinicTreatment, RoutineStep } from '@/lib/diagnostic/types';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, TrendingUp, Zap, Sparkles } from 'lucide-react';

interface CheckupDetailViewProps {
  result: AnalysisResult;
}

export default function CheckupDetailView({ result }: CheckupDetailViewProps) {
  const profile = result.profile || {};
  const skinScore = Number(profile.skin_score ?? profile.skinScore ?? 0);
  const skinType = profile.skinType || profile.skin_type || null;
  const concerns = profile.concerns || profile.issues || profile.problems || null;
  const visualAge = profile.visual_age || result.hidden_analysis?.estimated_visual_age || null;

  const renderConcerns = (value: any) => {
    if (!value) return null;
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          {value.map((item, idx) => (
            <li key={`${item}-${idx}`}>{String(item)}</li>
          ))}
        </ul>
      );
    }
    return <p className="text-slate-700">{String(value)}</p>;
  };

  const renderRoutine = (steps: RoutineStep[]) => {
    if (!steps || steps.length === 0) return <p className="text-slate-500">Рутина не сформирована.</p>;
    return (
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={`${step.stepName}-${idx}`} className="rounded-2xl border border-slate-100 p-4">
            <div className="font-bold text-slate-900">{step.stepName}</div>
            <div className="text-sm text-slate-500 mt-1">{step.frequency}</div>
            <p className="text-slate-700 mt-2">{step.instruction}</p>
            {step.key_ingredients && (
              <div className="text-xs text-slate-500 mt-2">Ключевые ингредиенты: {step.key_ingredients}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderTreatments = (treatments: ClinicTreatment[]) => {
    if (!treatments || treatments.length === 0) {
      return <p className="text-slate-500">Рекомендации клиники отсутствуют.</p>;
    }
    return (
      <div className="space-y-4">
        {treatments.map((treatment, idx) => (
          <div key={`${treatment.name}-${idx}`} className="rounded-2xl border border-slate-100 p-4 bg-white">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div className="font-bold text-slate-900 text-lg">{treatment.name}</div>
              {treatment.price && <div className="text-lg font-bold text-slate-900">{treatment.price}</div>}
            </div>

            {/* Effect */}
            <div className="mb-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Какой эффект?</div>
              <p className="text-slate-700 leading-relaxed text-sm">
                {treatment.projected_improvement || treatment.reason}
              </p>
            </div>

            {/* Personalized Benefits */}
            {treatment.personalized_benefits && (
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold text-xs uppercase tracking-wide">
                  <Sparkles size={14} />
                  Почему это важно вам?
                </div>
                <p className="text-indigo-900/80 text-sm leading-relaxed italic">
                  "{treatment.personalized_benefits}"
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Профиль</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">Skin Score</div>
            <div className="text-3xl font-bold text-blue-600 mt-1">{skinScore}/100</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">Тип кожи</div>
            <div className="text-lg font-bold text-slate-900 mt-1">{skinType || 'Не определен'}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">Визуальный возраст</div>
            <div className="text-lg font-bold text-slate-900 mt-1">{visualAge || '—'}</div>
          </div>
        </div>
        {concerns && (
          <div className="mt-6">
            <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-2">Основные замечания</div>
            {renderConcerns(concerns)}
          </div>
        )}
      </section>

      {/* Metrics Dashboard */}
      {result.metrics && (
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-cyan-500" />
            Детальные метрики
          </h3>
          <div className="space-y-6">
            <MetricBar label="Увлажненность" value={result.metrics.hydration} />
            <MetricBar label="Чистота пор" value={result.metrics.pores} />
            <MetricBar label="Текстура / Рельеф" value={result.metrics.texture} />
            <MetricBar label="Тонус и Упругость" value={result.metrics.firmness} />
          </div>
        </section>
      )}

      {/* Prognosis Section (FOMO) */}
      {result.profile?.prognosis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
            <div className="flex items-center gap-2 mb-3 text-red-700 font-bold">
              <AlertTriangle size={20} />
              <span>Без ухода (через год)</span>
            </div>
            <p className="text-red-900/80 text-sm leading-relaxed">
              {result.profile.prognosis.negative_scenario}
            </p>
          </div>
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-2 mb-3 text-emerald-700 font-bold">
              <TrendingUp size={20} />
              <span>Ваш результат (через 3 мес)</span>
            </div>
            <p className="text-emerald-900/80 text-sm leading-relaxed">
              {result.profile.prognosis.positive_scenario}
            </p>
          </div>
        </div>
      )}

      {/* Active Ingredients Section */}
      {result.active_ingredients && result.active_ingredients.length > 0 && (
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Zap size={20} className="text-yellow-600" />
            Подходящие ингредиенты
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {result.active_ingredients.map((ing, i) => (
              <span key={i} className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-xl text-sm font-bold border border-yellow-200 shadow-sm">
                {ing}
              </span>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-slate-700">
            <p className="font-medium mb-1">💡 Как искать средства:</p>
            <p>
              На маркетплейсах (Wildberries, Ozon) и в магазинах косметики ищите продукты с этими ингредиентами
              в составе. Обращайте внимание на первые 5-7 компонентов в списке — чем выше в списке,
              тем больше концентрация активного вещества.
            </p>
          </div>
        </section>
      )}

      {/* Recommended Routine */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Рекомендованная рутина</h2>
        {renderRoutine(result.routine || [])}
      </section>

      {/* Clinic Treatments */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Рекомендации клиники</h2>
        {renderTreatments(result.clinicTreatments || [])}
      </section>

      {/* Closing Advice */}
      <section className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-6 shadow-sm border border-cyan-100">
        <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Резюме эксперта</h3>
        <p className="text-slate-700 text-base leading-relaxed max-w-2xl mx-auto text-center">
          "{result.closingAdvice || 'Рекомендации отсутствуют.'}"
        </p>
      </section>
    </div>
  );
}

// Simple Progress Bar Component for Metrics
const MetricBar = ({ label, value }: { label: string, value: number }) => {
  const safeValue = value || 0; // Protect against NaN/undefined
  let color = 'bg-emerald-500';
  if (safeValue < 50) color = 'bg-rose-500';
  else if (safeValue < 80) color = 'bg-amber-500';

  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-900">{safeValue}%</span>
      </div>
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${safeValue}%` }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
};
