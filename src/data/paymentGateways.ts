export type PaymentGatewayId = 'mercadopago' | 'stripe'

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
  credentialsHelpUrl: string
  /** Aclaración: cuenta del restaurante, no suscripción IA·RESTAURANT */
  accountNote: string
}

/** IA·RESTAURANT no custodia ni procesa fondos — solo ayuda a generar links con las credenciales del restaurante. */
export const PAYMENT_BRIDGE_NOTE =
  'IA·RESTAURANT actúa únicamente como puente técnico: te ayudamos a conectar tu cuenta de Mercado Pago o Stripe y a generar links de pago. El dinero se cobra y deposita en tu cuenta del proveedor. Nosotros no recibimos, retenemos ni somos responsables de tus cobros.'

export const PAYMENT_LINK_ONLY_NOTE =
  'El cobro es por link de pago (Mercado Pago o Stripe Payment Link). No hay cargo automático en tarjeta desde IA·RESTAURANT: el comensal paga en la página del proveedor y tú confirmas en caja cuando el pago se refleje.'

/** Pasarelas soportadas para links — cuenta del restaurante, no suscripción SaaS */
export const PAYMENT_GATEWAYS: PaymentGatewayDef[] = [
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    tagline: 'Links de pago en México',
    description:
      'Conecta tu cuenta de negocio en Mercado Pago. Desde POS generamos un link de checkout; el pago lo procesa Mercado Pago y el dinero va a tu cuenta.',
    region: 'México',
    accent: '#009EE3',
    features: ['Link de pago', 'Tarjeta y transferencia', 'OXXO y QR MP', 'Depósito a tu cuenta MP'],
    signupUrl: 'https://www.mercadopago.com.mx/herramientas-para-vender',
    docsUrl: 'https://www.mercadopago.com.mx/developers/es/docs',
    credentialsHelpUrl: 'https://www.mercadopago.com.mx/developers/panel/app',
    accountNote: 'Tu cuenta Mercado Pago — IA·RESTAURANT no toca el dinero.',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    tagline: 'Payment Links globales',
    description:
      'Conecta tu cuenta Stripe de negocio. Generamos Payment Links; Stripe cobra al comensal y deposita en el banco que configures en Stripe.',
    region: 'Global · MX',
    accent: '#635BFF',
    features: ['Payment Links', 'Tarjetas internacionales', 'Dashboard Stripe', 'Depósito a tu banco'],
    signupUrl: 'https://dashboard.stripe.com/register',
    docsUrl: 'https://docs.stripe.com/payments/payment-links',
    credentialsHelpUrl: 'https://dashboard.stripe.com/apikeys',
    accountNote: 'Tu cuenta Stripe — independiente del plan IA·RESTAURANT.',
  },
]

export const CONNECT_STEPS = [
  { step: 1, title: 'Crea tu cuenta', detail: 'Regístrate en Mercado Pago o Stripe con los datos de tu restaurante.' },
  { step: 2, title: 'Copia tus credenciales', detail: 'Desde el panel del proveedor (Developers / API keys) pega Public Key y Access Token, o Publishable y Secret Key.' },
  { step: 3, title: 'Genera links en POS', detail: 'En Caja → POS, método Tarjeta → “Generar link de pago”. El comensal paga en MP/Stripe; tú confirmas el cobro en caja.' },
] as const

export const SAAS_BILLING_NOTE =
  'El pago de tu plan IA·RESTAURANT (mensual o anual) es un proceso distinto y no pasa por estas pasarelas. Aquí solo conectas cómo tus comensales te pagan en el restaurante.'
