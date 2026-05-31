"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode"
import { useEffect, useState } from "react"

type VerifyResponse = {
  authenticity: "VERIFIED" | "FLAGGED" | "NOT_FOUND"
  message?: string
  uuid?: string
  currentStatus?: string
  currentOwnerType?: string
  drug?: {
    batchNumber?: string
    expiryDate?: string
    details?: {
      drugName?: string
      genericName?: string
      category?: string
      dosageForm?: string
      strength?: string
    }
  }
  timeline?: Array<{
    transferDate: string
    fromOwnerType: string
    toOwnerType: string
    status: string
    notes?: string
    prescriptionReference?: string
  }>
}

export function VerifyClient({ initialUuid }: { initialUuid?: string }) {
  const [uuid, setUuid] = useState(initialUuid ?? "")
  const [result, setResult] = useState<VerifyResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null)
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  async function verify(targetUuid: string) {
    if (!targetUuid) {
      return
    }

    setIsVerifying(true)
    setError(null)

    const response = await fetch(`/api/verify/${targetUuid}`)
    const payload = (await response.json().catch(() => ({ authenticity: "NOT_FOUND", message: "Invalid response" }))) as VerifyResponse

    setIsVerifying(false)

    if (!response.ok) {
      setResult(payload)
      setError(payload.message ?? "Unable to verify")
      return
    }

    setResult(payload)
  }

  async function toggleScanner() {
    if (isScannerOpen) {
      if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        await scanner.stop()
      }
      await scanner?.clear()
      setScanner(null)
      setIsScannerOpen(false)
      return
    }

    const nextScanner = new Html5Qrcode("verify-qr-reader")
    setScanner(nextScanner)
    setIsScannerOpen(true)

    await nextScanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      async (decodedText) => {
        const parsedUuid = decodedText.includes("uuid=")
          ? new URL(decodedText).searchParams.get("uuid") ?? decodedText
          : decodedText

        setUuid(parsedUuid)
        await verify(parsedUuid)
        await nextScanner.stop()
        await nextScanner.clear()
        setScanner(null)
        setIsScannerOpen(false)
      },
      () => {}
    )
  }

  useEffect(() => {
    if (initialUuid) {
      void verify(initialUuid)
    }
  }, [initialUuid])

  useEffect(() => {
    return () => {
      if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        void scanner.stop().then(() => scanner.clear())
      }
    }
  }, [scanner])

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Public Medicine Verification</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Enter UUID manually or scan QR code from package to validate authenticity and ownership timeline.
        </p>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="uuid">Medicine UUID</Label>
            <Input id="uuid" value={uuid} onChange={(event) => setUuid(event.target.value)} placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000" />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void verify(uuid)} disabled={isVerifying || !uuid}>
              {isVerifying ? "Verifying..." : "Verify UUID"}
            </Button>
            <Button variant="outline" onClick={() => void toggleScanner()}>
              {isScannerOpen ? "Stop scanner" : "Scan QR"}
            </Button>
          </div>

          {isScannerOpen ? <div id="verify-qr-reader" className="overflow-hidden rounded-2xl border border-border p-2" /> : null}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <h3 className="text-xl font-semibold text-foreground">Verification Result</h3>

        {!result && !error ? (
          <p className="mt-4 text-sm text-muted-foreground">No verification yet.</p>
        ) : null}

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        {result ? (
          <div className="mt-4 space-y-5">
            <div className="rounded-2xl border border-border bg-slate-50 p-4">
              <p className="text-sm text-muted-foreground">Authenticity</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {result.authenticity === "VERIFIED" ? "Verified" : result.authenticity === "FLAGGED" ? "Flagged" : "Not Found"}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Current status</p>
                <p className="mt-1 text-sm font-medium text-foreground">{result.currentStatus ?? "-"}</p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Current owner type</p>
                <p className="mt-1 text-sm font-medium text-foreground">{result.currentOwnerType ?? "-"}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Drug</p>
              <p className="mt-1 text-sm font-medium text-foreground">{result.drug?.details?.drugName ?? "-"}</p>
              <p className="mt-1 text-sm text-muted-foreground">Batch: {result.drug?.batchNumber ?? "-"}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">Ownership timeline</p>
              <div className="mt-3 space-y-2">
                {result.timeline?.length ? (
                  result.timeline.map((event, index) => (
                    <div key={`${event.transferDate}-${index}`} className="rounded-2xl border border-border p-3 text-sm">
                      <p className="font-medium text-foreground">{event.fromOwnerType} → {event.toOwnerType}</p>
                      <p className="text-muted-foreground">{new Date(event.transferDate).toLocaleString()} | {event.status}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No transfer records yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
