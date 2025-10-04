"use client"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Role, User, Company } from "@/lib/types"

type Session = {
  company: Company | null
  user: User | null
}

type Ctx = {
  session: Session
  setSession: (s: Session) => void
  logout: () => void
}

const UserCtx = createContext<Ctx | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>({ company: null, user: null })

  useEffect(() => {
    const raw = localStorage.getItem("demo-session")
    if (raw) {
      try {
        setSession(JSON.parse(raw))
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("demo-session", JSON.stringify(session))
  }, [session])

  const logout = () => setSession({ company: null, user: null })

  return <UserCtx.Provider value={{ session, setSession, logout }}>{children}</UserCtx.Provider>
}

export function useUser() {
  const ctx = useContext(UserCtx)
  if (!ctx) throw new Error("useUser must be used inside UserProvider")
  return ctx
}

export function requireRole(role: Role, user: User | null) {
  return user?.role === role
}
