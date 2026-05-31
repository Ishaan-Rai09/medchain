import { authOptions } from "@/lib/auth-options"
import {
  getDrugTypesCollection,
  getLicensesCollection,
  getMedicineBatchesCollection,
  getMedicineUnitsCollection,
  getTransferLogsCollection,
  getUsersCollection,
} from "@/lib/mongo"
import { getRoleDashboardPath, getRoleFromSegment } from "@/lib/roles"
import { BadgeCheck, Building2, Factory, Pill, ShieldCheck, UserRound } from "lucide-react"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import GovernmentActionsClient from "../government-actions-client"
import ManufacturerActionsClient from "../manufacturer-actions-client"
import PharmacyActionsClient from "../pharmacy-actions-client"

type DashboardContent = {
  title: string
  description: string
  cards: Array<{ title: string; description: string; value: string }>
  Icon: typeof ShieldCheck
}

async function buildDashboard(role: "GOVERNMENT" | "MANUFACTURER" | "PHARMACY" | "CONSUMER", userId: string): Promise<DashboardContent> {
  if (role === "GOVERNMENT") {
    const [activeManufacturers, pendingAccounts, unitStatusSummary, flaggedUnits] = await Promise.all([
      getUsersCollection().then((collection) =>
        collection.countDocuments({ role: "MANUFACTURER", status: "ACTIVE" })
      ),
      getUsersCollection().then((collection) =>
        collection.countDocuments({ status: "PENDING" })
      ),
      getMedicineUnitsCollection().then((collection) =>
        collection.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray()
      ),
      getMedicineUnitsCollection().then((collection) =>
        collection.countDocuments({ authenticity: "FLAGGED" })
      ),
    ])

    const totalInCirculation = unitStatusSummary.reduce((sum, item) => sum + item.count, 0)

    return {
      title: "Government Operations Dashboard",
      description: "Issue licenses, monitor compliance, activate accounts, and investigate anomalies system-wide.",
      Icon: ShieldCheck,
      cards: [
        {
          title: "Active manufacturers",
          description: "Registered manufacturers currently active in the ecosystem.",
          value: activeManufacturers.toString(),
        },
        {
          title: "Pending account approvals",
          description: "Accounts awaiting regulator activation/deactivation action.",
          value: pendingAccounts.toString(),
        },
        {
          title: "Drugs in circulation",
          description: "Total medicine units tracked across all statuses.",
          value: totalInCirculation.toString(),
        },
        {
          title: "Flagged units",
          description: "Units with authenticity/status anomalies for investigation.",
          value: flaggedUnits.toString(),
        },
      ],
    }
  }

  if (role === "MANUFACTURER") {
    const [licenses, approvedDrugTypes, producedBatches, pendingTransfers, inTransit] = await Promise.all([
      getLicensesCollection().then((collection) =>
        collection.find({ manufacturerUserId: userId, status: "ACTIVE" }).toArray()
      ),
      getDrugTypesCollection().then((collection) =>
        collection.countDocuments({ manufacturerUserId: userId, status: "APPROVED" })
      ),
      getMedicineBatchesCollection().then((collection) =>
        collection.find({ manufacturerUserId: userId }).toArray()
      ),
      getTransferLogsCollection().then((collection) =>
        collection.countDocuments({ fromOwnerUserId: userId, status: "PENDING" })
      ),
      getMedicineUnitsCollection().then((collection) =>
        collection.countDocuments({ manufacturerUserId: userId, status: "DISTRIBUTED" })
      ),
    ])

    const licensedDrugTypes = new Set(licenses.flatMap((license) => license.licensedDrugTypeIds)).size
    const producedUnits = producedBatches.reduce((sum, batch) => sum + batch.quantity, 0)

    return {
      title: "Manufacturer Operations Dashboard",
      description: "Manage approved drug registrations, produce units, and transfer ownership to pharmacy partners.",
      Icon: Factory,
      cards: [
        {
          title: "Licensed drug types",
          description: "Unique drug types covered by active manufacturing licenses.",
          value: licensedDrugTypes.toString(),
        },
        {
          title: "Approved drug registrations",
          description: "Drug types approved by government for production.",
          value: approvedDrugTypes.toString(),
        },
        {
          title: "Units produced",
          description: "Total medicine units minted across all batches.",
          value: producedUnits.toString(),
        },
        {
          title: "Units in transit",
          description: "Units transferred out and pending downstream acceptance.",
          value: inTransit.toString(),
        },
        {
          title: "Pending transfers",
          description: "Ownership transfer events awaiting acceptance.",
          value: pendingTransfers.toString(),
        },
      ],
    }
  }

  if (role === "PHARMACY") {
    const [incomingTransfers, currentStock, salesLog, expiringSoon] = await Promise.all([
      getTransferLogsCollection().then((collection) =>
        collection.countDocuments({ toOwnerUserId: userId, status: "PENDING" })
      ),
      getMedicineUnitsCollection().then((collection) =>
        collection.countDocuments({ currentOwnerUserId: userId, status: "AT_PHARMACY" })
      ),
      getTransferLogsCollection().then((collection) =>
        collection.countDocuments({ fromOwnerUserId: userId, toOwnerType: "CONSUMER", status: "COMPLETED" })
      ),
      getMedicineBatchesCollection().then(async (collection) => {
        const now = new Date()
        const threshold = new Date(now)
        threshold.setDate(now.getDate() + 30)

        const batches = await collection
          .find({ expiryDate: { $lte: threshold, $gte: now } }, { projection: { unitUuids: 1 } })
          .toArray()

        const candidateUuids = batches.flatMap((batch) => batch.unitUuids)

        if (candidateUuids.length === 0) {
          return 0
        }

        return getMedicineUnitsCollection().then((unitsCollection) =>
          unitsCollection.countDocuments({
            uuid: { $in: candidateUuids },
            currentOwnerUserId: userId,
            status: "AT_PHARMACY",
          })
        )
      }),
    ])

    return {
      title: "Pharmacy Operations Dashboard",
      description: "Accept incoming units, track stock, transfer to consumers, and maintain prescription-linked sales logs.",
      Icon: Pill,
      cards: [
        {
          title: "Incoming transfers",
          description: "Transfer requests waiting for pharmacy acceptance.",
          value: incomingTransfers.toString(),
        },
        {
          title: "Current stock",
          description: "Units currently held at this pharmacy.",
          value: currentStock.toString(),
        },
        {
          title: "Expiry warnings (30d)",
          description: "Units in stock with upcoming expiration windows.",
          value: expiringSoon.toString(),
        },
        {
          title: "Sales log",
          description: "Completed pharmacy-to-consumer transfers.",
          value: salesLog.toString(),
        },
      ],
    }
  }

  return {
    title: "Consumer Verification Dashboard",
    description: "Consumer verification is public and does not require login. Use the portal to verify medicine authenticity by UUID or QR.",
    Icon: UserRound,
    cards: [
      {
        title: "Public verification",
        description: "Verify any medicine unit lifecycle using UUID or scan.",
        value: "Open /verify",
      },
    ],
  }
}

export default async function RoleDashboardPage({
  params,
}: {
  params: Promise<{ role: string }>
}) {
  const { role: roleSegment } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/login")
  }

  const currentRole = session.user.role

  if (!currentRole) {
    redirect("/auth/login")
  }

  const requestedRole = getRoleFromSegment(roleSegment)

  if (!requestedRole || requestedRole !== currentRole) {
    redirect(getRoleDashboardPath(currentRole))
  }

  const dashboard = await buildDashboard(currentRole, session.user.id ?? session.user.email ?? "")

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_45%,#eef6f2_100%)] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl border border-border/70 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <BadgeCheck className="h-4 w-4 text-primary" />
            Signed in as {session.user.email}
          </div>
          <div className="mt-4 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <dashboard.Icon className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{dashboard.title}</h1>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">{dashboard.description}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {dashboard.cards.map((card) => (
            <article key={card.title} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground">{card.title}</h2>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-primary">{card.value}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Quick navigation</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-foreground hover:bg-slate-50">
              <Building2 className="h-4 w-4" />
              Back to homepage
            </Link>
            <Link href="/verify" className="inline-flex items-center rounded-xl border border-border px-4 py-2 text-sm text-foreground hover:bg-slate-50">
              Public verify portal
            </Link>
            {currentRole === "GOVERNMENT" ? (
              <Link href="/api/admin/accounts" className="inline-flex items-center rounded-xl border border-border px-4 py-2 text-sm text-foreground hover:bg-slate-50">
                Account controls API
              </Link>
            ) : null}
            <Link href="/auth/login" className="inline-flex items-center rounded-xl border border-border px-4 py-2 text-sm text-foreground hover:bg-slate-50">
              Switch account
            </Link>
          </div>
        </section>
        {currentRole === "GOVERNMENT" ? (
          <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <GovernmentActionsClient />
          </section>
        ) : null}

        {currentRole === "MANUFACTURER" ? (
          <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <ManufacturerActionsClient />
          </section>
        ) : null}

        {currentRole === "PHARMACY" ? (
          <section className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <PharmacyActionsClient />
          </section>
        ) : null}
      </div>
    </div>
  )
}
