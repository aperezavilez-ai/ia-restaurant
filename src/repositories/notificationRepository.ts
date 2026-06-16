import { isSupabaseConfigured } from '@/lib/config'
import { withTimeout } from '@/lib/async'
import { notificationService } from '@/services/notificationService'
import type { Notification } from '@/types'
import type { TenantContext } from '@/types/context'

async function remoteNotifications(tenantId: string) {
  return withTimeout(notificationService.getByTenant(tenantId)).catch(() => [] as Notification[])
}

export const notificationRepository = {
  async getNotifications(ctx: TenantContext, limit = 50): Promise<Notification[]> {
    if (!isSupabaseConfigured()) return []
    return remoteNotifications(ctx.tenantId)
  },
}
