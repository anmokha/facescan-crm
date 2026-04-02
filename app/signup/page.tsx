'use client'

import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/diagnostic/firebaseConfig'
import { useRouter } from 'next/navigation'
import { Lock, Mail, UserPlus } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await createUserWithEmailAndPassword(auth, email, password)
      router.push('/onboarding')
    } catch (err: any) {
      console.error(err)
      if (err.code === 'auth/email-already-in-use') {
          setError('This email is already registered')
      } else if (err.code === 'auth/weak-password') {
          setError('Password must be at least 6 characters')
      } else {
          setError('Registration error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 mb-4 text-white font-bold text-xl">
                <UserPlus size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Clinic Registration</h1>
            <p className="text-slate-500 text-sm mt-2">Create an account to access CureScan</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="email" 
                        required
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="admin@clinic.com"
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
                {loading ? 'Creating account...' : 'Sign Up'}
            </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <a href="/login" className="text-blue-600 font-bold hover:underline">Log In</a>
        </div>
      </div>
    </div>
  )
}
