import type { NextRequest } from "next/server"

type Currency = { code: string; name: string; symbol: string | null }
type Country = { name: string; code: string; currencies: Currency[] }

let cache: { ts: number; data: Country[] } | null = null
const TTL_MS = 24 * 60 * 60 * 1000 // 24h

export async function GET(_req: NextRequest) {
  if (cache && Date.now() - cache.ts < TTL_MS) {
    return Response.json({ items: cache.data })
  }

  // Fetch minimal fields for lighter payload
  const res = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2,currencies", {
    next: { revalidate: TTL_MS / 1000 },
  })
  const raw = (await res.json()) as Array<any>

  const items: Country[] = raw
    .map((c) => {
      const currencies: Currency[] = Object.entries(c.currencies ?? {}).map(([code, v]: any) => ({
        code,
        name: v?.name ?? code,
        symbol: v?.symbol ?? null,
      }))
      return {
        name: c?.name?.common ?? "",
        code: (c?.cca2 ?? "").toUpperCase(),
        currencies,
      }
    })
    .filter((c) => c.name && c.code)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))

  cache = { ts: Date.now(), data: items }
  return Response.json({ items })
}
