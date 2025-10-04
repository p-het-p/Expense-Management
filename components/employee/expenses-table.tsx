"use client"
import useSWR from "swr"
import { useUser } from "@/components/auth/user-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ExpensesTable() {
  const { session } = useUser()
  const companyId = session.company?.id
  const userId = session.user?.id
  const { data } = useSWR(companyId && userId ? `/api/expenses?companyId=${companyId}&userId=${userId}` : null, fetcher)

  const rows = data?.items || []
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Converted</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((e: any) => (
            <TableRow key={e.id}>
              <TableCell>{new Date(e.expenseDate).toLocaleDateString()}</TableCell>
              <TableCell>{e.description}</TableCell>
              <TableCell>{e.category}</TableCell>
              <TableCell className="text-right">
                {e.amount} {e.currency}
              </TableCell>
              <TableCell>
                {e.convertedAmount} {e.convertedCurrency}
              </TableCell>
              <TableCell
                className={e.status === "approved" ? "text-green-600" : e.status === "rejected" ? "text-red-600" : ""}
              >
                {e.status}
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No expenses yet.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  )
}
