"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "./auth/user-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AppNav() {
  const pathname = usePathname()
  const { session, logout } = useUser()
  const { user } = session

  return (
    <header className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          Expense Manager
        </Link>
        <nav className="flex items-center gap-4">
          <Link className={cn("text-sm", pathname.startsWith("/employee") && "font-medium underline")} href="/employee">
            Employee
          </Link>
          <Link className={cn("text-sm", pathname.startsWith("/manager") && "font-medium underline")} href="/manager">
            Manager
          </Link>
          <Link className={cn("text-sm", pathname.startsWith("/admin") && "font-medium underline")} href="/admin">
            Admin
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <span className="text-sm">
              {user.name} · {user.role}
            </span>
          ) : null}
          {user ? (
            <Button size="sm" variant="secondary" onClick={logout}>
              Logout
            </Button>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button size="sm" variant="secondary">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Signup</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
