import { Db, MongoClient, type Collection, type ObjectId } from "mongodb"

export type AuthRole = "GOVERNMENT" | "MANUFACTURER" | "PHARMACY" | "CONSUMER"
export type AccountStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING"
export type DrugTypeStatus = "PENDING" | "APPROVED" | "REJECTED" | "REVOKED"
export type LicenseStatus = "ACTIVE" | "EXPIRED" | "REVOKED"
export type UnitStatus = "IN_PRODUCTION" | "DISTRIBUTED" | "AT_PHARMACY" | "SOLD_TO_CONSUMER"
export type TransferStatus = "PENDING" | "COMPLETED" | "REJECTED"

export type AuthUserDoc = {
  _id?: ObjectId
  name?: string
  email: string
  passwordHash?: string
  role: AuthRole
  orgName?: string
  status: AccountStatus
  createdAt: Date
  updatedAt: Date
}

export type DrugTypeDoc = {
  _id?: ObjectId
  manufacturerUserId: string
  manufacturerName?: string
  drugName: string
  genericName: string
  category: string
  dosageForm: string
  strength: string
  manufacturerDetails: string
  batchSize: number
  status: DrugTypeStatus
  reviewReason?: string
  reviewedByUserId?: string
  createdAt: Date
  updatedAt: Date
}

export type LicenseDoc = {
  _id?: ObjectId
  licenseId: string
  manufacturerUserId: string
  licensedDrugTypeIds: string[]
  expiryDate: Date
  jurisdiction: string
  status: LicenseStatus
  issuedByUserId: string
  createdAt: Date
  updatedAt: Date
}

export type MedicineBatchDoc = {
  _id?: ObjectId
  manufacturerUserId: string
  drugTypeId: string
  batchNumber: string
  manufacturingDate: Date
  expiryDate: Date
  quantity: number
  unitUuids: string[]
  createdAt: Date
  updatedAt: Date
}

export type MedicineUnitDoc = {
  _id?: ObjectId
  uuid: string
  batchId: string
  drugTypeId: string
  manufacturerUserId: string
  currentOwnerType: AuthRole
  currentOwnerUserId?: string
  status: UnitStatus
  authenticity: "VERIFIED" | "FLAGGED"
  qrDataUrl: string
  createdAt: Date
  updatedAt: Date
}

export type TransferLogDoc = {
  _id?: ObjectId
  unitUuid: string
  fromOwnerType: AuthRole
  fromOwnerUserId?: string
  toOwnerType: AuthRole
  toOwnerUserId?: string
  transferDate: Date
  prescriptionReference?: string
  notes?: string
  status: TransferStatus
  immutable: true
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

function validateConnectionString(uri: string): void {
  if (uri.includes("<cluster>")) {
    throw new Error(
      "DATABASE_URL contains <cluster>. Replace it with your real MongoDB Atlas cluster host."
    )
  }
}

export function getMongoClientPromise(): Promise<MongoClient> {
  if (!globalForMongo.mongoClientPromise) {
    validateConnectionString(connectionString)
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

export async function getDb(): Promise<Db> {
  const client = await getMongoClientPromise()
  const dbName = getDbNameFromConnectionString(connectionString)
  return client.db(dbName)
}

export async function getUsersCollection(): Promise<Collection<AuthUserDoc>> {
  const db = await getDb()
  return db.collection<AuthUserDoc>("users")
}

export async function getDrugTypesCollection(): Promise<Collection<DrugTypeDoc>> {
  const db = await getDb()
  return db.collection<DrugTypeDoc>("drugTypes")
}

export async function getLicensesCollection(): Promise<Collection<LicenseDoc>> {
  const db = await getDb()
  return db.collection<LicenseDoc>("licenses")
}

export async function getMedicineBatchesCollection(): Promise<Collection<MedicineBatchDoc>> {
  const db = await getDb()
  return db.collection<MedicineBatchDoc>("medicineBatches")
}

export async function getMedicineUnitsCollection(): Promise<Collection<MedicineUnitDoc>> {
  const db = await getDb()
  return db.collection<MedicineUnitDoc>("medicineUnits")
}

export async function getTransferLogsCollection(): Promise<Collection<TransferLogDoc>> {
  const db = await getDb()
  return db.collection<TransferLogDoc>("transferLogs")
}
