'use client'

import React from 'react'

interface SkinScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showPulse?: boolean
}

export default function SkinScoreBadge({
  score,
  size = 'md',
  showPulse = true
}: SkinScoreBadgeProps) {
  const getColor = (score: number) => {
    if (score >= 80) return {
      bg: 'bg-emerald-500',
      text: 'text-emerald-50',
      pulse: 'bg-emerald-400',
      ring: 'ring-emerald-400/20'
    }
    if (score >= 60) return {
      bg: 'bg-green-500',
      text: 'text-green-50',
      pulse: 'bg-green-400',
      ring: 'ring-green-400/20'
    }
    if (score >= 40) return {
      bg: 'bg-amber-500',
      text: 'text-amber-50',
      pulse: 'bg-amber-400',
      ring: 'ring-amber-400/20'
    }
    return {
      bg: 'bg-rose-500',
      text: 'text-rose-50',
      pulse: 'bg-rose-400',
      ring: 'ring-rose-400/20'
    }
  }

  const sizeClasses = {
    sm: {
      container: 'w-12 h-12',
      text: 'text-sm',
      ping: 'w-12 h-12'
    },
    md: {
      container: 'w-16 h-16',
      text: 'text-lg',
      ping: 'w-16 h-16'
    },
    lg: {
      container: 'w-24 h-24',
      text: 'text-3xl',
      ping: 'w-24 h-24'
    }
  }

  const colors = getColor(score)
  const sizes = sizeClasses[size]

  return (
    <div className="relative inline-flex">
      {showPulse && (
        <div
          className={`
            absolute inset-0
            rounded-full
            ${colors.pulse}
            opacity-75
            animate-ping
            ${sizes.ping}
          `}
        />
      )}
      <div
        className={`
          relative
          rounded-full
          ${colors.bg}
          ${colors.text}
          ${colors.ring}
          ring-8
          font-bold
          font-golos
          flex items-center justify-center
          ${sizes.container}
          ${sizes.text}
          shadow-lg
        `}
      >
        {score}
      </div>
    </div>
  )
}
