import { getDrugTypesCollection } from "@/lib/mongo"
import { getAuthUser, requireRole } from "@/lib/server-auth"
import { NextResponse } from "next/server"
import { z } from "zod"

const createDrugTypeSchema = z.object({
  drugName: z.string().trim().min(2),
  genericName: z.string().trim().min(2),
  category: z.string().trim().min(2),
  dosageForm: z.string().trim().min(2),
  strength: z.string().trim().min(1),
  manufacturerDetails: z.string().trim().min(2),
  batchSize: z.number().int().positive(),
})

export async function GET() {
  const user = await getAuthUser()

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const drugTypesCollection = await getDrugTypesCollection()
  const query = user.role === "GOVERNMENT" ? {} : { manufacturerUserId: user.id }
  const drugTypes = await drugTypesCollection.find(query).sort({ createdAt: -1 }).toArray()

  return NextResponse.json({ drugTypes })
}

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
  const parsed = createDrugTypeSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 })
  }

  const now = new Date()
  const drugTypesCollection = await getDrugTypesCollection()

  await drugTypesCollection.insertOne({
    manufacturerUserId: user.id,
    manufacturerName: user.email,
    drugName: parsed.data.drugName,
    genericName: parsed.data.genericName,
    category: parsed.data.category,
    dosageForm: parsed.data.dosageForm,
    strength: parsed.data.strength,
    manufacturerDetails: parsed.data.manufacturerDetails,
    batchSize: parsed.data.batchSize,
    status: "PENDING",
    createdAt: now,
    updatedAt: now,
  })

  return NextResponse.json({ message: "Drug type submitted for approval" }, { status: 201 })
}
