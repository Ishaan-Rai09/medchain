import type { AuthRole } from "@/lib/mongo"

const ROLE_SEGMENT_MAP: Record<AuthRole, string> = {
  GOVERNMENT: "government",
  MANUFACTURER: "manufacturer",
  PHARMACY: "pharmacy",
  CONSUMER: "consumer",
}

export function getRoleDashboardPath(role?: string | null): string {
  if (!role) {
    return "/auth/login"
  }

  const normalized = role.toUpperCase() as AuthRole
  const segment = ROLE_SEGMENT_MAP[normalized]

  return segment ? `/dashboard/${segment}` : "/auth/login"
}

export function getRoleFromSegment(segment: string): AuthRole | null {
  const entry = Object.entries(ROLE_SEGMENT_MAP).find(([, value]) => value === segment)
  return (entry?.[0] as AuthRole | undefined) ?? null
}
