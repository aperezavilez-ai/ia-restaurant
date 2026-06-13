import { supabase } from '@/lib/supabase'
import type { Order, OrderItem } from '@/types'
import { generateFolio } from '@/lib/utils'

export const orderService = {
  async createOrder(data: Partial<Order>, items: Partial<OrderItem>[]): Promise<Order> {
    const row = {
      ...data,
      folio: data.folio ?? generateFolio(),
      status: data.status ?? 'abierta',
    }
    const { data: order, error } = await supabase
      .from('orders').insert(row).select().single()
    if (error) throw error
    if (items.length > 0) {
      const { error: itemsErr } = await supabase.from('order_items').insert(
        items.map((i) => ({ ...i, order_id: order.id }))
      )
      if (itemsErr) throw itemsErr
    }
    return order
  },
  async getActiveOrders(tenantId: string, sucursalId: string): Promise<Order[]> {
    const { data } = await supabase
      .from('orders').select('*, items:order_items(*)')
      .eq('tenant_id', tenantId).eq('sucursal_id', sucursalId)
      .in('status', ['abierta', 'en_preparacion', 'lista'])
      .order('created_at', { ascending: false })
    return data || []
  },
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId)
  },
  async updateItemStatus(itemId: string, status: OrderItem['status']): Promise<void> {
    await supabase.from('order_items').update({ status }).eq('id', itemId)
  },
  async getOrderHistory(tenantId: string, sucursalId: string, limit = 50): Promise<Order[]> {
    const { data } = await supabase
      .from('orders').select('*')
      .eq('tenant_id', tenantId).eq('sucursal_id', sucursalId)
      .order('created_at', { ascending: false }).limit(limit)
    return data || []
  },
}
