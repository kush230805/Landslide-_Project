import { RISK_COLORS, RISK_LABELS, RISK_ORDER } from '@/lib/risk/risk-utils'

const RANGES: Record<string, string> = {
  LOW: '0–25%',
  MODERATE: '25–50%',
  HIGH: '50–75%',
  EXTREME: '75–100%',
}

export default function RiskLegend() {
  return (
    <div className="rounded-lg border border-border/80 bg-card/85 p-3 backdrop-blur-md">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Risk Level
      </p>
      <ul className="flex flex-col gap-1.5">
        {RISK_ORDER.map((level) => (
          <li key={level} className="flex items-center gap-2 text-xs">
            <span
              className="size-3 rounded-[3px]"
              style={{
                backgroundColor: RISK_COLORS[level],
                boxShadow: `0 0 6px ${RISK_COLORS[level]}88`,
              }}
            />
            <span className="font-medium text-foreground">{RISK_LABELS[level]}</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">
              {RANGES[level]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
