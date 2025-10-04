"use client"
import useSWR, { mutate } from "swr"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"
import { useUser } from "@/components/auth/user-context"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function UsersTable() {
  const { session } = useUser()
  const companyId = session.company?.id
  const { data } = useSWR(companyId ? `/api/users?companyId=${companyId}` : null, fetcher)

  const [form, setForm] = useState({ name: "", email: "", role: "employee", managerId: null })

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId) return
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, ...form }),
    })
    await mutate(`/api/users?companyId=${companyId}`)
    setForm({ name: "", email: "", role: "employee", managerId: null })
  }

  const managers = (data?.items || []).filter((u: any) => u.role === "manager")

  return (
    <div className="space-y-6">
      <form onSubmit={onCreate} className="rounded-md border p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label>Name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Role</Label>
          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Manager</Label>
          <Select value={form.managerId} onValueChange={(v) => setForm({ ...form, managerId: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>None</SelectItem>
              {managers.map((m: any) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-4">
          <Button type="submit">Add User</Button>
        </div>
      </form>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Manager</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.items || []).map((u: any) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.managerName || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
