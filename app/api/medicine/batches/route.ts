import {
  getDrugTypesCollection,
  getLicensesCollection,
  getMedicineBatchesCollection,
  getMedicineUnitsCollection,
} from "@/lib/mongo"
import { toObjectId } from "@/lib/object-id"
import { getAuthUser, requireRole } from "@/lib/server-auth"
import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import QRCode from "qrcode"
import { z } from "zod"

const createBatchSchema = z.object({
  drugTypeId: z.string().min(1),
  batchNumber: z.string().trim().min(2),
  manufacturingDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
  quantity: z.number().int().positive().max(5000),
})

export async function POST(request: Request) {
  const user = await getAuthUser()
  const authError = requireRole(user, ["MANUFACTURER"])

  if (authError) {
    return authError
  }

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const json = await request.json().catch(() => null)
  const parsed = createBatchSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 })
  }

  const drugTypeObjectId = toObjectId(parsed.data.drugTypeId)

  if (!drugTypeObjectId) {
    return NextResponse.json({ message: "Invalid drug type id" }, { status: 400 })
  }

  const drugTypesCollection = await getDrugTypesCollection()
  const drugType = await drugTypesCollection.findOne({ _id: drugTypeObjectId })

  if (!drugType || drugType.manufacturerUserId !== user.id) {
    return NextResponse.json({ message: "Drug type not found for this manufacturer" }, { status: 404 })
  }

  if (drugType.status !== "APPROVED") {
    return NextResponse.json({ message: "Drug type must be approved before production" }, { status: 400 })
  }

  const licensesCollection = await getLicensesCollection()
  const license = await licensesCollection.findOne({
    manufacturerUserId: user.id,
    status: "ACTIVE",
    licensedDrugTypeIds: parsed.data.drugTypeId,
  })

  if (!license || license.expiryDate < new Date()) {
    return NextResponse.json({ message: "No active license for this drug type" }, { status: 400 })
  }

  const now = new Date()
  const batchId = randomUUID()

  const units = await Promise.all(
    Array.from({ length: parsed.data.quantity }, async () => {
      const uuid = randomUUID()
      const verifyUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/verify?uuid=${uuid}`
      const qrDataUrl = await QRCode.toDataURL(verifyUrl)

      return {
        uuid,
        batchId,
        drugTypeId: parsed.data.drugTypeId,
        manufacturerUserId: user.id,
        currentOwnerType: "MANUFACTURER" as const,
        currentOwnerUserId: user.id,
        status: "IN_PRODUCTION" as const,
        authenticity: "VERIFIED" as const,
        qrDataUrl,
        createdAt: now,
        updatedAt: now,
      }
    })
  )

  const unitsCollection = await getMedicineUnitsCollection()
  await unitsCollection.insertMany(units)

  const batchesCollection = await getMedicineBatchesCollection()
  await batchesCollection.insertOne({
    manufacturerUserId: user.id,
    drugTypeId: parsed.data.drugTypeId,
    batchNumber: parsed.data.batchNumber,
    manufacturingDate: new Date(parsed.data.manufacturingDate),
    expiryDate: new Date(parsed.data.expiryDate),
    quantity: parsed.data.quantity,
    unitUuids: units.map((unit) => unit.uuid),
    createdAt: now,
    updatedAt: now,
  })

  return NextResponse.json(
    {
      message: "Batch registered and units minted",
      batchId,
      quantity: units.length,
      sampleUnitUuid: units[0]?.uuid,
    },
    { status: 201 }
  )
}

export async function GET(request: Request) {
  const user = await getAuthUser()

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const batchesCollection = await getMedicineBatchesCollection()
  const unitsCollection = await getMedicineUnitsCollection()

  const query = user.role === "GOVERNMENT" ? {} : { manufacturerUserId: user.id }

  const batches = await batchesCollection.find(query).sort({ createdAt: -1 }).limit(200).toArray()

  // include a few sample unit QR images for convenience
  const enriched = await Promise.all(
    batches.map(async (b) => {
      const sampleUuids = (b.unitUuids ?? []).slice(0, 6)
      const units = sampleUuids.length ? await unitsCollection.find({ uuid: { $in: sampleUuids } }).toArray() : []
      return { ...b, sampleUnits: units.map((u) => ({ uuid: u.uuid, qrDataUrl: u.qrDataUrl })) }
    })
  )

  return NextResponse.json({ batches: enriched })
}
