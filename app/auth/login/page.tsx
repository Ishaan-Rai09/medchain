import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_30%),linear-gradient(180deg,#f8fbff_0%,#ffffff_45%,#eef6f2_100%)] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <section className="flex flex-col justify-center space-y-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              Secure access for government and enterprise users
            </div>

            <div className="space-y-5">
              <h1 className="text-5xl font-semibold tracking-tight text-balance text-foreground sm:text-6xl">
                Sign in to the MedChain control plane.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Access licensing, batch oversight, transfer records, and verification tools from a single operational workspace.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Role-based access", "Government, manufacturer, pharmacy, and consumer views are isolated by role."],
                ["Audit ready", "Every operational action is designed to leave a traceable record."],
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
                <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">Sign in</CardTitle>
                <CardDescription className="text-base leading-7 text-muted-foreground">
                  Use your MedChain credentials to continue.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@agency.gov" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <Link href="/auth/signup" className="font-medium text-primary hover:underline">
                    Request access
                  </Link>
                  <span className="text-muted-foreground">Password reset flows come next</span>
                </div>

                <Button className="h-12 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Need onboarding instead? <Link href="/auth/signup" className="font-medium text-foreground hover:underline">Create an account</Link>
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}