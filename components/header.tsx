"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header() {
  // hide the header on pages that render their own `Navigation`
  const pathname = usePathname() ?? ""
  const hideHeaderPaths = ["/", "/auth/login", "/auth/signup"]
  if (hideHeaderPaths.includes(pathname)) {
    return null
  }

  const sess = useSession()
  const [open, setOpen] = useState(false)

  const session = sess?.data ?? null
  // DEBUG: client-side session state
  // eslint-disable-next-line no-console
  console.log('[client] header useSession()', sess)
  const role = session?.user?.role
  const email = session?.user?.email
  const expires = session?.expires

  // compute seconds left for display
  let expiresLeft = null as null | number
  if (expires) {
    const ms = new Date(expires).getTime() - Date.now()
    expiresLeft = Math.max(0, Math.floor(ms / 1000))
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold">MedChain</Link>
        </div>

        <div className="flex items-center gap-3">
          {role ? (
            <div className="relative">
              <button onClick={() => setOpen((s) => !s)} className="inline-flex items-center gap-2 rounded px-3 py-2 border">
                <div className="flex flex-col items-start">
                  <span className="font-medium">{role}</span>
                  <span className="text-xs text-muted-foreground">{email}</span>
                </div>
                {expiresLeft !== null ? (
                  <span className="ml-2 text-xs text-muted-foreground">{Math.floor(expiresLeft / 60)}m</span>
                ) : null}
              </button>

              {open ? (
                <div className="absolute right-0 mt-2 w-48 rounded-md border bg-white shadow-lg">
                  <Link href="/dashboard" className="block px-4 py-2 text-sm">Dashboard</Link>
                  <button onClick={() => signOut({ callbackUrl: '/auth/login' })} className="w-full text-left px-4 py-2 text-sm">Logout</button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link href="/auth/login" className="rounded px-3 py-2 border">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  )
}
