"use client"

import { useEffect, useRef } from "react"
import { signOut, useSession } from "next-auth/react"

// Auto sign out after inactivity (milliseconds)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes

export default function SessionGuard() {
  const { data: session } = useSession()
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    function resetTimer() {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
      timerRef.current = window.setTimeout(() => {
        // Sign out on inactivity
        void signOut({ callbackUrl: '/auth/login' })
      }, INACTIVITY_TIMEOUT)
    }

    function activity() {
      resetTimer()
    }

    window.addEventListener('mousemove', activity)
    window.addEventListener('keydown', activity)
    window.addEventListener('click', activity)

    resetTimer()

    return () => {
      window.removeEventListener('mousemove', activity)
      window.removeEventListener('keydown', activity)
      window.removeEventListener('click', activity)
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [session])

  // Also auto signout when session expires according to next-auth
  useEffect(() => {
    if (!session) return
    const expires = session.expires ? new Date(session.expires).getTime() : null
    if (!expires) return
    const now = Date.now()
    const to = Math.max(0, expires - now)
    const t = window.setTimeout(() => void signOut({ callbackUrl: '/auth/login' }), to)
    return () => clearTimeout(t)
  }, [session])

  return null
}
