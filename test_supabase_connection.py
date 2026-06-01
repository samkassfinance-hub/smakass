#!/usr/bin/env python3
"""
Test Supabase Connection and Create Tables if Needed
"""

import os
import requests
import json

# Your Supabase credentials
SUPABASE_URL = "https://eahyuwpejwbqzzolajzr.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhaHl1d3BlandicXp6b2xhanpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwOTIyNDQsImV4cCI6MjA5NDY2ODI0NH0.S98_O8nYZoiVj9-xq153R8VorNhehy8m46FoYIjUzvY"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhaHl1d3BlandicXp6b2xhanpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA5MjI0NCwiZXhwIjoyMDk0NjY4MjQ0fQ.Mm4eOTioL1FpasqsqJPBeNdRP_BBW0_50ucBsf5Uoxs"

def test_connection():
    """Test basic Supabase connection"""
    print("=" * 60)
    print("TESTING SUPABASE CONNECTION")
    print("=" * 60)
    print(f"URL: {SUPABASE_URL}")
    print(f"Anon Key: {SUPABASE_ANON_KEY[:20]}...")
    print(f"Service Key: {SUPABASE_SERVICE_KEY[:20]}...")
    print()
    
    # Test with service role key
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json"
    }
    
    print("🔍 Checking which tables exist...")
    print()
    
    tables_to_check = ['kf_users', 'kf_clients', 'kf_loans', 'kf_payments', 'kf_settings']
    existing_tables = []
    missing_tables = []
    
    for table in tables_to_check:
        try:
            url = f"{SUPABASE_URL}/rest/v1/{table}?limit=1"
            response = requests.get(url, headers=headers, timeout=5)
            
            if response.status_code == 200:
                print(f"✅ Table '{table}' EXISTS")
                existing_tables.append(table)
                
                # Show count
                count_response = requests.get(
                    f"{SUPABASE_URL}/rest/v1/{table}?select=count",
                    headers={**headers, "Prefer": "count=exact"},
                    timeout=5
                )
                if count_response.status_code == 200:
                    count = count_response.headers.get('Content-Range', '0-0/0').split('/')[-1]
                    print(f"   📊 Records: {count}")
            else:
                print(f"❌ Table '{table}' NOT FOUND (Status: {response.status_code})")
                print(f"   Error: {response.text[:100]}")
                missing_tables.append(table)
        except Exception as e:
            print(f"❌ Table '{table}' ERROR: {e}")
            missing_tables.append(table)
        print()
    
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"✅ Existing tables: {len(existing_tables)}")
    print(f"❌ Missing tables: {len(missing_tables)}")
    print()
    
    if missing_tables:
        print("⚠️  TABLES MISSING! You need to create them.")
        print()
        print("📋 Run this SQL in Supabase SQL Editor:")
        print("=" * 60)
        print(get_create_tables_sql())
        print("=" * 60)
        return False
    else:
        print("✅ ALL TABLES EXIST! Supabase is ready to use.")
        return True

def get_create_tables_sql():
    """Return SQL to create all required tables"""
    return """
-- KaasFlow Primary Supabase Schema
-- Copy and paste this into Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS kf_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    financier_name TEXT,
    business_name TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Settings Table
CREATE TABLE IF NOT EXISTS kf_settings (
    user_id TEXT PRIMARY KEY REFERENCES kf_users(id) ON DELETE CASCADE,
    financier_name TEXT,
    business_name TEXT,
    theme TEXT DEFAULT 'dark',
    lang TEXT DEFAULT 'en',
    extra_clients INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Clients Table
CREATE TABLE IF NOT EXISTS kf_clients (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES kf_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    id_num TEXT,
    occupation TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kf_clients_user_id ON kf_clients(user_id);

-- 4. Loans Table
CREATE TABLE IF NOT EXISTS kf_loans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES kf_users(id) ON DELETE CASCADE,
    client_id TEXT NOT NULL REFERENCES kf_clients(id) ON DELETE CASCADE,
    principal NUMERIC(15, 2) NOT NULL DEFAULT 0,
    interest_rate NUMERIC(5, 2) DEFAULT 0,
    duration INTEGER DEFAULT 0,
    type TEXT DEFAULT 'monthly',
    start_date DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kf_loans_user_id ON kf_loans(user_id);
CREATE INDEX IF NOT EXISTS idx_kf_loans_client_id ON kf_loans(client_id);

-- 5. Payments Table
CREATE TABLE IF NOT EXISTS kf_payments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES kf_users(id) ON DELETE CASCADE,
    loan_id TEXT NOT NULL REFERENCES kf_loans(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kf_payments_user_id ON kf_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_kf_payments_loan_id ON kf_payments(loan_id);

-- Enable Row Level Security
ALTER TABLE kf_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kf_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE kf_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE kf_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE kf_payments ENABLE ROW LEVEL SECURITY;

-- Policies (service role has full access)
CREATE POLICY "Service role full access users" ON kf_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access settings" ON kf_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access clients" ON kf_clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access loans" ON kf_loans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access payments" ON kf_payments FOR ALL USING (true) WITH CHECK (true);

SELECT 'KaasFlow tables created successfully!' AS message;
"""

def test_insert_data():
    """Test inserting sample data"""
    print("\n" + "=" * 60)
    print("TESTING DATA INSERT")
    print("=" * 60)
    
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    # Test insert user
    test_user = {
        "id": "test-user-123",
        "email": "test@example.com",
        "financier_name": "Test User",
        "business_name": "Test Business"
    }
    
    try:
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/kf_users",
            headers=headers,
            json=test_user,
            timeout=5
        )
        
        if response.status_code in [200, 201]:
            print("✅ Test user inserted successfully")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Failed to insert user: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Error inserting user: {e}")

if __name__ == "__main__":
    print("""
╔═══════════════════════════════════════════════════════════╗
║   KAASFLOW - SUPABASE CONNECTION TEST                    ║
╚═══════════════════════════════════════════════════════════╝
    """)
    
    # Test connection
    tables_exist = test_connection()
    
    if tables_exist:
        # Test data insert
        test_insert = input("\n📝 Test data insert? (y/n): ").strip().lower()
        if test_insert == 'y':
            test_insert_data()
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)
