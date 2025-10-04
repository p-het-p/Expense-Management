import type React from "react"
import Link from "next/link"

type AuthShellProps = {
  children: React.ReactNode
  oppositeHref: string
  oppositeLabel: string
  imageSrc: string
  imageAlt: string
}

export default function AuthShell({ children, oppositeHref, oppositeLabel, imageSrc, imageAlt }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[var(--background, #f6f0ea)] text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="rounded-none border border-black/50 bg-background">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-black/50 px-6 py-4 md:px-8">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Expense Manager</h1>
            <Link href={oppositeHref} className="text-sm md:text-base font-semibold underline-offset-4 hover:underline">
              {oppositeLabel}
            </Link>
          </header>

          {/* Body */}
          <section className="grid grid-cols-1 md:grid-cols-2">
            {/* Image column */}
            <div className="border-r border-black/50 p-4 md:p-6">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded bg-muted">
                {/* Using provided artwork as-is to match the mockup */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSrc || "/placeholder.svg"} alt={imageAlt} className="h-full w-full object-cover" />
              </div>
            </div>

            {/* Form column */}
            <div className="p-6 md:p-10">{children}</div>
          </section>
        </div>
      </div>
    </main>
  )
}
