import type { OrderSplitPart } from '@/types'

/** Reparte total en N partes iguales (centavos al último). */
export function buildEqualSplitParts(total: number, labels: string[]): OrderSplitPart[] {
  const n = labels.length
  if (n < 1) return []
  const cents = Math.round(total * 100)
  const base = Math.floor(cents / n)
  const remainder = cents - base * n

  return labels.map((label, i) => {
    const partCents = base + (i === n - 1 ? remainder : 0)
    return {
      id: crypto.randomUUID(),
      label: label.trim() || `Persona ${i + 1}`,
      amount: partCents / 100,
      paid_at: undefined,
    }
  })
}

export function splitPartsTotal(parts: OrderSplitPart[]): number {
  return Math.round(parts.reduce((s, p) => s + p.amount, 0) * 100) / 100
}

export function allPartsPaid(parts: OrderSplitPart[]): boolean {
  return parts.length > 0 && parts.every((p) => Boolean(p.paid_at))
}
