"use client"

import { cn } from "@/lib/utils"
import { CreditCard, ShoppingBag, ShoppingCart, Target, Banknote, ChevronRight, Lock } from "lucide-react"
import { pointsToDollars } from "@/lib/points"

const ICON_MAP: Record<string, typeof CreditCard> = {
  CreditCard,
  ShoppingBag,
  ShoppingCart,
  Target,
  Banknote,
}

interface CashoutCardProps {
  id: string
  name: string
  icon: string
  minPoints: number
  description: string
  userPoints: number
  onSelect: (id: string) => void
}

export function CashoutCard({
  id,
  name,
  icon,
  minPoints,
  description,
  userPoints,
  onSelect,
}: CashoutCardProps) {
  const Icon = ICON_MAP[icon] || CreditCard
  const canAfford = userPoints >= minPoints

  return (
    <button
      onClick={() => canAfford && onSelect(id)}
      disabled={!canAfford}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors",
        canAfford
          ? "hover:bg-secondary/50 active:bg-secondary cursor-pointer"
          : "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-card-foreground">{name}</h3>
        <p className="text-xs text-muted-foreground">
          Min. {minPoints.toLocaleString()} pts (${pointsToDollars(minPoints)})
        </p>
      </div>
      {canAfford ? (
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      ) : (
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
    </button>
  )
}
