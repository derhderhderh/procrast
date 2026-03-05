"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { PointsDisplay } from "@/components/app/points-display"
import { StreakBadge } from "@/components/app/streak-badge"
import { AdBanner } from "@/components/app/ad-banner"
import { Plus, ListTodo, ArrowRight, Clock, CheckCircle2, Loader2, TrendingUp } from "lucide-react"
import { getStreakMultiplier } from "@/lib/points"

interface UserData {
  points: number
  totalPointsEarned: number
  currentStreak: number
  longestStreak: number
  displayName: string
}

interface RecentSubmission {
  id: string
  taskTitle: string
  effortScore: number
  pointsAwarded: number
  createdAt: Date
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        // Fetch user data
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData)
        } else {
          setUserData({
            points: 0,
            totalPointsEarned: 0,
            currentStreak: 0,
            longestStreak: 0,
            displayName: user.displayName || "Student",
          })
        }

        // Fetch recent graded submissions
        const subsQuery = query(
          collection(db, "submissions"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        )
        const subsSnapshot = await getDocs(subsQuery)
        const subs: RecentSubmission[] = []
        for (const docSnap of subsSnapshot.docs) {
          const data = docSnap.data()
          if (data.aiAnalysis) {
            // Fetch task title
            let taskTitle = "Task"
            try {
              const taskDoc = await getDoc(doc(db, "tasks", data.taskId))
              if (taskDoc.exists()) taskTitle = taskDoc.data().title
            } catch {
              // ignore
            }
            subs.push({
              id: docSnap.id,
              taskTitle,
              effortScore: data.aiAnalysis.effortScore,
              pointsAwarded: data.aiAnalysis.pointsAwarded,
              createdAt: data.createdAt?.toDate() || new Date(),
            })
          }
        }
        setRecentSubmissions(subs)
      } catch {
        // Firestore may not have data yet
        setUserData({
          points: 0,
          totalPointsEarned: 0,
          currentStreak: 0,
          longestStreak: 0,
          displayName: user.displayName || "Student",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const displayName = userData?.displayName || user?.displayName || "Student"
  const firstName = displayName.split(" ")[0]
  const streakMultiplier = getStreakMultiplier(userData?.currentStreak || 0)

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-4 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="text-2xl font-bold text-foreground">{firstName}</h1>
      </div>

      {/* Points Card */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your Balance</p>
            <PointsDisplay points={userData?.points || 0} size="lg" className="mt-1" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <StreakBadge streak={userData?.currentStreak || 0} />
            {streakMultiplier > 1 && (
              <span className="flex items-center gap-1 text-xs font-medium text-primary">
                <TrendingUp className="h-3 w-3" />
                {streakMultiplier.toFixed(1)}x multiplier
              </span>
            )}
          </div>
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Earned</span>
          <span className="font-semibold text-card-foreground tabular-nums">{(userData?.totalPointsEarned || 0).toLocaleString()} pts</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link
          href="/app/tasks/new"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          New Task
        </Link>
        <Link
          href="/app/tasks"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-card-foreground transition-colors hover:bg-secondary"
        >
          <ListTodo className="h-4 w-4" />
          View Tasks
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Activity</h2>
          {recentSubmissions.length > 0 && (
            <Link href="/app/tasks" className="flex items-center gap-1 text-xs font-medium text-primary">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {recentSubmissions.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-10">
            <Clock className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No submissions yet</p>
            <Link
              href="/app/tasks/new"
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              Create your first task
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">{sub.taskTitle}</p>
                  <p className="text-xs text-muted-foreground">Score: {sub.effortScore}/10</p>
                </div>
                <span className="text-sm font-bold text-primary tabular-nums">+{sub.pointsAwarded}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ad Banner */}
      <AdBanner />
    </div>
  )
}
