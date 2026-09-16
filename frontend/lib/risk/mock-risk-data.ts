import { classifyRisk, clamp01 } from './risk-utils'
import type {
  ContributingFactor,
  RiskArea,
  RiskMapResponse,
  RiskPredictionResponse,
} from './types'

/**
 * Mock spatial risk model for the North Eastern Region (NER) of India.
 *
 * The goal is a *coherent* risk surface: nearby cells have related values,
 * driven by a handful of hazard "centers" (steep, high-rainfall, historically
 * active zones) with smooth distance falloff plus mild noise. This produces a
 * believable risk map rather than random isolated colors.
 *
 * Replace this entire module with real FastAPI calls later — the shapes match.
 */

// Region bounding box: [south, west, north, east]
export const REGION_BOUNDS: [number, number, number, number] = [24.0, 90.0, 27.8, 95.8]
export const REGION_CENTER: [number, number] = [25.9, 92.9]
export const GRID_ROWS = 16
export const GRID_COLS = 18

// Rough area of the monitored bounding box in km^2 (for the summary card).
export const MONITORED_AREA_KM2 = 152_000

interface HazardCenter {
  lat: number
  lng: number
  intensity: number
  radius: number // in degrees, controls falloff spread
}

// Loosely inspired by landslide-prone NER geography (Meghalaya plateau edge,
// Arunachal/Assam Himalayan foothills, Barail range). Not authoritative — mock.
const HAZARD_CENTERS: HazardCenter[] = [
  { lat: 25.57, lng: 91.88, intensity: 0.95, radius: 0.9 }, // Shillong / Meghalaya edge
  { lat: 27.1, lng: 93.6, intensity: 0.9, radius: 1.1 }, // Arunachal foothills
  { lat: 25.7, lng: 94.1, intensity: 0.78, radius: 0.8 }, // Nagaland hills
  { lat: 24.7, lng: 92.8, intensity: 0.62, radius: 0.7 }, // Barak / Barail range
  { lat: 26.7, lng: 90.5, intensity: 0.5, radius: 0.7 }, // Western foothills
]

/** Deterministic PRNG (mulberry32) so a given seed always yields the same map. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Smooth hazard field value at a coordinate (0..1), before noise. */
function baseFieldAt(lat: number, lng: number, drift: number): number {
  let value = 0.08 // ambient baseline
  for (const c of HAZARD_CENTERS) {
    const dLat = lat - (c.lat + drift * 0.15)
    const dLng = lng - (c.lng - drift * 0.1)
    const dist2 = dLat * dLat + dLng * dLng
    const falloff = Math.exp(-dist2 / (2 * c.radius * c.radius))
    value += (c.intensity + drift * 0.06) * falloff
  }
  return clamp01(value)
}

export interface GeneratedMap {
  response: RiskMapResponse
  /** keeps the seed/drift so single-point predictions can match the surface */
  seed: number
}

/**
 * Generate the full-region risk grid.
 * @param seed changes the surface slightly on each "Run Risk Analysis".
 */
export function generateRiskMap(seed = 1): GeneratedMap {
  const rand = mulberry32(seed)
  const drift = (seed % 7) / 7 - 0.5 // stable per-seed drift in [-0.5, 0.5]

  const [south, west, north, east] = REGION_BOUNDS
  const cellLat = (north - south) / GRID_ROWS
  const cellLng = (east - west) / GRID_COLS

  const areas: RiskArea[] = []
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const lat = south + (r + 0.5) * cellLat
      const lng = west + (c + 0.5) * cellLng
      const base = baseFieldAt(lat, lng, drift)
      // small spatially-mild noise so cells vary without becoming random
      const noise = (rand() - 0.5) * 0.12
      const score = clamp01(base + noise)
      areas.push({
        id: `${r}-${c}`,
        latitude: Number(lat.toFixed(4)),
        longitude: Number(lng.toFixed(4)),
        risk_score: Number(score.toFixed(3)),
        risk_level: classifyRisk(score),
      })
    }
  }

  return {
    seed,
    response: {
      generated_at: new Date().toISOString(),
      bounds: REGION_BOUNDS,
      grid: {
        rows: GRID_ROWS,
        cols: GRID_COLS,
        cellLat: Number(cellLat.toFixed(4)),
        cellLng: Number(cellLng.toFixed(4)),
      },
      areas,
    },
  }
}

/** Score at an arbitrary clicked coordinate, consistent with the surface. */
function scoreAt(lat: number, lng: number, seed: number): number {
  const drift = (seed % 7) / 7 - 0.5
  const rand = mulberry32(Math.round((lat + lng) * 1000) + seed)
  const base = baseFieldAt(lat, lng, drift)
  const noise = (rand() - 0.5) * 0.08
  return clamp01(base + noise)
}

/**
 * Derive contributing factors for a point prediction.
 * Factors are correlated with the overall score but each has its own signature,
 * mimicking model feature attributions.
 */
function factorsFor(lat: number, lng: number, score: number, seed: number): ContributingFactor[] {
  const rand = mulberry32(Math.round((lat - lng) * 997) + seed * 31)
  const jitter = (spread: number) => (rand() - 0.5) * spread

  const raw = [
    { name: 'Slope', base: score * 100 + 6 + jitter(14), importance: 0.32 },
    { name: 'Rainfall (24h)', base: score * 100 - 2 + jitter(22), importance: 0.27 },
    { name: 'Soil Moisture', base: score * 100 - 6 + jitter(16), importance: 0.18 },
    { name: 'Historical Landslides', base: score * 100 - 10 + jitter(20), importance: 0.13 },
    { name: 'Elevation', base: score * 100 - 16 + jitter(18), importance: 0.1 },
  ]

  return raw
    .map((f) => ({
      name: f.name,
      value: Math.round(Math.min(99, Math.max(8, f.base))),
      importance: f.importance,
    }))
    .sort((a, b) => b.value - a.value)
}

/** Build the human-readable decision-support narrative from the top factors. */
function narrativeFor(factors: ContributingFactor[]): string[] {
  const notes: string[] = []
  const byName = Object.fromEntries(factors.map((f) => [f.name, f.value]))

  if ((byName['Slope'] ?? 0) >= 65)
    notes.push('High slope is significantly increasing landslide susceptibility.')
  if ((byName['Rainfall (24h)'] ?? 0) >= 60)
    notes.push('Recent rainfall has raised the triggering potential in this area.')
  if ((byName['Soil Moisture'] ?? 0) >= 60)
    notes.push('Elevated soil moisture reduces slope stability.')
  if ((byName['Historical Landslides'] ?? 0) >= 55)
    notes.push('Historical landslide activity exists near this location.')
  if ((byName['Elevation'] ?? 0) >= 60)
    notes.push('High elevation terrain contributes to instability.')

  if (notes.length === 0)
    notes.push('No dominant risk drivers detected — conditions appear relatively stable.')

  return notes
}

/** Produce a single-point prediction consistent with the region surface. */
export function predictAt(lat: number, lng: number, seed = 1): RiskPredictionResponse {
  const score = scoreAt(lat, lng, seed)
  const factors = factorsFor(lat, lng, score, seed)
  return {
    latitude: Number(lat.toFixed(4)),
    longitude: Number(lng.toFixed(4)),
    risk_score: Number(score.toFixed(3)),
    risk_level: classifyRisk(score),
    contributing_factors: factors,
    narrative: narrativeFor(factors),
  }
}
