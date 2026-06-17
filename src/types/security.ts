export type TenantDeviceStatus = 'approved' | 'pending' | 'revoked'

export interface TenantDevice {
  id: string
  tenant_id: string
  sucursal_id?: string
  user_id?: string
  fingerprint_hash: string
  device_label: string
  status: TenantDeviceStatus
  ip_address?: string
  user_agent?: string
  last_seen_at: string
  approved_by?: string
  approved_at?: string
  revoked_at?: string
  created_at: string
}

export interface LoginAuditEntry {
  id: string
  tenant_id?: string
  user_id?: string
  device_id?: string
  email?: string
  ip_address?: string
  user_agent?: string
  success: boolean
  reason?: string
  created_at: string
}

export interface SecurityConfig {
  ip_allowlist_enabled: boolean
  ip_allowlist: string[]
  alert_new_device: boolean
  alert_new_ip: boolean
  alert_security_whatsapp: boolean
}

export type SecurityBlockReason =
  | 'tenant_suspended'
  | 'device_pending'
  | 'device_revoked'
  | 'device_limit'
  | 'ip_blocked'

export class SecurityAccessError extends Error {
  constructor(
    message: string,
    public readonly reason: SecurityBlockReason,
    public readonly device?: TenantDevice
  ) {
    super(message)
    this.name = 'SecurityAccessError'
  }
}
