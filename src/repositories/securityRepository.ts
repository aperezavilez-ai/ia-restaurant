import { getDeviceFingerprint } from '@/lib/deviceFingerprint'
import { fetchClientIp, isIpInAllowlist } from '@/lib/ipSecurity'
import { getTenantDeviceLimit } from '@/config/deviceLimits'
import { securityService } from '@/services/securityService'
import { localDb } from '@/lib/localDb'
import { getSecurityPolicy, sendSecurityAlert } from '@/services/securityAlertService'
import { SecurityAccessError } from '@/types/security'
import type { SecurityConfig } from '@/types/security'
import type { TenantDevice } from '@/types/security'
import type { AuthSession } from '@/repositories/authRepository'
import type { TenantContext } from '@/types/context'

function toCtx(session: AuthSession): TenantContext {
  return {
    tenantId: session.tenant.id,
    sucursalId: session.sucursal.id,
    userId: session.user.id,
    taxRate: (session.sucursal.tax_rate || 16) / 100,
  }
}

async function validateIpAccess(
  session: AuthSession,
  policy: SecurityConfig,
  clientIp: string | null
): Promise<void> {
  if (!clientIp || clientIp === 'unknown') return
  const ctx = toCtx(session)

  if (policy.ip_allowlist_enabled && !isIpInAllowlist(clientIp, policy.ip_allowlist)) {
    await securityService.logLogin({
      tenant_id: session.tenant.id,
      user_id: session.user.id,
      email: session.user.email,
      ip_address: clientIp,
      user_agent: navigator.userAgent,
      success: false,
      reason: 'ip_blocked',
    })
    void sendSecurityAlert(
      ctx,
      'security_ip_blocked',
      `${session.user.full_name} (${session.user.email}) intentó entrar desde IP no autorizada: ${clientIp}`
    )
    throw new SecurityAccessError(
      'Acceso bloqueado: tu red no está en la lista permitida del restaurante.',
      'ip_blocked'
    )
  }

  if (policy.alert_new_ip) {
    const seen = await securityService.hasSuccessfulLoginFromIp(session.tenant.id, clientIp)
    if (!seen) {
      void sendSecurityAlert(
        ctx,
        'security_new_ip',
        `${session.user.full_name} inició sesión desde IP nueva: ${clientIp}`
      )
    }
  }
}

export const securityRepository = {
  async getSecurityPolicy(tenantId: string) {
    return getSecurityPolicy(tenantId)
  },

  async updateSecurityPolicy(tenantId: string, config: SecurityConfig) {
    await securityService.updateOrganizationSecurity(tenantId, config)
    const org = await localDb.getOrganization(tenantId)
    if (org) {
      await localDb.saveOrganization({ ...org, security_config: config })
    }
  },

  async listRecentLogins(tenantId: string) {
    return securityService.listRecentLogins(tenantId)
  },

  async enforceDeviceAccess(session: AuthSession): Promise<TenantDevice | null> {
    const { user, tenant, sucursal } = session
    const clientIp = await fetchClientIp()
    const policy = await getSecurityPolicy(tenant.id)
    const ctx = toCtx(session)

    if (!tenant.is_active) {
      await securityService.logLogin({
        tenant_id: tenant.id,
        user_id: user.id,
        email: user.email,
        ip_address: clientIp || undefined,
        user_agent: navigator.userAgent,
        success: false,
        reason: 'tenant_suspended',
      })
      throw new SecurityAccessError(
        'La licencia de este restaurante está suspendida. Contacta a soporte IA·RESTAURANT.',
        'tenant_suspended'
      )
    }

    if (user.role === 'admin_saas') {
      await securityService.logLogin({
        tenant_id: tenant.id,
        user_id: user.id,
        email: user.email,
        ip_address: clientIp || undefined,
        user_agent: navigator.userAgent,
        success: true,
        reason: 'saas_admin',
      })
      return null
    }

    await validateIpAccess(session, policy, clientIp)

    const fp = await getDeviceFingerprint()
    const existing = await securityService.getDeviceByFingerprint(tenant.id, fp.hash)

    if (existing) {
      if (existing.status === 'revoked') {
        throw new SecurityAccessError(
          'Este equipo fue revocado. Solicita autorización al administrador del restaurante.',
          'device_revoked',
          existing
        )
      }
      if (existing.status === 'pending') {
        throw new SecurityAccessError(
          'Equipo pendiente de autorización. El administrador debe aprobarlo en Seguridad → Equipos.',
          'device_pending',
          existing
        )
      }
      await securityService.touchDevice(existing.id)
      if (clientIp) {
        await securityService.updateDeviceIp(existing.id, clientIp)
      }
      await securityService.logLogin({
        tenant_id: tenant.id,
        user_id: user.id,
        device_id: existing.id,
        email: user.email,
        ip_address: clientIp || undefined,
        user_agent: navigator.userAgent,
        success: true,
      })
      return existing
    }

    const activeCount = await securityService.countDevices(tenant.id, ['approved', 'pending'])
    const limit = getTenantDeviceLimit(tenant)

    if (activeCount >= limit) {
      throw new SecurityAccessError(
        `Límite de equipos alcanzado (${limit}). Revoca un equipo o actualiza tu plan.`,
        'device_limit'
      )
    }

    const isFirst = activeCount === 0
    const status = isFirst ? 'approved' : 'pending'

    const device = await securityService.insertDevice({
      tenant_id: tenant.id,
      sucursal_id: sucursal.id,
      user_id: user.id,
      fingerprint_hash: fp.hash,
      device_label: fp.label,
      status,
      ip_address: clientIp || undefined,
      user_agent: navigator.userAgent,
      approved_by: isFirst ? user.id : undefined,
      approved_at: isFirst ? new Date().toISOString() : undefined,
    })

    if (status === 'pending') {
      await securityService.logLogin({
        tenant_id: tenant.id,
        user_id: user.id,
        device_id: device.id,
        email: user.email,
        ip_address: clientIp || undefined,
        user_agent: navigator.userAgent,
        success: false,
        reason: 'device_pending',
      })
      void sendSecurityAlert(
        ctx,
        'security_new_device',
        `Equipo nuevo pendiente: ${fp.label}${clientIp ? ` · IP ${clientIp}` : ''}. Aprueba en Seguridad → Equipos.`
      )
      throw new SecurityAccessError(
        'Nuevo equipo registrado. Espera aprobación del administrador para operar.',
        'device_pending',
        device
      )
    }

    await securityService.logLogin({
      tenant_id: tenant.id,
      user_id: user.id,
      device_id: device.id,
      email: user.email,
      ip_address: clientIp || undefined,
      user_agent: navigator.userAgent,
      success: true,
      reason: 'first_device',
    })
    return device
  },

  async listDevices(tenantId: string) {
    return securityService.listTenantDevices(tenantId)
  },

  async approveDevice(deviceId: string, approverId: string) {
    await securityService.updateDeviceStatus(deviceId, 'approved', approverId)
  },

  async revokeDevice(deviceId: string) {
    await securityService.updateDeviceStatus(deviceId, 'revoked')
  },

  async listAllTenants() {
    return securityService.listAllTenants()
  },

  async setTenantActive(tenantId: string, isActive: boolean) {
    await securityService.setTenantActive(tenantId, isActive)
  },
}
