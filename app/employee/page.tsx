import AppNav from "@/components/app-nav"
import ExpenseForm from "@/components/employee/expense-form"
import ExpensesTable from "@/components/employee/expenses-table"
import { UserProvider } from "@/components/auth/user-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EmployeePage() {
  return (
    <UserProvider>
      <AppNav />
      <main className="mx-auto max-w-6xl p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesTable />
          </CardContent>
        </Card>
      </main>
    </UserProvider>
  )
}
