"use client"

import { cn } from "@/lib/utils"
import { Flame } from "lucide-react"

interface StreakBadgeProps {
  streak: number
  className?: string
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5",
        streak > 0 && "bg-accent/20",
        className
      )}
    >
      <Flame
        className={cn(
          "h-4 w-4",
          streak > 0 ? "text-accent" : "text-muted-foreground"
        )}
      />
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          streak > 0 ? "text-accent-foreground" : "text-muted-foreground"
        )}
      >
        {streak} day{streak !== 1 ? "s" : ""}
      </span>
    </div>
  )
}
