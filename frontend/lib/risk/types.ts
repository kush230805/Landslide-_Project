/**
 * Shared types for the Landslide Risk Monitoring System.
 * These mirror the response shapes the FastAPI backend is expected to return,
 * so the mock service layer can be swapped for real HTTP calls with no UI changes.
 */

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'

/** A single monitored grid cell / area returned by GET /api/v1/risk/map */
export interface RiskArea {
  id: string
  latitude: number
  longitude: number
  /** normalized 0..1 */
  risk_score: number
  risk_level: RiskLevel
}

/** Full-region map payload — matches GET /api/v1/risk/map */
export interface RiskMapResponse {
  generated_at: string
  /** [south, west, north, east] region bounding box */
  bounds: [number, number, number, number]
  /** number of columns / rows of the grid so the client can draw cells */
  grid: { rows: number; cols: number; cellLat: number; cellLng: number }
  areas: RiskArea[]
}

export interface ContributingFactor {
  name: string
  /** 0..100, the observed value/intensity of this factor at the location */
  value: number
  /** 0..1, relative importance in the prediction (feature importance) */
  importance: number
}

/** Single-point prediction — matches POST /api/v1/risk/predict */
export interface RiskPredictionResponse {
  latitude: number
  longitude: number
  risk_score: number
  risk_level: RiskLevel
  contributing_factors: ContributingFactor[]
  /** human-readable decision-support notes derived from the factors */
  narrative: string[]
}

export interface Coordinate {
  latitude: number
  longitude: number
}
