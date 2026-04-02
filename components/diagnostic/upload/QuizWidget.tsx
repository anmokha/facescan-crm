import React, { useState, useEffect } from 'react'
import { MessageCircle, ChevronRight, X, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GeneratedQuiz } from '@/lib/diagnostic/types'

interface QuizWidgetProps {
  isVisible: boolean;
  onClose: () => void;
  onQuizSubmit: (answers: any, email: string) => Promise<void>;
  quizData?: GeneratedQuiz;
}

export default function QuizWidget({ isVisible, onClose, onQuizSubmit, quizData }: QuizWidgetProps) {
  const [step, setStep] = useState<'question' | 'email' | 'success'>('question')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isVisible || !quizData) return null

  const questions = [
      { key: 'confirmation', ...quizData.confirmation_question },
      { key: 'preference', ...quizData.preference_question },
      { key: 'budget', ...quizData.budget_intent_question }
  ]
  const currentQ = questions[currentQuestionIndex]

  const handleAnswer = (option: string) => {
      setAnswers(prev => ({ ...prev, [currentQ.key]: option }))
      if (currentQuestionIndex < 2) {
          setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 300)
      } else {
          setTimeout(() => setStep('email'), 300)
      }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      await onQuizSubmit(answers, email)
      setIsSubmitting(false)
      setStep('success')
      setTimeout(onClose, 3000)
  }

  return (
    <AnimatePresence>
        <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 right-4 z-50 w-full max-w-sm p-4"
        >
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center relative">
                            <div className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full border-2 border-slate-900" />
                            <MessageCircle size={16} className="text-white" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ваш эксперт</div>
                            <div className="text-sm font-bold text-white leading-none">CureScan AI</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5">
                    {step === 'question' && (
                        <motion.div 
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <p className="text-slate-900 font-bold mb-4 leading-tight">
                                {currentQ.question}
                            </p>
                            <div className="space-y-2">
                                {currentQ.options.map((opt, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => handleAnswer(opt)}
                                        className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-slate-100 hover:border-cyan-200 transition-all text-sm font-medium text-slate-700 hover:text-cyan-900 flex items-center justify-between group"
                                    >
                                        {opt}
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-cyan-500" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 'email' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="flex justify-center mb-4">
                                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                                    <Mail size={24} />
                                </div>
                            </div>
                            <h4 className="text-center font-bold text-slate-900 mb-2">Куда отправить карту?</h4>
                            <p className="text-center text-xs text-slate-500 mb-4">
                                Я сохранила ваши ответы и обновила рекомендации.
                            </p>
                            <form onSubmit={handleEmailSubmit} className="space-y-3">
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-all disabled:opacity-70"
                                >
                                    {isSubmitting ? 'Отправка...' : 'Получить PDF'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-4">
                            <div className="text-4xl mb-2">✨</div>
                            <h4 className="font-bold text-slate-900">Отправлено!</h4>
                            <p className="text-xs text-slate-500">Проверьте почту через минуту.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    </AnimatePresence>
  )
}
