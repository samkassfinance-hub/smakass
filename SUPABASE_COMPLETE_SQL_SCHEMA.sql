-- ============================================================================
-- KAASFLOW - COMPLETE SUPABASE SQL SCHEMA
-- ============================================================================
-- Copy and paste this entire script into Supabase SQL Editor
-- Go to: SQL Editor → New Query → Paste this → Run
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- 1. USERS TABLE
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS kf_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  financier_name TEXT DEFAULT '',
  business_name TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_kf_users_email ON kf_users(email);

-- ─────────────────────────────────────────────────────────────────────────
-- 2. SETTINGS TABLE
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS kf_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES kf_users(id) ON DELETE CASCADE,
  financier_name TEXT DEFAULT '',
  business_name TEXT DEFAULT '',
  theme TEXT DEFAULT 'dark',
  lang TEXT DEFAULT 'en',
  extra_clients INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_kf_settings_user_id ON kf_settings(user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. CLIENTS TABLE
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS kf_clients (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES kf_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  id_num TEXT DEFAULT '',
  occupation TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_kf_clients_user_id ON kf_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_kf_clients_name ON kf_clients(name);

-- ─────────────────────────────────────────────────────────────────────────
-- 4. LOANS TABLE
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS kf_loans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES kf_users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES kf_clients(id) ON DELETE CASCADE,
  principal NUMERIC(15,2) DEFAULT 0,
  interest_rate NUMERIC(5,2) DEFAULT 0,
  duration INTEGER DEFAULT 0,
  type TEXT DEFAULT 'monthly',
  start_date TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_kf_loans_user_id ON kf_loans(user_id);
CREATE INDEX IF NOT EXISTS idx_kf_loans_client_id ON kf_loans(client_id);
CREATE INDEX IF NOT EXISTS idx_kf_loans_status ON kf_loans(status);

-- ─────────────────────────────────────────────────────────────────────────
-- 5. PAYMENTS TABLE
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS kf_payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES kf_users(id) ON DELETE CASCADE,
  loan_id TEXT NOT NULL REFERENCES kf_loans(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) DEFAULT 0,
  date TEXT DEFAULT '',
  note TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_kf_payments_user_id ON kf_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_kf_payments_loan_id ON kf_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_kf_payments_date ON kf_payments(date);

-- ─────────────────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS) - OPTIONAL BUT RECOMMENDED
-- ─────────────────────────────────────────────────────────────────────────
-- Uncomment the lines below if you want to enable Row Level Security
-- This ensures users can only access their own data

-- ALTER TABLE kf_users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE kf_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE kf_clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE kf_loans ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE kf_payments ENABLE ROW LEVEL SECURITY;

-- -- Allow users to read/write only their own data
-- CREATE POLICY "Users can access own data"
--   ON kf_users FOR ALL
--   USING (id = auth.uid());

-- CREATE POLICY "Settings: Users can access own settings"
--   ON kf_settings FOR ALL
--   USING (user_id = auth.uid());

-- CREATE POLICY "Clients: Users can access own clients"
--   ON kf_clients FOR ALL
--   USING (user_id = auth.uid());

-- CREATE POLICY "Loans: Users can access own loans"
--   ON kf_loans FOR ALL
--   USING (user_id = auth.uid());

-- CREATE POLICY "Payments: Users can access own payments"
--   ON kf_payments FOR ALL
--   USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────
-- 7. SAMPLE DATA (Optional - for testing)
-- ─────────────────────────────────────────────────────────────────────────
-- Uncomment below to add test data (replace user_id with your actual user ID)

-- INSERT INTO kf_users (id, email, financier_name, business_name) VALUES
-- ('user123', 'samkass@example.com', 'Sam Kass', 'Kass Financial'),
-- ON CONFLICT (email) DO NOTHING;

-- INSERT INTO kf_settings (user_id, financier_name, business_name, theme, lang) VALUES
-- ('user123', 'Sam Kass', 'Kass Financial', 'dark', 'en')
-- ON CONFLICT (user_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────
-- 8. VERIFY TABLES CREATED
-- ─────────────────────────────────────────────────────────────────────────
-- Run this query to verify all tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
-- After running this script:
-- 1. Refresh your Supabase dashboard
-- 2. You should see 5 new tables in the left sidebar under "Database"
-- 3. Update your .env file with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
-- 4. Restart your backend
-- 5. Run: python test_supabase_connection.py
-- ============================================================================
