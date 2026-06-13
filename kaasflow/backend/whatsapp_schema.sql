-- ================================================================
--  WhatsApp Reminder System - Database Schema
--  Add these tables to your Supabase database
--  Run this in Supabase SQL Editor
-- ================================================================

-- ── WhatsApp Settings Table ──────────────────────────────────
-- Stores finance user's WhatsApp configuration (one record per user)
CREATE TABLE IF NOT EXISTS kf_whatsapp_settings (
    user_id             UUID PRIMARY KEY REFERENCES kf_users(id) ON DELETE CASCADE,
    whatsapp_number     TEXT NOT NULL,              -- Finance user's WhatsApp number with country code
    whatsapp_enabled    BOOLEAN DEFAULT true,       -- Enable/disable automatic reminders
    business_name       TEXT DEFAULT 'KaasFlow',    -- Business name to show in messages
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── WhatsApp Logs Table ──────────────────────────────────────
-- Tracks all WhatsApp reminders sent (for audit and debugging)
CREATE TABLE IF NOT EXISTS kf_whatsapp_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES kf_users(id) ON DELETE CASCADE,
    loan_id         TEXT NOT NULL,                  -- Loan ID that triggered the reminder
    client_id       TEXT NOT NULL,                  -- Client who received the reminder
    sent_date       DATE NOT NULL,                  -- Date the reminder was sent
    status          TEXT NOT NULL,                  -- 'success' or 'failed'
    error_message   TEXT,                           -- Error details if failed
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes for Performance ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_user ON kf_whatsapp_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_date ON kf_whatsapp_logs(sent_date);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_loan ON kf_whatsapp_logs(loan_id);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE kf_whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE kf_whatsapp_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON kf_whatsapp_settings FOR ALL USING (true);
CREATE POLICY "service_role_all" ON kf_whatsapp_logs FOR ALL USING (true);

-- ── Trigger: Auto-update updated_at ──────────────────────────
CREATE TRIGGER trg_whatsapp_settings_updated
  BEFORE UPDATE ON kf_whatsapp_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Sample Query: Get Today's Reminder Statistics ────────────
-- SELECT 
--     COUNT(*) as total_sent,
--     SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
--     SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
-- FROM kf_whatsapp_logs
-- WHERE sent_date = CURRENT_DATE;

COMMENT ON TABLE kf_whatsapp_settings IS 'Stores finance user WhatsApp configuration for automated loan reminders';
COMMENT ON TABLE kf_whatsapp_logs IS 'Audit log of all WhatsApp reminders sent by the system';
