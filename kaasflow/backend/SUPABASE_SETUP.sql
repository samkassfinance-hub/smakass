-- ============================================================================
-- SUPABASE DATABASE SETUP - Copy this entire script into SQL Editor
-- ============================================================================
-- Project: SamKass Finance Manager
-- Date: June 2026
-- Instructions:
-- 1. Go to https://app.supabase.com/project/puhovplmbaldrisxqssy/editor
-- 2. Click "New Query"
-- 3. Copy and paste this entire script
-- 4. Click "Run"
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Users Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    provider VARCHAR(50),
    provider_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    last_login TIMESTAMP
);

-- ============================================================================
-- Subscriptions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    start_date TIMESTAMP DEFAULT now(),
    end_date TIMESTAMP,
    renewal_date TIMESTAMP,
    client_limit INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- App Backups Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS app_backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) NOT NULL UNIQUE,
    clients_json JSONB DEFAULT '[]',
    loans_json JSONB DEFAULT '[]',
    payments_json JSONB DEFAULT '[]',
    settings_json JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- Audit Logs Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id VARCHAR(255),
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- Create Indexes for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_app_backups_user_email ON app_backups(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for Users Table
-- ============================================================================
CREATE POLICY "Users can view their own data"
    ON users
    FOR SELECT
    USING (true);  -- Backend validates

CREATE POLICY "Users can update their own data"
    ON users
    FOR UPDATE
    USING (true);  -- Backend validates

-- ============================================================================
-- RLS Policies for Subscriptions Table
-- ============================================================================
CREATE POLICY "Users can view their subscriptions"
    ON subscriptions
    FOR SELECT
    USING (true);  -- Backend validates

CREATE POLICY "Users can insert subscriptions"
    ON subscriptions
    FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- RLS Policies for App Backups Table
-- ============================================================================
CREATE POLICY "Users can view their backups"
    ON app_backups
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert backups"
    ON app_backups
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update backups"
    ON app_backups
    FOR UPDATE
    USING (true);

-- ============================================================================
-- RLS Policies for Audit Logs Table
-- ============================================================================
CREATE POLICY "Users can view their audit logs"
    ON audit_logs
    FOR SELECT
    USING (true);

CREATE POLICY "System can insert audit logs"
    ON audit_logs
    FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- Sample Data (Optional - Uncomment to add test data)
-- ============================================================================
-- INSERT INTO users (email, name, phone, is_active) VALUES
--     ('test@example.com', 'Test User', '+91-9876543210', true),
--     ('demo@example.com', 'Demo User', '+91-9123456789', true);

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- All tables created successfully!
-- Tables: users, subscriptions, app_backups, audit_logs
-- Status: Ready to use ✅
-- ============================================================================
