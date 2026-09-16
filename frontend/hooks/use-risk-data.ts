'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  fetchRiskMap,
  getCurrentSeed,
  predictRisk,
  updateRiskMap,
} from '@/lib/risk/risk-api'
import { generateRiskMap, MONITORED_AREA_KM2 } from '@/lib/risk/mock-risk-data'
import type {
  Coordinate,
  RiskMapResponse,
  RiskPredictionResponse,
} from '@/lib/risk/types'

export interface RiskSummary {
  monitoredAreaKm2: number
  totalZones: number
  highRiskZones: number
  extremeRiskZones: number
}

export interface HistoryEntry {
  latitude: number
  longitude: number
  risk_score: number
  risk_level: RiskPredictionResponse['risk_level']
  at: string
}

export function useRiskData() {
  // Initialize the surface synchronously so the map paints immediately.
  const [mapData, setMapData] = useState<RiskMapResponse>(
    () => generateRiskMap(getCurrentSeed()).response,
  )
  const [selectedCoordinate, setSelectedCoordinate] = useState<Coordinate | null>(null)
  const [selectedRisk, setSelectedRisk] = useState<RiskPredictionResponse | null>(null)
  const [loadingMap, setLoadingMap] = useState(false)
  const [loadingPrediction, setLoadingPrediction] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>(mapData.generated_at)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const summary = useMemo<RiskSummary>(() => {
    const areas = mapData.areas
    const highRiskZones = areas.filter(
      (a) => a.risk_level === 'HIGH' || a.risk_level === 'EXTREME',
    ).length
    const extremeRiskZones = areas.filter((a) => a.risk_level === 'EXTREME').length
    return {
      monitoredAreaKm2: MONITORED_AREA_KM2,
      totalZones: areas.length,
      highRiskZones,
      extremeRiskZones,
    }
  }, [mapData])

  /** FEATURE 1 — analyze the exact coordinate the user clicked. */
  const analyzeLocation = useCallback(async (coord: Coordinate) => {
    setSelectedCoordinate(coord)
    setSelectedRisk(null)
    setLoadingPrediction(true)
    setError(null)
    try {
      const prediction = await predictRisk(coord.latitude, coord.longitude)
      setSelectedRisk(prediction)
      setHistory((prev) =>
        [
          {
            latitude: prediction.latitude,
            longitude: prediction.longitude,
            risk_score: prediction.risk_score,
            risk_level: prediction.risk_level,
            at: new Date().toISOString(),
          },
          ...prev,
        ].slice(0, 6),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to analyze location.')
    } finally {
      setLoadingPrediction(false)
    }
  }, [])

  /** FEATURE 2 — recompute the entire regional risk surface. */
  const runRiskAnalysis = useCallback(async () => {
    setLoadingMap(true)
    setError(null)
    try {
      const next = await updateRiskMap()
      setMapData(next)
      setLastUpdated(next.generated_at)
      // Re-analyze the selected point against the refreshed surface.
      setSelectedCoordinate((coord) => {
        if (coord) {
          predictRisk(coord.latitude, coord.longitude)
            .then(setSelectedRisk)
            .catch(() => {})
        }
        return coord
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update risk map.')
    } finally {
      setLoadingMap(false)
    }
  }, [])

  /** Soft refresh — re-fetch the current surface without recomputing. */
  const refreshMap = useCallback(async () => {
    setLoadingMap(true)
    setError(null)
    try {
      const next = await fetchRiskMap()
      setMapData(next)
      setLastUpdated(next.generated_at)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to refresh map.')
    } finally {
      setLoadingMap(false)
    }
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedCoordinate(null)
    setSelectedRisk(null)
  }, [])

  return {
    mapData,
    selectedCoordinate,
    selectedRisk,
    loadingMap,
    loadingPrediction,
    lastUpdated,
    error,
    summary,
    history,
    analyzeLocation,
    runRiskAnalysis,
    refreshMap,
    clearSelection,
  }
}
