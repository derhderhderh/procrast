"use client"

import { cn } from "@/lib/utils"
import { Brain, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react"

interface AiAnalysis {
  isAiGenerated: boolean
  aiConfidence: number
  effortScore: number
  feedback: string
  pointsAwarded: number
}

interface AiResultCardProps {
  analysis: AiAnalysis
  className?: string
}

export function AiResultCard({ analysis, className }: AiResultCardProps) {
  const effortPercent = (analysis.effortScore / 10) * 100

  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-card-foreground">AI Analysis</h3>
      </div>

      {/* AI Detection */}
      <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
        {analysis.isAiGenerated ? (
          <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
        ) : (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
        )}
        <div>
          <p className={cn("text-sm font-medium", analysis.isAiGenerated ? "text-destructive" : "text-primary")}>
            {analysis.isAiGenerated ? "Likely AI-Generated" : "Appears Human-Written"}
          </p>
          <p className="text-xs text-muted-foreground">
            {analysis.aiConfidence}% confidence
          </p>
        </div>
      </div>

      {/* Effort Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-card-foreground">Effort Score</span>
          <span className="text-sm font-bold text-primary">{analysis.effortScore}/10</span>
        </div>
        <div className="h-2.5 rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${effortPercent}%` }}
          />
        </div>
      </div>

      {/* Feedback */}
      <div className="space-y-1.5">
        <span className="text-sm font-medium text-card-foreground">Feedback</span>
        <p className="text-sm text-muted-foreground leading-relaxed">{analysis.feedback}</p>
      </div>

      {/* Points Awarded */}
      <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <span className="text-sm font-medium text-card-foreground">Points Earned</span>
        </div>
        <span className="text-xl font-bold text-primary">+{analysis.pointsAwarded}</span>
      </div>
    </div>
  )
}
