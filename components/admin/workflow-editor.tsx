"use client"
import useSWR, { mutate } from "swr"
import type React from "react"

import { useUser } from "@/components/auth/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function WorkflowEditor() {
  const { session } = useUser()
  const companyId = session.company?.id
  const { data } = useSWR(companyId ? `/api/workflows?companyId=${companyId}` : null, fetcher)

  const rule = data?.item
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!companyId) return
    const fd = new FormData(e.currentTarget)
    const minimumApprovalPercent = Number(fd.get("percent") || 0)
    const autoApproveCategories = String(fd.get("autoCats") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    await fetch("/api/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        name: "Default",
        minimumApprovalPercent,
        config: { autoApproveCategories },
      }),
    })
    await mutate(`/api/workflows?companyId=${companyId}`)
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-md border p-4">
      <div>
        <Label>Minimum approval percentage</Label>
        <Input name="percent" type="number" min={0} max={100} defaultValue={rule?.minimumApprovalPercent ?? 0} />
      </div>
      <div>
        <Label>Auto-approve categories (comma separated)</Label>
        <Input
          name="autoCats"
          placeholder="e.g. Misc, Snacks"
          defaultValue={(rule?.config?.autoApproveCategories || []).join(", ")}
        />
      </div>
      <Separator />
      <Button type="submit">Save Rules</Button>
    </form>
  )
}
