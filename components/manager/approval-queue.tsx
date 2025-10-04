"use client"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { useUser } from "@/components/auth/user-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ApprovalQueue() {
  const { session } = useUser()
  const uid = session.user?.id
  const { data } = useSWR(uid ? `/api/approvals/queue?managerId=${uid}` : null, fetcher)

  async function act(id: string, action: "approve" | "reject") {
    await fetch(`/api/approvals/${id}/${action}`, { method: "POST" })
    await mutate(`/api/approvals/queue?managerId=${uid}`)
  }

  const rows = data?.items || []
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Converted</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((e: any) => (
            <TableRow key={e.id}>
              <TableCell>{e.employeeName}</TableCell>
              <TableCell>{e.description}</TableCell>
              <TableCell>{new Date(e.expenseDate).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                {e.amount} {e.currency}
              </TableCell>
              <TableCell>
                {e.convertedAmount} {e.convertedCurrency}
              </TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" onClick={() => act(e.id, "approve")}>
                  Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => act(e.id, "reject")}>
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No items to review.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  )
}
