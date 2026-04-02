'use client'

import React, { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/diagnostic/firebaseConfig'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Mail, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // View State: 'login' | 'reset'
  const [view, setView] = useState<'login' | 'reset'>('login')
  const [resetSent, setResetSent] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const isAdminHost = typeof window !== 'undefined' && window.location.hostname.startsWith('admin.');
  const defaultRedirect = isAdminHost ? '/admin' : '/dashboard';
  const redirectTo = searchParams.get('redirect') || defaultRedirect

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      const idToken = await user.getIdToken()
      const idTokenResult = await user.getIdTokenResult()
      const isAdmin = idTokenResult.claims.admin === true

      if (isAdmin) {
        try {
          const response = await fetch('/api/auth/create-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          })

          if (!response.ok) throw new Error('Failed to create session')
        } catch (sessionError: any) {
          console.error('Session creation failed:', sessionError)
        }
      }

      router.push(redirectTo)

    } catch (err: any) {
      console.error('Login error:', err)
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Try again later.')
      } else {
        setError(err.message || 'Login error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) {
          setError('Enter email');
          return;
      }
      setLoading(true);
      setError('');
      try {
          await sendPasswordResetEmail(auth, email);
          setResetSent(true);
      } catch (err: any) {
          if (err.code === 'auth/user-not-found') {
              // For security, don't reveal if user exists, just say sent (or maybe reveal if UX preference)
              // But standard is usually to be vague. However, for a SaaS tool, precise error helps.
              setError('User with this email not found');
          } else {
              setError(err.message || 'Reset error');
          }
      } finally {
          setLoading(false);
      }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 mb-4 text-white font-bold text-xl">
                CS
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
                {view === 'login' ? 'Clinic Login' : 'Password Reset'}
            </h1>
            <p className="text-slate-500 text-sm mt-2">
                {view === 'login' ? 'Enter your credentials to access' : 'We\'ll send you a reset link'}
            </p>
        </div>

        {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="email" 
                            required
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="clinic@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="password" 
                            required
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center font-medium">
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? 'Logging in...' : 'Log In'}
                </button>
                
                <div className="mt-6 text-center">
                    <button 
                        type="button" 
                        onClick={() => { setView('reset'); setError(''); }}
                        className="text-sm text-slate-400 hover:text-slate-600"
                    >
                        Forgot password?
                    </button>
                </div>
            </form>
        ) : (
            <form onSubmit={handleReset} className="space-y-6">
                 {resetSent ? (
                     <div className="text-center bg-green-50 p-6 rounded-xl border border-green-100 mb-6">
                         <div className="text-green-600 font-bold mb-2">Link sent!</div>
                         <p className="text-sm text-green-700">Check your email {email} and follow instructions.</p>
                     </div>
                 ) : (
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="email" 
                                required
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="clinic@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                     </div>
                 )}

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center font-medium">
                        {error}
                    </div>
                )}

                {!resetSent && (
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-70"
                    >
                        {loading ? 'Sending...' : 'Reset Password'}
                    </button>
                )}

                <div className="mt-6 text-center">
                    <button 
                        type="button" 
                        onClick={() => { setView('login'); setError(''); setResetSent(false); }}
                        className="text-sm text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2 mx-auto"
                    >
                        <ArrowLeft size={16} /> Back to Login
                    </button>
                </div>
            </form>
        )}
      </div>
    </div>
  )
}
