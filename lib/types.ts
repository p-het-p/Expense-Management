export type Role = "admin" | "manager" | "employee"

export interface Company {
  id: string
  name: string
  countryCode: string
  defaultCurrency: string
  createdAt: string
}

export interface User {
  id: string
  companyId: string
  name: string
  email: string
  role: Role
  managerId?: string | null
  createdAt: string
}

export type ExpenseStatus = "pending" | "approved" | "rejected"

export interface Expense {
  id: string
  companyId: string
  userId: string
  description: string
  category: string
  amount: number
  currency: string
  convertedAmount: number
  convertedCurrency: string
  vendor?: string
  expenseDate: string
  status: ExpenseStatus
  receiptName?: string
  createdAt: string
}

export interface ApprovalHistory {
  id: string
  expenseId: string
  actorUserId: string
  action: "submit" | "approve" | "reject"
  comment?: string
  createdAt: string
}

export interface WorkflowRule {
  id: string
  companyId: string
  name: string
  minimumApprovalPercent: number // 0-100
  config: {
    autoApproveCategories?: string[]
  }
  createdAt: string
}
