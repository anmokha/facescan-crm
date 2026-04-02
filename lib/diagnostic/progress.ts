import { AnalysisResult } from './types'

export interface ProgressDelta {
  deltaScore?: number
  deltaMetrics?: {
    hydration?: number
    pores?: number
    texture?: number
    firmness?: number
  }
  label?: 'improving' | 'stable' | 'declining'
  quality?: 'good' | 'bad' | 'unknown'
  confidence?: number
}

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }
  return null
}

export const computeProgress = (
  current?: AnalysisResult,
  previous?: AnalysisResult
): ProgressDelta | null => {
  if (!current || !previous) return null

  const currentScore = toNumber(current.profile?.skin_score ?? current.profile?.skinScore)
  const previousScore = toNumber(previous.profile?.skin_score ?? previous.profile?.skinScore)

  const progress: ProgressDelta = {}

  if (currentScore !== null && previousScore !== null) {
    const deltaScore = currentScore - previousScore
    progress.deltaScore = deltaScore
    if (deltaScore >= 5) progress.label = 'improving'
    else if (deltaScore >= 1) progress.label = 'stable'
    else if (deltaScore <= -1) progress.label = 'declining'
    else progress.label = 'stable'
  }

  const currentMetrics = current.metrics
  const previousMetrics = previous.metrics
  if (currentMetrics && previousMetrics) {
    progress.deltaMetrics = {
      hydration: toNumber(currentMetrics.hydration) !== null && toNumber(previousMetrics.hydration) !== null
        ? (currentMetrics.hydration - previousMetrics.hydration)
        : undefined,
      pores: toNumber(currentMetrics.pores) !== null && toNumber(previousMetrics.pores) !== null
        ? (currentMetrics.pores - previousMetrics.pores)
        : undefined,
      texture: toNumber(currentMetrics.texture) !== null && toNumber(previousMetrics.texture) !== null
        ? (currentMetrics.texture - previousMetrics.texture)
        : undefined,
      firmness: toNumber(currentMetrics.firmness) !== null && toNumber(previousMetrics.firmness) !== null
        ? (currentMetrics.firmness - previousMetrics.firmness)
        : undefined,
    }
  }

  return progress
}
