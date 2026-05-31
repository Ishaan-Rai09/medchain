"use client"

import { useState, useEffect } from "react"

export default function ManufacturerActionsClient() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [batches, setBatches] = useState<any[]>([])

  async function submitDrugType(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const payload = {
      drugName: fd.get('drugName') as string,
      genericName: fd.get('genericName') as string,
      category: fd.get('category') as string,
      dosageForm: fd.get('dosageForm') as string,
      strength: fd.get('strength') as string,
      manufacturerDetails: fd.get('manufacturerDetails') as string,
      batchSize: Number(fd.get('batchSize')) || 0,
    }

    try {
      const res = await fetch('/api/drug-types', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed to submit drug type')
      alert('Submitted for approval')
      e.currentTarget.reset()
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  async function createBatch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const payload = {
      drugTypeId: fd.get('drugTypeId') as string,
      lotNumber: fd.get('lotNumber') as string,
      quantity: Number(fd.get('quantity')) || 0,
      manufactureDate: fd.get('manufactureDate') as string,
      expiryDate: fd.get('expiryDate') as string,
    }

    try {
      const res = await fetch('/api/medicine/batches', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed to create batch')
      alert('Batch created')
      e.currentTarget.reset()
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
      // refresh batches
      void fetchBatches()
    }
  }

  async function fetchBatches() {
    try {
      const res = await fetch('/api/medicine/batches')
      if (!res.ok) throw new Error('Failed to load batches')
      const json = await res.json()
      setBatches(json.batches ?? [])
    } catch (err: any) {
      setError(err?.message ?? String(err))
    }
  }

  useEffect(() => { void fetchBatches() }, [])

  async function initiateTransfer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const payload = {
      toOwnerUserId: fd.get('toOwnerUserId') as string,
      unitUuids: (fd.get('unitUuids') as string || '').split(',').map(s => s.trim()).filter(Boolean),
      note: fd.get('note') as string,
    }

    try {
      const res = await fetch('/api/transfers', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed to create transfer')
      alert('Transfer created')
      e.currentTarget.reset()
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <h3 className="text-lg font-semibold">Manufacturer actions</h3>
      {error ? <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <section className="rounded-lg border bg-white p-4">
        <h4 className="mb-3 font-medium">Submit drug type for approval</h4>
        <form onSubmit={submitDrugType} className="grid gap-2 md:grid-cols-2">
          <input name="drugName" required placeholder="Drug name" className="rounded-md border p-2" />
          <input name="genericName" required placeholder="Generic name" className="rounded-md border p-2" />
          <input name="category" required placeholder="Category" className="rounded-md border p-2" />
          <input name="dosageForm" required placeholder="Dosage form" className="rounded-md border p-2" />
          <input name="strength" required placeholder="Strength" className="rounded-md border p-2" />
          <input name="batchSize" type="number" required placeholder="Suggested batch size" className="rounded-md border p-2" />
          <textarea name="manufacturerDetails" required placeholder="Manufacturer details" className="md:col-span-2 rounded-md border p-2" />
          <div className="md:col-span-2">
            <button className="rounded-md bg-primary px-4 py-2 text-white">Submit</button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h4 className="mb-3 font-medium">Create production batch</h4>
        <form onSubmit={createBatch} className="grid gap-2 md:grid-cols-2">
          <input name="drugTypeId" required placeholder="Drug type id" className="rounded-md border p-2" />
          <input name="lotNumber" required placeholder="Lot / batch number" className="rounded-md border p-2" />
          <input name="quantity" type="number" required placeholder="Quantity" className="rounded-md border p-2" />
          <input name="manufactureDate" type="date" required className="rounded-md border p-2" />
          <input name="expiryDate" type="date" required className="rounded-md border p-2" />
          <div className="md:col-span-2">
            <button className="rounded-md bg-primary px-4 py-2 text-white">Create batch</button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h4 className="mb-3 font-medium">My batches</h4>
        {batches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No batches yet.</p>
        ) : (
          <div className="space-y-3">
            {batches.map((b) => (
              <div key={b._id} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Batch {b.batchNumber}</div>
                    <div className="text-sm text-muted-foreground">Quantity: {b.quantity}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigator.clipboard?.writeText(b.batchId)} className="rounded-md border px-3 py-1 text-sm">Copy ID</button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-6 gap-2">
                  {(b.sampleUnits ?? []).map((u: any) => (
                    <div key={u.uuid} className="flex flex-col items-center text-xs">
                      <img src={u.qrDataUrl} alt={u.uuid} className="h-20 w-20 rounded-md border" />
                      <div className="mt-1 truncate">{u.uuid}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h4 className="mb-3 font-medium">Initiate transfer to partner</h4>
        <form onSubmit={initiateTransfer} className="grid gap-2 md:grid-cols-2">
          <input name="toOwnerUserId" required placeholder="Destination user id or email" className="rounded-md border p-2" />
          <input name="unitUuids" required placeholder="Comma separated unit UUIDs" className="rounded-md border p-2" />
          <textarea name="note" placeholder="Optional note" className="md:col-span-2 rounded-md border p-2" />
          <div className="md:col-span-2">
            <button className="rounded-md bg-primary px-4 py-2 text-white">Create transfer</button>
          </div>
        </form>
      </section>
    </div>
  )
}
