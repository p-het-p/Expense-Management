const PRECREATED = ["Alto-Sparrow", "Cedar-Stream", "Amber-Cloud", "Maple-Nova", "Indigo-Field", "Quartz-Sky"]

const rnd = (n: number) => Math.floor(Math.random() * n)

export function generateTempPassword() {
  const base = PRECREATED[rnd(PRECREATED.length)]
  const suffix = `${rnd(9)}${rnd(9)}${rnd(9)}${String.fromCharCode(65 + rnd(26))}`
  return `${base}-${suffix}`
}
