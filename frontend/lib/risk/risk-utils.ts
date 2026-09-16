import type { RiskLevel } from './types'

/**
 * Centralized risk classification.
 * Change thresholds/colors here only — the whole UI reads from these helpers.
 *
 * Risk score is normalized 0..1.
 *   0.00 – 0.25  -> LOW
 *   0.25 – 0.50  -> MODERATE
 *   0.50 – 0.75  -> HIGH
 *   0.75 – 1.00  -> EXTREME
 */
export const RISK_THRESHOLDS: { level: RiskLevel; min: number }[] = [
  { level: 'EXTREME', min: 0.75 },
  { level: 'HIGH', min: 0.5 },
  { level: 'MODERATE', min: 0.25 },
  { level: 'LOW', min: 0 },
]

/** Literal hex colors — used by Leaflet (SVG needs concrete colors) and the UI. */
export const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: '#22c55e',
  MODERATE: '#eab308',
  HIGH: '#f97316',
  EXTREME: '#ef4444',
}

export const RISK_LABELS: Record<RiskLevel, string> = {
  LOW: 'Low',
  MODERATE: 'Moderate',
  HIGH: 'High',
  EXTREME: 'Extreme',
}

export const RISK_ORDER: RiskLevel[] = ['LOW', 'MODERATE', 'HIGH', 'EXTREME']

/** Classify a normalized 0..1 score into a risk level. */
export function classifyRisk(score: number): RiskLevel {
  const s = clamp01(score)
  for (const { level, min } of RISK_THRESHOLDS) {
    if (s >= min) return level
  }
  return 'LOW'
}

export function getRiskColor(level: RiskLevel): string {
  return RISK_COLORS[level]
}

export function getRiskColorForScore(score: number): string {
  return RISK_COLORS[classifyRisk(score)]
}

/** Convert a 0..1 score to a rounded percentage. */
export function toPercent(score: number): number {
  return Math.round(clamp01(score) * 100)
}

export function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

export function formatCoord(n: number): string {
  return n.toFixed(4)
}
