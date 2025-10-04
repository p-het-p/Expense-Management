import { db } from "@/lib/mock-db"

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const e = db.updateExpenseStatus(params.id, "rejected")
  if (!e) return new Response("Not found", { status: 404 })
  db.logApproval({ expenseId: e.id, actorUserId: e.userId, action: "reject" })
  return Response.json({ ok: true })
}
