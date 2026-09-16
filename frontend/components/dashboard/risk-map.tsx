'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  Marker,
  Rectangle,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import { Layers, Map as MapIcon, Search } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import RiskLegend from './risk-legend'
import { REGION_CENTER } from '@/lib/risk/mock-risk-data'
import { getRiskColor, RISK_LABELS, toPercent } from '@/lib/risk/risk-utils'
import type { Coordinate, RiskMapResponse, RiskPredictionResponse } from '@/lib/risk/types'

type BaseMap = 'dark' | 'satellite'

// Key-free tile sources. The "dark" map uses standard OSM tiles rendered
// through a CSS filter (see .map-dark in globals.css) to match the theme.
const TILE_LAYERS: Record<BaseMap, { url: string; attribution: string }> = {
  dark: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics',
  },
}

interface RiskMapProps {
  mapData: RiskMapResponse
  selectedCoordinate: Coordinate | null
  selectedRisk: RiskPredictionResponse | null
  onSelect: (coord: Coordinate) => void
}

/** Captures map clicks and hover coordinates. */
function MapEvents({
  onSelect,
  onHover,
}: {
  onSelect: (coord: Coordinate) => void
  onHover: (coord: Coordinate | null) => void
}) {
  useMapEvents({
    click(e) {
      onSelect({ latitude: e.latlng.lat, longitude: e.latlng.lng })
    },
    mousemove(e) {
      onHover({ latitude: e.latlng.lat, longitude: e.latlng.lng })
    },
    mouseout() {
      onHover(null)
    },
  })
  return null
}

/** Flies the map to a target coordinate when it changes (used by search). */
function Recenter({ target }: { target: Coordinate | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo([target.latitude, target.longitude], Math.max(map.getZoom(), 9))
  }, [target, map])
  return null
}

/** Ensures Leaflet measures its container correctly after mount/resize. */
function SizeFix() {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 120)
    const onResize = () => map.invalidateSize()
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', onResize)
    }
  }, [map])
  return null
}

export default function RiskMap({
  mapData,
  selectedCoordinate,
  selectedRisk,
  onSelect,
}: RiskMapProps) {
  const [baseMap, setBaseMap] = useState<BaseMap>('dark')
  const [opacity, setOpacity] = useState(0.55)
  const [hover, setHover] = useState<Coordinate | null>(null)
  const [flyTarget, setFlyTarget] = useState<Coordinate | null>(null)
  const [searchLat, setSearchLat] = useState('')
  const [searchLng, setSearchLng] = useState('')

  const { cellLat, cellLng } = mapData.grid

  const selectedColor = selectedRisk
    ? getRiskColor(selectedRisk.risk_level)
    : 'var(--color-primary)'

  const selectedIcon = useMemo(() => {
    const color =
      selectedRisk != null ? getRiskColor(selectedRisk.risk_level) : '#38e1c8'
    return L.divIcon({
      className: 'landslide-selected-marker',
      html: `<span style="position:relative;display:flex;align-items:center;justify-content:center;width:34px;height:34px;">
        <span style="position:absolute;width:34px;height:34px;border-radius:9999px;background:${color}55;animation:pulse-ring 1.6s ease-out infinite;"></span>
        <span style="position:relative;width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid #ffffff;box-shadow:0 0 10px ${color};"></span>
      </span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    })
  }, [selectedRisk])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const lat = Number.parseFloat(searchLat)
    const lng = Number.parseFloat(searchLng)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const coord = { latitude: lat, longitude: lng }
      setFlyTarget(coord)
      onSelect(coord)
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapContainer
        center={REGION_CENTER}
        zoom={7}
        minZoom={5}
        maxZoom={16}
        scrollWheelZoom
        zoomControl
        className={baseMap === 'dark' ? 'map-dark' : 'map-satellite'}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          key={baseMap}
          url={TILE_LAYERS[baseMap].url}
          attribution={TILE_LAYERS[baseMap].attribution}
        />

        {mapData.areas.map((area) => {
          const color = getRiskColor(area.risk_level)
          const bounds: [[number, number], [number, number]] = [
            [area.latitude - cellLat / 2, area.longitude - cellLng / 2],
            [area.latitude + cellLat / 2, area.longitude + cellLng / 2],
          ]
          return (
            <Rectangle
              key={area.id}
              bounds={bounds}
              pathOptions={{
                color,
                weight: 0.5,
                opacity: 0.25,
                fillColor: color,
                fillOpacity: opacity,
              }}
            >
              <Tooltip className="risk-tooltip" sticky>
                <div>
                  {area.latitude.toFixed(3)}, {area.longitude.toFixed(3)}
                </div>
                <div style={{ color, fontWeight: 700 }}>
                  {RISK_LABELS[area.risk_level]} · {toPercent(area.risk_score)}%
                </div>
              </Tooltip>
            </Rectangle>
          )
        })}

        {selectedCoordinate && (
          <Marker
            position={[selectedCoordinate.latitude, selectedCoordinate.longitude]}
            icon={selectedIcon}
          />
        )}

        <MapEvents onSelect={onSelect} onHover={setHover} />
        <Recenter target={flyTarget} />
        <SizeFix />
      </MapContainer>

      {/* Search (top-left) */}
      <form
        onSubmit={handleSearch}
        className="absolute left-3 top-3 z-[1000] flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/85 p-1.5 backdrop-blur-md"
      >
        <input
          value={searchLat}
          onChange={(e) => setSearchLat(e.target.value)}
          placeholder="Lat"
          inputMode="decimal"
          className="w-16 rounded-md bg-muted/50 px-2 py-1 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
        />
        <input
          value={searchLng}
          onChange={(e) => setSearchLng(e.target.value)}
          placeholder="Lng"
          inputMode="decimal"
          className="w-16 rounded-md bg-muted/50 px-2 py-1 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
        />
        <button
          type="submit"
          aria-label="Search coordinate"
          className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Search className="size-3.5" />
        </button>
      </form>

      {/* Base map + opacity (top-right) */}
      <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2 rounded-lg border border-border/80 bg-card/85 p-2 backdrop-blur-md">
        <div className="flex items-center gap-1 rounded-md bg-muted/50 p-0.5">
          <button
            type="button"
            onClick={() => setBaseMap('dark')}
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors ${
              baseMap === 'dark'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MapIcon className="size-3.5" /> Map
          </button>
          <button
            type="button"
            onClick={() => setBaseMap('satellite')}
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors ${
              baseMap === 'satellite'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="size-3.5" /> Satellite
          </button>
        </div>
        <div className="px-1 pb-1">
          <div className="mb-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Risk overlay</span>
            <span className="font-mono">{Math.round(opacity * 100)}%</span>
          </div>
          <Slider
            value={[opacity * 100]}
            min={0}
            max={100}
            step={5}
            onValueChange={(v) => {
              const value = Array.isArray(v) ? v[0] : v

              if (typeof value === 'number' && Number.isFinite(value)) {
                setOpacity(value / 100)
              }
            }}
            className="w-32"
          />
        </div>
      </div>

      {/* Legend (bottom-left) */}
      <div className="absolute bottom-6 left-3 z-[1000] w-44">
        <RiskLegend />
      </div>

      {/* Coordinate readout (bottom-right) */}
      <div className="absolute bottom-6 right-3 z-[1000] rounded-lg border border-border/80 bg-card/85 px-3 py-1.5 font-mono text-[11px] text-muted-foreground backdrop-blur-md">
        {hover
          ? `${hover.latitude.toFixed(4)}, ${hover.longitude.toFixed(4)}`
          : 'Hover map for coordinates'}
      </div>
    </div>
  )
}
