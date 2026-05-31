import { MongoClient, type Collection, type ObjectId } from "mongodb"

export type AuthUserDoc = {
  _id?: ObjectId
  name?: string
  email: string
  passwordHash?: string
  role: "GOVERNMENT" | "MANUFACTURER" | "PHARMACY" | "CONSUMER"
  orgName?: string
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING"
  createdAt: Date
  updatedAt: Date
}

const connectionString = process.env.DATABASE_URL ?? ""

if (!connectionString) {
  throw new Error("DATABASE_URL is required")
}

const globalForMongo = globalThis as unknown as {
  mongoClientPromise: Promise<MongoClient> | undefined
}

function getMongoClientPromise(): Promise<MongoClient> {
  if (!globalForMongo.mongoClientPromise) {
    globalForMongo.mongoClientPromise = new MongoClient(connectionString).connect()
  }

  return globalForMongo.mongoClientPromise
}

function getDbNameFromConnectionString(uri: string): string {
  const explicit = process.env.MONGODB_DB_NAME?.trim()

  if (explicit) {
    return explicit
  }

  try {
    const parsed = new URL(uri)
    const dbName = parsed.pathname.replace(/^\/+/, "")
    return dbName || "medchain"
  } catch {
    const pathMatch = uri.match(/\/([^/?]+)(\?|$)/)
    return pathMatch?.[1] || "medchain"
  }
}

export async function getUsersCollection(): Promise<Collection<AuthUserDoc>> {
  const client = await getMongoClientPromise()
  const dbName = getDbNameFromConnectionString(connectionString)
  return client.db(dbName).collection<AuthUserDoc>("users")
}
