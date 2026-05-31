"use client"

import { useEffect, useState } from "react"

type User = { _id?: string; email: string; role: string; status: string }
type DrugType = { _id?: string; drugName: string; manufacturerName?: string; status?: string }

export default function GovernmentActionsClient() {
  const [pendingDrugTypes, setPendingDrugTypes] = useState<DrugType[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [approvedDrugTypes, setApprovedDrugTypes] = useState<DrugType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const [dRes, uRes] = await Promise.all([
        fetch('/api/drug-types'),
        fetch('/api/admin/accounts'),
      ])

      if (!dRes.ok) throw new Error('Failed to load drug types')
      if (!uRes.ok) throw new Error('Failed to load users')

      const dJson = await dRes.json()
      const uJson = await uRes.json()

      const allDrugTypes: DrugType[] = dJson.drugTypes ?? []
      setPendingDrugTypes(allDrugTypes.filter((d) => d.status === 'PENDING'))
      setApprovedDrugTypes(allDrugTypes.filter((d) => d.status === 'APPROVED'))

      const allUsers: User[] = uJson.users ?? []
      setUsers(allUsers)
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function reviewDrugType(id: string, status: 'APPROVED' | 'REJECTED') {
    setError(null)
    try {
      const res = await fetch(`/api/drug-types/${id}/review`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) throw new Error('Failed to update drug type')

      setPendingDrugTypes((prev) => prev.filter((p) => p._id !== id))
      // refresh approved list
      const dRes = await fetch('/api/drug-types')
      const dJson = await dRes.json()
      setApprovedDrugTypes((dJson.drugTypes ?? []).filter((d: DrugType) => d.status === 'APPROVED'))
    } catch (err: any) {
      setError(err?.message ?? String(err))
    }
  }

  async function updateAccount(userId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') {
    setError(null)
    try {
      const res = await fetch('/api/admin/accounts', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId, status }),
      })

      if (!res.ok) throw new Error('Failed to update account')

      setUsers((prev) => prev.map((u) => (u._id === userId || u.email === userId ? { ...u, status } : u)))
    } catch (err: any) {
      setError(err?.message ?? String(err))
    }
  }

  async function issueLicense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    const manufacturerUserId = (fd.get('manufacturerUserId') as string) || ''
    const licensedDrugTypeIds = (fd.getAll('licensedDrugTypeIds') as string[]) || []
    const expiryDate = fd.get('expiryDate') as string
    const jurisdiction = fd.get('jurisdiction') as string

    try {
      const payload = { manufacturerUserId, licensedDrugTypeIds, expiryDate, jurisdiction }
      const res = await fetch('/api/licenses', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed to issue license')
      // refresh licenses and users
      await fetchData()
      form.reset()
      alert('License issued')
    } catch (err: any) {
      setError(err?.message ?? String(err))
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <h3 className="text-lg font-semibold">Government actions</h3>

      {error ? <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h4 className="mb-3 font-medium">Pending drug registrations</h4>
          {loading ? (
            <p>Loading…</p>
          ) : pendingDrugTypes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending registrations.</p>
          ) : (
            <ul className="space-y-3">
              {pendingDrugTypes.map((d) => (
                <li key={d._id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{d.drugName}</div>
                    <div className="text-sm text-muted-foreground">{d.manufacturerName}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-md bg-green-600 px-3 py-1 text-white" onClick={() => d._id && reviewDrugType(d._id, 'APPROVED')}>Approve</button>
                    <button className="rounded-md bg-red-600 px-3 py-1 text-white" onClick={() => d._id && reviewDrugType(d._id, 'REJECTED')}>Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border bg-white p-4">
          <h4 className="mb-3 font-medium">Pending accounts</h4>
          {loading ? (
            <p>Loading…</p>
          ) : users.filter((u) => u.status === 'PENDING').length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending accounts.</p>
          ) : (
            <ul className="space-y-3">
              {users.filter((u) => u.status === 'PENDING').map((u) => (
                <li key={u._id ?? u.email} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{u.email}</div>
                    <div className="text-sm text-muted-foreground">{u.role}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-md bg-green-600 px-3 py-1 text-white" onClick={() => updateAccount(u._id ?? u.email, 'ACTIVE')}>Activate</button>
                    <button className="rounded-md bg-yellow-500 px-3 py-1 text-white" onClick={() => updateAccount(u._id ?? u.email, 'INACTIVE')}>Reject</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4">
        <h4 className="mb-3 font-medium">Issue manufacturing license</h4>
        <form onSubmit={issueLicense} className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Manufacturer</label>
            <select name="manufacturerUserId" required className="mt-1 w-full rounded-md border p-2">
              <option value="">Select manufacturer</option>
              {users.filter((u) => u.role === 'MANUFACTURER' && u.status === 'ACTIVE').map((m) => (
                <option key={m._id ?? m.email} value={m._id ?? m.email}>{m.email}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Expiry date</label>
            <input name="expiryDate" type="date" required className="mt-1 w-full rounded-md border p-2" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Licensed drug types (hold Ctrl to multi-select)</label>
            <select name="licensedDrugTypeIds" multiple size={4} required className="mt-1 w-full rounded-md border p-2">
              {approvedDrugTypes.map((d) => (
                <option key={d._id} value={d._id}>{d.drugName} — {d.manufacturerName}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Jurisdiction</label>
            <input name="jurisdiction" required placeholder="Country / State" className="mt-1 w-full rounded-md border p-2" />
          </div>

          <div className="md:col-span-2">
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-white">Issue License</button>
          </div>
        </form>
      </section>
    </div>
  )
}
