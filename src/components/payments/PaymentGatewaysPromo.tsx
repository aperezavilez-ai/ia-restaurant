import { Link } from 'react-router-dom'
import { CreditCard, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'
import { usePaymentGatewayStore } from '@/store/paymentGatewayStore'
import { PAYMENT_GATEWAYS } from '@/data/paymentGateways'

export function PaymentGatewaysPromo({ compact }: { compact?: boolean }) {
  const tenantId = useAuthStore((s) => s.tenant?.id) || ''
  const preferred = usePaymentGatewayStore((s) => s.getPreferred(tenantId))
  const gatewayName = PAYMENT_GATEWAYS.find((g) => g.id === preferred)?.name

  if (compact) {
    return (
      <Link
        to="/app/payment-gateways"
        className="flex items-center justify-between gap-2 p-3 rounded-xl border border-brand-200 bg-brand-50/50 hover:bg-brand-50 transition-colors text-sm"
      >
        <span className="flex items-center gap-2 text-slate-700">
          <CreditCard size={16} className="text-brand-600" />
          {gatewayName ? `Conectado: ${gatewayName}` : 'Conectar MP o Stripe'}
        </span>
        <ChevronRight size={16} className="text-slate-400" />
      </Link>
    )
  }

  return (
    <Card className="p-5 border-2 border-dashed border-brand-200 bg-brand-50/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-bold text-slate-800 flex items-center gap-2">
            <CreditCard size={18} className="text-brand-600" />
            Links de pago — Mercado Pago o Stripe
          </p>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            IA·RESTAURANT te ayuda a conectar tu cuenta y generar links. El dinero va directo a tu pasarela;
            nosotros no recibimos ni somos responsables del cobro.
          </p>
          {gatewayName && (
            <p className="text-xs text-brand-700 font-mono mt-2">Cuenta conectada: {gatewayName}</p>
          )}
        </div>
        <Link to="/app/payment-gateways">
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-colors">
            Conectar pasarela <ChevronRight size={16} />
          </span>
        </Link>
      </div>
    </Card>
  )
}
