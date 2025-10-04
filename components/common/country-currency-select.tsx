"use client"

import { useMemo } from "react"
import useSWR from "swr"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type CCValue = { countryCode: string; currency: string }
type Props = {
  value: CCValue
  onChange: (v: CCValue) => void
  required?: boolean
  className?: string
  countryLabel?: string
  currencyLabel?: string
  showCurrency?: boolean // new
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function CountryCurrencySelect({
  value,
  onChange,
  required,
  className,
  countryLabel = "Country",
  currencyLabel = "Default currency",
  showCurrency = true, // new default
}: Props) {
  const { data } = useSWR<{
    items: Array<{
      name: string
      code: string
      currencies: Array<{ code: string; name: string; symbol: string | null }>
    }>
  }>("/api/countries", fetcher)

  const countries = data?.items ?? []

  const allCurrencies = useMemo(() => {
    const map = new Map<string, { code: string; name: string; symbol: string | null }>()
    for (const c of countries) {
      for (const cur of c.currencies) {
        if (!map.has(cur.code)) map.set(cur.code, cur)
      }
    }
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code))
  }, [countries])

  const countryCurrencies = useMemo(() => {
    const c = countries.find((x) => x.code === value.countryCode)
    return c?.currencies ?? allCurrencies
  }, [countries, value.countryCode, allCurrencies])

  function onCountryChange(code: string) {
    const c = countries.find((x) => x.code === code)
    const firstCurrency = c?.currencies?.[0]?.code || value.currency || "USD"
    onChange({ countryCode: code, currency: firstCurrency })
  }

  return (
    <div className={className}>
      <div className={`grid gap-3 ${showCurrency ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
        <div>
          <Label>{countryLabel}</Label>
          <Select value={value.countryCode} onValueChange={onCountryChange} required={required}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {showCurrency && (
          <div>
            <Label>{currencyLabel}</Label>
            <Select
              value={value.currency}
              onValueChange={(cur) => onChange({ ...value, currency: cur })}
              required={required}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {countryCurrencies.map((cur) => (
                  <SelectItem key={cur.code} value={cur.code}>
                    {cur.code} — {cur.name} {cur.symbol ? `(${cur.symbol})` : ""}
                  </SelectItem>
                ))}
                <div className="px-2 py-1.5 text-xs text-muted-foreground">All currencies</div>
                {allCurrencies.map((cur) => (
                  <SelectItem key={`all-${cur.code}`} value={cur.code}>
                    {cur.code} — {cur.name} {cur.symbol ? `(${cur.symbol})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  )
}
