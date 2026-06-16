import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types'

export const notificationService = {
  async getByTenant(tenantId: string, limit = 50): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data || []
  },
}
