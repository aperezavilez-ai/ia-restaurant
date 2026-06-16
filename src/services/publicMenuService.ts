import { supabase } from '@/lib/supabase'
import { isSupabaseConfigured } from '@/lib/config'
import { withTimeout } from '@/lib/async'
import type { Category, Product } from '@/types'

const EMPTY_MENU = { products: [] as Product[], categories: [] as Category[] }

export const publicMenuService = {
  async getMenu(tenantId?: string): Promise<{ products: Product[]; categories: Category[] }> {
    if (!isSupabaseConfigured() || !tenantId) return EMPTY_MENU

    try {
      const [productsRes, categoriesRes] = await withTimeout(
        Promise.all([
          Promise.resolve(
            supabase
              .from('products')
              .select('*, category:categories(*)')
              .eq('tenant_id', tenantId)
              .eq('is_active', true)
              .order('name')
          ),
          Promise.resolve(
            supabase
              .from('categories')
              .select('*')
              .eq('tenant_id', tenantId)
              .eq('is_active', true)
              .order('sort_order')
          ),
        ]),
        6000
      )
      if (productsRes.error) throw productsRes.error
      return {
        products: (productsRes.data as Product[]) || [],
        categories: (categoriesRes.data as Category[]) || [],
      }
    } catch {
      return EMPTY_MENU
    }
  },

  async getTenantName(tenantId?: string): Promise<string> {
    if (!isSupabaseConfigured() || !tenantId) return 'IA·RESTAURANT'
    try {
      const { data } = await withTimeout(
        Promise.resolve(
          supabase.from('tenants').select('name').eq('id', tenantId).maybeSingle()
        ),
        4000
      )
      if (data?.name) return data.name
    } catch {
      /* ignore */
    }
    return 'IA·RESTAURANT'
  },

  async resolveTableByNumber(num: number, tenantId?: string) {
    if (!isSupabaseConfigured()) return null

    try {
      let query = supabase
        .from('tables')
        .select('id, number, area_id, tenant_id, sucursal_id, assigned_waiter_id, area:table_areas(name)')
        .eq('number', num)
      if (tenantId) query = query.eq('tenant_id', tenantId)

      const { data: table } = await withTimeout(Promise.resolve(query.maybeSingle()), 5000)

      if (!table) return null

      let waiterName = 'Mesero'
      if (table.assigned_waiter_id) {
        try {
          const { data: waiter } = await withTimeout(
            Promise.resolve(
              supabase
                .from('users')
                .select('full_name')
                .eq('id', table.assigned_waiter_id)
                .maybeSingle()
            ),
            3000
          )
          if (waiter?.full_name) waiterName = waiter.full_name
        } catch {
          /* ignore */
        }
      }
      const area = table.area as { name?: string } | null
      return {
        id: table.id as string,
        number: table.number as number,
        tenant_id: table.tenant_id as string,
        sucursal_id: table.sucursal_id as string,
        area_id: table.area_id as string,
        area_name: area?.name || 'Sin área',
        waiter_id: (table.assigned_waiter_id as string) || '',
        waiter_name: waiterName,
      }
    } catch {
      return null
    }
  },
}
