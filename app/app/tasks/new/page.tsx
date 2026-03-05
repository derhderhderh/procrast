"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ArrowLeft, Loader2, Zap, Gauge, Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const EFFORT_OPTIONS = [
  { value: "low", label: "Low", description: "Quick task, ~30 min", icon: Zap, multiplier: "1x" },
  { value: "medium", label: "Medium", description: "Moderate, ~1-2 hrs", icon: Gauge, multiplier: "2x" },
  { value: "high", label: "High", description: "Intensive, 2+ hrs", icon: Flame, multiplier: "3x" },
] as const

export default function NewTaskPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [effort, setEffort] = useState<"low" | "medium" | "high">("medium")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError("")
    setLoading(true)

    try {
      const docRef = await addDoc(collection(db, "tasks"), {
        userId: user.uid,
        title: title.trim(),
        description: description.trim(),
        estimatedEffort: effort,
        status: "pending",
        createdAt: serverTimestamp(),
        submittedAt: null,
      })
      router.push(`/app/tasks/${docRef.id}`)
    } catch {
      setError("Failed to create task. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/app/tasks"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary transition-colors hover:bg-secondary/80"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">New Task</h1>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Task Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Math Chapter 5 Homework"
            required
            className="w-full rounded-xl border border-input bg-secondary/30 py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe the assignment..."
            required
            rows={3}
            className="w-full resize-none rounded-xl border border-input bg-secondary/30 py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Estimated Effort */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Estimated Effort</label>
          <p className="text-xs text-muted-foreground">Higher effort = more points per submission</p>
          <div className="grid grid-cols-3 gap-2">
            {EFFORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEffort(opt.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors",
                  effort === opt.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-secondary/50"
                )}
              >
                <opt.icon
                  className={cn(
                    "h-5 w-5",
                    effort === opt.value ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-semibold",
                    effort === opt.value ? "text-primary" : "text-card-foreground"
                  )}
                >
                  {opt.label}
                </span>
                <span className="text-[10px] text-muted-foreground">{opt.description}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    effort === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {opt.multiplier}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim() || !description.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Task"
          )}
        </button>
      </form>
    </div>
  )
}
