import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple in-memory rate limiter for sensitive routes.
// Note: In production, replace with a distributed rate limiter (Redis, Cloudflare, etc.).
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60
const ipCounters = new Map<string, { count: number; firstSeen: number }>()

function isSensitivePath(pathname: string) {
  return pathname.startsWith('/api/auth') || pathname.startsWith('/api/transfers') || pathname.startsWith('/api/licenses') || pathname.startsWith('/api/medicine')
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rate limiting for sensitive endpoints
  if (isSensitivePath(pathname)) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || request.headers.get('x-client-ip') || 'unknown'
    const now = Date.now()
    const entry = ipCounters.get(ip)

    if (!entry) {
      ipCounters.set(ip, { count: 1, firstSeen: now })
    } else {
      if (now - entry.firstSeen > RATE_LIMIT_WINDOW_MS) {
        ipCounters.set(ip, { count: 1, firstSeen: now })
      } else {
        entry.count += 1
        ipCounters.set(ip, entry)
        if (entry.count > MAX_REQUESTS_PER_WINDOW) {
          return new NextResponse('Too many requests', { status: 429 })
        }
      }
    }
  }

  const res = NextResponse.next()

  // Security headers
  res.headers.set('Referrer-Policy', 'no-referrer')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=()')
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  // In development, allow eval for React devtools; in production avoid 'unsafe-eval'.
  const isDev = process.env.NODE_ENV !== 'production'
  const scriptSrc = isDev ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'"
  res.headers.set('Content-Security-Policy', `default-src 'self'; script-src ${scriptSrc}; img-src 'self' data:; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';`)
  res.headers.set('Cache-Control', 'no-store')

  return res
}

export const config = {
  matcher: ['/api/:path*', '/(.*)'],
}
