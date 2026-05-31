"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { ArrowRight, Building2 } from "lucide-react"

type SignupRole = "GOVERNMENT" | "MANUFACTURER" | "PHARMACY"

export default function SignupPage() {
  const router = useRouter()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [organization, setOrganization] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<SignupRole>("MANUFACTURER")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsSubmitting(true)

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        organization,
        email,
        password,
        role,
      }),
    })

    const payload = (await response.json().catch(() => ({ message: "Unable to create account" }))) as {
      message?: string
    }

    if (!response.ok) {
      setIsSubmitting(false)
      toast.error(payload.message ?? "Unable to create account")
      return
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    })

    setIsSubmitting(false)

    if (!signInResult || signInResult.error) {
      toast.success("Account created. Please sign in.")
      router.push("/auth/login")
      return
    }

    toast.success("Account created and signed in")
    router.push(signInResult.url ?? "/dashboard")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_30%),linear-gradient(180deg,#f8fbff_0%,#ffffff_45%,#eef4ff_100%)] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center">
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

          <section className="flex items-center lg:justify-end">
            <Card className="mx-auto w-full max-w-2xl rounded-3xl border-border/70 bg-white/95 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.24)] backdrop-blur">
              <CardHeader className="space-y-3 px-6 pt-7 pb-5 sm:px-8 sm:pt-8 sm:pb-6">
                <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">Create account</CardTitle>
                <CardDescription className="text-base leading-7 text-muted-foreground">
                  Register your organization and prepare for role-based access.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-6 pb-7 sm:px-8 sm:pb-8">
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        placeholder="Amina"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        placeholder="Khan"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      placeholder="Ministry of Health"
                      value={organization}
                      onChange={(event) => setOrganization(event.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={(value) => setRole(value as SignupRole)}>
                      <SelectTrigger id="role" className="h-11 w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GOVERNMENT">Government</SelectItem>
                        <SelectItem value="MANUFACTURER">Manufacturer</SelectItem>
                        <SelectItem value="PHARMACY">Pharmacy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@agency.gov"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a secure password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSubmitting ? "Creating account..." : "Create account"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account? <Link href="/auth/login" className="font-medium text-foreground hover:underline">Sign in</Link>
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}