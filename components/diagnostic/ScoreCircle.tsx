// Reusable Score Circle Component
// Displays circular progress indicator with gradient

'use client';

interface ScoreCircleProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export default function ScoreCircle({ score, size = 'large', showLabel = true }: ScoreCircleProps) {
  // Size configurations
  const sizeConfig = {
    small: {
      width: 'w-24 h-24',
      circleSize: 48,
      radius: 40,
      strokeWidth: 6,
      fontSize: 'text-3xl',
      labelSize: 'text-[8px]'
    },
    medium: {
      width: 'w-32 h-32',
      circleSize: 64,
      radius: 55,
      strokeWidth: 7,
      fontSize: 'text-4xl',
      labelSize: 'text-[9px]'
    },
    large: {
      width: 'w-40 h-40',
      circleSize: 80,
      radius: 70,
      strokeWidth: 8,
      fontSize: 'text-6xl',
      labelSize: 'text-[10px]'
    }
  };

  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.radius;
  const dashOffset = circumference - (circumference * score) / 100;

  // Determine status based on score
  const getStatus = (score: number) => {
    if (score >= 85) return {
      from: '#10b981',
      to: '#059669',
      label: 'Отличное состояние',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700'
    };
    if (score >= 70) return {
      from: '#3b82f6',
      to: '#2563eb',
      label: 'Хорошее состояние',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700'
    };
    if (score >= 55) return {
      from: '#f59e0b',
      to: '#d97706',
      label: 'Требует внимания',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700'
    };
    return {
      from: '#ef4444',
      to: '#dc2626',
      label: 'Нуждается в уходе',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700'
    };
  };

  const status = getStatus(score);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Score Circle */}
      <div className={`relative ${config.width} flex items-center justify-center mb-4`}>
        <svg className="w-full h-full transform -rotate-90 drop-shadow-xl">
          <circle
            cx={config.circleSize}
            cy={config.circleSize}
            r={config.radius}
            stroke="#f1f5f9"
            strokeWidth={config.strokeWidth}
            fill="transparent"
          />
          <circle
            cx={config.circleSize}
            cy={config.circleSize}
            r={config.radius}
            stroke="url(#score-gradient)"
            strokeWidth={config.strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-1500 ease-out"
          />
          <defs>
            <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={status.from} />
              <stop offset="100%" stopColor={status.to} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          {showLabel && (
            <span className={`text-slate-400 ${config.labelSize} font-bold uppercase tracking-widest mb-1`}>
              Score
            </span>
          )}
          <span className={`${config.fontSize} font-bold text-slate-900 tracking-tighter leading-none`}>
            {score}
          </span>
        </div>
      </div>

      {/* Status Badge (optional for small size) */}
      {size !== 'small' && (
        <div className={`px-4 py-2 rounded-2xl border shadow-sm ${status.bg} ${status.border}`}>
          <span className={`text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${status.text}`}>
            <span
              className={`w-2 h-2 rounded-full ${score < 80 ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: status.from }}
            />
            {status.label}
          </span>
        </div>
      )}
    </div>
  );
}
