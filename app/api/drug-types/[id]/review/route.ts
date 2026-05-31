import { getDrugTypesCollection, type DrugTypeStatus } from "@/lib/mongo"
import { toObjectId } from "@/lib/object-id"
import { getAuthUser, requireRole } from "@/lib/server-auth"
import { NextResponse } from "next/server"
import { z } from "zod"

const reviewDrugTypeSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "REVOKED"]),
  reason: z.string().trim().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const authError = requireRole(user, ["GOVERNMENT"])

  if (authError) {
    return authError
  }

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const json = await request.json().catch(() => null)
  const parsed = reviewDrugTypeSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 })
  }

  const objectId = toObjectId(id)

  if (!objectId) {
    return NextResponse.json({ message: "Invalid drug type id" }, { status: 400 })
  }

  const drugTypesCollection = await getDrugTypesCollection()

  await drugTypesCollection.updateOne(
    { _id: objectId },
    {
      $set: {
        status: parsed.data.status as DrugTypeStatus,
        reviewReason: parsed.data.reason,
        reviewedByUserId: user.id,
        updatedAt: new Date(),
      },
    }
  )

  return NextResponse.json({ message: "Drug type reviewed" })
}
