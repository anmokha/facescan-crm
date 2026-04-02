import React from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Activity, Droplet, AlertCircle } from 'lucide-react';
import { DiagnosticType } from '@/lib/diagnostic/types';
import { DIAGNOSTIC_TYPES, DIAGNOSTIC_TYPE_IDS } from '@/config/diagnosticTypes';

interface DiagnosticTypeSwitcherProps {
  currentType: DiagnosticType;
  onTypeChange: (type: DiagnosticType) => void;
}

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Sparkles,
  Activity,
  Droplet,
  AlertCircle,
};

const DiagnosticTypeSwitcher: React.FC<DiagnosticTypeSwitcherProps> = ({
  currentType,
  onTypeChange,
}) => {
  const currentIndex = DIAGNOSTIC_TYPE_IDS.indexOf(currentType);
  const config = DIAGNOSTIC_TYPES[currentType];

  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? DIAGNOSTIC_TYPE_IDS.length - 1 : currentIndex - 1;
    onTypeChange(DIAGNOSTIC_TYPE_IDS[newIndex] as DiagnosticType);
  };

  const handleNext = () => {
    const newIndex = currentIndex === DIAGNOSTIC_TYPE_IDS.length - 1 ? 0 : currentIndex + 1;
    onTypeChange(DIAGNOSTIC_TYPE_IDS[newIndex] as DiagnosticType);
  };

  const IconComponent = ICON_MAP[config.icon] || Sparkles;

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 py-4 px-2">
      {/* Left Arrow */}
      <button
        onClick={handlePrevious}
        className="p-2 rounded-full hover:bg-stone-100 transition-colors flex-shrink-0"
        aria-label="Предыдущий тип диагностики"
      >
        <ChevronLeft size={20} className="text-stone-600" />
      </button>

      {/* Current Type Display */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 rounded-2xl bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 min-w-[200px] sm:min-w-[280px] justify-center transition-all duration-300">
        <div
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: config.colors.primary500 }}
        >
          <IconComponent size={18} className="text-white sm:w-5 sm:h-5" />
        </div>
        <h2 className="font-serif text-base sm:text-xl font-bold text-stone-800 whitespace-nowrap">
          {config.name}
        </h2>
      </div>

      {/* Right Arrow */}
      <button
        onClick={handleNext}
        className="p-2 rounded-full hover:bg-stone-100 transition-colors flex-shrink-0"
        aria-label="Следующий тип диагностики"
      >
        <ChevronRight size={20} className="text-stone-600" />
      </button>
    </div>
  );
};

export default DiagnosticTypeSwitcher;
