-- Add WhatsApp Configuration Table
-- Run this in Supabase SQL Editor

-- ── 7. WHATSAPP CONFIG ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS kf_whatsapp_config (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES kf_users(id) ON DELETE CASCADE,
    instance_name       TEXT NOT NULL,
    phone_number        TEXT,
    is_connected        BOOLEAN DEFAULT FALSE,
    due_today_enabled   BOOLEAN DEFAULT TRUE,
    due_tomorrow_enabled BOOLEAN DEFAULT TRUE,
    overdue_enabled     BOOLEAN DEFAULT TRUE,
    connected_at        TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEX for fast lookups ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_whatsapp_user ON kf_whatsapp_config(user_id);

-- ── Enable RLS ──────────────────────────────────────────────
ALTER TABLE kf_whatsapp_config ENABLE ROW LEVEL SECURITY;

-- ── RLS Policy ──────────────────────────────────────────────
CREATE POLICY "service_role_all" ON kf_whatsapp_config FOR ALL USING (true);

-- ── Trigger: auto-update updated_at ─────────────────────────
CREATE TRIGGER trg_whatsapp_config_updated
  BEFORE UPDATE ON kf_whatsapp_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Verify table created
SELECT 'kf_whatsapp_config table created successfully!' AS status;
