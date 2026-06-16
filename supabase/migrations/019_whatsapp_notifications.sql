-- ================================================================
-- IA-RESTAURANT — MIGRACIÓN 019: WhatsApp operativo + historial
-- ================================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS whatsapp_config JSONB DEFAULT '{"alerts":{"order_ready":true,"payment_complete":false}}'::jsonb;

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  channel     TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'interno')),
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  recipient   TEXT,
  status      TEXT NOT NULL DEFAULT 'enviada' CHECK (status IN ('enviada', 'fallida', 'pendiente')),
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_tenant_idx ON notifications (tenant_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_tenant_select" ON notifications
  FOR SELECT USING (tenant_id = get_tenant_id());

CREATE POLICY "notifications_tenant_insert" ON notifications
  FOR INSERT WITH CHECK (tenant_id = get_tenant_id());
