// Phone Authentication Form Component
// Two-step flow: phone input → SMS code verification

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SMSCodeInput from './SMSCodeInput';
import { normalizePhone, type SupportedCountry } from '@/lib/phone';
import type { Locale } from '@/lib/i18n';
import { getMessages } from '@/lib/i18n/messages';

interface PhoneAuthFormProps {
  clinicId: string;
  defaultPhoneCountry?: SupportedCountry;
  locale?: Locale;
  title?: string;
  subtitle?: string;
  onSuccess?: (payload: { customerId?: string; phone: string; phoneCountry: SupportedCountry; sessionToken: string }) => void;
}

export default function PhoneAuthForm({
  clinicId,
  defaultPhoneCountry = 'AE',
  locale = 'en-US',
  title,
  subtitle,
  onSuccess
}: PhoneAuthFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'code' | 'password'>('phone');
  const [phoneCountry, setPhoneCountry] = useState<SupportedCountry>(defaultPhoneCountry);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const messages = getMessages(locale);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  const checkExistingCustomer = async (phoneNumberE164: string): Promise<boolean> => {
    try {
      const query = new URLSearchParams({
        phone: phoneNumberE164,
        clinicId,
        phoneCountry
      });
      const res = await fetch(`/api/portal/check-customer?${query.toString()}`);
      const data = await res.json();
      
      if (data.exists && data.hasPassword) {
        setStep('password');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to check customer:', err);
      return false;
    }
  };

  const handleRequestCode = async () => {
    let normalized;
    try {
      normalized = normalizePhone(phone, phoneCountry);
    } catch (e: any) {
      setError(e?.message || messages.invalidPhone);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if customer already has a password
      const hasPassword = await checkExistingCustomer(normalized.phoneE164);
      if (hasPassword) {
        setLoading(false);
        return;
      }

      const res = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized.phoneE164, clinicId, phoneCountry })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || messages.connectionError);
        return;
      }

      setStep('code');
      setResendCooldown(60); // 60 seconds cooldown

      // Start countdown
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(messages.connectionError);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (password.length < 4) {
      setError(messages.enterPasswordError);
      return;
    }

    let normalized;
    try {
      normalized = normalizePhone(phone, phoneCountry);
    } catch (e: any) {
      setError(e?.message || messages.invalidPhone);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized.phoneE164, phoneCountry, password, clinicId })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || messages.invalidPassword);
        return;
      }

      // Save session token to localStorage
      localStorage.setItem('customerSession', data.token);

      if (onSuccess) {
        onSuccess({ customerId: data.customer.id, phone: normalized.phoneE164, phoneCountry, sessionToken: data.token });
      } else {
        router.push('/portal');
      }
    } catch (err) {
      setError(messages.connectionError);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (code: string) => {
    let normalized;
    try {
      normalized = normalizePhone(phone, phoneCountry);
    } catch (e: any) {
      setError(e?.message || messages.invalidPhone);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized.phoneE164, phoneCountry, code, clinicId })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || messages.invalidCode);
        return;
      }

      // Save session token to localStorage
      localStorage.setItem('customerSession', data.sessionToken);

      // Success callback or redirect
      if (onSuccess) {
        onSuccess({ customerId: data.customerId, phone: normalized.phoneE164, phoneCountry, sessionToken: data.sessionToken });
      } else {
        router.push('/portal');
      }
    } catch (err) {
      setError(messages.connectionError);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    setStep('phone');
    setError('');
  };

  if (step === 'password') {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
          {messages.passwordTitle}
        </h2>

        <p className="text-slate-600 text-center mb-8">
          {messages.passwordSubtitle}
        </p>

        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            {messages.passwordLabel}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="******"
            className="w-full px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={handlePasswordLogin}
          disabled={loading || password.length < 4}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all mb-4"
        >
          {loading ? messages.loggingIn : messages.loginButton}
        </button>

        <div className="text-center space-y-2">
          <button
            onClick={async () => {
                setLoading(true);
                try {
                    let normalized;
                    try {
                      normalized = normalizePhone(phone, phoneCountry);
                    } catch (e: any) {
                      setError(e?.message || messages.invalidPhone);
                      return;
                    }

                    const res = await fetch('/api/portal/reset-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone: normalized.phoneE164, clinicId, phoneCountry })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        setError(messages.forgotPasswordSent);
                    } else {
                        setError(data.error || messages.connectionError);
                    }
                } catch (err) {
                    setError(messages.connectionError);
                } finally {
                    setLoading(false);
                }
            }}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-700 font-bold disabled:opacity-50 block w-full"
          >
            {messages.forgotPasswordButton}
          </button>

          <button
            onClick={handleResendCode}
            disabled={loading}
            className="text-sm text-slate-500 hover:text-slate-700 block w-full"
          >
            {messages.changePhoneButton}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
          {messages.codeTitle}
        </h2>

        <p className="text-slate-600 text-center mb-8">
          {messages.codeSubtitle(phone)}
        </p>

        <SMSCodeInput onComplete={handleVerifyCode} disabled={loading} />

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <div className="mt-6 text-center space-y-2">
          {resendCooldown > 0 ? (
            <p className="text-sm text-slate-500">
              {messages.resendInSeconds(resendCooldown)}
            </p>
          ) : (
            <button
              onClick={handleRequestCode}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-700 font-bold disabled:opacity-50"
            >
              {messages.resendCodeButton}
            </button>
          )}

          <button
            onClick={handleResendCode}
            disabled={loading}
            className="text-sm text-slate-500 hover:text-slate-700 block w-full"
          >
            {messages.changePhoneButton}
          </button>
        </div>
      </div>
    );
  }

  const isPhoneValid = (() => {
    try {
      normalizePhone(phone, phoneCountry);
      return true;
    } catch {
      return false;
    }
  })();

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
        {title || messages.portalLoginTitle}
      </h2>

      <p className="text-slate-600 text-center mb-8">
        {subtitle || messages.portalLoginSubtitle}
      </p>

      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-700 mb-2">{messages.phoneLabel}</label>
        <div className="flex gap-3">
          <select
            value={phoneCountry}
            onChange={(e) => setPhoneCountry(e.target.value as SupportedCountry)}
            className="w-28 px-3 py-3 text-sm border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
            disabled={loading}
          >
            <option value="RU">RU</option>
            <option value="AE">AE</option>
          </select>
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder={phoneCountry === 'AE' ? '+971 50 123 4567' : '+7 911 123 4567'}
            className="flex-1 px-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      <button
        onClick={handleRequestCode}
        disabled={loading || !isPhoneValid}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? messages.sendingCode : messages.requestCodeButton}
      </button>

      <p className="text-xs text-slate-500 text-center mt-4">
        {messages.unlockConsent}
      </p>
    </div>
  );
}
