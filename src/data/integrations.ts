import type { PaymentGatewayId } from '@/data/paymentGateways'

export type IntegrationStatus = 'active' | 'configured' | 'setup' | 'coming_soon'

export interface IntegrationDef {
  id: string
  name: string
  category: string
  icon: string
  description: string
  /** Ruta interna de la app */
  path: string
  /** Enlace externo opcional (crear cuenta en el proveedor) */
  externalUrl?: string
  status: IntegrationStatus
  statusLabel: string
  gatewayId?: PaymentGatewayId
}

export const INTEGRATIONS: IntegrationDef[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    category: 'Comunicación',
    icon: '💬',
    description: 'Configura el número para alertas de reservas, pedidos listos y avisos al equipo.',
    path: '/app/settings#notificaciones',
    externalUrl: 'https://business.whatsapp.com/',
    status: 'setup',
    statusLabel: 'Configurar',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Pagos',
    icon: '💳',
    description: 'Cobra con tarjeta y links de pago. El dinero va a tu cuenta Stripe, no a IA·RESTAURANT.',
    path: '/app/payment-gateways?gw=stripe',
    externalUrl: 'https://dashboard.stripe.com/register',
    status: 'setup',
    statusLabel: 'Disponible',
    gatewayId: 'stripe',
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    category: 'Pagos',
    icon: '🛒',
    description: 'Links de pago, QR y terminal para cobrar comensales en México.',
    path: '/app/payment-gateways?gw=mercadopago',
    externalUrl: 'https://www.mercadopago.com.mx/herramientas-para-vender',
    status: 'setup',
    statusLabel: 'Disponible',
    gatewayId: 'mercadopago',
  },
  {
    id: 'clip',
    name: 'Clip',
    category: 'Pagos',
    icon: '📱',
    description: 'Terminal móvil y links de pago muy usados en restaurantes mexicanos.',
    path: '/app/payment-gateways?gw=clip',
    externalUrl: 'https://www.clip.mx/',
    status: 'setup',
    statusLabel: 'Disponible',
    gatewayId: 'clip',
  },
  {
    id: 'cfdi',
    name: 'PAC Facturación CFDI',
    category: 'Facturación',
    icon: '📄',
    description: 'Genera facturas desde órdenes cobradas, timbra y descarga XML/PDF.',
    path: '/app/invoicing',
    status: 'active',
    statusLabel: 'Activo',
  },
  {
    id: 'delivery',
    name: 'Delivery manual',
    category: 'Delivery',
    icon: '🛵',
    description: 'Registra pedidos a domicilio, asigna repartidor y envía a cocina. Sin conexión a apps externas.',
    path: '/app/delivery',
    status: 'active',
    statusLabel: 'Activo',
  },
  {
    id: 'printer',
    name: 'Impresora y tickets',
    category: 'Hardware',
    icon: '🖨️',
    description: 'Imprime tickets, QR por mesa y comandas desde Caja y el módulo de impresión.',
    path: '/app/printing',
    status: 'active',
    statusLabel: 'Activo',
  },
  {
    id: 'qr',
    name: 'Menú QR comensal',
    category: 'Comensal',
    icon: '📲',
    description: 'QR por mesa para que el comensal pida desde el celular.',
    path: '/app/qr',
    status: 'active',
    statusLabel: 'Activo',
  },
]

export function integrationStatusVariant(status: IntegrationStatus): 'success' | 'info' | 'warning' | 'default' {
  if (status === 'active' || status === 'configured') return 'success'
  if (status === 'setup') return 'info'
  if (status === 'coming_soon') return 'warning'
  return 'default'
}
