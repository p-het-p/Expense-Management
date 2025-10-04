import type { NextRequest } from "next/server"
import { db, convertToCompanyCurrency } from "@/lib/mock-db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get("companyId")
  const userId = searchParams.get("userId")
  if (!companyId) return Response.json({ items: [] })
  const items = db.listExpenses(companyId, { userId: userId || undefined })
  return Response.json({ items })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { companyId, userId, description, category, amount, currency, vendor, expenseDate, receiptName } = body
  const company = db.getCompany(companyId)
  if (!company) return new Response("Company not found", { status: 404 })
  const fx = convertToCompanyCurrency(Number(amount), String(currency), company.defaultCurrency)

  // Auto-approve if category is configured
  const wf = db.getWorkflow(companyId)
  const autoApprove = wf?.config?.autoApproveCategories
    ?.map((s) => s.toLowerCase())
    .includes(String(category).toLowerCase())

  const expense = db.createExpense({
    companyId,
    userId,
    description,
    category,
    amount: Number(amount),
    currency,
    vendor,
    expenseDate,
    convertedAmount: fx.convertedAmount,
    convertedCurrency: fx.convertedCurrency,
    receiptName,
    status: autoApprove ? "approved" : "pending",
  })

  db.logApproval({ expenseId: expense.id, actorUserId: userId, action: "submit" })
  if (autoApprove) {
    db.logApproval({ expenseId: expense.id, actorUserId: userId, action: "approve", comment: "Auto-approved by rule" })
  }

  return Response.json({ expense })
}
