"use client"
import { useState } from "react"
import type React from "react"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useUser } from "@/components/auth/user-context"
import useSWR from "swr"
import { useMemo } from "react"

const fetcher = (url: string, init?: RequestInit) => fetch(url, init).then((r) => r.json())

export default function ExpenseForm() {
  const { session } = useUser()
  const [fileName, setFileName] = useState<string | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)

  const companyCurrency = session.company?.defaultCurrency || "USD"
  const [form, setForm] = useState({
    description: "",
    category: "Misc",
    amount: "",
    currency: companyCurrency,
    vendor: "",
    expenseDate: new Date().toISOString().slice(0, 10),
    notes: "",
  })

  const { data: countriesData } = useSWR<{ items: Array<{ currencies: Array<{ code: string; name: string }> }> }>(
    "/api/countries",
    fetcher,
  )
  const allCurrencies = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of countriesData?.items ?? []) {
      for (const cur of c.currencies) {
        if (!map.has(cur.code)) map.set(cur.code, cur.name)
      }
    }
    return Array.from(map.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.code.localeCompare(b.code))
  }, [countriesData])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!session.user || !session.company) return
    setSubmitting(true)
    try {
      await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: session.company.id,
          userId: session.user.id,
          description: form.description,
          category: form.category,
          amount: Number(form.amount || 0),
          currency: form.currency,
          vendor: form.vendor,
          expenseDate: form.expenseDate,
          receiptName: fileName,
        }),
      })
      await mutate(`/api/expenses?companyId=${session.company.id}&userId=${session.user.id}`)
      setForm({ ...form, description: "", amount: "", vendor: "", notes: "" })
      setFileName(undefined)
    } finally {
      setSubmitting(false)
    }
  }

  // "OCR" demo: prefill amount if filename like "receipt-123.45.png"
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFileName(f.name)
    const match = f.name.match(/(\d+(\.\d+)?)/)
    if (match) {
      setForm((prev) => ({ ...prev, amount: match[1] }))
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="desc">Description</Label>
          <Input
            id="desc"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Travel">Travel</SelectItem>
              <SelectItem value="Meals">Meals</SelectItem>
              <SelectItem value="Lodging">Lodging</SelectItem>
              <SelectItem value="Supplies">Supplies</SelectItem>
              <SelectItem value="Misc">Misc</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Currency</Label>
          <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              {allCurrencies.length ? (
                allCurrencies.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="vendor">Vendor</Label>
          <Input id="vendor" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="date">Expense Date</Label>
          <Input
            id="date"
            type="date"
            value={form.expenseDate}
            onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Attach Receipt</Label>
          <Input type="file" accept="image/*,application/pdf" onChange={onFileChange} />
          {fileName ? <p className="text-xs text-muted-foreground mt-1">Attached: {fileName}</p> : null}
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  )
}
