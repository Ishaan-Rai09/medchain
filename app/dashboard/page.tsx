import { authOptions } from "@/lib/auth-options"
import { getUsersCollection } from "@/lib/mongo"
import { getRoleDashboardPath } from "@/lib/roles"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

export default async function DashboardRouterPage() {
  const session = await getServerSession(authOptions)
  // DEBUG: log session for troubleshooting login redirects
  // Remove these logs in production
  // eslint-disable-next-line no-console
  console.log('[debug] /dashboard session:', JSON.stringify(session))

  if (!session?.user) {
    redirect("/auth/login")
  }

  let role = session.user.role

  if (!role && session.user.email) {
    const usersCollection = await getUsersCollection()
    const user = await usersCollection.findOne({ email: session.user.email })
    role = user?.role ?? null
  }

  redirect(getRoleDashboardPath(role))
}
