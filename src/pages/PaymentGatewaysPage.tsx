import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CreditCard, Info, Shield, ArrowLeft, ExternalLink } from 'lucide-react'
import { PaymentGatewayCard } from '@/components/payments/PaymentGatewayCard'
import {
  PAYMENT_GATEWAYS,
  SAAS_BILLING_NOTE,
  SAAS_STRIPE_NOTE,
  PAYMENT_EXTERNAL_NOTE,
  CONNECT_STEPS,
} from '@/data/paymentGateways'
import { usePaymentGatewayStore } from '@/store/paymentGatewayStore'
import { useAuthStore } from '@/store/authStore'
import { useTenantContext } from '@/hooks/useTenantContext'
import { tenantRepository } from '@/repositories/tenantRepository'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import type { PaymentGatewayId } from '@/data/paymentGateways'

const VALID_GATEWAYS = new Set<PaymentGatewayId>(['mercadopago', 'stripe', 'clip'])

export default function PaymentGatewaysPage() {
  const [searchParams] = useSearchParams()
  const highlightGw = searchParams.get('gw')
  const ctx = useTenantContext()
  const tenant = useAuthStore((s) => s.tenant)
  const tenantId = tenant?.id || ''
  const preferred = usePaymentGatewayStore((s) => s.getPreferred(tenantId))
  const setPreferred = usePaymentGatewayStore((s) => s.setPreferred)

  useEffect(() => {
    if (!ctx) return
    tenantRepository.getPaymentConfig(ctx).then((c) => {
      const gateway = c.gateway && VALID_GATEWAYS.has(c.gateway) ? c.gateway : undefined
      if (gateway) setPreferred(tenantId, gateway)
    })
  }, [ctx, tenantId, setPreferred])

  const handleSelect = async (id: PaymentGatewayId) => {
    if (!tenantId) return
    const next = preferred === id ? null : id
    setPreferred(tenantId, next)
    const gw = PAYMENT_GATEWAYS.find((g) => g.id === id)
    if (ctx && next) {
      try {
        await tenantRepository.updatePaymentConfig(ctx, { gateway: next })
      } catch {
        /* preferencia local basta */
      }
    }
    toast(
      next
        ? `${gw?.name} marcada como referencia — cobra en su app o web`
        : 'Referencia de pasarela quitada',
      'success',
    )
  }

  useEffect(() => {
    if (!highlightGw) return
    const el = document.getElementById(`gateway-${highlightGw}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlightGw])

  const activeGateway = PAYMENT_GATEWAYS.find((g) => g.id === preferred)

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <Link to="/app/cash" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600 mb-3">
          <ArrowLeft size={14} /> Volver a Caja
        </Link>
        <p className="text-[10px] font-mono text-orange-600 uppercase tracking-widest">Finanzas</p>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <CreditCard size={24} /> Pasarelas de pago
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Enlaces a Mercado Pago, Stripe y Clip — cobras fuera de IA·RESTAURANT
        </p>
      </div>

      <div className="rounded-2xl border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-orange-50 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <ExternalLink size={20} className="text-brand-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-800">Sin intervención en cobros del restaurante</p>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{PAYMENT_EXTERNAL_NOTE}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 pt-2 border-t border-brand-200/80">
          <Info size={18} className="text-brand-600 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 leading-relaxed">
            En <strong>POS → Cobrar</strong> registras el pago en caja (efectivo, tarjeta, mixto) después de cobrar al cliente en tu pasarela.
          </p>
        </div>
        <div className="flex items-start gap-3 pt-2 border-t border-brand-200/80">
          <Shield size={18} className="text-violet-600 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>Plan IA·RESTAURANT:</strong> {SAAS_STRIPE_NOTE}{' '}
            <Link to="/app/subscriptions" className="text-brand-600 font-semibold hover:underline">
              Ver suscripción
            </Link>
            . {SAAS_BILLING_NOTE}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-command-border bg-white p-5">
        <p className="font-bold text-slate-800 mb-4">Flujo recomendado</p>
        <ol className="space-y-4">
          {CONNECT_STEPS.map((s) => (
            <li key={s.step} className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-black text-sm flex items-center justify-center shrink-0">
                {s.step}
              </span>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{s.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PAYMENT_GATEWAYS.map((gw) => (
          <div key={gw.id} id={`gateway-${gw.id}`} className={highlightGw === gw.id ? 'ring-2 ring-brand-400 rounded-2xl' : ''}>
            <PaymentGatewayCard
              gateway={gw}
              selected={preferred === gw.id}
              onSelect={() => handleSelect(gw.id)}
            />
          </div>
        ))}
      </div>

      {activeGateway && (
        <div className="rounded-2xl border border-command-border bg-white p-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Referencia actual: <strong>{activeGateway.name}</strong> — abre su sitio para cobrar al comensal.
          </p>
          <a href={activeGateway.signupUrl} target="_blank" rel="noopener noreferrer">
            <Button type="button">
              <ExternalLink size={14} /> Ir a {activeGateway.name}
            </Button>
          </a>
        </div>
      )}

      <p className="text-center text-[10px] text-slate-400 font-mono pb-4 leading-relaxed max-w-xl mx-auto">
        IA·RESTAURANT no almacena credenciales de pasarelas ni genera links de cobro a comensales.
      </p>
    </div>
  )
}
