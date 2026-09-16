'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Play, RefreshCw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Navbar from './navbar'
import SummaryCards from './summary-cards'
import CoordinateAnalysis from './coordinate-analysis'
import { MapLoadingOverlay, MapSkeleton } from './loading-state'
import { useRiskData } from '@/hooks/use-risk-data'
import { cn } from '@/lib/utils'

// Leaflet must only run on the client.
const RiskMap = dynamic(() => import('./risk-map'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Dashboard() {
  const {
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
  } = useRiskData()

  const [lastUpdatedLabel, setLastUpdatedLabel] = useState('—')

  useEffect(() => {
    setLastUpdatedLabel(formatClock(lastUpdated))
  }, [lastUpdated])
  
  return (
    <div className="min-h-svh bg-background">
      <Navbar
        lastUpdatedLabel={lastUpdatedLabel}
        extremeRiskZones={summary.extremeRiskZones}
      />

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        <SummaryCards summary={summary} lastUpdatedLabel={lastUpdatedLabel} />

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <TriangleAlert className="size-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Map column */}
          <div className="xl:col-span-2">
            <Card className="overflow-hidden border-border/70 bg-card/60 p-0">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-3.5">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Regional Risk Surface
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Click any location to run a point risk prediction
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshMap}
                    disabled={loadingMap}
                  >
                    <RefreshCw
                      className={cn('size-4', loadingMap && 'animate-spin')}
                    />
                    Refresh
                  </Button>
                  <Button size="sm" onClick={runRiskAnalysis} disabled={loadingMap}>
                    <Play className="size-4" />
                    Run Risk Analysis
                  </Button>
                </div>
              </div>

              {/* Map */}
              <div className="relative h-[560px] w-full">
                <RiskMap
                  mapData={mapData}
                  selectedCoordinate={selectedCoordinate}
                  selectedRisk={selectedRisk}
                  onSelect={analyzeLocation}
                />
                {loadingMap && <MapLoadingOverlay />}
              </div>
            </Card>
          </div>

          {/* Analysis panel */}
          <div className="xl:col-span-1">
            <Card className="h-full border-border/70 bg-card/60 p-0">
              <CoordinateAnalysis
                selectedCoordinate={selectedCoordinate}
                selectedRisk={selectedRisk}
                loading={loadingPrediction}
                history={history}
                onSelectHistory={analyzeLocation}
              />
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
