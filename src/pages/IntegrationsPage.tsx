import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, ArrowRight, Globe } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { INTEGRATIONS, integrationStatusVariant, type IntegrationDef } from '@/data/integrations'
import { usePaymentGatewayStore } from '@/store/paymentGatewayStore'
import { useAuthStore } from '@/store/authStore'
import { useTenantContext } from '@/hooks/useTenantContext'
import { tenantRepository } from '@/repositories/tenantRepository'

function resolveStatus(
  integration: IntegrationDef,
  preferredGateway: string | null,
  whatsappConfigured: boolean,
): IntegrationDef {
  if (integration.id === 'whatsapp' && whatsappConfigured) {
    return { ...integration, status: 'configured', statusLabel: 'Configurado' }
  }
  if (integration.gatewayId && preferredGateway === integration.gatewayId) {
    return { ...integration, status: 'configured', statusLabel: 'Configurada' }
  }
  return integration
}

export default function IntegrationsPage() {
  const ctx = useTenantContext()
  const tenant = useAuthStore((s) => s.tenant)
  const preferred = usePaymentGatewayStore((s) => s.getPreferred(tenant?.id || ''))
  const [whatsappConfigured, setWhatsappConfigured] = useState(false)

  useEffect(() => {
    if (!ctx) return
    tenantRepository.getBusinessProfile(ctx).then((profile) => {
      setWhatsappConfigured(!!profile?.organization?.whatsapp_alerts?.trim())
    })
  }, [ctx])

  const items = INTEGRATIONS.map((i) => resolveStatus(i, preferred, whatsappConfigured))

  const activeCount = items.filter((i) => i.status === 'active' || i.status === 'configured').length

  return (
    <div className="space-y-6 animate-fadeUp max-w-6xl">
      <div>
        <p className="text-[10px] font-mono text-orange-600 uppercase tracking-widest">Conectividad</p>
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Globe size={24} /> Centro de integraciones
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Enlaces directos a los módulos que ya funcionan en tu restaurante
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-xl">
        <Card className="p-4 text-center">
          <p className="text-2xl font-mono font-black">{items.length}</p>
          <p className="text-[10px] text-slate-500 uppercase">Integraciones</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-mono font-black text-brand-600">{activeCount}</p>
          <p className="text-[10px] text-slate-500 uppercase">Activas / configuradas</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-mono font-black">{items.filter((i) => i.status === 'coming_soon').length}</p>
          <p className="text-[10px] text-slate-500 uppercase">API próximamente</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((integration) => (
          <Card key={integration.id} className="p-5 flex flex-col h-full hover:border-brand-300 transition-colors">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0" aria-hidden>{integration.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800">{integration.name}</p>
                <p className="text-xs text-slate-500">{integration.category}</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mt-3 flex-1 leading-relaxed">{integration.description}</p>

            <Badge
              variant={integrationStatusVariant(integration.status)}
              className="mt-3 w-fit capitalize"
            >
              {integration.statusLabel}
            </Badge>

            <div className="mt-4 flex flex-col gap-2">
              <Link to={integration.path}>
                <Button className="w-full" variant={integration.status === 'coming_soon' ? 'outline' : 'primary'}>
                  Abrir módulo <ArrowRight size={14} />
                </Button>
              </Link>
              {integration.externalUrl && (
                <a href={integration.externalUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full" type="button">
                    <ExternalLink size={14} /> Crear cuenta en {integration.name.split(' ')[0]}
                  </Button>
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5 bg-brand-50/50 border-brand-200">
        <p className="font-bold text-slate-800 mb-2">Rutas rápidas</p>
        <div className="flex flex-wrap gap-2 text-sm">
          {[
            { label: 'Pasarelas de pago', path: '/app/payment-gateways' },
            { label: 'Facturación CFDI', path: '/app/invoicing' },
            { label: 'Delivery', path: '/app/delivery' },
            { label: 'Impresión y QR', path: '/app/printing' },
            { label: 'Menú QR', path: '/app/qr' },
            { label: 'Ajustes', path: '/app/settings' },
          ].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="px-3 py-1.5 rounded-lg bg-white border border-command-border text-brand-700 font-semibold hover:bg-brand-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}
