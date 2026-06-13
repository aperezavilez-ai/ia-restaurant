-- ================================================================
-- IA-RESTAURANT — MIGRACIÓN 006: Políticas INSERT/UPDATE (RLS)
-- Sin WITH CHECK, insertar órdenes/caja/pagos fallaba en producción
-- ================================================================

-- cash_registers
CREATE POLICY "cash_registers_insert" ON cash_registers
  FOR INSERT WITH CHECK (tenant_id = get_tenant_id());
CREATE POLICY "cash_registers_update" ON cash_registers
  FOR UPDATE USING (tenant_id = get_tenant_id());

-- orders
CREATE POLICY "orders_insert" ON orders
  FOR INSERT WITH CHECK (tenant_id = get_tenant_id());
CREATE POLICY "orders_update" ON orders
  FOR UPDATE USING (tenant_id = get_tenant_id());

-- order_items
CREATE POLICY "order_items_insert" ON order_items
  FOR INSERT WITH CHECK (
    order_id IN (SELECT id FROM orders WHERE tenant_id = get_tenant_id())
  );
CREATE POLICY "order_items_update" ON order_items
  FOR UPDATE USING (
    order_id IN (SELECT id FROM orders WHERE tenant_id = get_tenant_id())
  );

-- payments
CREATE POLICY "payments_insert" ON payments
  FOR INSERT WITH CHECK (tenant_id = get_tenant_id());

-- tables (estado mesa al cobrar / comanda)
CREATE POLICY "tables_update" ON tables
  FOR UPDATE USING (tenant_id = get_tenant_id());

-- products (catálogo)
CREATE POLICY "products_insert" ON products
  FOR INSERT WITH CHECK (tenant_id = get_tenant_id());
CREATE POLICY "products_update" ON products
  FOR UPDATE USING (tenant_id = get_tenant_id());
