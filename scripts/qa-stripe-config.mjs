/**
 * Verifica variables Stripe SaaS (no llama a la API).
 * 4 Price IDs = 2 planes × mensual/anual (como Soft Restaurant).
 */
import { loadEnv } from './load-env.mjs'

loadEnv()

const required = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_BASICO_MENSUAL',
  'STRIPE_PRICE_BASICO_ANUAL',
  'STRIPE_PRICE_PROFESIONAL_MENSUAL',
  'STRIPE_PRICE_PROFESIONAL_ANUAL',
]

let missing = 0
console.log('QA Stripe config — 2 planes × 2 periodos = 4 precios\n')

for (const key of required) {
  const val = process.env[key]?.trim()
  if (val) {
    const preview = key.includes('SECRET') || key.includes('KEY')
      ? `${val.slice(0, 8)}…`
      : val
    console.log(`  ✓ ${key} = ${preview}`)
  } else {
    missing++
    console.error(`  ✗ ${key} — no configurada`)
  }
}

if (missing === 0) {
  console.log('\n✓ Stripe listo para checkout SaaS')
  process.exit(0)
}

console.error(`\n✗ Faltan ${missing} variable(s). Ver .env.example`)
console.error('  Webhook: https://www.iarestaurant.mx/api/stripe/webhook')
process.exit(1)
