import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, BadgeCheck, Boxes, Building2, QrCode, ScanLine, ShieldCheck, Workflow } from "lucide-react"

export default function HomePage() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: "Regulatory control",
      description: "License issuance, drug approvals, and account activation all stay under government oversight.",
    },
    {
      icon: Boxes,
      title: "Unit-level traceability",
      description: "Every medicine unit receives a non-sequential UUID and immutable custody history.",
    },
    {
      icon: QrCode,
      title: "QR verification",
      description: "Public verification works from UUID entry or camera scan, with no login required.",
    },
    {
      icon: Workflow,
      title: "Controlled transfers",
      description: "Manufacturer to pharmacy to consumer handoffs are recorded as insert-only audit events.",
    },
  ]

  const roles = [
    "Government / Regulator",
    "Manufacturer",
    "Pharmacy / Distributor",
    "Consumer verification portal",
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-12 pt-6 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-border/70 bg-white/80 px-5 py-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">MedChain</p>
              <p className="text-sm text-foreground/80">Medical supply chain traceability platform</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Government sign-in</Link>
            </Button>
            <Button asChild className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/auth/signup">
                Launch portal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <main className="relative z-10 flex flex-1 items-center py-12 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <section className="max-w-3xl space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                Government-grade traceability and public verification
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-6xl lg:text-7xl">
                  Track every medicine unit from manufacture to consumer with an auditable chain of custody.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                  MedChain gives regulators, manufacturers, pharmacies, and consumers a single secure platform for licensing, batch creation, transfer logging, and public authenticity checks.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button size="lg" asChild className="h-12 gap-2 px-6 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/auth/login">
                    Access role dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 border-border bg-white px-6 text-foreground hover:bg-slate-50">
                  <Link href="/auth/signup">Request onboarding</Link>
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {roles.map((role) => (
                  <div key={role} className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{role}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Platform snapshot</p>
                    <h2 className="mt-1 text-2xl font-semibold text-foreground">Operational overview</h2>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Verified</div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    ["UUID generation", "crypto.randomUUID()"],
                    ["Production state", "In Production"],
                    ["Transfer log", "Immutable insert-only records"],
                    ["Public portal", "No login required"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                      <ScanLine className="h-5 w-5 text-emerald-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Public verification</p>
                      <p className="font-semibold">Scan or enter a medicine UUID to inspect lineage</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>

        <section className="relative z-10 grid gap-4 pb-8 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-primary">
                <pillar.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{pillar.description}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
