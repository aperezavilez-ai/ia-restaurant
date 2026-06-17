export type SaasPlanId = 'basico' | 'profesional'
export type SaasBillingInterval = 'mensual' | 'anual'

export interface SaasPlanLimits {
  devices: number
  users: number
  branches: number
  tables: number
  products: number
}

export interface SaasPlan {
  /** ID interno (BD / Stripe metadata) — no cambia */
  id: SaasPlanId
  /** Nombre comercial IA·RESTAURANT */
  label: string
  tagline: string
  idealFor: string
  priceMxn: number
  priceAnnualMxn: number
  limits: SaasPlanLimits
  /** Módulos y capacidades incluidas */
  includes: string[]
  /** Solo en el plan superior (para comparativa) */
  upgrades?: string[]
}

/**
 * Planes comerciales IA·RESTAURANT (nombres propios, no copiar competencia).
 * IDs técnicos: basico = Arranque · profesional = Comando
 */
export const SAAS_PLANS: SaasPlan[] = [
  {
    id: 'basico',
    label: 'Plan Arranque',
    tagline: 'Tu restaurante operando en digital',
    idealFor: 'Cafeterías, fondas y restaurantes con 1 sucursal y 1–2 cajas o tablets',
    priceMxn: 699,
    priceAnnualMxn: 7339,
    limits: { devices: 2, users: 5, branches: 1, tables: 20, products: 50 },
    includes: [
      'POS: cobro efectivo, tarjeta (registro), mixto y división de cuenta',
      'Mesas & piso: plano, meseros, traslado y unión de mesas',
      'Cocina KDS en tiempo real',
      'Caja: turno, fondo inicial, Corte X y Corte Z',
      'Menú QR para comensales (pedido desde el celular)',
      'Catálogo: productos, categorías e imágenes',
      'Historial de ventas y tickets',
      'Reportes del día y ventas por método de pago',
      'Hasta 5 usuarios (cajero, mesero, cocina, gerente)',
      'Hasta 2 equipos conectados a la vez (caja + cocina, etc.)',
      '1 sucursal · hasta 20 mesas · 50 productos en menú',
      'Enlaces a pasarelas (MP, Stripe o Clip de tu negocio)',
      'Soporte por ticket',
    ],
  },
  {
    id: 'profesional',
    label: 'Plan Comando',
    tagline: 'Centro de mando para operación completa',
    idealFor: 'Restaurantes con varios puntos de venta, inventario y más de un local',
    priceMxn: 999,
    priceAnnualMxn: 10489,
    limits: { devices: 10, users: 15, branches: 3, tables: 50, products: 200 },
    includes: [
      'Todo lo del Plan Arranque',
      'Inventario: ingredientes, kardex y alertas de stock bajo',
      'Compras y proveedores',
      'CRM: clientes, historial y asignación en mesa',
      'Reportes BI y exportación',
      'Módulo Finanzas (resumen operativo)',
      'Multi-sucursal: hasta 3 locales',
      'Reservaciones y lista de espera',
      'Promociones y combos',
      'Notificaciones WhatsApp (cocina lista, cobro, seguridad)',
      'Seguridad: equipos autorizados, auditoría de accesos',
      'Hasta 15 usuarios y 10 equipos simultáneos',
      'Hasta 50 mesas y 200 productos por sucursal',
      'Soporte prioritario',
    ],
    upgrades: [
      'Inventario y compras',
      'CRM y lealtad',
      'Multi-sucursal (3 locales)',
      'WhatsApp y seguridad avanzada',
      '8 equipos adicionales (10 vs 2)',
    ],
  },
]

export const SAAS_IVA_NOTE =
  'Precios en pesos mexicanos + IVA. Plan anual: 12 meses de uso, pagas solo 10.5 meses.'

/** Nombre para productos en Stripe Dashboard */
export const STRIPE_PRODUCT_NAMES: Record<SaasPlanId, string> = {
  basico: 'IA·RESTAURANT — Plan Arranque',
  profesional: 'IA·RESTAURANT — Plan Comando',
}

export function planPrice(plan: SaasPlan, interval: SaasBillingInterval): number {
  return interval === 'anual' ? plan.priceAnnualMxn : plan.priceMxn
}

export function planById(id: SaasPlanId): SaasPlan {
  return SAAS_PLANS.find((p) => p.id === id) ?? SAAS_PLANS[1]
}

export const PLAN_DISPLAY_NAMES: Record<SaasPlanId, string> = {
  basico: 'Plan Arranque',
  profesional: 'Plan Comando',
}
