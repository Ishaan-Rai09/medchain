import { getMedicineUnitsCollection, getTransferLogsCollection } from "@/lib/mongo"
import { getAuthUser, requireRole } from "@/lib/server-auth"
import { NextResponse } from "next/server"
import { z } from "zod"

const createTransferSchema = z.object({
  unitUuids: z.array(z.string().uuid()).min(1),
  toOwnerType: z.enum(["PHARMACY", "CONSUMER"]),
  toOwnerUserId: z.string().optional(),
  transferDate: z.string().datetime(),
  prescriptionReference: z.string().trim().optional(),
  notes: z.string().trim().optional(),
})

export async function GET() {
  const user = await getAuthUser()

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const transferLogsCollection = await getTransferLogsCollection()
  const incoming =
    user.role === "PHARMACY"
      ? await transferLogsCollection.find({ toOwnerUserId: user.id, status: "PENDING" }).sort({ createdAt: -1 }).toArray()
      : []

  const history = await transferLogsCollection
    .find({
      $or: [{ fromOwnerUserId: user.id }, { toOwnerUserId: user.id }],
    })
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray()

  return NextResponse.json({ incoming, history })
}

export async function POST(request: Request) {
  const user = await getAuthUser()
  const authError = requireRole(user, ["MANUFACTURER", "PHARMACY"])

  if (authError) {
    return authError
  }

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const json = await request.json().catch(() => null)
  const parsed = createTransferSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 })
  }

  if (user.role === "MANUFACTURER" && parsed.data.toOwnerType !== "PHARMACY") {
    return NextResponse.json({ message: "Manufacturer can only transfer to pharmacy" }, { status: 400 })
  }

  if (user.role === "PHARMACY" && parsed.data.toOwnerType !== "CONSUMER") {
    return NextResponse.json({ message: "Pharmacy can only transfer to consumer" }, { status: 400 })
  }

  if (parsed.data.toOwnerType === "PHARMACY" && !parsed.data.toOwnerUserId) {
    return NextResponse.json({ message: "toOwnerUserId is required for pharmacy transfer" }, { status: 400 })
  }

  const now = new Date()
  const transferDate = new Date(parsed.data.transferDate)
  const unitsCollection = await getMedicineUnitsCollection()
  const transferLogsCollection = await getTransferLogsCollection()

  const units = await unitsCollection
    .find({ uuid: { $in: parsed.data.unitUuids } })
    .toArray()

  if (units.length !== parsed.data.unitUuids.length) {
    return NextResponse.json({ message: "One or more units not found" }, { status: 404 })
  }

  for (const unit of units) {
    if (unit.currentOwnerUserId !== user.id) {
      return NextResponse.json({ message: `Unit ${unit.uuid} is not owned by current user` }, { status: 403 })
    }
  }

  const transferLogs = units.map((unit) => ({
    unitUuid: unit.uuid,
    fromOwnerType: user.role,
    fromOwnerUserId: user.id,
    toOwnerType: parsed.data.toOwnerType,
    toOwnerUserId: parsed.data.toOwnerUserId,
    transferDate,
    prescriptionReference: parsed.data.prescriptionReference,
    notes: parsed.data.notes,
    status: parsed.data.toOwnerType === "CONSUMER" ? ("COMPLETED" as const) : ("PENDING" as const),
    immutable: true as const,
    createdAt: now,
    updatedAt: now,
  }))

  await transferLogsCollection.insertMany(transferLogs)

  if (parsed.data.toOwnerType === "PHARMACY") {
    await unitsCollection.updateMany(
      { uuid: { $in: parsed.data.unitUuids } },
      {
        $set: {
          status: "DISTRIBUTED",
          updatedAt: now,
        },
      }
    )
  } else {
    await unitsCollection.updateMany(
      { uuid: { $in: parsed.data.unitUuids } },
      {
        $set: {
          currentOwnerType: "CONSUMER",
          status: "SOLD_TO_CONSUMER",
          updatedAt: now,
        },
        $unset: {
          currentOwnerUserId: "",
        },
      }
    )
  }

  return NextResponse.json({ message: "Transfer recorded", transferCount: transferLogs.length }, { status: 201 })
}
