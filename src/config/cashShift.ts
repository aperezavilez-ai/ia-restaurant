import type { UserRole } from '@/types'

/** Roles que deben abrir turno de caja antes de operar el panel */
export const SHIFT_REQUIRED_ROLES: UserRole[] = [
  'admin_restaurant',
  'gerente',
  'supervisor',
  'cajero',
]

export function requiresCashShift(role?: UserRole): boolean {
  return !!role && SHIFT_REQUIRED_ROLES.includes(role)
}
