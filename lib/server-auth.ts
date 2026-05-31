import { authOptions } from "@/lib/auth-options"
import type { AuthRole } from "@/lib/mongo"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export type AuthUserContext = {
  id: string
  email: string
  role: AuthRole
}

export async function getAuthUser(): Promise<AuthUserContext | null> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email || !session.user.role) {
    return null
  }

  return {
    id: session.user.id ?? session.user.email,
    email: session.user.email,
    role: session.user.role,
  }
}

export function requireRole(
  user: AuthUserContext | null,
  allowedRoles: AuthRole[]
): NextResponse | null {
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  return null
}
