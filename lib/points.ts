export const EFFORT_MULTIPLIERS: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
}

export const POINTS_PER_DOLLAR = 1000

export const CASHOUT_OPTIONS = [
  {
    id: "visa_prepaid",
    name: "Visa Prepaid Card",
    icon: "CreditCard",
    minPoints: 5000,
    description: "Prepaid Visa gift card",
  },
  {
    id: "amazon",
    name: "Amazon Gift Card",
    icon: "ShoppingBag",
    minPoints: 5000,
    description: "Amazon.com gift card",
  },
  {
    id: "walmart",
    name: "Walmart Gift Card",
    icon: "ShoppingCart",
    minPoints: 5000,
    description: "Walmart gift card",
  },
  {
    id: "target",
    name: "Target Gift Card",
    icon: "Target",
    minPoints: 5000,
    description: "Target gift card",
  },
  {
    id: "zelle",
    name: "Zelle Transfer",
    icon: "Banknote",
    minPoints: 10000,
    description: "Direct bank transfer via Zelle",
  },
] as const

export type CashoutMethod = (typeof CASHOUT_OPTIONS)[number]["id"]

export function calculatePoints(
  effortScore: number,
  estimatedEffort: string,
  currentStreak: number
): number {
  const effortMultiplier = EFFORT_MULTIPLIERS[estimatedEffort] || 1
  const streakMultiplier = Math.min(1 + currentStreak * 0.1, 2)
  return Math.round(effortScore * 10 * effortMultiplier * streakMultiplier)
}

export function pointsToDollars(points: number): string {
  return (points / POINTS_PER_DOLLAR).toFixed(2)
}

export function getStreakMultiplier(streak: number): number {
  return Math.min(1 + streak * 0.1, 2)
}
