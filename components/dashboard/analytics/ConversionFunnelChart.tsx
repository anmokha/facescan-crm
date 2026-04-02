'use client'

import React, { useEffect, useRef } from 'react'
// @ts-ignore - funnel-graph-js doesn't have types
import FunnelGraph from 'funnel-graph-js'

export type FunnelData = {
  labels: string[]
  subLabels: string[]
  colors: string[][]
  values: number[][]
}

interface ConversionFunnelChartProps {
  data: FunnelData
}

export const ConversionFunnelChart = ({ data }: ConversionFunnelChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<any>(null)
  const containerIdRef = useRef(`funnel-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    const containerEl = containerRef.current
    if (!containerEl) return

    // Clear previous graph
    if (graphRef.current) {
      containerEl.innerHTML = ''
      graphRef.current = null
    }

    // Dynamically load CSS
    const link1 = document.createElement('link')
    link1.rel = 'stylesheet'
    link1.href = 'https://unpkg.com/funnel-graph-js@1.4.2/dist/css/main.min.css'
    document.head.appendChild(link1)

    const link2 = document.createElement('link')
    link2.rel = 'stylesheet'
    link2.href = 'https://unpkg.com/funnel-graph-js@1.4.2/dist/css/theme.min.css'
    document.head.appendChild(link2)

    // Create new funnel
    try {
      const width = Math.max(720, Math.floor(containerEl.getBoundingClientRect().width || 0))
      graphRef.current = new FunnelGraph({
        container: `#${containerIdRef.current}`,
        gradientDirection: 'horizontal',
        data: data,
        displayPercent: true,
        direction: 'horizontal',
        width,
        height: 500,
        subLabelValue: 'raw' // Show actual numbers, not percentages
      })

      graphRef.current.draw()
    } catch (e) {
      console.error('Failed to create funnel graph:', e)
    }

    return () => {
      containerEl.innerHTML = ''
      // Cleanup CSS links
      document.querySelectorAll('link[href*="funnel-graph"]').forEach(el => el.remove())
    }
  }, [data])

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-10 shadow-sm">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Conversion Funnel by Source</h3>
        <p className="text-sm text-slate-500">Track leads from checkup to conversion, segmented by traffic source</p>
      </div>
      <div id={containerIdRef.current} ref={containerRef} className="funnel-container overflow-x-auto" />

      {/* Legend */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        {data.subLabels.map((label, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{
                background: Array.isArray(data.colors[idx])
                  ? `linear-gradient(to right, ${data.colors[idx][0]}, ${data.colors[idx][data.colors[idx].length - 1]})`
                  : data.colors[idx]
              }}
            />
            <span className="text-sm font-medium text-slate-700">{label}</span>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div
        className="mt-8 grid gap-4 pt-6 border-t border-slate-100"
        style={{ gridTemplateColumns: `repeat(${Math.max(data.labels.length, 1)}, minmax(0, 1fr))` }}
      >
        {data.labels.map((label, idx) => {
          const total = data.values[idx].reduce((sum, val) => sum + val, 0)
          const prevTotal = idx > 0 ? data.values[idx - 1].reduce((sum, val) => sum + val, 0) : total
          const dropoffRate = idx > 0 && prevTotal > 0 ? Math.round(((prevTotal - total) / prevTotal) * 100) : 0

          return (
            <div key={idx} className="bg-slate-50 rounded-xl p-4 text-center">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {label}
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {total}
              </div>
              {idx > 0 && (
                <div className={`text-xs font-semibold ${dropoffRate > 50 ? 'text-red-600' : dropoffRate > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {dropoffRate}% drop-off
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
