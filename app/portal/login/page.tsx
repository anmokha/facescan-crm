'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Phone, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';

export default function PortalLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clinicId = searchParams.get('client') || 'default';
  const captchaRef = useRef<ReCAPTCHA>(null);

  const [step, setStep] = useState<'phone' | 'password' | 'reset' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ============ STEP 1: CHECK IF CUSTOMER EXISTS ============
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/portal/check-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, clinicId })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка проверки номера');
        setLoading(false);
        return;
      }

      if (!data.exists) {
        // Customer doesn't exist → redirect to checkup
        setError('Номер не найден. Сначала пройдите чекап.');
        setTimeout(() => {
          router.push(`/checkup?client=${clinicId}`);
        }, 2000);
        return;
      }

      if (!data.hasPassword) {
        // Edge case: customer exists but no password
        setError('Ваш аккаунт требует обновления. Пройдите чекап снова.');
        setTimeout(() => {
          router.push(`/checkup?client=${clinicId}`);
        }, 2000);
        return;
      }

      // Customer exists with password → show password form
      setStep('password');
    } catch (err) {
      console.error('Phone check error:', err);
      setError('Ошибка подключения. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // ============ STEP 2: LOGIN WITH PASSWORD ============
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, clinicId })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Неверный пароль');
        setLoading(false);
        return;
      }

      // Save session token
      localStorage.setItem('customerSession', data.token);

      // Redirect to portal
      router.push('/portal');
    } catch (err) {
      console.error('Login error:', err);
      setError('Ошибка подключения. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // ============ STEP 3: RESET PASSWORD ============
  const handleResetPassword = () => {
    setStep('reset');
    setError('');
    setCaptchaToken(null);
  };

  const handleResetSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/portal/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone, 
          captchaToken,
          clinicId 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Ошибка сброса пароля');
        // Reset captcha on error
        captchaRef.current?.reset();
        setCaptchaToken(null);
        setLoading(false);
        return;
      }

      setSuccessMessage(data.message || 'Новый пароль отправлен в SMS');
      setStep('success');
    } catch (err) {
      console.error('Reset error:', err);
      setError('Ошибка подключения. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // ============ UI RENDER ============
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6 text-slate-900">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {step === 'success' ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <Lock className="w-8 h-8 text-white" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {step === 'success' ? 'Готово!' : 'Вход в личный кабинет'}
          </h1>
          <p className="text-slate-600">
            {step === 'phone' && 'Введите номер телефона'}
            {step === 'password' && 'Введите пароль'}
            {step === 'reset' && 'Восстановление пароля'}
            {step === 'success' && 'Пароль отправлен'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* FORM: PHONE NUMBER */}
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Номер телефона
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 999 123-45-67"
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:bg-slate-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Проверка...
                </>
              ) : (
                <>
                  Продолжить
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* FORM: PASSWORD */}
        {step === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:bg-slate-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Вход...
                </>
              ) : (
                'Войти'
              )}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-blue-600 hover:text-blue-700 text-sm font-bold"
              >
                Забыли пароль?
              </button>
            </div>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-slate-600 hover:text-slate-900 text-sm"
            >
              ← Другой номер
            </button>
          </form>
        )}

        {/* FORM: RESET PASSWORD */}
        {step === 'reset' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 mb-4">
              Новый пароль будет отправлен на номер <strong>{phone}</strong> SMS сообщением.
            </p>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 mb-4">
              <strong>Внимание:</strong> Стоимость SMS - 4₽. Функция защищена от злоупотреблений.
            </div>

            <div className="flex justify-center mb-4 overflow-hidden">
               <ReCAPTCHA
                 ref={captchaRef}
                 sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
                 onChange={(token) => setCaptchaToken(token)}
                 onExpired={() => setCaptchaToken(null)}
               />
            </div>

            <button
              onClick={handleResetSubmit}
              disabled={loading || !captchaToken}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:bg-slate-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Отправка...
                </>
              ) : (
                'Отправить новый пароль'
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('password')}
              className="w-full text-slate-600 hover:text-slate-900 text-sm"
            >
              ← Назад ко вводу пароля
            </button>
          </div>
        )}

        {/* STEP: SUCCESS */}
        {step === 'success' && (
          <div className="space-y-6 text-center">
            <p className="text-slate-700">
              {successMessage}
            </p>
            
            <button
              onClick={() => setStep('password')}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
            >
              Вернуться ко входу
            </button>
          </div>
        )}
      </div>
    </div>
  );
}