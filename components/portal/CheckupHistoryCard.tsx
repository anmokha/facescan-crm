// Checkup History Card Component
// Displays a single checkup in the history list

'use client';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { Calendar, TrendingUp } from 'lucide-react';

interface CheckupHistoryCardProps {
  checkup: any;
}

export default function CheckupHistoryCard({ checkup }: CheckupHistoryCardProps) {
  const router = useRouter();

  // Safe date formatting with validation
  let date = 'Неизвестная дата';
  if (checkup.createdAt) {
    try {
      // Handle both Firestore format (.seconds) and serialized format (._seconds)
      const seconds = checkup.createdAt.seconds || checkup.createdAt._seconds;
      if (seconds && typeof seconds === 'number') {
        const timestamp = new Date(seconds * 1000);
        if (!isNaN(timestamp.getTime())) {
          date = format(timestamp, 'd MMMM yyyy', { locale: ru });
        }
      } else {
        console.warn('Checkup with invalid timestamp format:', checkup.id, checkup.createdAt);
      }
    } catch (error) {
      console.error('Invalid date in checkup:', checkup.id, error);
    }
  }

  const profile = checkup.analysisResult?.profile || {};
  const skinScore = Number(profile.skin_score ?? profile.skinScore ?? 0);
  const skinType = profile.skinType || 'Не определен';

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div
      onClick={() => router.push(`/portal/checkup/${checkup.id}`)}
      className="flex items-center justify-between p-6 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-blue-200 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        {/* Date Badge */}
        <div className="bg-blue-50 p-4 rounded-xl">
          <Calendar className="w-6 h-6 text-blue-600" />
        </div>

        {/* Info */}
        <div>
          <div className="font-bold text-slate-900 text-lg">{date}</div>
          <div className="text-sm text-slate-600 mt-1 flex items-center gap-2">
            <span>{skinType}</span>
            <span className="text-slate-300">•</span>
            <span className={`font-bold ${getScoreColor(skinScore)}`}>
              Score: {skinScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
        Подробнее →
      </div>
    </div>
  );
}
