"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { InstallPrompt } from "@/components/landing/install-prompt"
import Link from "next/link"

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed silently
      })
    }

    // Redirect if running in standalone PWA mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true
    if (isStandalone) {
      router.replace("/app")
    }
  }, [router])

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-between px-6 py-12">
        {/* Top Content */}
        <div className="flex-1 flex flex-col justify-center space-y-10">
          <HeroSection />
          <FeaturesSection />
        </div>

        {/* Bottom Actions */}
        <div className="space-y-3 pt-8">
          <InstallPrompt />
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or use in browser</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <Link
            href="/app"
            className="flex w-full items-center justify-center rounded-2xl border border-border bg-secondary py-3.5 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            Open Web App
          </Link>
        </div>
      </div>
    </main>
  )
}
