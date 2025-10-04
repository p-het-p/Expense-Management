"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useUser, UserProvider } from "@/components/auth/user-context"

function LoginInner() {
  const router = useRouter()
  const { setSession } = useUser()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch(`/api/users?lookup=${encodeURIComponent(email)}`)
    const data = await res.json()
    if (!data?.user || !data?.company) {
      setError("User not found. Use signup or admin to create users.")
      return
    }
    setSession({ company: data.company, user: data.user })
    router.push("/employee")
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <Button type="submit">Login</Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </form>
    </main>
  )
}

export default function LoginPage() {
  return (
    <UserProvider>
      <LoginInner />
    </UserProvider>
  )
}
