import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowRight, Building2, ShieldCheck } from "lucide-react"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_30%),linear-gradient(180deg,#f8fbff_0%,#ffffff_45%,#eef4ff_100%)] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-10 lg:grid-cols-[0.98fr_1.02fr] lg:gap-14">
          <section className="flex flex-col justify-center space-y-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800 shadow-sm">
              <Building2 className="h-4 w-4" />
              Request onboarding for your organization
            </div>

            <div className="space-y-5">
              <h1 className="text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-6xl">
                Create a MedChain account for regulated operations.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Set up access for your team, align a verified organization profile, and prepare to manage licenses, units, and transfer logs.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Verified onboarding", "Accounts can be reviewed before activation if the workflow requires it."],
                ["Organization first", "The platform is designed around agency and company-level access."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-3xl border border-border bg-white/90 p-5 shadow-sm backdrop-blur">
                  <h2 className="text-base font-semibold text-foreground">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex items-center">
            <Card className="w-full border-border/70 bg-white/95 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)] backdrop-blur">
              <CardHeader className="space-y-3 pb-6">
                <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">Create account</CardTitle>
                <CardDescription className="text-base leading-7 text-muted-foreground">
                  Register your organization and prepare for role-based access.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" placeholder="Amina" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" placeholder="Khan" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input id="organization" placeholder="Ministry of Health" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@agency.gov" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Create a secure password" />
                </div>

                <Button className="h-12 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  Request access
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account? <Link href="/auth/login" className="font-medium text-foreground hover:underline">Sign in</Link>
                </p>

                <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  <ShieldCheck className="h-4 w-4" />
                  This onboarding form is a UI shell until the auth workflow is wired up.
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}