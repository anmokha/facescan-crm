'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ZoneProgressItem {
  zone: string
  metric: string
  percentChange: number
  description: string
}

interface ZoneProgressProps {
  zoneProgress: ZoneProgressItem[]
}

const zoneLabels: Record<string, string> = {
  forehead: 'Лоб',
  cheeks: 'Щёки',
  tzone: 'Т-зона',
  periorbital: 'Область глаз',
  chin: 'Подбородок',
  nasolabial: 'Носогубные складки'
}

const metricLabels: Record<string, string> = {
  wrinkles: 'Морщины',
  hydration: 'Увлажнённость',
  texture: 'Текстура',
  pores: 'Поры',
  firmness: 'Упругость',
  pigmentation: 'Пигментация'
}

export default function ZoneProgress({ zoneProgress }: ZoneProgressProps) {
  if (!zoneProgress || zoneProgress.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
        Прогресс по зонам лица
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {zoneProgress.map((item, idx) => {
          const isPositive = item.percentChange > 0
          const isNeutral = item.percentChange === 0

          return (
            <div
              key={idx}
              className={`rounded-xl p-4 border-2 transition-all hover:shadow-md ${
                isNeutral
                  ? 'bg-slate-50 border-slate-200'
                  : isPositive
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    {zoneLabels[item.zone] || item.zone}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {metricLabels[item.metric] || item.metric}
                  </p>
                </div>

                <div className={`flex items-center gap-1 font-bold text-lg ${
                  isNeutral
                    ? 'text-slate-600'
                    : isPositive
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                }`}>
                  {isNeutral ? (
                    <Minus size={18} />
                  ) : isPositive ? (
                    <TrendingUp size={18} />
                  ) : (
                    <TrendingDown size={18} />
                  )}
                  <span>{Math.abs(item.percentChange)}%</span>
                </div>
              </div>

              <p className={`text-sm font-medium ${
                isNeutral
                  ? 'text-slate-700'
                  : isPositive
                    ? 'text-emerald-700'
                    : 'text-amber-700'
              }`}>
                {item.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
