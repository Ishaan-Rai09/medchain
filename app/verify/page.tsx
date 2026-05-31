import { VerifyClient } from "@/app/verify/verify-client"

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ uuid?: string }>
}) {
  const { uuid } = await searchParams

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_45%,#eef6f2_100%)] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-border bg-white/90 p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Verify Medicine Authenticity
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            Public portal for UUID and QR-based verification with full lifecycle timeline and ownership state.
          </p>
        </header>

        <VerifyClient initialUuid={uuid} />
      </div>
    </div>
  )
}
