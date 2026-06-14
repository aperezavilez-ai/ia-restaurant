import { supabase } from '@/lib/supabase'
import { DEMO_TENANT_ID, DEMO_SUCURSAL_ID, isSupabaseConfigured } from '@/lib/config'
import { SEED_CATEGORIES, SEED_PRODUCTS } from '@/data/seed'
import type { Category, Product } from '@/types'

export const publicMenuService = {
  async getMenu(): Promise<{ products: Product[]; categories: Category[] }> {
    if (isSupabaseConfigured()) {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('tenant_id', DEMO_TENANT_ID)
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('categories')
          .select('*')
          .eq('tenant_id', DEMO_TENANT_ID)
          .eq('is_active', true)
          .order('sort_order'),
      ])
      if (productsRes.data?.length) {
        return {
          products: productsRes.data as Product[],
          categories: (categoriesRes.data as Category[]) || [],
        }
      }
    }
    return {
      products: SEED_PRODUCTS.filter((p) => p.is_active),
      categories: SEED_CATEGORIES.filter((c) => c.is_active),
    }
  },

  async getTenantName(): Promise<string> {
    if (isSupabaseConfigured()) {
      const { data } = await supabase
        .from('tenants')
        .select('name')
        .eq('id', DEMO_TENANT_ID)
        .maybeSingle()
      if (data?.name) return data.name
    }
    return 'IA·RESTAURANT'
  },

  async resolveTableByNumber(num: number) {
    if (isSupabaseConfigured()) {
      const { data: table } = await supabase
        .from('tables')
        .select('id, number, area_id, assigned_waiter_id, area:table_areas(name)')
        .eq('tenant_id', DEMO_TENANT_ID)
        .eq('sucursal_id', DEMO_SUCURSAL_ID)
        .eq('number', num)
        .maybeSingle()

      if (table) {
        let waiterName = 'Mesero'
        if (table.assigned_waiter_id) {
          const { data: waiter } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', table.assigned_waiter_id)
            .maybeSingle()
          if (waiter?.full_name) waiterName = waiter.full_name
        }
        const area = table.area as { name?: string } | null
        return {
          id: table.id as string,
          number: table.number as number,
          area_id: table.area_id as string,
          area_name: area?.name || 'Sin área',
          waiter_id: (table.assigned_waiter_id as string) || '',
          waiter_name: waiterName,
        }
      }
    }

    const { getTableByNumber } = await import('@/lib/tableLookup')
    return getTableByNumber(num)
  },
}
