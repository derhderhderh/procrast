"use client"

import { useState, useEffect } from "react"
import { Share, Plus, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop")
  const [showIosInstructions, setShowIosInstructions] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent
    if (/iPad|iPhone|iPod/.test(ua)) {
      setPlatform("ios")
    } else if (/Android/.test(ua)) {
      setPlatform("android")
    } else {
      setPlatform("desktop")
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstallClick = async () => {
    if (platform === "ios") {
      setShowIosInstructions(true)
      return
    }
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setDeferredPrompt(null)
      }
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleInstallClick}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <Download className="h-5 w-5" />
        Install TaskReward
      </button>

      {showIosInstructions && platform === "ios" && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3 animate-in slide-in-from-bottom-4">
          <p className="text-sm font-semibold text-card-foreground">Install on iPhone/iPad:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</div>
              <span>Tap the <Share className="inline h-4 w-4" /> Share button in Safari</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</div>
              <span>Scroll down and tap <Plus className="inline h-4 w-4" /> Add to Home Screen</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</div>
              <span>Tap <strong className="text-foreground">Add</strong> to confirm</span>
            </div>
          </div>
        </div>
      )}

      {platform !== "ios" && !deferredPrompt && (
        <p className="text-center text-xs text-muted-foreground">
          Open in Chrome for the best install experience
        </p>
      )}
    </div>
  )
}
