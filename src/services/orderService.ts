import { supabase } from '@/lib/supabase'
import type { Order, OrderItem } from '@/types'
import { generateFolio } from '@/lib/utils'

function normalizeOrder(row: Record<string, unknown>): Order {
  const rawItems = (row.items as OrderItem[] | undefined) ?? (row.order_items as OrderItem[] | undefined) ?? []
  const { order_items: _oi, items: _i, ...rest } = row
  return { ...rest, items: rawItems } as Order
}

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
    const { data, error } = await supabase
      .from('orders').select('*, order_items(*)')
      .eq('tenant_id', tenantId).eq('sucursal_id', sucursalId)
      .in('status', ['abierta', 'en_preparacion', 'lista', 'entregada', 'cobro_parcial'])
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map((row) => normalizeOrder(row as Record<string, unknown>))
  },
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId)
  },

  async updateOrderCustomer(orderId: string, customerId: string | null, customerName?: string | null): Promise<void> {
    await supabase.from('orders').update({
      customer_id: customerId,
      customer_name: customerName,
      updated_at: new Date().toISOString(),
    }).eq('id', orderId)
  },
  async updateItemStatus(itemId: string, status: OrderItem['status']): Promise<void> {
    await supabase.from('order_items').update({ status }).eq('id', itemId)
  },
  async insertOrderItems(items: Partial<OrderItem>[]): Promise<void> {
    if (!items.length) return
    const { error } = await supabase.from('order_items').insert(items)
    if (error) throw error
  },
  async updateOrderTotals(
    orderId: string,
    patch: Pick<Order, 'subtotal' | 'tax' | 'discount' | 'total' | 'updated_at'>,
  ): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update(patch)
      .eq('id', orderId)
    if (error) throw error
  },

  async updateOrderPatch(
    orderId: string,
    patch: Partial<Pick<Order, 'status' | 'split_config' | 'updated_at' | 'cashier_id'>>
  ): Promise<void> {
    const { error } = await supabase.from('orders').update(patch).eq('id', orderId)
    if (error) throw error
  },
  async getOrderHistory(tenantId: string, sucursalId: string, limit = 50): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders').select('*, order_items(*)')
      .eq('tenant_id', tenantId).eq('sucursal_id', sucursalId)
      .order('created_at', { ascending: false }).limit(limit)
    if (error) throw error
    return (data || []).map((row) => normalizeOrder(row as Record<string, unknown>))
  },
}
