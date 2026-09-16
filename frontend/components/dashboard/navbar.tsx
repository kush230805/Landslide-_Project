import { MountainSnow, ShieldAlert, ShieldCheck } from 'lucide-react'

interface NavbarProps {
  lastUpdatedLabel: string
  extremeRiskZones: number
}

export default function Navbar({ lastUpdatedLabel, extremeRiskZones }: NavbarProps) {
  const warning = extremeRiskZones > 0

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <MountainSnow className="size-5.5" />
          </span>
          <div>
            <h1 className="text-sm font-semibold leading-tight text-foreground sm:text-base">
              Landslide Risk Monitoring System
            </h1>
            <p className="text-xs text-muted-foreground">
              North Eastern Region · AI Early Warning
            </p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          {/* Warning status */}
          <div
            className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium"
            style={
              warning
                ? {
                    color: '#ef4444',
                    borderColor: '#ef444455',
                    backgroundColor: '#ef44441a',
                  }
                : {
                    color: '#22c55e',
                    borderColor: '#22c55e55',
                    backgroundColor: '#22c55e1a',
                  }
            }
          >
            {warning ? (
              <ShieldAlert className="size-4" />
            ) : (
              <ShieldCheck className="size-4" />
            )}
            {warning ? `Warning · ${extremeRiskZones} extreme zones` : 'No active warning'}
          </div>

          {/* System status */}
          <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span className="font-medium text-foreground">Monitoring</span>
          </div>

          {/* Last updated */}
          <div className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
            <span>Updated</span>
            <span className="font-mono text-foreground">{lastUpdatedLabel}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
