"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { PointsDisplay } from "@/components/app/points-display"
import { CashoutCard } from "@/components/app/cashout-card"
import { AdBanner } from "@/components/app/ad-banner"
import { CASHOUT_OPTIONS, pointsToDollars } from "@/lib/points"
import { Loader2, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface CashoutRequest {
  id: string
  amount: number
  dollarValue: number
  method: string
  status: "pending" | "processing" | "completed" | "rejected"
  createdAt: Date
}

const STATUS_STYLES = {
  pending: { label: "Pending", icon: Clock, className: "text-accent" },
  processing: { label: "Processing", icon: Loader2, className: "text-primary" },
  completed: { label: "Completed", icon: CheckCircle2, className: "text-primary" },
  rejected: { label: "Rejected", icon: XCircle, className: "text-destructive" },
}

export default function WalletPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [points, setPoints] = useState(0)
  const [cashouts, setCashouts] = useState<CashoutRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setPoints(userDoc.data().points || 0)
        }

        const cashoutsQuery = query(
          collection(db, "cashouts"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        )
        const snapshot = await getDocs(cashoutsQuery)
        setCashouts(
          snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<CashoutRequest, "id" | "createdAt">),
            createdAt: d.data().createdAt?.toDate() || new Date(),
          }))
        )
      } catch {
        // No cashouts yet
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  const handleSelectCashout = (methodId: string) => {
    router.push(`/app/wallet/cashout?method=${methodId}`)
  }

  const pendingAmount = cashouts
    .filter((c) => c.status === "pending" || c.status === "processing")
    .reduce((sum, c) => sum + c.amount, 0)

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-4 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Wallet</h1>

      {/* Balance Card */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Available Balance</p>
        <PointsDisplay points={points} size="lg" />
        <p className="text-sm text-muted-foreground">
          Equivalent to <span className="font-semibold text-foreground">${pointsToDollars(points)}</span>
        </p>
        {pendingAmount > 0 && (
          <p className="text-xs text-accent">
            {pendingAmount.toLocaleString()} pts in pending cashouts
          </p>
        )}
      </div>

      {/* Cashout Options */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Cash Out
        </h2>
        <div className="space-y-2">
          {CASHOUT_OPTIONS.map((option) => (
            <CashoutCard
              key={option.id}
              {...option}
              userPoints={points}
              onSelect={handleSelectCashout}
            />
          ))}
        </div>
      </div>

      {/* Cashout History */}
      {cashouts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Cashout History
          </h2>
          <div className="space-y-2">
            {cashouts.map((cashout) => {
              const statusInfo = STATUS_STYLES[cashout.status]
              const StatusIcon = statusInfo.icon
              const methodLabel = CASHOUT_OPTIONS.find((o) => o.id === cashout.method)?.name || cashout.method

              return (
                <div
                  key={cashout.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <StatusIcon className={cn("h-5 w-5 shrink-0", statusInfo.className)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground">{methodLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      {cashout.amount.toLocaleString()} pts (${cashout.dollarValue.toFixed(2)})
                    </p>
                  </div>
                  <span className={cn("text-xs font-medium capitalize", statusInfo.className)}>
                    {statusInfo.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <AdBanner />
    </div>
  )
}
