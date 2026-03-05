"use client"

import { cn } from "@/lib/utils"
import { Coins } from "lucide-react"

interface PointsDisplayProps {
  points: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function PointsDisplay({ points, size = "md", className }: PointsDisplayProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-3xl",
    lg: "text-5xl",
  }

  const iconSize = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Coins className={cn(iconSize[size], "text-accent")} />
      <span className={cn(sizeClasses[size], "font-bold tabular-nums tracking-tight text-foreground")}>
        {points.toLocaleString()}
      </span>
      {size !== "sm" && <span className="text-sm text-muted-foreground">pts</span>}
    </div>
  )
}
