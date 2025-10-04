import { db } from "@/lib/mock-db"

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const e = db.updateExpenseStatus(params.id, "approved")
  if (!e) return new Response("Not found", { status: 404 })
  db.logApproval({ expenseId: e.id, actorUserId: e.userId, action: "approve" })
  return Response.json({ ok: true })
}
