"use client"

import { useEffect, useRef } from "react"

interface AdBannerProps {
  slot?: string
  format?: "auto" | "horizontal" | "vertical" | "rectangle"
  className?: string
}

export function AdBanner({ slot = "7217705807", format = "auto", className = "" }: AdBannerProps) {
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

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-2478580166735674"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
