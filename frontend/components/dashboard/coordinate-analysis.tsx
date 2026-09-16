'use client'

import { useState } from 'react'
import {
  ChevronDown,
  Crosshair,
  History,
  MapPin,
  TriangleAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import RiskBadge from './risk-badge'
import ContributingFactors from './contributing-factors'
import { Spinner } from './loading-state'
import { formatCoord, getRiskColor, toPercent } from '@/lib/risk/risk-utils'
import type { Coordinate, RiskPredictionResponse } from '@/lib/risk/types'
import type { HistoryEntry } from '@/hooks/use-risk-data'
import { cn } from '@/lib/utils'

interface CoordinateAnalysisProps {
  selectedCoordinate: Coordinate | null
  selectedRisk: RiskPredictionResponse | null
  loading: boolean
  history: HistoryEntry[]
  onSelectHistory: (coord: Coordinate) => void
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.round(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.round(m / 60)}h ago`
}

export default function CoordinateAnalysis({
  selectedCoordinate,
  selectedRisk,
  loading,
  history,
  onSelectHistory,
}: CoordinateAnalysisProps) {
  const [detailed, setDetailed] = useState(false)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border/70 px-5 py-4">
        <Crosshair className="size-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Coordinate Analysis</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Empty state */}
        {!selectedCoordinate && (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
              <MapPin className="size-6" />
            </span>
            <p className="max-w-[220px] text-sm text-muted-foreground text-balance">
              Select a location on the map to analyze its landslide risk.
            </p>
          </div>
        )}

        {/* Selected */}
        {selectedCoordinate && (
          <div className="flex flex-col gap-5">
            {/* Location */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Selected Location
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Latitude</p>
                  <p className="font-mono text-sm text-foreground">
                    {formatCoord(selectedCoordinate.latitude)}
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Longitude</p>
                  <p className="font-mono text-sm text-foreground">
                    {formatCoord(selectedCoordinate.longitude)}
                  </p>
                </div>
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-border/70 bg-muted/20 py-10 text-sm text-muted-foreground">
                <Spinner className="size-4 text-primary" />
                Analyzing location…
              </div>
            )}

            {!loading && selectedRisk && (
              <>
                {/* Score + level */}
                <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 p-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Risk Score
                    </p>
                    <p
                      className="mt-1 text-4xl font-bold tabular-nums"
                      style={{ color: getRiskColor(selectedRisk.risk_level) }}
                    >
                      {toPercent(selectedRisk.risk_score)}%
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Risk Level
                    </p>
                    <RiskBadge level={selectedRisk.risk_level} size="lg" />
                  </div>
                </div>

                {/* Contributing factors */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Contributing Factors
                    </p>
                  </div>
                  <ContributingFactors factors={selectedRisk.contributing_factors} />
                </div>

                {/* Human-in-the-loop decision support */}
                <div className="rounded-xl border border-border/70 bg-muted/15 p-4">
                  <p className="mb-2.5 text-sm font-semibold text-foreground">
                    Why is this location at risk?
                  </p>
                  <ul className="flex flex-col gap-2">
                    {selectedRisk.narrative.map((note, i) => (
                      <li key={i} className="flex gap-2 text-xs leading-relaxed">
                        <TriangleAlert
                          className="mt-0.5 size-3.5 shrink-0"
                          style={{ color: getRiskColor(selectedRisk.risk_level) }}
                        />
                        <span className="text-muted-foreground">{note}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 border-t border-border/60 pt-2.5 text-[11px] italic leading-relaxed text-muted-foreground">
                    Model-generated assessment for decision support. Final action rests
                    with human authorities.
                  </p>
                </div>

                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setDetailed((v) => !v)}
                >
                  {detailed ? 'Hide Detailed Analysis' : 'View Detailed Analysis'}
                  <ChevronDown
                    className={cn(
                      'size-4 transition-transform',
                      detailed && 'rotate-180',
                    )}
                  />
                </Button>

                {detailed && (
                  <div className="rounded-xl border border-border/70 bg-muted/15 p-4">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Feature Importance Breakdown
                    </p>
                    <ul className="flex flex-col gap-2 font-mono text-xs">
                      {selectedRisk.contributing_factors.map((f) => (
                        <li key={f.name} className="flex justify-between">
                          <span className="text-muted-foreground">{f.name}</span>
                          <span className="text-foreground">
                            {(f.importance * 100).toFixed(0)}% · val {f.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Recent history */}
            {history.length > 0 && (
              <div>
                <Separator className="my-1" />
                <div className="mb-2 mt-3 flex items-center gap-1.5">
                  <History className="size-3.5 text-muted-foreground" />
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Recent Analyses
                  </p>
                </div>
                <ul className="flex flex-col gap-1">
                  {history.map((h, i) => (
                    <li key={`${h.at}-${i}`}>
                      <button
                        type="button"
                        onClick={() =>
                          onSelectHistory({ latitude: h.latitude, longitude: h.longitude })
                        }
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted/50"
                      >
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: getRiskColor(h.risk_level) }}
                        />
                        <span className="font-mono text-muted-foreground">
                          {formatCoord(h.latitude)}, {formatCoord(h.longitude)}
                        </span>
                        <span className="ml-auto font-mono tabular-nums text-foreground">
                          {toPercent(h.risk_score)}%
                        </span>
                        <span className="w-12 text-right text-[10px] text-muted-foreground">
                          {relativeTime(h.at)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
