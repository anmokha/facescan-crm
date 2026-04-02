'use client'

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type FlowData = {
  sources: { id: string; name: string; value: number; color: string; icon?: React.ReactNode }[]
  targets: { id: string; name: string; value: number; color: string }[]
  links: { sourceId: string; targetId: string; value: number }[]
}

export const LeadStreamChart = ({ data }: { data: FlowData }) => {
  const [hoveredSource, setHoveredSource] = useState<string | null>(null)
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null)

  // Layout Constants
  const height = 500
  const itemHeightMin = 52
  const gap = 16

  const layout = useMemo(() => {
    const totalSourceValue = data.sources.reduce((acc, s) => acc + s.value, 0)
    const totalTargetValue = data.targets.reduce((acc, s) => acc + s.value, 0)
    const totalValue = Math.max(totalSourceValue, totalTargetValue) || 1; 
    
    // Y-Coordinate Calculation
    const calculatePositions = (items: typeof data.sources) => {
      let currentY = 0
      return items.map(item => {
        // Height proportional to value, but with a minimum
        // We use a non-linear scale for better visibility of small items
        const rawHeight = (item.value / totalValue) * (height - (items.length * gap))
        const itemHeight = Math.max(rawHeight, itemHeightMin)
        
        const y = currentY
        currentY += itemHeight + gap
        return { ...item, y, height: itemHeight }
      })
    }

    const sourcePos = calculatePositions(data.sources)
    const targetPos = calculatePositions(data.targets)

    const paths = data.links.map(link => {
      const source = sourcePos.find(s => s.id === link.sourceId)
      const target = targetPos.find(t => t.id === link.targetId)

      if (!source || !target) return null;

      const startY = source.y + source.height / 2
      const endY = target.y + target.height / 2
      
      const pathData = `
        M 0,${startY} 
        C 180,${startY} 
          180,${endY} 
          360,${endY}
      `
      
      return {
        ...link,
        path: pathData,
        strokeWidth: Math.max((link.value / totalValue) * 60, 3) 
      }
    }).filter(Boolean) as any[]

    const containerHeight = Math.max(
        (sourcePos[sourcePos.length - 1]?.y || 0) + (sourcePos[sourcePos.length - 1]?.height || 0),
        (targetPos[targetPos.length - 1]?.y || 0) + (targetPos[targetPos.length - 1]?.height || 0)
    ) + 60;

    return { sourcePos, targetPos, paths, containerHeight }
  }, [data])

  return (
    <div className="flex w-full bg-[#0B0F1A] rounded-3xl p-10 text-white overflow-hidden relative border border-slate-800/50 shadow-2xl" style={{ height: layout.containerHeight }}>
      
      {/* Background Pulse Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      {/* LEFT COLUMN (SOURCES) */}
      <div className="flex flex-col absolute left-10 top-10 w-64 z-20">
        <div className="flex justify-between items-center mb-8 px-2">
            <div className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">Incoming Stream</div>
            <div className="text-slate-600 text-[10px] uppercase font-mono">Volume</div>
        </div>
        
        {layout.sourcePos.map((source) => (
          <motion.div
            key={source.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onMouseEnter={() => setHoveredSource(source.id)}
            onMouseLeave={() => setHoveredSource(null)}
            className={`
              relative flex items-center p-4 rounded-2xl border border-slate-800/50 bg-slate-900/40 cursor-pointer transition-all duration-500 group
              ${hoveredSource === source.id ? 'border-indigo-500/50 bg-slate-800/60 shadow-lg shadow-indigo-500/5 translate-x-1' : 'hover:bg-slate-800/30'}
              ${hoveredSource && hoveredSource !== source.id ? 'opacity-20 grayscale-[0.5]' : 'opacity-100'}
            `}
            style={{ height: source.height, top: source.y, position: 'absolute', width: '100%' }}
          >
            <div className="w-1 h-1/3 absolute left-0 top-1/3 rounded-r-full transition-all duration-500 group-hover:h-1/2 group-hover:top-1/4" style={{ backgroundColor: source.color }} />
            
            <div className="flex-1 flex justify-between items-center ml-2">
                <div className="flex flex-col">
                    <div className="font-bold text-sm text-slate-300 group-hover:text-white transition-colors">{source.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium tracking-tight">Source Channel</div>
                </div>
                <div className="font-mono font-bold text-sm text-indigo-400 group-hover:text-indigo-300">{source.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CENTER (DYNAMIC SVG PATHS) */}
      <div className="absolute left-[310px] top-10 w-[360px] h-full pointer-events-none z-10">
        <svg className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="streamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
          </defs>
          
          {layout.paths.map((link, i) => {
            const isActive = hoveredSource === link.sourceId || hoveredTarget === link.targetId || (!hoveredSource && !hoveredTarget);
            const isSelected = hoveredSource === link.sourceId || hoveredTarget === link.targetId;

            return (
              <motion.path
                key={`${link.sourceId}-${link.targetId}`}
                d={link.path}
                fill="none"
                stroke="url(#streamGradient)"
                strokeWidth={link.strokeWidth}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: isActive ? (isSelected ? 1 : 0.4) : 0.03,
                  strokeWidth: isSelected ? link.strokeWidth * 1.1 : link.strokeWidth
                }}
                transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: i * 0.05 }}
                style={{ filter: isSelected ? 'url(#glow)' : 'none' }}
                className="transition-all duration-500"
              />
            )
          })}
        </svg>
      </div>

      {/* RIGHT COLUMN (TARGETS) */}
      <div className="flex flex-col absolute left-[710px] top-10 w-64 z-20">
        <div className="flex justify-between items-center mb-8 px-2">
            <div className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">Conversion Goal</div>
            <div className="text-slate-600 text-[10px] uppercase font-mono">Leads</div>
        </div>
        
        {layout.targetPos.map((target) => (
          <motion.div
            key={target.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onMouseEnter={() => setHoveredTarget(target.id)}
            onMouseLeave={() => setHoveredTarget(null)}
             className={`
              relative flex items-center p-4 rounded-2xl border border-slate-800/50 bg-slate-900/40 cursor-pointer transition-all duration-500 group
              ${hoveredTarget === target.id ? 'border-emerald-500/50 bg-slate-800/60 shadow-lg shadow-emerald-500/5 -translate-x-1' : 'hover:bg-slate-800/30'}
              ${hoveredTarget && hoveredTarget !== target.id ? 'opacity-20 grayscale-[0.5]' : 'opacity-100'}
            `}
            style={{ height: target.height, top: target.y, position: 'absolute', width: '100%' }}
          >
            <div className="w-1 h-1/3 absolute right-0 top-1/3 rounded-l-full transition-all duration-500 group-hover:h-1/2 group-hover:top-1/4" style={{ backgroundColor: target.color }} />
            
            <div className="flex-1 flex justify-between items-center mr-2">
                <div className="font-mono font-bold text-sm text-emerald-400 group-hover:text-emerald-300">{target.value}</div>
                <div className="text-right flex flex-col">
                    <div className="font-bold text-sm text-slate-300 group-hover:text-white transition-colors">{target.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium tracking-tight">Business Status</div>
                </div>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  )
}
