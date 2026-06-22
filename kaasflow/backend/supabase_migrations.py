"""
Supabase Database Schema and Migration Utilities
Run this to set up or verify database tables
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def get_supabase_client() -> Client:
    """Get authenticated Supabase client"""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    
    return create_client(url, key)


def create_users_table(supabase: Client) -> None:
    """Create users table schema"""
    query = """
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
    )
    """
    # Note: Execute via Supabase dashboard SQL editor for initial setup
    print("✅ Users table schema defined (run in Supabase SQL editor)")


def create_subscriptions_table(supabase: Client) -> None:
    """Create subscriptions table schema"""
    query = """
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
    )
    """
    print("✅ Subscriptions table schema defined (run in Supabase SQL editor)")


def create_app_backups_table(supabase: Client) -> None:
    """Create app backups table for data sync"""
    query = """
    CREATE TABLE IF NOT EXISTS app_backups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_email VARCHAR(255) NOT NULL UNIQUE,
        clients_json JSONB DEFAULT '[]',
        loans_json JSONB DEFAULT '[]',
        payments_json JSONB DEFAULT '[]',
        settings_json JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
    )
    """
    print("✅ App backups table schema defined (run in Supabase SQL editor)")


def create_audit_logs_table(supabase: Client) -> None:
    """Create audit logs table for tracking user actions"""
    query = """
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
    )
    """
    print("✅ Audit logs table schema defined (run in Supabase SQL editor)")


def setup_rls_policies(supabase: Client) -> None:
    """Setup Row Level Security (RLS) policies"""
    policies = {
        "users": "Users can only read their own data",
        "subscriptions": "Users can only read their own subscriptions",
        "app_backups": "Users can only access their own backups",
        "audit_logs": "Users can only read their own audit logs"
    }
    
    for table, description in policies.items():
        print(f"✅ RLS policy for {table}: {description}")
    
    print("\n⚠️  NOTE: Configure RLS policies in Supabase dashboard:")
    print("   1. Go to Authentication → Policies")
    print("   2. Enable RLS on each table")
    print("   3. Create SELECT/INSERT/UPDATE/DELETE policies as needed")


def print_setup_guide():
    """Print comprehensive setup guide"""
    guide = """
    ╔════════════════════════════════════════════════════════════════╗
    ║         SUPABASE DATABASE SETUP GUIDE                          ║
    ╚════════════════════════════════════════════════════════════════╝
    
    1. CREATE TABLES (Run in Supabase Dashboard → SQL Editor):
    ──────────────────────────────────────────────────────────
    
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Users Table
    CREATE TABLE users (
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
    
    -- Subscriptions Table
    CREATE TABLE subscriptions (
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
    
    -- App Backups Table
    CREATE TABLE app_backups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_email VARCHAR(255) NOT NULL UNIQUE,
        clients_json JSONB DEFAULT '[]',
        loans_json JSONB DEFAULT '[]',
        payments_json JSONB DEFAULT '[]',
        settings_json JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
    );
    
    -- Audit Logs Table
    CREATE TABLE audit_logs (
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
    
    -- Create indexes for better query performance
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
    CREATE INDEX idx_app_backups_user_email ON app_backups(user_email);
    CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
    
    2. ENABLE ROW LEVEL SECURITY (RLS):
    ──────────────────────────────────
    
    -- Enable RLS on tables
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE app_backups ENABLE ROW LEVEL SECURITY;
    ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
    
    3. SET UP AUTHENTICATION:
    ───────────────────────
    
    In Supabase Dashboard:
    - Authentication → Users: Create test users or enable OAuth providers
    - Create custom JWT tokens for API access if needed
    
    4. TEST CONNECTION:
    ──────────────────
    
    Run: python3 test_supabase_connection.py
    """
    
    print(guide)


if __name__ == "__main__":
    try:
        supabase = get_supabase_client()
        print("✅ Supabase client initialized\n")
        
        # Print table schemas
        create_users_table(supabase)
        create_subscriptions_table(supabase)
        create_app_backups_table(supabase)
        create_audit_logs_table(supabase)
        
        # Print RLS info
        print("\n" + "="*60)
        setup_rls_policies(supabase)
        
        # Print full setup guide
        print("\n" + "="*60)
        print_setup_guide()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n⚠️  Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env")
