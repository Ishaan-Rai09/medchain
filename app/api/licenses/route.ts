import { getLicensesCollection, getUsersCollection } from "@/lib/mongo"
import { toObjectId } from "@/lib/object-id"
import { getAuthUser, requireRole } from "@/lib/server-auth"
import { randomUUID } from "crypto"
import { NextResponse } from "next/server"
import { z } from "zod"

const createLicenseSchema = z.object({
  manufacturerUserId: z.string().min(1),
  licensedDrugTypeIds: z.array(z.string().min(1)).min(1),
  expiryDate: z.string().datetime(),
  jurisdiction: z.string().trim().min(2),
})

export async function GET() {
  const user = await getAuthUser()

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const licensesCollection = await getLicensesCollection()
  const query = user.role === "GOVERNMENT" ? {} : { manufacturerUserId: user.id }
  const licenses = await licensesCollection.find(query).sort({ createdAt: -1 }).toArray()

  return NextResponse.json({ licenses })
}

export async function POST(request: Request) {
  const user = await getAuthUser()
  const authError = requireRole(user, ["GOVERNMENT"])

  if (authError) {
    return authError
  }

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const json = await request.json().catch(() => null)
  const parsed = createLicenseSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 })
  }

  const usersCollection = await getUsersCollection()
  const manufacturerObjectId = toObjectId(parsed.data.manufacturerUserId)
  const manufacturer = manufacturerObjectId
    ? await usersCollection.findOne({ _id: manufacturerObjectId })
    : await usersCollection.findOne({ email: parsed.data.manufacturerUserId })

  if (!manufacturer || manufacturer.role !== "MANUFACTURER") {
    return NextResponse.json({ message: "Manufacturer account not found" }, { status: 404 })
  }

  const now = new Date()
  const licensesCollection = await getLicensesCollection()

  await licensesCollection.insertOne({
    licenseId: `LIC-${randomUUID().slice(0, 8).toUpperCase()}`,
    manufacturerUserId: manufacturer._id?.toString() ?? manufacturer.email,
    licensedDrugTypeIds: parsed.data.licensedDrugTypeIds,
    expiryDate: new Date(parsed.data.expiryDate),
    jurisdiction: parsed.data.jurisdiction,
    status: "ACTIVE",
    issuedByUserId: user.id,
    createdAt: now,
    updatedAt: now,
  })

  return NextResponse.json({ message: "License issued" }, { status: 201 })
}
