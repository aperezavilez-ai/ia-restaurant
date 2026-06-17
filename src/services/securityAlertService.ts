import { whatsappService } from '@/services/whatsappService'
import { tenantService } from '@/services/tenantService'
import { normalizeSecurityConfig } from '@/lib/ipSecurity'
import type { TenantContext } from '@/types/context'
import type { SecurityConfig } from '@/types/security'

export type SecurityAlertKind = 'security_new_device' | 'security_new_ip' | 'security_ip_blocked'

export async function getSecurityPolicy(tenantId: string): Promise<SecurityConfig> {
  const org = await tenantService.getOrganization(tenantId)
  return normalizeSecurityConfig(org?.security_config)
}

export async function sendSecurityAlert(
  ctx: TenantContext,
  kind: SecurityAlertKind,
  detail: string
): Promise<void> {
  const policy = await getSecurityPolicy(ctx.tenantId)
  if (!policy.alert_security_whatsapp) return
  if (kind === 'security_new_device' && !policy.alert_new_device) return
  if ((kind === 'security_new_ip' || kind === 'security_ip_blocked') && !policy.alert_new_ip) return

  const titles: Record<SecurityAlertKind, string> = {
    security_new_device: 'Nuevo equipo pendiente',
    security_new_ip: 'Acceso desde IP nueva',
    security_ip_blocked: 'Acceso bloqueado por IP',
  }

  try {
    await whatsappService.sendAlert(ctx, {
      type: kind,
      title: titles[kind],
      message: detail,
    })
  } catch {
    /* alerta opcional */
  }
}
