"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authHelpers } from "@/lib/auth"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    if (authHelpers.isAuthenticated()) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  )
}
