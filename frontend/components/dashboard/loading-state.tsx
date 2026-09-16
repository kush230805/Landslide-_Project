import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('animate-spin', className)} />
}

interface MapLoadingOverlayProps {
  label?: string
}

/** Full-cover overlay shown while the regional risk surface recomputes. */
export function MapLoadingOverlay({ label = 'Running risk analysis…' }: MapLoadingOverlayProps) {
  return (
    <div className="absolute inset-0 z-[1200] flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-sm">
      <div className="relative flex size-14 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-primary/30" />
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">Recomputing regional risk surface</p>
    </div>
  )
}

/** Placeholder shown while the Leaflet bundle loads on the client. */
export function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted/30">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="size-7 animate-spin text-primary" />
        <p className="text-sm">Loading map…</p>
      </div>
    </div>
  )
}
