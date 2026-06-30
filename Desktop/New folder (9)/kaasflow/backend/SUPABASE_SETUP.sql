-- ================================================================================
-- SUPABASE DATABASE SETUP
-- ================================================================================
-- Execute this script in Supabase SQL Editor to create all required tables
-- Project: puhovplmbaldrisxqssy
-- Date: 2026-06-24
-- ================================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================================
-- 1. USERS TABLE - Store user information
-- ================================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    subscription_status VARCHAR(50) DEFAULT 'free'
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- ================================================================================
-- 2. APP_BACKUPS TABLE - Store user app data backups for sync
-- ================================================================================
CREATE TABLE IF NOT EXISTS public.app_backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) UNIQUE NOT NULL,
    clients_json JSONB DEFAULT '[]'::JSONB,
    loans_json JSONB DEFAULT '[]'::JSONB,
    payments_json JSONB DEFAULT '[]'::JSONB,
    settings_json JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_app_backups_user_email ON public.app_backups(user_email);
CREATE INDEX IF NOT EXISTS idx_app_backups_updated_at ON public.app_backups(updated_at DESC);

-- ================================================================================
-- 3. SUBSCRIPTIONS TABLE - Track user subscriptions and plans
-- ================================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    plan_type VARCHAR(50) DEFAULT 'free',
    status VARCHAR(50) DEFAULT 'active',
    client_limit INTEGER DEFAULT 10,
    loan_limit INTEGER DEFAULT 50,
    payment_limit INTEGER DEFAULT 500,
    razorpay_subscription_id VARCHAR(255),
    razorpay_order_id VARCHAR(255),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    renewal_date TIMESTAMP WITH TIME ZONE,
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_email ON public.subscriptions(user_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON public.subscriptions(expires_at);

-- ================================================================================
-- 4. PAYMENTS TABLE - Track all payments and transactions
-- ================================================================================
CREATE TABLE IF NOT EXISTS public.kf_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    razorpay_payment_id VARCHAR(255) UNIQUE,
    razorpay_order_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'created',
    payment_method VARCHAR(50),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_kf_payments_user_id ON public.kf_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_kf_payments_user_email ON public.kf_payments(user_email);
CREATE INDEX IF NOT EXISTS idx_kf_payments_razorpay_id ON public.kf_payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_kf_payments_status ON public.kf_payments(status);
CREATE INDEX IF NOT EXISTS idx_kf_payments_created_at ON public.kf_payments(created_at DESC);

-- ================================================================================
-- 5. AUDIT_LOG TABLE - Track important events and changes
-- ================================================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(50) DEFAULT 'success',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_user_email ON public.audit_log(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);

-- ================================================================================
-- 6. MAGIC_LINKS TABLE - Store magic link tokens for passwordless auth
-- ================================================================================
CREATE TABLE IF NOT EXISTS public.magic_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_magic_links_email ON public.magic_links(email);
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON public.magic_links(token);
CREATE INDEX IF NOT EXISTS idx_magic_links_expires_at ON public.magic_links(expires_at);

-- ================================================================================
-- 7. EMAIL_LOGS TABLE - Track email sending for debugging
-- ================================================================================
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    email_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'sent',
    provider VARCHAR(50),
    external_id VARCHAR(255),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);

-- ================================================================================
-- 8. WHATSAPP_MESSAGES TABLE - Track WhatsApp reminders
-- ================================================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    message_type VARCHAR(50),
    content TEXT,
    meta_message_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'sent',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_user_email ON public.whatsapp_messages(user_email);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON public.whatsapp_messages(created_at DESC);

-- ================================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) - Optional but recommended
-- ================================================================================

-- Enable RLS on sensitive tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kf_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_backups ENABLE ROW LEVEL SECURITY;

-- Create policy for users table (users can only see their own data)
CREATE POLICY "Users can view their own data"
    ON public.users
    FOR SELECT
    USING (email = current_user_email());

-- Create policy for subscriptions table
CREATE POLICY "Users can view their own subscriptions"
    ON public.subscriptions
    FOR SELECT
    USING (user_email = current_user_email());

-- Create policy for payments table
CREATE POLICY "Users can view their own payments"
    ON public.kf_payments
    FOR SELECT
    USING (user_email = current_user_email());

-- Create policy for app_backups table
CREATE POLICY "Users can view their own backups"
    ON public.app_backups
    FOR SELECT
    USING (user_email = current_user_email());

-- ================================================================================
-- CREATE FUNCTIONS FOR COMMON OPERATIONS
-- ================================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_backups_updated_at BEFORE UPDATE ON public.app_backups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kf_payments_updated_at BEFORE UPDATE ON public.kf_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================================
-- VERIFICATION QUERIES (Run these to verify setup)
-- ================================================================================

-- Check all tables are created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check users table structure
-- \d public.users

-- Check app_backups table structure
-- \d public.app_backups

-- ================================================================================
-- NOTES
-- ================================================================================
-- 1. RLS (Row Level Security) requires additional setup with Supabase Auth
-- 2. If you're not using Supabase Auth, you can disable RLS
-- 3. Backup your data before running this script
-- 4. All timestamps are in UTC timezone
-- 5. JSONb columns provide better indexing than JSON
-- 6. Adjust limits and constraints based on your requirements
-- ================================================================================
