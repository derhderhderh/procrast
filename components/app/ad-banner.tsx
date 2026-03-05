"use client"

import { useEffect, useRef } from "react"

interface AdBannerProps {
  slot?: string
  format?: "auto" | "horizontal" | "vertical" | "rectangle"
  className?: string
}

export function AdBanner({ slot = "XXXXXXXXXX", format = "auto", className = "" }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    try {
      const adsbygoogle = (window as any).adsbygoogle || []
      adsbygoogle.push({})
      pushed.current = true
    } catch {
      // AdSense not loaded yet
    }
  }, [])

  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID

  if (!publisherId) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-muted/50 p-4 text-xs text-muted-foreground ${className}`}>
        Ad Space
      </div>
    )
  }

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
