"use client"

import { useEffect, useState } from "react"

type Transfer = { _id?: string; unitUuid: string; fromOwnerUserId: string; status: string; createdAt?: string }

export default function PharmacyActionsClient() {
  const [incoming, setIncoming] = useState<Transfer[]>([])
  const [history, setHistory] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/transfers')
      if (!res.ok) throw new Error('Failed to load transfers')
      const json = await res.json()
      setIncoming(json.incoming ?? [])
      setHistory(json.history ?? [])
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  async function decide(id: string, decision: 'ACCEPT' | 'REJECT') {
    setError(null)
    try {
      const res = await fetch(`/api/transfers/${id}/decision`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ decision }) })
      if (!res.ok) throw new Error('Failed to update transfer')
      fetchData()
    } catch (err: any) {
      setError(err?.message ?? String(err))
    }
  }

  async function sellToConsumer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const unitUuids = (fd.get('unitUuids') as string || '').split(',').map(s => s.trim()).filter(Boolean)
    const prescriptionReference = fd.get('prescriptionReference') as string
    try {
      const payload = { unitUuids, toOwnerType: 'CONSUMER', transferDate: new Date().toISOString(), prescriptionReference }
      const res = await fetch('/api/transfers', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed to record sale')
      alert('Sale recorded')
      e.currentTarget.reset()
      fetchData()
    } catch (err: any) {
      setError(err?.message ?? String(err))
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <h3 className="text-lg font-semibold">Pharmacy actions</h3>
      {error ? <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <section className="rounded-lg border bg-white p-4">
        <h4 className="mb-3 font-medium">Incoming transfers</h4>
        {loading ? <p>Loading…</p> : incoming.length === 0 ? <p className="text-sm text-muted-foreground">No incoming transfers.</p> : (
          <ul className="space-y-2">
            {incoming.map(t => (
              <li key={t._id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Unit {t.unitUuid}</div>
                  <div className="text-sm text-muted-foreground">From: {t.fromOwnerUserId}</div>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-md bg-green-600 px-3 py-1 text-white" onClick={() => t._id && decide(t._id, 'ACCEPT')}>Accept</button>
                  <button className="rounded-md bg-red-600 px-3 py-1 text-white" onClick={() => t._id && decide(t._id, 'REJECT')}>Reject</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h4 className="mb-3 font-medium">Record sale to consumer</h4>
        <form onSubmit={sellToConsumer} className="grid gap-2 md:grid-cols-2">
          <input name="unitUuids" required placeholder="Comma separated unit UUIDs" className="rounded-md border p-2" />
          <input name="prescriptionReference" placeholder="Prescription ref (optional)" className="rounded-md border p-2" />
          <div className="md:col-span-2">
            <button className="rounded-md bg-primary px-4 py-2 text-white">Record sale</button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h4 className="mb-3 font-medium">Transfer history</h4>
        {history.length === 0 ? <p className="text-sm text-muted-foreground">No recent transfers.</p> : (
          <ul className="space-y-2">
            {history.map(h => (
              <li key={h._id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Unit {h.unitUuid}</div>
                  <div className="text-sm text-muted-foreground">Status: {h.status}</div>
                </div>
                <div className="text-sm text-muted-foreground">{h.createdAt ? new Date(h.createdAt).toLocaleString() : ''}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
