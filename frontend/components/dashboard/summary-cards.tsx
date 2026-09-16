import { Clock, Grid3x3, Layers, TriangleAlert } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { RISK_COLORS } from '@/lib/risk/risk-utils'
import type { RiskSummary } from '@/hooks/use-risk-data'

interface SummaryCardsProps {
  summary: RiskSummary
  lastUpdatedLabel: string
}

export default function SummaryCards({ summary, lastUpdatedLabel }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Monitored Area',
      value: `${summary.monitoredAreaKm2.toLocaleString('en-US')}`,
      unit: 'km²',
      icon: Grid3x3,
      accent: 'var(--color-primary)',
      sub: 'North Eastern Region',
    },
    {
      label: 'Risk Zones',
      value: summary.totalZones.toLocaleString(),
      unit: 'cells',
      icon: Layers,
      accent: 'var(--color-primary)',
      sub: 'Active monitoring grid',
    },
    {
      label: 'High-Risk Locations',
      value: summary.highRiskZones.toLocaleString(),
      unit: 'zones',
      icon: TriangleAlert,
      accent: RISK_COLORS.HIGH,
      sub: `${summary.extremeRiskZones} at extreme risk`,
    },
    {
      label: 'Last Model Update',
      value: lastUpdatedLabel,
      unit: '',
      icon: Clock,
      accent: 'var(--color-primary)',
      sub: 'Auto-synced surface',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="relative overflow-hidden border-border/70 bg-card/60 p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {card.label}
              </p>
              <p className="mt-2 flex items-baseline gap-1.5">
                <span className="truncate text-2xl font-semibold tabular-nums text-foreground">
                  {card.value}
                </span>
                {card.unit && (
                  <span className="text-sm text-muted-foreground">{card.unit}</span>
                )}
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{card.sub}</p>
            </div>
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${card.accent}1f`, color: card.accent }}
            >
              <card.icon className="size-4.5" />
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}
