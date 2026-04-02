// Journey Page - Redirect to Customer Portal
// Old journey links now redirect to the new Customer Portal

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function JourneyRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Check if customer is authenticated
    const sessionToken = localStorage.getItem('customerSession');

    if (sessionToken) {
      // Authenticated - redirect to portal
      router.push('/portal');
    } else {
      // Not authenticated - redirect to checkup (will show login form)
      router.push('/checkup');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <div className="text-lg text-slate-600">Перенаправление на портал...</div>
      </div>
    </div>
  );
}
