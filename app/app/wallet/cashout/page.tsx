"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc, addDoc, collection, updateDoc, increment, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { CASHOUT_OPTIONS, POINTS_PER_DOLLAR, pointsToDollars } from "@/lib/points"
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

function CashoutForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const methodId = searchParams.get("method") || ""
  const { user } = useAuth()

  const [points, setPoints] = useState(0)
  const [amount, setAmount] = useState("")
  const [details, setDetails] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const method = CASHOUT_OPTIONS.find((o) => o.id === methodId)

  useEffect(() => {
    if (!user) return
    const fetchPoints = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setPoints(userDoc.data().points || 0)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchPoints()
  }, [user])

  if (!method) {
    router.replace("/app/wallet")
    return null
  }

  const numAmount = parseInt(amount) || 0
  const dollarValue = numAmount / POINTS_PER_DOLLAR
  const canSubmit = numAmount >= method.minPoints && numAmount <= points && details.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !canSubmit) return
    setError("")
    setSubmitting(true)

    try {
      await addDoc(collection(db, "cashouts"), {
        userId: user.uid,
        amount: numAmount,
        dollarValue,
        method: methodId,
        status: "pending",
        details: details.trim(),
        createdAt: serverTimestamp(),
      })

      // Deduct points
      await updateDoc(doc(db, "users", user.uid), {
        points: increment(-numAmount),
      })

      setSuccess(true)
    } catch {
      setError("Failed to submit cashout request. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-20 flex flex-col items-center text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Request Submitted</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          Your cashout of {numAmount.toLocaleString()} pts (${dollarValue.toFixed(2)}) via {method.name} has been submitted. You will be notified once processed.
        </p>
        <Link
          href="/app/wallet"
          className="mt-4 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Back to Wallet
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const detailsLabel =
    methodId === "zelle"
      ? "Zelle Email or Phone"
      : methodId === "visa_prepaid"
        ? "Mailing Address or Email"
        : "Email for Delivery"

  const detailsPlaceholder =
    methodId === "zelle"
      ? "email@example.com or phone number"
      : methodId === "visa_prepaid"
        ? "Address or email for digital delivery"
        : "email@example.com"

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/app/wallet"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary transition-colors hover:bg-secondary/80"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Link>
        <h1 className="text-xl font-bold text-foreground">{method.name}</h1>
      </div>

      {/* Balance Info */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground">Available Balance</p>
        <p className="text-2xl font-bold text-foreground tabular-nums">{points.toLocaleString()} pts</p>
        <p className="text-xs text-muted-foreground">Min. {method.minPoints.toLocaleString()} pts required</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Cashout Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Amount */}
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium text-foreground">
            Points to Redeem
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Min. ${method.minPoints.toLocaleString()}`}
            min={method.minPoints}
            max={points}
            step={1000}
            required
            className="w-full rounded-xl border border-input bg-secondary/30 py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {numAmount > 0 && (
            <p className="text-xs text-muted-foreground">
              = <span className="font-semibold text-foreground">${dollarValue.toFixed(2)}</span>
            </p>
          )}
          {numAmount > points && (
            <p className="text-xs text-destructive">Insufficient points</p>
          )}
        </div>

        {/* Quick amounts */}
        <div className="flex flex-wrap gap-2">
          {[5000, 10000, 25000, 50000]
            .filter((v) => v >= method.minPoints && v <= points)
            .map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v))}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  numAmount === v
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {v.toLocaleString()} pts (${pointsToDollars(v)})
              </button>
            ))}
        </div>

        {/* Details */}
        <div className="space-y-2">
          <label htmlFor="details" className="text-sm font-medium text-foreground">
            {detailsLabel}
          </label>
          <input
            id="details"
            type="text"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder={detailsPlaceholder}
            required
            className="w-full rounded-xl border border-input bg-secondary/30 py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            `Redeem ${numAmount > 0 ? `$${dollarValue.toFixed(2)}` : ""}`
          )}
        </button>
      </form>
    </div>
  )
}

export default function CashoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CashoutForm />
    </Suspense>
  )
}
