'use client';

import React from 'react';
import { User } from 'lucide-react';
import type { Locale } from '@/lib/i18n';

interface HeaderProps {
  clientName?: string;
  onPortalClick?: () => void;
  portalLabel?: string;
  languageLabel?: string;
  locale?: Locale;
  locales?: Locale[];
  onLocaleChange?: (locale: Locale) => void;
}

const Header: React.FC<HeaderProps> = ({
  clientName = "CureScan",
  onPortalClick,
  portalLabel = 'My portal',
  languageLabel = 'Language',
  locale,
  locales,
  onLocaleChange
}) => {
  const showLocaleSwitcher = false // Force hidden for demo

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50 transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-xl font-bold text-stone-800 tracking-tight truncate max-w-[220px] sm:max-w-[360px]">
            {clientName}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {showLocaleSwitcher && (
            <select
              value={locale}
              onChange={(e) => onLocaleChange?.(e.target.value as Locale)}
              className="px-3 py-2 text-sm border border-stone-200 rounded-xl bg-white text-stone-700 font-semibold"
              aria-label={languageLabel}
            >
              {locales?.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          )}

          {/* Portal Login Button */}
          <button
            onClick={onPortalClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold transition-all text-sm"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{portalLabel}</span>
          </button>

          {/* Contact shortcuts can be added here per-clinic (WhatsApp/tel) once configured */}
        </div>
      </div>
    </header>
  );
};

export default Header;
