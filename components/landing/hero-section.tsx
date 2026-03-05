"use client"

import { Sparkles, BookOpen, Trophy } from "lucide-react"

export function HeroSection() {
  return (
    <div className="flex flex-col items-center text-center space-y-6">
      {/* Logo/Icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15">
        <Trophy className="h-10 w-10 text-primary" />
      </div>

      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-balance text-foreground">
          TaskReward
        </h1>
        <p className="text-lg text-muted-foreground text-balance leading-relaxed max-w-sm">
          Submit your homework. Get AI-scored analysis. Earn real rewards.
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          AI-Powered Scoring
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent-foreground">
          <BookOpen className="h-3 w-3" />
          Track Progress
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          <Trophy className="h-3 w-3" />
          Real Rewards
        </div>
      </div>
    </div>
  )
}
