import type { NextRequest } from "next/server"
import { db } from "@/lib/mock-db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const managerId = searchParams.get("managerId")
  if (!managerId) return Response.json({ items: [] })
  const items = db.listApprovalsForManager(managerId).map((e) => {
    const emp = db.getUser(e.userId)
    return { ...e, employeeName: emp?.name || "Unknown" }
  })
  return Response.json({ items })
}
