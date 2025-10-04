import type { ApprovalHistory, Company, Expense, User, WorkflowRule } from "./types"

const companies: Company[] = []
const users: User[] = []
const expenses: Expense[] = []
const approvals: ApprovalHistory[] = []
const workflows: WorkflowRule[] = []

const genId = () => Math.random().toString(36).slice(2)

export const db = {
  // Companies
  createCompany(name: string, countryCode: string, defaultCurrency: string) {
    const c: Company = {
      id: genId(),
      name,
      countryCode,
      defaultCurrency,
      createdAt: new Date().toISOString(),
    }
    companies.push(c)
    return c
  },
  getCompany(companyId: string) {
    return companies.find((c) => c.id === companyId) || null
  },

  // Users
  createUser(data: Omit<User, "id" | "createdAt">) {
    const u: User = { ...data, id: genId(), createdAt: new Date().toISOString() }
    users.push(u)
    return u
  },
  listUsers(companyId: string) {
    return users.filter((u) => u.companyId === companyId)
  },
  getUser(id: string) {
    return users.find((u) => u.id === id) || null
  },

  // Expenses
  createExpense(data: Omit<Expense, "id" | "createdAt">) {
    const e: Expense = { ...data, id: genId(), createdAt: new Date().toISOString() }
    expenses.push(e)
    return e
  },
  listExpenses(companyId: string, filter?: { userId?: string; status?: string }) {
    let list = expenses.filter((e) => e.companyId === companyId)
    if (filter?.userId) list = list.filter((e) => e.userId === filter.userId)
    if (filter?.status) list = list.filter((e) => e.status === filter.status)
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  updateExpenseStatus(expenseId: string, status: Expense["status"]) {
    const e = expenses.find((x) => x.id === expenseId)
    if (!e) return null
    e.status = status
    return e
  },

  // Approvals
  logApproval(a: Omit<ApprovalHistory, "id" | "createdAt">) {
    const rec: ApprovalHistory = { ...a, id: genId(), createdAt: new Date().toISOString() }
    approvals.push(rec)
    return rec
  },
  listApprovalsForManager(managerId: string) {
    // Manager can review employees they manage
    const managedIds = users.filter((u) => u.managerId === managerId).map((u) => u.id)
    const pending = expenses.filter((e) => managedIds.includes(e.userId) && e.status === "pending")
    return pending
  },

  // Workflows
  upsertWorkflow(rule: Omit<WorkflowRule, "id" | "createdAt"> & { id?: string }) {
    if (rule.id) {
      const idx = workflows.findIndex((w) => w.id === rule.id && w.companyId === rule.companyId)
      if (idx >= 0) {
        workflows[idx] = { ...workflows[idx], ...rule }
        return workflows[idx]
      }
    }
    const created: WorkflowRule = {
      ...rule,
      id: genId(),
      createdAt: new Date().toISOString(),
    }
    workflows.push(created)
    return created
  },
  getWorkflow(companyId: string) {
    // Return latest or default
    const list = workflows.filter((w) => w.companyId === companyId)
    return list[list.length - 1] || null
  },
}

export const convertToCompanyCurrency = (amount: number, currency: string, defaultCurrency: string) => {
  if (currency === defaultCurrency) return { convertedAmount: amount, convertedCurrency: defaultCurrency, rate: 1 }
  // fake static rate for demo purposes
  const rate = 1.1
  return { convertedAmount: Math.round(amount * rate * 100) / 100, convertedCurrency: defaultCurrency, rate }
}
