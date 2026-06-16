import { useEffect } from 'react'
import { useLiveFlowStore } from '@/store/liveFlowStore'
import { useAuthStore } from '@/store/authStore'
import { realtimeService } from '@/services/realtimeService'
import { isSupabaseConfigured } from '@/lib/config'
import type { QROrder, WaiterAlert } from '@/types/qrFlow'

export function useRealtimeBootstrap() {
  const tenantId = useAuthStore((s) => s.tenant?.id)
  const hydrateFromRemote = useLiveFlowStore(s => s.hydrateFromRemote)
  const applyRemoteOrder = useLiveFlowStore(s => s.applyRemoteOrder)
  const applyRemoteAlert = useLiveFlowStore(s => s.applyRemoteAlert)

  useEffect(() => {
    if (!isSupabaseConfigured() || !tenantId) return

    hydrateFromRemote()

    const unsubs = [
      realtimeService.subscribeTenant(tenantId, 'qr_orders', ({ new: row }) => {
        if (!row.id) return
        applyRemoteOrder({
          id: row.id as string,
          table_id: row.table_id as string,
          table_number: row.table_number as number,
          area: (row.area as string) || '',
          waiter_id: (row.waiter_id as string) || '',
          waiter_name: (row.waiter_name as string) || '',
          items: (row.items as QROrder['items']) || [],
          status: row.status as QROrder['status'],
          subtotal: Number(row.subtotal),
          tax: Number(row.tax),
          total: Number(row.total),
          folio: row.folio as string,
          kitchen_order_id: row.kitchen_order_id as string | undefined,
          created_at: row.created_at as string,
          validated_at: row.validated_at as string | undefined,
          rejected_reason: row.rejected_reason as string | undefined,
        })
      }),
      realtimeService.subscribeTenant(tenantId, 'waiter_alerts', ({ new: row }) => {
        if (!row.id) return
        applyRemoteAlert({
          id: row.id as string,
          type: row.type as WaiterAlert['type'],
          table_number: row.table_number as number,
          order_id: row.order_id as string | undefined,
          message: row.message as string,
          read: Boolean(row.read),
          created_at: row.created_at as string,
        })
      }),
    ]

    return () => unsubs.forEach(u => u())
  }, [tenantId, hydrateFromRemote, applyRemoteOrder, applyRemoteAlert])
}
