import { NextResponse } from "next/server"
import { generateTempPassword } from "@/lib/password"

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}))
  if (!email || typeof email !== "string") {
    return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 })
  }

  // Generate a temporary password
  const tempPassword = generateTempPassword()

  // Here you'd look up the user and persist the temp password/reset token.
  // For this MVP we simulate email delivery with a server log.
  console.log("[v0] Sending temporary password to:", email, "password:", tempPassword)

  // Respond success (do not expose password to client for security)
  return NextResponse.json({ ok: true })
}
