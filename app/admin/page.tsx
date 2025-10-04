import AppNav from "@/components/app-nav"
import UsersTable from "@/components/admin/users-table"
import { UserProvider } from "@/components/auth/user-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminPage() {
  return (
    <UserProvider>
      <AppNav />
      <main className="mx-auto max-w-6xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Admin · Users</h1>
          <Link href="/admin/workflows">
            <Button variant="secondary">Approval Rules</Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <UsersTable />
          </CardContent>
        </Card>
      </main>
    </UserProvider>
  )
}
