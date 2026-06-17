import type { SecurityConfig } from '@/types/security'

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  ip_allowlist_enabled: false,
  ip_allowlist: [],
  alert_new_device: true,
  alert_new_ip: true,
  alert_security_whatsapp: true,
}

export function normalizeSecurityConfig(raw?: Partial<SecurityConfig> | null): SecurityConfig {
  return { ...DEFAULT_SECURITY_CONFIG, ...raw }
}

/** Comprueba si la IP está en la lista (exacta, prefijo con * o /24 simplificado) */
export function isIpInAllowlist(ip: string, allowlist: string[]): boolean {
  if (!allowlist.length) return true
  const normalized = ip.trim()
  if (!normalized || normalized === 'unknown') return false

  return allowlist.some((entry) => {
    const e = entry.trim()
    if (!e) return false
    if (e.endsWith('*')) return normalized.startsWith(e.slice(0, -1))
    if (e.includes('/')) {
      const [base, bitsStr] = e.split('/')
      const bits = Number(bitsStr)
      if (bits === 24) {
        const prefix = base.split('.').slice(0, 3).join('.')
        return normalized.startsWith(`${prefix}.`)
      }
      if (bits >= 8 && bits <= 32) {
        const octets = Math.floor(bits / 8)
        const prefix = base.split('.').slice(0, octets).join('.')
        return normalized.startsWith(octets > 0 ? `${prefix}.` : prefix) || normalized === base
      }
      return normalized.startsWith(base)
    }
    return normalized === e
  })
}

export async function fetchClientIp(): Promise<string | null> {
  try {
    const res = await fetch('/api/security/client-ip')
    if (!res.ok) return null
    const data = await res.json()
    return typeof data.ip === 'string' ? data.ip : null
  } catch {
    return null
  }
}
