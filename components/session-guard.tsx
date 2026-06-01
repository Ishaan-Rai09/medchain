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
        // DEBUG: log inactivity signout trigger
        // eslint-disable-next-line no-console
        console.log('[client] session-guard: inactivity signOut')
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
    // DEBUG: log scheduled auto signout due to session expiry
    // eslint-disable-next-line no-console
    console.log('[client] session-guard: scheduling signOut in', to, 'ms', 'session.expires=', session.expires)

    // If the expiry is effectively now (small or zero), avoid immediate
    // sign-out — this protects against tiny clock skews or timing races.
    const MIN_DELAY = 5000 // 5s

    const scheduleExpirySignOut = () => {
      // eslint-disable-next-line no-console
      console.log('[client] session-guard: expiry signOut triggered')
      void signOut({ callbackUrl: '/auth/login' })
    }

    if (to > MIN_DELAY) {
      var t = window.setTimeout(scheduleExpirySignOut, to)
    } else {
      // If expiry is immediate or nearly immediate, poll the session
      // endpoint briefly to allow the server/COOKIE to stabilize.
      const pollSession = async (attempts = 12, delay = 300) => {
        for (let i = 0; i < attempts; i++) {
          try {
            const resp = await fetch('/api/auth/session')
            if (resp.ok) {
              const json = await resp.json()
              const remoteExpires = json?.expires ? new Date(json.expires).getTime() : null
              if (json?.user && remoteExpires && remoteExpires - Date.now() > MIN_DELAY) {
                // got a valid refreshed session — schedule signout normally
                // eslint-disable-next-line no-console
                console.log('[client] session-guard: found refreshed session, scheduling in', remoteExpires - Date.now())
                t = window.setTimeout(scheduleExpirySignOut, Math.max(0, remoteExpires - Date.now()))
                return
              }
            }
          } catch (e) {
            // ignore and retry
          }
          await new Promise((r) => setTimeout(r, delay))
        }

        // nothing valid found — sign out
        scheduleExpirySignOut()
      }

      void pollSession()
    }
    return () => clearTimeout(t)
  }, [session])

  return null
}
