#!/usr/bin/env python3
"""
View all data in Supabase
Shows complete database contents
"""

import os
from dotenv import load_dotenv
from supabase import create_client
import json

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

print("\n" + "=" * 100)
print("SUPABASE DATA VIEWER - COMPLETE DATABASE CONTENTS")
print("=" * 100)

tables = ["kf_users", "kf_clients", "kf_loans", "kf_payments", "kf_settings"]

total_records = 0

for table_name in tables:
    try:
        response = supabase.table(table_name).select("*").execute()
        
        record_count = len(response.data) if response.data else 0
        total_records += record_count
        
        print(f"\n[TABLE: {table_name.upper()}]")
        print(f"Total Records: {record_count}")
        print("-" * 100)
        
        if response.data:
            for idx, record in enumerate(response.data, 1):
                print(f"\nRecord #{idx}:")
                print(json.dumps(record, indent=2, default=str))
        else:
            print("(No data in this table)")
            
    except Exception as e:
        print(f"ERROR accessing {table_name}: {e}")

print("\n" + "=" * 100)
print(f"SUMMARY: Total records across all tables: {total_records}")
print("=" * 100)
print("\nTo view this data in Supabase Dashboard:")
print("1. Go to https://app.supabase.com")
print("2. Select project: puhovplmbaldrisxqssy")
print("3. Click 'Table Editor' in left sidebar")
print("4. Click any table name to view data")
print("5. All data shown above should be visible in the dashboard")
print("\n")
