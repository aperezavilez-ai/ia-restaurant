import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CreditCard, ExternalLink, ArrowLeft, Shield, Loader2, Check, Minus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import {
  SAAS_PLANS,
  SAAS_IVA_NOTE,
  planPrice,
  PLAN_DISPLAY_NAMES,
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

const COMPARE_ROWS = [
  { key: 'devices', label: 'Equipos simultáneos', arranque: '2', comando: '10' },
  { key: 'users', label: 'Usuarios', arranque: '5', comando: '15' },
  { key: 'branches', label: 'Sucursales', arranque: '1', comando: '3' },
  { key: 'pos', label: 'POS y división de cuenta', arranque: true, comando: true },
  { key: 'kds', label: 'Cocina KDS + Mesas', arranque: true, comando: true },
  { key: 'qr', label: 'Menú QR comensal', arranque: true, comando: true },
  { key: 'cash', label: 'Caja Corte X / Z', arranque: true, comando: true },
  { key: 'inventory', label: 'Inventario y compras', arranque: false, comando: true },
  { key: 'crm', label: 'CRM clientes', arranque: false, comando: true },
  { key: 'multi', label: 'Multi-sucursal', arranque: false, comando: true },
  { key: 'whatsapp', label: 'Alertas WhatsApp', arranque: false, comando: true },
  { key: 'security', label: 'Seguridad equipos e IP', arranque: false, comando: true },
  { key: 'bi', label: 'Reportes BI avanzados', arranque: false, comando: true },
] as const

function CompareCell({ value }: { value: boolean | string }) {
  if (typeof value === 'string') return <span className="font-mono text-xs font-bold">{value}</span>
  return value ? (
    <Check size={16} className="text-ops-success mx-auto" />
  ) : (
    <Minus size={16} className="text-slate-300 mx-auto" />
  )
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
          12 meses de uso — pagas solo 10.5 meses
        </p>
      )}

      <Card className="p-5 border-brand-200 bg-brand-50/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Plan actual</p>
            <p className="text-xl font-black text-slate-800">
              {PLAN_DISPLAY_NAMES[currentPlan] ?? planDef.label}
            </p>
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
              <p className="text-xs text-brand-600 font-semibold mt-0.5">{plan.tagline}</p>
              <p className="text-3xl font-mono font-black text-brand-600 mt-3">
                {formatCurrency(amount)}
                <span className="text-sm text-slate-500 font-normal">
                  /{billing === 'mensual' ? 'mes' : 'año'}
                </span>
              </p>
              <p className="text-[10px] text-slate-500">+ IVA</p>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">{plan.idealFor}</p>
              <ul className="mt-4 space-y-1.5 flex-1 max-h-56 overflow-y-auto">
                {plan.includes.map((f) => (
                  <li key={f} className="text-[11px] text-slate-600 flex gap-1.5">
                    <Check size={12} className="text-ops-success shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
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
                    <CreditCard size={14} /> Contratar {billing === 'mensual' ? 'mensual' : 'anual'}
                  </>
                )}
              </Button>
            </Card>
          )
        })}
      </div>

      <Card className="p-5 overflow-x-auto">
        <p className="font-bold text-slate-800 mb-3">Comparativa rápida</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-command-border">
              <th className="text-left py-2 text-slate-500 font-medium">Incluye</th>
              <th className="text-center py-2 font-bold text-slate-800">Arranque</th>
              <th className="text-center py-2 font-bold text-brand-700">Comando</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => (
              <tr key={row.key} className="border-b border-slate-100">
                <td className="py-2 text-slate-600 text-xs">{row.label}</td>
                <td className="py-2 text-center"><CompareCell value={row.arranque} /></td>
                <td className="py-2 text-center"><CompareCell value={row.comando} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-5">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-violet-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-800 text-sm">Pago del software</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{SAAS_STRIPE_NOTE}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
