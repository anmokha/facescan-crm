'use client'

import React, { useState } from 'react'
import { X, Mail, Sparkles, Loader2, CheckCircle2, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ExitOfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (email: string) => Promise<void>;
    locale?: string;
}

export default function ExitOfferModal({ isOpen, onClose, onSuccess, locale = 'en-US' }: ExitOfferModalProps) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const isAr = locale === 'ar-AE'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        
        setLoading(true)
        try {
            await onSuccess(email)
            setSubmitted(true)
            setTimeout(() => {
                onClose()
            }, 3000)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
                        dir={isAr ? 'rtl' : 'ltr'}
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-10" />
                        
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors bg-white/50 rounded-full"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 pt-12 text-center">
                            {!submitted ? (
                                <>
                                    <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <Mail className="text-indigo-600" size={40} />
                                    </div>

                                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 tracking-tight">
                                        {isAr ? 'انتظر! لا تفقد نتائجك' : "Wait! Don't lose your results"}
                                    </h3>
                                    
                                    <p className="text-slate-500 mb-8 text-lg leading-relaxed">
                                        {isAr 
                                            ? 'أدخل بريدك الإلكتروني للحصول على تقرير كامل عن فحص بشرتك بالذكاء الاصطناعي مجانًا.' 
                                            : "Enter your email to get your full AI Skin Report delivered to your inbox for free."}
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                                <Mail size={20} />
                                            </div>
                                            <input 
                                                type="email"
                                                required
                                                placeholder={isAr ? 'البريد الإلكتروني' : "Your email address"}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 font-medium"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || !email}
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50 group"
                                        >
                                            {loading ? (
                                                <Loader2 className="animate-spin" size={24} />
                                            ) : (
                                                <>
                                                    <Sparkles size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                                                    <span>{isAr ? 'أرسل التقرير' : "Send My Full Report"}</span>
                                                    <ArrowRight size={20} className={isAr ? 'rotate-180' : ''} />
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    <p className="mt-6 text-xs text-slate-400 font-medium uppercase tracking-widest">
                                        No spam. Just your personalized results.
                                    </p>
                                </>
                            ) : (
                                <div className="py-12 animate-in fade-in zoom-in duration-500">
                                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="text-emerald-600" size={48} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                        {isAr ? 'تم الإرسال بنجاح!' : "Sent successfully!"}
                                    </h3>
                                    <p className="text-slate-500">
                                        {isAr 
                                            ? 'افحص بريدك الإلكتروني (بما في ذلك الرسائل غير المرغوب فيها) للحصول على تقريرك.' 
                                            : "Check your inbox (and spam) for your detailed report."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
