-- ================================================================
-- IA-RESTAURANT — MIGRACIÓN 015: INSERT/UPDATE categorías del catálogo
-- ================================================================

CREATE POLICY "categories_insert" ON categories
  FOR INSERT WITH CHECK (tenant_id = get_tenant_id());

CREATE POLICY "categories_update" ON categories
  FOR UPDATE USING (tenant_id = get_tenant_id());
