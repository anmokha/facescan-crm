// Customer Portal - Main Dashboard
// Shows checkup history, skin score progress, and treatment plan

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { differenceInDays } from 'date-fns';
import SkinScoreChart from '@/components/portal/SkinScoreChart';
import CheckupHistoryCard from '@/components/portal/CheckupHistoryCard';
import TreatmentPlanWidget from '@/components/portal/TreatmentPlanWidget';
import ScoreCircle from '@/components/diagnostic/ScoreCircle';
import { Plus, Loader2 } from 'lucide-react';

export default function CustomerPortal() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadPortalData();
  }, []);

  const loadPortalData = async () => {
    const sessionToken = localStorage.getItem('customerSession');

    if (!sessionToken) {
      router.push('/checkup');
      return;
    }

    try {
      const res = await fetch('/api/portal/me', {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });

      if (!res.ok) {
        localStorage.removeItem('customerSession');
        router.push('/checkup');
        return;
      }

      const portalData = await res.json();
      setData(portalData);
    } catch (error) {
      console.error('Failed to load portal data:', error);
      router.push('/checkup');
    } finally {
      setLoading(false);
    }
  };

  const canCreateNewCheckup = () => {
    if (!data?.customer?.lastCheckupAt) return true; // First checkup

    try {
      // Handle both Firestore and serialized timestamp formats
      const seconds = data.customer.lastCheckupAt.seconds || data.customer.lastCheckupAt._seconds;
      if (!seconds) return true;

      const lastCheckupDate = new Date(seconds * 1000);
      if (isNaN(lastCheckupDate.getTime())) return true; // Invalid date, allow new checkup

      const daysSince = differenceInDays(new Date(), lastCheckupDate);

      // Check time limit (30 days)
      if (daysSince >= 30) return true;

      // Check if procedure completed since last checkup
      const hasProcedureSinceLastCheckup = data.customer.treatmentPlan?.some((t: any) => {
        if (!t.lastSessionDate) return false;
        try {
          const sessionDate = new Date(t.lastSessionDate);
          if (isNaN(sessionDate.getTime())) return false;
          return sessionDate > lastCheckupDate;
        } catch {
          return false;
        }
      });

      return hasProcedureSinceLastCheckup;
    } catch {
      return true; // On error, allow new checkup
    }
  };

  const getDaysUntilNextCheckup = () => {
    if (!data?.customer?.lastCheckupAt) return 0;

    try {
      // Handle both Firestore and serialized timestamp formats
      const seconds = data.customer.lastCheckupAt.seconds || data.customer.lastCheckupAt._seconds;
      if (!seconds) return 0;

      const lastCheckupDate = new Date(seconds * 1000);
      if (isNaN(lastCheckupDate.getTime())) return 0;

      const daysSince = differenceInDays(new Date(), lastCheckupDate);
      return Math.max(0, 30 - daysSince);
    } catch {
      return 0;
    }
  };

  const handleNewCheckup = () => {
    if (canCreateNewCheckup()) {
      router.push(`/checkup?cid=${data.customer.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <div className="text-lg text-slate-600">Загрузка...</div>
        </div>
      </div>
    );
  }

  const daysUntilNext = getDaysUntilNextCheckup();
  const canCheckup = canCreateNewCheckup();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Clinic Info */}
            <div className="flex items-center gap-4">
              {data?.clinic?.logoUrl && (
                <img
                  src={data.clinic.logoUrl}
                  alt="Clinic"
                  className="h-12 w-auto object-contain"
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {data?.clinic?.name || 'Личный кабинет'}
                </h1>
                <p className="text-sm text-slate-500">{data?.customer?.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Skin Score Summary */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="grid md:grid-cols-[1fr_auto] gap-8 mb-6">
            {/* Left: Skin Type */}
            <div>
              <div className="text-sm text-slate-500 mb-1">Ваш тип кожи</div>
              <div className="text-3xl font-bold text-slate-900">
                {data?.latestCheckup?.analysisResult?.profile?.skinType || 'Пройдите первый чекап'}
              </div>
            </div>

            {/* Right: Score Circle */}
            <div className="flex items-center justify-center">
              <ScoreCircle
                score={Number(data?.latestCheckup?.analysisResult?.profile?.skin_score ?? data?.latestCheckup?.analysisResult?.profile?.skinScore ?? 0)}
                size="medium"
                showLabel={false}
              />
            </div>
          </div>

          <SkinScoreChart history={data?.checkupHistory || []} />
        </div>

        {/* Latest Recommendation */}
        {data?.latestCheckup?.analysisResult?.closingAdvice && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-sm border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Рекомендация специалиста</h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {data.latestCheckup.analysisResult.closingAdvice}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Checkup History */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">История чекапов</h2>

            {canCheckup ? (
              <button
                onClick={handleNewCheckup}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Новый чекап
              </button>
            ) : (
              <div className="text-right">
                <button
                  disabled
                  className="flex items-center gap-2 bg-slate-100 text-slate-400 px-6 py-3 rounded-xl font-bold cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  Новый чекап
                </button>
                <p className="text-xs text-slate-500 mt-2">
                  Доступен через {daysUntilNext} {daysUntilNext === 1 ? 'день' : 'дней'}
                </p>
              </div>
            )}
          </div>

          {/* Availability Notice */}
          {!canCheckup && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                <span className="font-bold">Новый чекап будет доступен:</span>
                <br />
                • Через {daysUntilNext} {daysUntilNext === 1 ? 'день' : 'дней'} (спустя 30 дней с последнего чекапа)
                <br />
                • Или после прохождения процедуры в клинике
              </p>
            </div>
          )}

          {/* History List */}
          {data?.checkupHistory?.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔬</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                У вас пока нет чекапов
              </h3>
              <p className="text-slate-600 mb-6">
                Пройдите первый чекап, чтобы узнать состояние вашей кожи
              </p>
              <button
                onClick={handleNewCheckup}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                Пройти первый чекап
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.checkupHistory?.map((checkup: any) => (
                <CheckupHistoryCard key={checkup.id} checkup={checkup} />
              ))}
            </div>
          )}
        </div>

        {/* Treatment Plan */}
        <TreatmentPlanWidget treatmentPlan={data?.customer?.treatmentPlan || []} />
      </main>
    </div>
  );
}
