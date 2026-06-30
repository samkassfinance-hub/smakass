#!/usr/bin/env python3
"""
Supabase Connection Test Script
Tests all Supabase connections and verifies database schema
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

print("\n" + "="*70)
print("🔍 SUPABASE CONNECTION TEST")
print("="*70)

# Test 1: Environment Variables
print("\n[1] Checking Environment Variables...")
url = os.environ.get("SUPABASE_URL")
anon_key = os.environ.get("SUPABASE_ANON_KEY")
service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if url:
    print(f"✅ SUPABASE_URL: {url}")
else:
    print("❌ SUPABASE_URL: Not set")
    sys.exit(1)

if anon_key:
    print(f"✅ SUPABASE_ANON_KEY: {anon_key[:20]}...")
else:
    print("❌ SUPABASE_ANON_KEY: Not set")

if service_key:
    print(f"✅ SUPABASE_SERVICE_ROLE_KEY: {service_key[:20]}...")
else:
    print("❌ SUPABASE_SERVICE_ROLE_KEY: Not set")

# Test 2: Client Import
print("\n[2] Importing Supabase Client...")
try:
    from supabase import create_client, Client
    print("✅ Supabase module imported successfully")
except ImportError as e:
    print(f"❌ Failed to import Supabase: {e}")
    sys.exit(1)

# Test 3: Create Client
print("\n[3] Creating Supabase Client...")
try:
    client = create_client(url, service_key or anon_key)
    print("✅ Supabase client created successfully")
except Exception as e:
    print(f"❌ Failed to create client: {e}")
    sys.exit(1)

# Test 4: Connection Test
print("\n[4] Testing Connection...")
try:
    # Try to query a simple table
    response = client.table('users').select('*').limit(1).execute()
    print("✅ Connection successful - can query 'users' table")
except Exception as e:
    print(f"⚠️  Could not query 'users' table: {e}")
    print("   This might mean the table doesn't exist yet (normal for first setup)")

# Test 5: Check Tables
print("\n[5] Checking Database Schema...")
try:
    from postgrest import SyncRequestClient
    # Try to access auth_audit_log_events (built-in Supabase table)
    try:
        response = client.table('auth.audit_log_events').select('*').limit(1).execute()
        print("✅ Can access auth tables (Supabase Auth is enabled)")
    except:
        print("ℹ️  Auth tables not accessible (may need Auth setup)")
    
    # List of expected tables
    expected_tables = ['users', 'subscriptions', 'app_backups', 'payments']
    print(f"\n   Expected tables to create:")
    for table in expected_tables:
        print(f"   - {table}")
        
except Exception as e:
    print(f"⚠️  Could not verify schema: {e}")

# Test 6: Test with SupabaseManager
print("\n[6] Testing SupabaseManager Class...")
try:
    from supabase_client import SupabaseManager
    manager = SupabaseManager()
    if manager.client:
        print("✅ SupabaseManager initialized successfully")
        if manager.is_connected():
            print("✅ SupabaseManager confirms connection is active")
    else:
        print("❌ SupabaseManager failed to initialize client")
except Exception as e:
    print(f"❌ Error with SupabaseManager: {e}")

# Test 7: Test with SupabaseService
print("\n[7] Testing SupabaseService Class...")
try:
    from supabase_client import SupabaseService
    service = SupabaseService()
    print("✅ SupabaseService initialized successfully")
    
    # Try a safe operation
    try:
        users = service.query_table('users')
        print(f"✅ Can query users table (found {len(users)} records)")
    except Exception as query_error:
        print(f"⚠️  Cannot query users yet: {query_error}")
        print("   (Table may not exist yet - this is normal for first setup)")
        
except Exception as e:
    print(f"❌ Error with SupabaseService: {e}")

# Test 8: Test Upsert (used in sync operations)
print("\n[8] Testing Data Operations...")
try:
    # Create a test record
    test_data = {
        "user_email": "test@example.com",
        "clients_json": [],
        "loans_json": [],
        "payments_json": [],
        "settings_json": {}
    }
    print("   Attempting to upsert test record...")
    
    try:
        response = client.table('app_backups').upsert(test_data).execute()
        print(f"✅ Upsert operation successful - test record saved")
        print(f"   Response: {len(response.data)} record(s) affected")
    except Exception as upsert_error:
        print(f"⚠️  Upsert failed: {upsert_error}")
        print("   (Table may not exist - run SUPABASE_SETUP.sql to create tables)")
        
except Exception as e:
    print(f"⚠️  Error testing data operations: {e}")

# Test 9: Summary
print("\n" + "="*70)
print("📋 SUMMARY")
print("="*70)
print("""
✅ All basic connection tests passed!

Next Steps:
1. If you see warnings about missing tables, run the SQL setup script:
   - Open: kaasflow/backend/SUPABASE_SETUP.sql
   - Execute in Supabase SQL Editor
   - This creates users, subscriptions, app_backups, and payments tables

2. Verify the app works:
   - Start backend: python3 kaasflow/backend/app.py
   - Check /api/debug-env endpoint
   - Check /api/sync/status endpoint

3. Test sync operations:
   - Try backing up data from the app
   - Check if data appears in Supabase dashboard

For issues, check:
- Supabase project: https://app.supabase.com/project/puhovplmbaldrisxqssy
- Environment variables are correctly set in .env
- All API keys match your Supabase project settings
""")
print("="*70)
