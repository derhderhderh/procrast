"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { TaskCard } from "@/components/app/task-card"
import { AdBanner } from "@/components/app/ad-banner"
import { Plus, Loader2, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  title: string
  description: string
  estimatedEffort: "low" | "medium" | "high"
  status: "pending" | "submitted" | "graded"
  createdAt: Date
}

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "submitted" | "graded">("all")

  useEffect(() => {
    if (!user) return
    const fetchTasks = async () => {
      try {
        const q = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        )
        const snapshot = await getDocs(q)
        const fetchedTasks: Task[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Task, "id" | "createdAt">),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }))
        setTasks(fetchedTasks)
      } catch {
        // No tasks yet or index not created
        setTasks([])
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [user])

  const filteredTasks = filter === "all" ? tasks : tasks.filter((t) => t.status === filter)

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
        <Link
          href="/app/tasks/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {(["all", "pending", "submitted", "graded"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-14">
          <ClipboardList className="h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium text-foreground">
            {filter === "all" ? "No tasks yet" : `No ${filter} tasks`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {filter === "all" ? "Create your first task to get started" : "Tasks will appear here once updated"}
          </p>
          {filter === "all" && (
            <Link
              href="/app/tasks/new"
              className="mt-4 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Create Task
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, index) => (
            <div key={task.id}>
              <TaskCard {...task} />
              {/* Ad every 5th item */}
              {(index + 1) % 5 === 0 && index < filteredTasks.length - 1 && (
                <div className="my-3">
                  <AdBanner />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
