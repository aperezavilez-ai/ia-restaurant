export interface SaasPlan {
  id: 'basico' | 'profesional' | 'enterprise'
  label: string
  /** Precio mensual MXN (+ IVA). Referencia mercado: Soft Restaurant LITE $799, PRO $1,099 */
  priceMxn: number
  /** Anual promoción: pagas 10.5 meses, usas 12 (como Soft Restaurant) */
  priceAnnualMxn: number
  period: string
  maxUsers: number
  maxBranches: number
  maxTables: number
  maxProducts: number
  maxDevices: number
  features: string[]
}

/**
 * Posicionamiento vs Soft Restaurant® 12 (competencia directa):
 * - LITE  $799/mes · 2 equipos  → Básico       $699/mes · 2 equipos
 * - PRO   $1,099/mes · 10 equipos → Profesional $999/mes · 10 equipos
 * - Enterprise: multi-sucursal / franquicia (sin equivalente directo)
 */
export const SAAS_PLANS: SaasPlan[] = [
  {
    id: 'basico',
    label: 'Básico',
    priceMxn: 699,
    priceAnnualMxn: 7339,
    period: 'mes',
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
    period: 'mes',
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
  {
    id: 'enterprise',
    label: 'Enterprise',
    priceMxn: 1399,
    priceAnnualMxn: 14689,
    period: 'mes',
    maxUsers: 50,
    maxBranches: 20,
    maxTables: 200,
    maxProducts: 2000,
    maxDevices: 25,
    features: [
      'Hasta 25 equipos simultáneos',
      'Todo Profesional + franquicias',
      'API e integraciones',
      'Soporte prioritario',
    ],
  },
]

export const SAAS_IVA_NOTE = 'Precios en MXN + IVA. Anual: pagas 10.5 meses, usas 12.'

/** Comparativa rápida vs Soft Restaurant (mensual, antes de IVA) */
export const COMPETITOR_BENCHMARK = {
  name: 'Soft Restaurant 12',
  lite: { label: 'LITE', priceMxn: 799, devices: 2 },
  pro: { label: 'PRO', priceMxn: 1099, devices: 10 },
} as const
