import { getUsersCollection, type AccountStatus } from "@/lib/mongo"
import { toObjectId } from "@/lib/object-id"
import { getAuthUser, requireRole } from "@/lib/server-auth"
import { NextResponse } from "next/server"
import { z } from "zod"

const updateAccountSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]),
})

export async function GET() {
  const user = await getAuthUser()
  const authError = requireRole(user, ["GOVERNMENT"])

  if (authError) {
    return authError
  }

  const usersCollection = await getUsersCollection()
  const users = await usersCollection
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray()

  return NextResponse.json({ users })
}

export async function PATCH(request: Request) {
  const user = await getAuthUser()
  const authError = requireRole(user, ["GOVERNMENT"])

  if (authError) {
    return authError
  }

  const json = await request.json().catch(() => null)
  const parsed = updateAccountSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 })
  }

  const { userId, status } = parsed.data
  const usersCollection = await getUsersCollection()

  const objectId = toObjectId(userId)
  const filter = objectId ? { _id: objectId } : { email: userId }

  await usersCollection.updateOne(filter, {
    $set: {
      status: status as AccountStatus,
      updatedAt: new Date(),
    },
  })

  return NextResponse.json({ message: "Account status updated" })
}
