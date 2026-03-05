"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { StreakBadge } from "@/components/app/streak-badge"
import { AdBanner } from "@/components/app/ad-banner"
import { pointsToDollars } from "@/lib/points"
import {
  User,
  Mail,
  Calendar,
  Flame,
  Trophy,
  Target,
  LogOut,
  Loader2,
  CheckCircle2,
  Clock,
  Moon,
  Sun,
} from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface UserProfile {
  displayName: string
  email: string
  points: number
  totalPointsEarned: number
  currentStreak: number
  longestStreak: number
  createdAt: Date | null
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState({ tasks: 0, submissions: 0, cashouts: 0 })
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setProfile({
            displayName: data.displayName || user.displayName || "Student",
            email: data.email || user.email || "",
            points: data.points || 0,
            totalPointsEarned: data.totalPointsEarned || 0,
            currentStreak: data.currentStreak || 0,
            longestStreak: data.longestStreak || 0,
            createdAt: data.createdAt?.toDate() || null,
          })
        } else {
          setProfile({
            displayName: user.displayName || "Student",
            email: user.email || "",
            points: 0,
            totalPointsEarned: 0,
            currentStreak: 0,
            longestStreak: 0,
            createdAt: null,
          })
        }

        // Fetch stats
        const [tasksSnap, subsSnap, cashSnap] = await Promise.all([
          getDocs(query(collection(db, "tasks"), where("userId", "==", user.uid))),
          getDocs(query(collection(db, "submissions"), where("userId", "==", user.uid))),
          getDocs(query(collection(db, "cashouts"), where("userId", "==", user.uid))),
        ])
        setStats({
          tasks: tasksSnap.size,
          submissions: subsSnap.size,
          cashouts: cashSnap.size,
        })
      } catch {
        setProfile({
          displayName: user.displayName || "Student",
          email: user.email || "",
          points: 0,
          totalPointsEarned: 0,
          currentStreak: 0,
          longestStreak: 0,
          createdAt: null,
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
    } catch {
      setSigningOut(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) return null

  const initial = profile.displayName.charAt(0).toUpperCase()

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-4 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Profile</h1>

      {/* User Info */}
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xl font-bold text-primary">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-card-foreground truncate">{profile.displayName}</h2>
          <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
          {profile.createdAt && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Joined {profile.createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center rounded-xl border border-border bg-card p-4">
          <Flame className="h-5 w-5 text-accent" />
          <span className="mt-1 text-2xl font-bold text-card-foreground tabular-nums">{profile.currentStreak}</span>
          <span className="text-xs text-muted-foreground">Current Streak</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-border bg-card p-4">
          <Trophy className="h-5 w-5 text-accent" />
          <span className="mt-1 text-2xl font-bold text-card-foreground tabular-nums">{profile.longestStreak}</span>
          <span className="text-xs text-muted-foreground">Longest Streak</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-border bg-card p-4">
          <Target className="h-5 w-5 text-primary" />
          <span className="mt-1 text-2xl font-bold text-card-foreground tabular-nums">{profile.totalPointsEarned.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">Total Earned</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-border bg-card p-4">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <span className="mt-1 text-2xl font-bold text-card-foreground tabular-nums">{stats.submissions}</span>
          <span className="text-xs text-muted-foreground">Submissions</span>
        </div>
      </div>

      {/* Lifetime Stats */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-card-foreground">Lifetime</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tasks Created</span>
            <span className="font-medium text-card-foreground">{stats.tasks}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cashout Requests</span>
            <span className="font-medium text-card-foreground">{stats.cashouts}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Redeemed</span>
            <span className="font-medium text-card-foreground">${pointsToDollars(profile.totalPointsEarned - profile.points)}</span>
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          {theme === "dark" ? (
            <Moon className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Sun className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-card-foreground">Theme</span>
        </div>
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                theme === t
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
      >
        {signingOut ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <LogOut className="h-4 w-4" />
            Sign Out
          </>
        )}
      </button>

      <AdBanner />
    </div>
  )
}
