import { getMedicineUnitsCollection, getTransferLogsCollection } from "@/lib/mongo"
import { toObjectId } from "@/lib/object-id"
import { getAuthUser, requireRole } from "@/lib/server-auth"
import { NextResponse } from "next/server"
import { z } from "zod"

const decisionSchema = z.object({
  decision: z.enum(["ACCEPT", "REJECT"]),
  notes: z.string().trim().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const authError = requireRole(user, ["PHARMACY"])

  if (authError) {
    return authError
  }

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const json = await request.json().catch(() => null)
  const parsed = decisionSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 })
  }

  const objectId = toObjectId(id)

  if (!objectId) {
    return NextResponse.json({ message: "Invalid transfer id" }, { status: 400 })
  }

  const transferLogsCollection = await getTransferLogsCollection()
  const transfer = await transferLogsCollection.findOne({ _id: objectId })

  if (!transfer) {
    return NextResponse.json({ message: "Transfer not found" }, { status: 404 })
  }

  if (transfer.toOwnerUserId !== user.id || transfer.status !== "PENDING") {
    return NextResponse.json({ message: "Transfer cannot be updated" }, { status: 400 })
  }

  const now = new Date()

  await transferLogsCollection.updateOne(
    { _id: objectId },
    {
      $set: {
        status: parsed.data.decision === "ACCEPT" ? "COMPLETED" : "REJECTED",
        notes: parsed.data.notes ?? transfer.notes,
        updatedAt: now,
      },
    }
  )

  if (parsed.data.decision === "ACCEPT") {
    const unitsCollection = await getMedicineUnitsCollection()
    await unitsCollection.updateOne(
      { uuid: transfer.unitUuid },
      {
        $set: {
          currentOwnerType: "PHARMACY",
          currentOwnerUserId: user.id,
          status: "AT_PHARMACY",
          updatedAt: now,
        },
      }
    )
  }

  return NextResponse.json({ message: `Transfer ${parsed.data.decision.toLowerCase()}ed` })
}
