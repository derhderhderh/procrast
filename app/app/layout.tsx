"use client"

import { AuthProvider } from "@/lib/auth-context"
import { AuthGuard } from "@/components/app/auth-guard"
import { BottomNav } from "@/components/app/bottom-nav"
import { usePathname } from "next/navigation"

const AUTH_PAGES = ["/app/login", "/app/register"]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_PAGES.includes(pathname)

  return (
    <AuthProvider>
      <AuthGuard>
        <div className="flex min-h-screen flex-col bg-background">
          <main className={isAuthPage ? "flex-1" : "flex-1 pb-20"}>
            {children}
          </main>
          {!isAuthPage && <BottomNav />}
        </div>
      </AuthGuard>
    </AuthProvider>
  )
}
