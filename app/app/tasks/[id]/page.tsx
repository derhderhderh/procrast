"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  increment,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { SubmissionForm } from "@/components/app/submission-form"
import { AiResultCard } from "@/components/app/ai-result-card"
import { AdBanner } from "@/components/app/ad-banner"
import { ArrowLeft, Clock, Send, CheckCircle2, Loader2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface TaskData {
  title: string
  description: string
  estimatedEffort: "low" | "medium" | "high"
  status: "pending" | "submitted" | "graded"
  userId: string
}

interface SubmissionData {
  id: string
  type: "text" | "image"
  content: string
  aiAnalysis: {
    isAiGenerated: boolean
    aiConfidence: number
    effortScore: number
    feedback: string
    pointsAwarded: number
  } | null
  createdAt: Date
}

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const taskId = params.id as string
  const [task, setTask] = useState<TaskData | null>(null)
  const [submissions, setSubmissions] = useState<SubmissionData[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchData = async () => {
    if (!user) return
    try {
      const taskDoc = await getDoc(doc(db, "tasks", taskId))
      if (!taskDoc.exists() || taskDoc.data().userId !== user.uid) {
        router.replace("/app/tasks")
        return
      }
      setTask(taskDoc.data() as TaskData)

      const subsQuery = query(
        collection(db, "submissions"),
        where("taskId", "==", taskId),
        where("userId", "==", user.uid)
      )
      const subsSnapshot = await getDocs(subsQuery)
      const subs: SubmissionData[] = subsSnapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SubmissionData, "id" | "createdAt">),
        createdAt: d.data().createdAt?.toDate() || new Date(),
      }))
      subs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      setSubmissions(subs)
    } catch {
      router.replace("/app/tasks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user, taskId])

  const handleSubmit = async (data: { type: "text" | "image"; content: string; file?: File }) => {
    if (!user || !task) return
    setIsSubmitting(true)

    try {
      let contentUrl = data.content

      // Upload file to Firebase Storage if image
      if (data.type === "image" && data.file) {
        const fileRef = ref(storage, `submissions/${user.uid}/${taskId}/${Date.now()}_${data.file.name}`)
        await uploadBytes(fileRef, data.file)
        contentUrl = await getDownloadURL(fileRef)
      }

      // Create submission document
      const subDoc = await addDoc(collection(db, "submissions"), {
        taskId,
        userId: user.uid,
        type: data.type,
        content: contentUrl,
        aiAnalysis: null,
        createdAt: serverTimestamp(),
      })

      // Call AI analysis API
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: subDoc.id,
          taskId,
          type: data.type,
          content: contentUrl,
          taskTitle: task.title,
          taskDescription: task.description,
          estimatedEffort: task.estimatedEffort,
          userId: user.uid,
        }),
      })

      if (response.ok) {
        const result = await response.json()

        // Update submission with analysis
        await updateDoc(doc(db, "submissions", subDoc.id), {
          aiAnalysis: result.analysis,
        })

        // Update task status
        await updateDoc(doc(db, "tasks", taskId), {
          status: "graded",
          submittedAt: serverTimestamp(),
        })

        // Update user points and streak
        const userRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userRef)
        const userData = userDoc.data()

        let newStreak = 1
        if (userData?.lastSubmissionDate) {
          const lastDate = userData.lastSubmissionDate.toDate()
          const now = new Date()
          const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
          if (diffDays === 0) {
            newStreak = userData.currentStreak || 1
          } else if (diffDays === 1) {
            newStreak = (userData.currentStreak || 0) + 1
          }
        }

        await updateDoc(userRef, {
          points: increment(result.analysis.pointsAwarded),
          totalPointsEarned: increment(result.analysis.pointsAwarded),
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, userData?.longestStreak || 0),
          lastSubmissionDate: Timestamp.now(),
        })
      }

      // Refresh data
      await fetchData()
    } catch {
      // Error handling
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !task) return
    if (!confirm("Delete this task? This cannot be undone.")) return
    setDeleting(true)
    try {
      const { deleteDoc } = await import("firebase/firestore")
      await deleteDoc(doc(db, "tasks", taskId))
      router.replace("/app/tasks")
    } catch {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!task) return null

  const STATUS_CONFIG = {
    pending: { label: "Pending", icon: Clock, className: "bg-muted text-muted-foreground" },
    submitted: { label: "Submitted", icon: Send, className: "bg-primary/15 text-primary" },
    graded: { label: "Graded", icon: CheckCircle2, className: "bg-success/15 text-success" },
  }

  const statusInfo = STATUS_CONFIG[task.status]
  const StatusIcon = statusInfo.icon

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
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground truncate">{task.title}</h1>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 transition-colors hover:bg-destructive/20"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin text-destructive" />
          ) : (
            <Trash2 className="h-4 w-4 text-destructive" />
          )}
        </button>
      </div>

      {/* Task Info */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", statusInfo.className)}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium capitalize text-secondary-foreground">
            {task.estimatedEffort} effort
          </span>
        </div>
      </div>

      {/* Submission Form (only show if pending) */}
      {task.status === "pending" && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Submit Your Work
          </h2>
          <SubmissionForm
            taskId={taskId}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Previous Submissions & Results */}
      {submissions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {submissions.length === 1 ? "Submission Result" : "Submission Results"}
          </h2>
          {submissions.map((sub) =>
            sub.aiAnalysis ? (
              <AiResultCard key={sub.id} analysis={sub.aiAnalysis} />
            ) : (
              <div key={sub.id} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">Analysis pending...</p>
              </div>
            )
          )}
        </div>
      )}

      {/* Ad Banner */}
      <AdBanner />
    </div>
  )
}
