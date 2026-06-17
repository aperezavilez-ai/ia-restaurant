import { useEffect, useState } from 'react'
import { History } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useTenantContext } from '@/hooks/useTenantContext'
import { securityRepository } from '@/repositories/securityRepository'
import type { LoginAuditEntry } from '@/types/security'

export function LoginAuditPanel() {
  const ctx = useTenantContext()
  const [entries, setEntries] = useState<LoginAuditEntry[]>([])

  useEffect(() => {
    if (!ctx) return
    securityRepository.listRecentLogins(ctx.tenantId).then(setEntries)
  }, [ctx])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History size={18} className="text-brand-600" />
          <h3 className="font-bold text-slate-800">Historial de accesos</h3>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500 p-5 text-center">Sin registros aún</p>
        ) : (
          <ul className="divide-y divide-command-border max-h-80 overflow-y-auto">
            {entries.map(e => (
              <li key={e.id} className="px-5 py-3 text-xs flex justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{e.email || '—'}</p>
                  <p className="text-slate-500 font-mono">{e.ip_address || 'IP desconocida'}</p>
                  {e.reason && <p className="text-slate-400">{e.reason}</p>}
                </div>
                <div className="text-right shrink-0">
                  <Badge variant={e.success ? 'success' : 'danger'}>
                    {e.success ? 'OK' : 'Bloqueado'}
                  </Badge>
                  <p className="text-slate-400 mt-1">
                    {new Date(e.created_at).toLocaleString('es-MX')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}
