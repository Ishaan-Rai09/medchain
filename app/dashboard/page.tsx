import { authOptions } from "@/lib/auth-options"
import { getRoleDashboardPath } from "@/lib/roles"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function DashboardRouterPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  redirect(getRoleDashboardPath(session.user.role))
}
