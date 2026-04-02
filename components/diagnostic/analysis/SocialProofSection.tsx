'use client'

import React, { useState, useEffect } from 'react'
import { Star, Instagram, ExternalLink, Loader2, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SocialContent } from '@/lib/diagnostic/types'

interface SocialProofSectionProps {
  clinicId: string
  procedure?: string | null
  locale?: string
}

export default function SocialProofSection({ clinicId, procedure, locale = 'en-US' }: SocialProofSectionProps) {
  const [reviews, setReviews] = useState<SocialContent[]>([])
  const [posts, setPosts] = useState<SocialContent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!clinicId) return
      try {
        const url = `/api/social-content?clinicId=${clinicId}${procedure ? `&procedure=${encodeURIComponent(procedure)}` : ''}`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setReviews(data.reviews || [])
          setPosts(data.posts || [])
        }
      } catch (e) {
        console.error('Failed to fetch social proof:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [clinicId, procedure])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-slate-300" size={32} />
      </div>
    )
  }

  if (reviews.length === 0 && posts.length === 0) {
    return null
  }

  return (
    <div className="space-y-12 mb-16">
      {/* Google Reviews */}
      {reviews.length > 0 && (
        <section className="bg-slate-50 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Patient Experiences</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Verified Google Reviews</p>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
              <Star className="fill-yellow-400 text-yellow-400" size={20} />
              <span className="font-black text-slate-900 text-lg">4.9</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((review, i) => (
              <motion.a
                key={review.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                href={review.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(review.rating || 5)].map((_, j) => (
                      <Star key={j} className="fill-yellow-400 text-yellow-400" size={14} />
                    ))}
                  </div>
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-4 italic line-clamp-4">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                    {review.author?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">{review.author}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{review.date}</div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </section>
      )}

      {/* Instagram Posts */}
      {posts.length > 0 && (
        <section className="px-2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                    <Instagram className="text-white" size={20} />
                </div>
                Real Results
              </h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Cases from our Instagram</p>
            </div>
            <a 
                href={`https://instagram.com/${posts[0].clinicId}`} // fallback
                target="_blank" 
                className="text-indigo-600 font-bold text-sm hover:underline"
            >
                Follow Us
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {posts.map((post, i) => (
              <motion.a
                key={post.id || i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square bg-slate-100 rounded-[2rem] relative overflow-hidden group shadow-lg shadow-slate-200/50"
              >
                {post.mediaUrl ? (
                    <img 
                        src={post.mediaUrl} 
                        alt={post.caption || 'Result'} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Instagram size={32} className="text-slate-300" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p className="text-white text-[10px] font-bold line-clamp-2 leading-tight">
                        {post.caption}
                    </p>
                </div>
              </motion.a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
