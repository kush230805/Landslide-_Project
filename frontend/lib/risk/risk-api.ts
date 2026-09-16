import { generateRiskMap, predictAt } from './mock-risk-data'
import type { RiskMapResponse, RiskPredictionResponse } from './types'

/**
 * ------------------------------------------------------------------
 *  API SERVICE LAYER
 * ------------------------------------------------------------------
 *  This is the ONLY place that talks to a "backend". Every UI component
 *  and hook depends on these functions, never on the mock data directly.
 *
 *  To connect the real FastAPI backend, flip USE_MOCK to false, set
 *  NEXT_PUBLIC_API_BASE_URL, and the fetch branches below take over.
 *  The response shapes are already identical to the mock data.
 *
 *  Endpoints:
 *    GET  /api/v1/risk/map          -> RiskMapResponse
 *    POST /api/v1/risk/predict      -> RiskPredictionResponse   body: { latitude, longitude }
 *    POST /api/v1/risk/update-map   -> RiskMapResponse
 */

const USE_MOCK = true
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

// simulated network latency for the mock so loading states are visible
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

// A module-level seed so "update map" produces a new-but-coherent surface.
let mapSeed = 1
export function getCurrentSeed() {
  return mapSeed
}

async function httpGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`Request failed (${res.status}) for ${path}`)
  return (await res.json()) as T
}

async function httpPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Request failed (${res.status}) for ${path}`)
  return (await res.json()) as T
}

/** GET /api/v1/risk/map — current risk surface for the whole region. */
export async function fetchRiskMap(): Promise<RiskMapResponse> {
  if (!USE_MOCK) return httpGet<RiskMapResponse>('/api/v1/risk/map')
  await delay(500)
  return generateRiskMap(mapSeed).response
}

/** POST /api/v1/risk/update-map — recompute predictions across the region. */
export async function updateRiskMap(): Promise<RiskMapResponse> {
  if (!USE_MOCK) return httpPost<RiskMapResponse>('/api/v1/risk/update-map', {})
  await delay(1400)
  mapSeed = (mapSeed % 6) + 1 // rotate the surface deterministically
  return generateRiskMap(mapSeed).response
}

/** POST /api/v1/risk/predict — analyze a single clicked coordinate. */
export async function predictRisk(
  latitude: number,
  longitude: number,
): Promise<RiskPredictionResponse> {
  if (!USE_MOCK)
    return httpPost<RiskPredictionResponse>('/api/v1/risk/predict', { latitude, longitude })
  await delay(650)
  return predictAt(latitude, longitude, mapSeed)
}
