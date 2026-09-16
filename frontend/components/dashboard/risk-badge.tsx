import { getRiskColor, RISK_LABELS } from '@/lib/risk/risk-utils'
import type { RiskLevel } from '@/lib/risk/types'
import { cn } from '@/lib/utils'

interface RiskBadgeProps {
  level: RiskLevel
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function RiskBadge({ level, size = 'md', className }: RiskBadgeProps) {
  const color = getRiskColor(level)
  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold uppercase tracking-wide',
        sizes[size],
        className,
      )}
      style={{
        color,
        borderColor: `${color}66`,
        backgroundColor: `${color}1f`,
      }}
    >
      <span
        className="inline-block size-2 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
      />
      {RISK_LABELS[level]}
    </span>
  )
}
