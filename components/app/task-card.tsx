"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Clock, CheckCircle2, Send, ChevronRight } from "lucide-react"

interface TaskCardProps {
  id: string
  title: string
  description: string
  estimatedEffort: "low" | "medium" | "high"
  status: "pending" | "submitted" | "graded"
  createdAt: Date
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-muted text-muted-foreground",
  },
  submitted: {
    label: "Submitted",
    icon: Send,
    className: "bg-primary/15 text-primary",
  },
  graded: {
    label: "Graded",
    icon: CheckCircle2,
    className: "bg-success/15 text-success",
  },
}

const EFFORT_CONFIG = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", className: "bg-accent/15 text-accent-foreground" },
  high: { label: "High", className: "bg-primary/15 text-primary" },
}

export function TaskCard({ id, title, description, estimatedEffort, status }: TaskCardProps) {
  const statusInfo = STATUS_CONFIG[status]
  const effortInfo = EFFORT_CONFIG[estimatedEffort]
  const StatusIcon = statusInfo.icon

  return (
    <Link
      href={`/app/tasks/${id}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/50 active:bg-secondary"
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-card-foreground truncate">{title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{description}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", statusInfo.className)}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </span>
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", effortInfo.className)}>
            {effortInfo.label}
          </span>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </Link>
  )
}
