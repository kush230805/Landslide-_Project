import { getRiskColorForScore } from '@/lib/risk/risk-utils'
import type { ContributingFactor } from '@/lib/risk/types'

interface ContributingFactorsProps {
  factors: ContributingFactor[]
}

export default function ContributingFactors({ factors }: ContributingFactorsProps) {
  return (
    <div className="flex flex-col gap-3.5">
      {factors.map((factor) => {
        const color = getRiskColorForScore(factor.value / 100)
        return (
          <div key={factor.name} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-foreground">{factor.name}</span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {Math.round(factor.importance * 100)}% weight
                </span>
                <span className="font-mono font-semibold tabular-nums" style={{ color }}>
                  {factor.value}%
                </span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${factor.value}%`,
                  backgroundColor: color,
                  boxShadow: `0 0 10px ${color}99`,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
