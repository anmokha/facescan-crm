// Portal Login Modal Component
// Modal wrapper for PhoneAuthForm to access portal from checkup page

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import PhoneAuthForm from '@/components/auth/PhoneAuthForm';
import type { Locale } from '@/lib/i18n';

interface PortalLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicId: string;
  locale?: Locale;
}

export default function PortalLoginModal({ isOpen, onClose, clinicId, locale }: PortalLoginModalProps) {
  const router = useRouter();

  // Check if user already has a session when modal opens
  useEffect(() => {
    if (isOpen) {
      const sessionToken = localStorage.getItem('customerSession');
      if (sessionToken) {
        // User already logged in, redirect to portal
        router.push('/portal');
      }
    }
  }, [isOpen, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white hover:text-slate-200 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* PhoneAuthForm will handle the login flow and redirect to /portal */}
        <PhoneAuthForm clinicId={clinicId} locale={locale} />
      </div>
    </div>
  );
}
