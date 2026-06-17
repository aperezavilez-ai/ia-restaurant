export type SaasPlanId = 'basico' | 'profesional'
export type SaasBillingInterval = 'mensual' | 'anual'

export interface SaasPlan {
  id: SaasPlanId
  label: string
  /** Mensual MXN + IVA */
  priceMxn: number
  /** Anual: pagas 10.5 meses, usas 12 (como Soft Restaurant) */
  priceAnnualMxn: number
  maxUsers: number
  maxBranches: number
  maxTables: number
  maxProducts: number
  maxDevices: number
  features: string[]
}

/**
 * Mismo modelo que Soft Restaurant® 12: 2 planes × 2 periodos = 4 precios en Stripe.
 * - LITE  $799/mes · $8,390/año  → Básico       $699 · $7,339
 * - PRO   $1,099/mes · $11,540/año → Profesional $999 · $10,489
 */
export const SAAS_PLANS: SaasPlan[] = [
  {
    id: 'basico',
    label: 'Básico',
    priceMxn: 699,
    priceAnnualMxn: 7339,
    maxUsers: 5,
    maxBranches: 1,
    maxTables: 20,
    maxProducts: 50,
    maxDevices: 2,
    features: [
      'Hasta 2 equipos simultáneos',
      'POS, Mesas y Cocina KDS',
      'Reportes básicos',
      'Menú QR comensal',
    ],
  },
  {
    id: 'profesional',
    label: 'Profesional',
    priceMxn: 999,
    priceAnnualMxn: 10489,
    maxUsers: 15,
    maxBranches: 3,
    maxTables: 50,
    maxProducts: 200,
    maxDevices: 10,
    features: [
      'Hasta 10 equipos simultáneos',
      'Todo Básico + Inventario y CRM',
      'Multi sucursal (hasta 3)',
      'WhatsApp alertas y seguridad avanzada',
    ],
  },
]

export const SAAS_IVA_NOTE = 'Precios en MXN + IVA. Anual: 12 meses de uso, pagas solo 10.5 meses.'

export const COMPETITOR_BENCHMARK = {
  name: 'Soft Restaurant 12',
  lite: { label: 'LITE', priceMxn: 799, priceAnnualMxn: 8390, devices: 2 },
  pro: { label: 'PRO', priceMxn: 1099, priceAnnualMxn: 11540, devices: 10 },
} as const

export function planPrice(plan: SaasPlan, interval: SaasBillingInterval): number {
  return interval === 'anual' ? plan.priceAnnualMxn : plan.priceMxn
}
