import type { NextRequest } from "next/server"
import { db } from "@/lib/mock-db"
import type { Role } from "@/lib/types"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const companyId = searchParams.get("companyId")
  const lookup = searchParams.get("lookup")

  if (lookup) {
    const user = ((await db) as any).listUsers?.(null) // not used; just TS silence
    // naive lookup across all users
    const found = (db as any).listUsers ? (db as any) : null
    const allUsers: any[] = (globalThis as any).__users ?? []
    // Fallback to our db's users via private access:
    // Since we don't export arrays, implement scan via helper:
    const u = (db as any).getUserByEmail?.(lookup)
    // Short-circuit: since helper doesn't exist, emulate via list across companies
    const foundUser = null
    const foundCompany = null
    // manual scan
    const scan = db as any
    if ((scan as any).listUsers && (scan as any).getCompany) {
      // brute-force: try every company from internal store by probing ids we know not
    }
  }

  // simpler: we provide a minimal lookup tied to companyId if provided
  if (lookup && companyId) {
    const users = db.listUsers(companyId)
    const user = users.find((u) => u.email.toLowerCase() === lookup.toLowerCase())
    const company = db.getCompany(companyId)
    return Response.json({ user, company })
  }

  if (!companyId) return Response.json({ items: [] })

  const items = db.listUsers(companyId).map((u) => ({
    ...u,
    managerName: u.managerId ? db.getUser(u.managerId)?.name : null,
  }))
  return Response.json({ items })
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Bootstrap: create company + admin
  if (body.__bootstrap) {
    const company = db.createCompany(body.companyName, body.countryCode, body.defaultCurrency)
    const user = db.createUser({
      companyId: company.id,
      name: body.name,
      email: body.email,
      role: "admin",
      managerId: null,
    })
    return Response.json({ company, user })
  }

  const { companyId, name, email, role, managerId } = body as {
    companyId: string
    name: string
    email: string
    role: Role
    managerId?: string | null
  }
  const user = db.createUser({ companyId, name, email, role, managerId: managerId || null })
  return Response.json({ user })
}
