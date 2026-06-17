-- ================================================================
-- IA-RESTAURANT — MIGRACIÓN 022: Seguridad fase 2 — políticas e IP
-- ================================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS security_config JSONB DEFAULT '{
    "ip_allowlist_enabled": false,
    "ip_allowlist": [],
    "alert_new_device": true,
    "alert_new_ip": true,
    "alert_security_whatsapp": true
  }'::jsonb;

CREATE INDEX IF NOT EXISTS login_audit_ip_lookup
  ON login_audit (tenant_id, ip_address, created_at DESC)
  WHERE success = true AND ip_address IS NOT NULL;
