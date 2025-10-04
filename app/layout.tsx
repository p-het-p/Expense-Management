import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { UserProvider } from "@/components/auth/user-context"
import AppNav from "@/components/app-nav"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <UserProvider>
          {/* Global nav */}
          <Suspense fallback={<div>Loading...</div>}>
            <AppNav />
          </Suspense>
          {/* Page content */}
          <div className="min-h-screen">{children}</div>
        </UserProvider>
        <Analytics />
      </body>
    </html>
  )
}
