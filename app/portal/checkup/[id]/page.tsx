// Customer Portal - Checkup Detail View
// Shows detailed analysis results for a specific checkup

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ScoreCircle from '@/components/diagnostic/ScoreCircle';
import ZoneProgress from '@/components/diagnostic/ZoneProgress';
import CheckupDetailView from '@/components/portal/CheckupDetailView';

export default function CheckupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [checkup, setCheckup] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCheckupData();
  }, [leadId]);

  const loadCheckupData = async () => {
    const sessionToken = localStorage.getItem('customerSession');

    if (!sessionToken) {
      router.push('/checkup');
      return;
    }

    try {
      // Get portal data to verify ownership
      const portalRes = await fetch('/api/portal/me', {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });

      if (!portalRes.ok) {
        router.push('/checkup');
        return;
      }

      const portalData = await portalRes.json();

      // Find checkup in history
      const checkupData = portalData.checkupHistory.find((c: any) => c.id === leadId);

      if (!checkupData) {
        setError('Чекап не найден');
        return;
      }

      setCheckup(checkupData);
    } catch (err) {
      console.error('Failed to load checkup:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
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

  if (error || !checkup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{error || 'Чекап не найден'}</h2>
          <button
            onClick={() => router.push('/portal')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700"
          >
            Вернуться в портал
          </button>
        </div>
      </div>
    );
  }

  // Safe date formatting
  let date = 'Неизвестная дата';
  if (checkup.createdAt) {
    try {
      // Handle both Firestore format (.seconds) and serialized format (._seconds)
      const seconds = checkup.createdAt.seconds || checkup.createdAt._seconds;
      if (seconds && typeof seconds === 'number') {
        const timestamp = new Date(seconds * 1000);
        if (!isNaN(timestamp.getTime())) {
          date = format(timestamp, 'd MMMM yyyy, HH:mm', { locale: ru });
        }
      }
    } catch (error) {
      console.error('Invalid date in checkup detail:', checkup.id, error);
    }
  }

  const profile = checkup.analysisResult?.profile || {};
  const skinScore = Number(profile.skin_score ?? profile.skinScore ?? 0);
  const skinType = profile.skinType || profile.skin_type || null;
  const visualAge = profile.visual_age || checkup.analysisResult?.hidden_analysis?.estimated_visual_age || null;
  const zoneProgress = checkup.analysisResult?.comparison?.zoneProgress || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push('/portal')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">Назад в портал</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header Summary with Circle */}
        <div className="text-center mb-10">
          <div className="flex flex-col items-center justify-center mb-6">
            {/* Score Circle */}
            <ScoreCircle score={skinScore} size="large" showLabel={true} />

            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-2 mt-6 tracking-tight">
              Карта состояния вашей кожи
            </h2>

            <p className="text-slate-600 mb-4">{date}</p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
              {skinType && (
                <p className="text-lg text-slate-600 font-medium">
                  Тип кожи: <span className="text-slate-900 font-bold">{skinType}</span>
                </p>
              )}
              {visualAge && (
                <p className="text-lg text-slate-600 font-medium">
                  Визуальный возраст: <span className="text-slate-900 font-bold">{visualAge} лет</span>
                </p>
              )}
            </div>
          </div>

          {/* Zone Progress */}
          {zoneProgress && zoneProgress.length > 0 && (
            <div className="mx-auto max-w-3xl mt-8 mb-8">
              <ZoneProgress zoneProgress={zoneProgress} />
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {checkup.analysisResult && (
          <CheckupDetailView result={checkup.analysisResult} />
        )}
      </main>
    </div>
  );
}
