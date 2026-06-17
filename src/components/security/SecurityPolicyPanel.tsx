import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { useTenantContext } from '@/hooks/useTenantContext'
import { securityRepository } from '@/repositories/securityRepository'
import { DEFAULT_SECURITY_CONFIG } from '@/lib/ipSecurity'
import type { SecurityConfig } from '@/types/security'

export function SecurityPolicyPanel() {
  const ctx = useTenantContext()
  const [config, setConfig] = useState<SecurityConfig>(DEFAULT_SECURITY_CONFIG)
  const [ipInput, setIpInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!ctx) return
    securityRepository.getSecurityPolicy(ctx.tenantId).then((c) => {
      setConfig(c)
      setIpInput(c.ip_allowlist.join(', '))
    })
  }, [ctx])

  const save = async () => {
    if (!ctx) return
    const ips = ipInput
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(Boolean)
    const next: SecurityConfig = { ...config, ip_allowlist: ips }
    setLoading(true)
    try {
      await securityRepository.updateSecurityPolicy(ctx.tenantId, next)
      setConfig(next)
      toast('Política de seguridad guardada', 'success')
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Error al guardar', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-brand-600" />
          <h3 className="font-bold text-slate-800">Política de acceso</h3>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-command-border cursor-pointer">
          <div>
            <p className="text-sm font-semibold text-slate-800">Restringir por IP</p>
            <p className="text-xs text-slate-500">Solo redes listadas (WiFi del local)</p>
          </div>
          <input
            type="checkbox"
            checked={config.ip_allowlist_enabled}
            onChange={e => setConfig(c => ({ ...c, ip_allowlist_enabled: e.target.checked }))}
            className="w-5 h-5 accent-brand-500"
          />
        </label>

        <div>
          <label className="text-sm font-medium text-slate-700">IPs permitidas</label>
          <p className="text-[10px] text-slate-500 mb-1">Ej: 192.168.1.100, 192.168.1.0/24, 10.0.0.*</p>
          <textarea
            className="w-full mt-1 min-h-[80px] rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono"
            value={ipInput}
            onChange={e => setIpInput(e.target.value)}
            placeholder="192.168.1.0/24, 189.123.45.67"
          />
        </div>

        <div className="space-y-2">
          {[
            { key: 'alert_new_device' as const, label: 'Alerta WhatsApp — equipo nuevo' },
            { key: 'alert_new_ip' as const, label: 'Alerta WhatsApp — IP nueva' },
            { key: 'alert_security_whatsapp' as const, label: 'Activar alertas de seguridad' },
          ].map(item => (
            <label key={item.key} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={config[item.key]}
                onChange={e => setConfig(c => ({ ...c, [item.key]: e.target.checked }))}
                className="accent-brand-500"
              />
              {item.label}
            </label>
          ))}
        </div>

        <Button className="w-full" loading={loading} onClick={save}>
          Guardar política
        </Button>
      </CardBody>
    </Card>
  )
}
