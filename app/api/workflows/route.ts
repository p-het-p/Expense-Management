import type { NextRequest } from "next/server"
import { db } from "@/lib/mock-db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get("companyId")
  if (!companyId) return Response.json({ item: null })
  const item = db.getWorkflow(companyId)
  return Response.json({ item })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const saved = db.upsertWorkflow({
    companyId: body.companyId,
    name: body.name || "Default",
    minimumApprovalPercent: Number(body.minimumApprovalPercent ?? body.percent ?? 0),
    config: body.config || {},
  })
  return Response.json({ item: saved })
}
