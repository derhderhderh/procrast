"use client"

import { Brain, Flame, CreditCard, Shield } from "lucide-react"

const FEATURES = [
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Gemini AI scores your effort and detects AI-generated content",
  },
  {
    icon: Flame,
    title: "Streak Rewards",
    description: "Daily streaks multiply your earnings up to 2x",
  },
  {
    icon: CreditCard,
    title: "Cash Out",
    description: "Redeem points for Visa, Amazon, Walmart cards, or Zelle",
  },
  {
    icon: Shield,
    title: "Fair Scoring",
    description: "AI ensures authentic effort is recognized and rewarded",
  },
]

export function FeaturesSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        How It Works
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <feature.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-card-foreground">{feature.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
