import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CreditCard, ExternalLink, ArrowLeft, Shield, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import {
  SAAS_PLANS,
  SAAS_IVA_NOTE,
  COMPETITOR_BENCHMARK,
  planPrice,
  type SaasBillingInterval,
  type SaasPlanId,
} from '@/data/saasPlans'
import { SAAS_STRIPE_NOTE } from '@/data/paymentGateways'
import { formatCurrency, cn } from '@/lib/utils'
import { subscriptionService } from '@/services/subscriptionService'
import { tenantService } from '@/services/tenantService'
import { toast } from '@/components/ui/Toast'

const STATUS_LABEL: Record<string, string> = {
  none: 'Sin suscripción Stripe',
  trialing: 'Periodo de prueba',
  active: 'Activa',
  past_due: 'Pago pendiente',
  canceled: 'Cancelada',
  incomplete: 'Incompleta',
  unpaid: 'Impaga',
}

export default function SubscriptionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tenant = useAuthStore((s) => s.tenant)
  const setTenant = useAuthStore((s) => s.setTenant)
  const [billing, setBilling] = useState<SaasBillingInterval>('mensual')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  const currentPlan = (tenant?.plan === 'basico' || tenant?.plan === 'profesional'
    ? tenant.plan
    : 'profesional') as SaasPlanId
  const planDef = SAAS_PLANS.find((p) => p.id === currentPlan) || SAAS_PLANS[1]
  const subStatus = tenant?.subscription_status || 'none'
  const hasStripeCustomer = Boolean(tenant?.stripe_customer_id)

  useEffect(() => {
    const stripeResult = searchParams.get('stripe')
    if (!stripeResult) return
    setSearchParams({}, { replace: true })
    if (stripeResult === 'success') {
      toast('Pago recibido — actualizando tu plan…', 'success')
      if (tenant?.id) {
        tenantService.getTenant(tenant.id).then((t) => {
          if (t) setTenant(t)
        })
      }
    } else if (stripeResult === 'cancel') {
      toast('Pago cancelado', 'error')
    }
  }, [searchParams, setSearchParams, tenant?.id, setTenant])

  const goCheckout = async (planId: SaasPlanId) => {
    setLoadingPlan(`${planId}-${billing}`)
    try {
      const url = await subscriptionService.startCheckout(planId, billing)
      window.location.href = url
    } catch (e) {
      toast(e instanceof Error ? e.message : 'No se pudo iniciar el pago', 'error')
      setLoadingPlan(null)
    }
  }

  const goPortal = async () => {
    setPortalLoading(true)
    try {
      const url = await subscriptionService.openBillingPortal()
      window.location.href = url
    } catch (e) {
      toast(e instanceof Error ? e.message : 'No se pudo abrir el portal', 'error')
      setPortalLoading(false)
    }
  }

  const competitorRef = billing === 'mensual'
    ? `LITE ${formatCurrency(COMPETITOR_BENCHMARK.lite.priceMxn)} · PRO ${formatCurrency(COMPETITOR_BENCHMARK.pro.priceMxn)}`
    : `LITE ${formatCurrency(COMPETITOR_BENCHMARK.lite.priceAnnualMxn)} · PRO ${formatCurrency(COMPETITOR_BENCHMARK.pro.priceAnnualMxn)}`

  return (
    <div className="max-w-4xl space-y-6 animate-fadeUp">
      <div>
        <Link to="/app/settings" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600 mb-3">
          <ArrowLeft size={14} /> Volver a configuración
        </Link>
        <p className="text-[10px] font-mono text-orange-600 uppercase tracking-widest">Empresa</p>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <CreditCard size={24} /> Suscripción IA·RESTAURANT
        </h1>
        <p className="text-sm text-slate-500 mt-1">{SAAS_IVA_NOTE}</p>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-slate-700">
        <p className="font-bold text-emerald-800">Más barato que {COMPETITOR_BENCHMARK.name}</p>
        <p className="mt-1 text-xs leading-relaxed">
          Ellos ({billing}): {competitorRef}. Nosotros: Básico{' '}
          <strong>{formatCurrency(planPrice(SAAS_PLANS[0], billing))}</strong> · Profesional{' '}
          <strong>{formatCurrency(planPrice(SAAS_PLANS[1], billing))}</strong>.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3 p-1 rounded-full bg-slate-100 border border-command-border">
          <button
            type="button"
            onClick={() => setBilling('mensual')}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-bold transition-colors',
              billing === 'mensual' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'
            )}
          >
            Mensuales
          </button>
          <button
            type="button"
            onClick={() => setBilling('anual')}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-bold transition-colors',
              billing === 'anual' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-500'
            )}
          >
            Anual
          </button>
        </div>
      </div>

      {billing === 'anual' && (
        <p className="text-center text-xs text-brand-700 font-semibold">
          12 meses de uso — pagas solo 10.5 meses (como Soft Restaurant)
        </p>
      )}

      <div className="rounded-2xl border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-brand-50 p-5">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-violet-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-800">Stripe para tu plan IA·RESTAURANT</p>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{SAAS_STRIPE_NOTE}</p>
          </div>
        </div>
      </div>

      <Card className="p-5 border-brand-200 bg-brand-50/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Plan actual</p>
            <p className="text-xl font-black text-slate-800 capitalize">{planDef.label}</p>
            <p className="text-sm text-slate-600 mt-1">
              {formatCurrency(planDef.priceMxn)}/mes + IVA · {tenant?.name}
            </p>
            <Badge
              variant={subStatus === 'active' || subStatus === 'trialing' ? 'success' : 'default'}
              className="mt-2"
            >
              {STATUS_LABEL[subStatus] || subStatus}
            </Badge>
          </div>
          <Button onClick={goPortal} loading={portalLoading} disabled={portalLoading}>
            <ExternalLink size={14} /> Administrar en Stripe
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SAAS_PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id
          const loadKey = `${plan.id}-${billing}`
          const isLoading = loadingPlan === loadKey
          const amount = planPrice(plan, billing)
          return (
            <Card
              key={plan.id}
              className={cn('p-5 flex flex-col', isCurrent && 'border-2 border-brand-400 shadow-glow')}
            >
              {isCurrent && <Badge variant="amber" className="mb-3 w-fit">Plan actual</Badge>}
              <p className="font-black text-slate-800 text-lg">{plan.label}</p>
              <p className="text-3xl font-mono font-black text-brand-600 mt-1">
                {formatCurrency(amount)}
                <span className="text-sm text-slate-500 font-normal">
                  /{billing === 'mensual' ? 'mes' : 'año'}
                </span>
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">+ IVA (moneda nacional)</p>
              <ul className="mt-4 space-y-1.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-xs text-slate-600">✓ {f}</li>
                ))}
              </ul>
              <p className="text-[10px] text-slate-400 mt-4 font-mono">
                {plan.maxDevices} equipos simultáneos
              </p>
              <Button
                className="w-full mt-4"
                variant={isCurrent ? 'secondary' : 'primary'}
                disabled={isCurrent || isLoading || loadingPlan !== null}
                onClick={() => goCheckout(plan.id)}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Redirigiendo a Stripe…
                  </>
                ) : isCurrent ? (
                  'Plan activo'
                ) : (
                  <>
                    <CreditCard size={14} /> Pagar {billing === 'mensual' ? 'mensual' : 'anual'}
                  </>
                )}
              </Button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
