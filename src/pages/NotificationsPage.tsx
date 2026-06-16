import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, ExternalLink, MessageCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useTenantContext } from '@/hooks/useTenantContext'
import { notificationRepository } from '@/repositories/notificationRepository'
import { whatsappService } from '@/services/whatsappService'
import type { Notification } from '@/types'

export default function NotificationsPage() {
  const ctx = useTenantContext()
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!ctx) return
    setLoading(true)
    try {
      const list = await notificationRepository.getNotifications(ctx)
      setItems(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [ctx])

  const openWa = (n: Notification) => {
    const url = typeof n.metadata?.wa_url === 'string' ? n.metadata.wa_url : ''
    if (url) whatsappService.openWhatsAppLink(url)
  }

  const hasWaUrl = (n: Notification) => typeof n.metadata?.wa_url === 'string' && n.metadata.wa_url.length > 0

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] font-mono text-orange-600 uppercase tracking-widest">Comunicación</p>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Bell size={24} /> Notificaciones
          </h1>
          <p className="text-sm text-slate-500 mt-1">Historial de alertas WhatsApp y avisos al equipo</p>
        </div>
        <Link to="/app/settings#notificaciones">
          <Button variant="outline" size="sm">Configurar WhatsApp</Button>
        </Link>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-sm text-slate-500">Cargando historial…</Card>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center space-y-3">
          <MessageCircle size={32} className="mx-auto text-slate-300" />
          <p className="text-sm text-slate-600">Sin notificaciones aún.</p>
          <p className="text-xs text-slate-500">
            Configura tu número en Ajustes y marca pedidos listos en Cocina para enviar alertas.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map(n => (
            <Card key={n.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="info" className="uppercase text-[9px]">{n.channel}</Badge>
                  <p className="font-bold text-sm text-slate-800">{n.title}</p>
                </div>
                <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  {new Date(n.created_at).toLocaleString('es-MX')}
                  {n.recipient ? ` · ${n.recipient}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {hasWaUrl(n) && n.status !== 'enviada' && (
                  <Button size="sm" variant="outline" onClick={() => openWa(n)}>
                    <ExternalLink size={14} /> Enviar por WhatsApp
                  </Button>
                )}
                <Badge
                  variant={n.status === 'enviada' ? 'success' : n.status === 'fallida' ? 'danger' : 'warning'}
                  className="capitalize"
                >
                  {n.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
