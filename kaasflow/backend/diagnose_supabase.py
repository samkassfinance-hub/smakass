#!/usr/bin/env python3
"""
Diagnose Supabase connection issues
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

print("\n" + "=" * 80)
print("SUPABASE CONNECTION DIAGNOSTIC")
print("=" * 80)

# Check 1: Environment variables
print("\n[1] CHECKING ENVIRONMENT VARIABLES")
print("-" * 80)

supabase_url = os.getenv("SUPABASE_URL", "")
supabase_anon_key = os.getenv("SUPABASE_ANON_KEY", "")
supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

print(f"SUPABASE_URL: {'SET' if supabase_url else 'MISSING'}")
print(f"SUPABASE_ANON_KEY: {'SET' if supabase_anon_key else 'MISSING'}")
print(f"SUPABASE_SERVICE_ROLE_KEY: {'SET' if supabase_service_key else 'MISSING'}")

if not supabase_url or not supabase_service_key:
    print("\nERROR: Missing required Supabase credentials!")
    sys.exit(1)

# Check 2: Test connection
print("\n[2] TESTING SUPABASE CONNECTION")
print("-" * 80)

try:
    from supabase import create_client, Client
    
    print("Importing Supabase library: OK")
    
    # Create client
    supabase = create_client(supabase_url, supabase_service_key)
    print("Creating Supabase client: OK")
    
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)

# Check 3: Test table access
print("\n[3] CHECKING TABLES")
print("-" * 80)

tables = ["kf_users", "kf_clients", "kf_loans", "kf_payments", "kf_settings"]

for table_name in tables:
    try:
        response = supabase.table(table_name).select("count", count="exact").execute()
        count = response.count if response.count is not None else 0
        print(f"{table_name}: OK - {count} records")
    except Exception as e:
        print(f"{table_name}: ERROR - {str(e)[:60]}")

# Check 4: Insert test data
print("\n[4] TESTING INSERT OPERATION")
print("-" * 80)

try:
    test_data = {
        "id": "test_user_001",
        "email": "test@samkass.local",
        "financier_name": "Test User",
        "business_name": "Test Business"
    }
    
    response = supabase.table("kf_users").insert(test_data).execute()
    print("Insert test data: OK")
    
    # Verify data was inserted
    response = supabase.table("kf_users").select("*").eq("email", "test@samkass.local").execute()
    
    if response.data:
        print(f"Data retrieval: OK - Found {len(response.data)} record(s)")
        print(f"Data: {response.data[0]}")
        
        # Clean up
        supabase.table("kf_users").delete().eq("email", "test@samkass.local").execute()
        print("Cleanup: OK")
    else:
        print("Data retrieval: ERROR - No data found")
        
except Exception as e:
    print(f"ERROR: {e}")

# Check 5: View all data in tables
print("\n[5] CHECKING DATA IN TABLES")
print("-" * 80)

for table_name in ["kf_users", "kf_clients", "kf_loans"]:
    try:
        response = supabase.table(table_name).select("*").limit(5).execute()
        if response.data:
            print(f"\n{table_name}: {len(response.data)} records found")
            for record in response.data:
                print(f"  - {record}")
        else:
            print(f"\n{table_name}: NO DATA (table is empty)")
    except Exception as e:
        print(f"{table_name}: ERROR - {str(e)[:60]}")

print("\n" + "=" * 80)
print("DIAGNOSTIC COMPLETE")
print("=" * 80 + "\n")
