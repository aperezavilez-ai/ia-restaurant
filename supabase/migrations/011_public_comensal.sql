-- ================================================================
-- IA-RESTAURANT — MIGRACIÓN 011: LECTURA PÚBLICA PARA PWA COMENSAL
-- Permite menú QR y seguimiento de pedidos sin login (tenant demo)
-- ================================================================

CREATE POLICY "public_products_read" ON products
  FOR SELECT USING (
    tenant_id = '00000000-0000-0000-0000-000000000001'::uuid AND is_active = true
  );

CREATE POLICY "public_categories_read" ON categories
  FOR SELECT USING (
    tenant_id = '00000000-0000-0000-0000-000000000001'::uuid AND is_active = true
  );

CREATE POLICY "public_tables_read" ON tables
  FOR SELECT USING (
    tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  );

CREATE POLICY "public_table_areas_read" ON table_areas
  FOR SELECT USING (
    tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  );

CREATE POLICY "public_tenant_name" ON tenants
  FOR SELECT USING (
    id = '00000000-0000-0000-0000-000000000001'::uuid
  );

CREATE POLICY "qr_orders_public_read" ON qr_orders
  FOR SELECT USING (
    tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  );

CREATE POLICY "tenant_settings_public_read" ON tenant_settings
  FOR SELECT USING (
    tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
  );
