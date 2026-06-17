export type PaymentGatewayId = 'mercadopago' | 'stripe' | 'clip'

export interface PaymentGatewayDef {
  id: PaymentGatewayId
  name: string
  tagline: string
  description: string
  region: string
  accent: string
  features: string[]
  signupUrl: string
  docsUrl: string
  accountNote: string
}

/**
 * Cobros a comensales: IA·RESTAURANT solo muestra enlaces.
 * El restaurante cobra en MP, Stripe o Clip fuera de la app.
 */
export const PAYMENT_EXTERNAL_NOTE =
  'Para cobrar a tus comensales, usa tu cuenta de Mercado Pago, Stripe o Clip directamente (app, terminal o link del proveedor). IA·RESTAURANT no procesa, no retiene ni interviene en esos cobros — solo te orienta con enlaces oficiales.'

/** Stripe de la plataforma: el dueño paga su plan IA·RESTAURANT (único cobro que procesamos). */
export const SAAS_STRIPE_NOTE =
  'El pago de tu plan IA·RESTAURANT (mensual o anual) se procesa con Stripe a la plataforma IA·RESTAURANT. Es independiente de la cuenta Stripe, Mercado Pago o Clip que uses para cobrar a tus clientes en el restaurante.'

export const SAAS_BILLING_NOTE =
  'Administra la suscripción al software en Suscripciones. Las pasarelas de esta pantalla son solo enlaces para que operes cobros fuera de IA·RESTAURANT.'

export const PAYMENT_GATEWAYS: PaymentGatewayDef[] = [
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    tagline: 'Cobra en la app o web de MP',
    description:
      'Crea tu cuenta de negocio y cobra con QR, link o checkout desde Mercado Pago. El dinero va a tu cuenta MP — sin pasar por IA·RESTAURANT.',
    region: 'México',
    accent: '#009EE3',
    features: ['QR y link MP', 'Tarjeta y transferencia', 'OXXO', 'Depósito a tu cuenta'],
    signupUrl: 'https://www.mercadopago.com.mx/herramientas-para-vender',
    docsUrl: 'https://www.mercadopago.com.mx/developers/es/docs',
    accountNote: 'Operas en Mercado Pago; aquí solo el enlace de registro.',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    tagline: 'Cobra en dashboard Stripe',
    description:
      'Cuenta Stripe de tu restaurante (distinta al pago de tu plan IA·RESTAURANT). Genera Payment Links o cobra desde el panel Stripe — fuera de esta app.',
    region: 'Global · MX',
    accent: '#635BFF',
    features: ['Payment Links', 'Tarjetas internacionales', 'Dashboard Stripe', 'Depósito a tu banco'],
    signupUrl: 'https://dashboard.stripe.com/register',
    docsUrl: 'https://docs.stripe.com/payments/payment-links',
    accountNote: 'No confundir con el Stripe de tu suscripción al software.',
  },
  {
    id: 'clip',
    name: 'Clip',
    tagline: 'Terminal y app Clip',
    description:
      'Cobra con terminal móvil Clip o links desde la app Clip. El dinero va a tu cuenta Clip — IA·RESTAURANT no participa en el cobro.',
    region: 'México',
    accent: '#FF6B00',
    features: ['Terminal Clip', 'App móvil', 'Cobro con tarjeta', 'Depósito a tu banco'],
    signupUrl: 'https://www.clip.mx/',
    docsUrl: 'https://ayuda.clip.mx/',
    accountNote: 'Cobras en Clip; en POS solo registras el cobro en caja.',
  },
]

export const CONNECT_STEPS = [
  { step: 1, title: 'Elige tu pasarela', detail: 'Mercado Pago, Stripe o Clip — la que ya uses o quieras abrir.' },
  { step: 2, title: 'Crea cuenta en el proveedor', detail: 'Usa los enlaces oficiales de esta pantalla. Todo el cobro ocurre en su app o web.' },
  { step: 3, title: 'Registra en IA·RESTAURANT', detail: 'En POS confirma el cobro (efectivo, tarjeta, mixto) después de cobrar en tu pasarela.' },
] as const
