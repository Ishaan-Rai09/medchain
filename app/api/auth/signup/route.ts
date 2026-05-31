import { getUsersCollection } from "@/lib/mongo"
import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { z } from "zod"

const signupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  organization: z.string().trim().min(2, "Organization is required"),
  email: z.string().email("A valid email is required").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["GOVERNMENT", "MANUFACTURER", "PHARMACY"]),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = signupSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      )
    }

    const { firstName, lastName, organization, email, password, role } = parsed.data

    const usersCollection = await getUsersCollection()

    const existing = await usersCollection.findOne({ email })

    if (existing) {
      return NextResponse.json({ message: "An account with this email already exists" }, { status: 409 })
    }

    const passwordHash = await hash(password, 12)

    const now = new Date()
    const initialStatus = role === "GOVERNMENT" ? "ACTIVE" : "PENDING"

    await usersCollection.insertOne({
        name: `${firstName} ${lastName}`.trim(),
        email,
        passwordHash,
        role,
        orgName: organization,
      status: initialStatus,
        createdAt: now,
        updatedAt: now,
    })

    return NextResponse.json({ message: "Account created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Signup failed", error)

    const message = error instanceof Error ? error.message : "Unable to create account"

    return NextResponse.json(
      {
        message:
          process.env.NODE_ENV === "development"
            ? message
            : "Unable to create account",
      },
      { status: 500 }
    )
  }
}
