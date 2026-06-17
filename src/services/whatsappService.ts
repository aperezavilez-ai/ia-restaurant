import { supabase } from '@/lib/supabase'
import type { TenantContext } from '@/types/context'

export type WhatsAppAlertType = 'order_ready' | 'payment_complete' | 'test' | 'security_new_device' | 'security_new_ip' | 'security_ip_blocked'

export interface SendAlertResult {
  status: 'enviada' | 'pendiente' | 'skipped'
  wa_url?: string
  notification_id?: string
  reason?: string
}

export const whatsappService = {
  async sendAlert(
    _ctx: TenantContext,
    payload: {
      type: WhatsAppAlertType
      title: string
      message: string
      recipient?: string
    },
  ): Promise<SendAlertResult> {
    const { data: session } = await supabase.auth.getSession()
    const token = session.session?.access_token
    if (!token) throw new Error('Inicia sesión para enviar alertas')

    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      if (data.wa_url) {
        return { status: 'pendiente', wa_url: data.wa_url }
      }
      throw new Error(data.error || 'No se pudo enviar la alerta')
    }

    return {
      status: data.status || 'enviada',
      wa_url: data.wa_url,
      notification_id: data.notification_id,
      reason: data.reason,
    }
  },

  openWhatsAppLink(url: string) {
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  },
}
