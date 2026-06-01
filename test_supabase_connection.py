#!/usr/bin/env python3
"""
KaasFlow - Test Supabase Connection and Table Status
====================================================
This script directly tests your Supabase connection using the API keys
and checks which tables exist.
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv('kaasflow/backend/.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

TABLES = ['kf_users', 'kf_settings', 'kf_clients', 'kf_loans', 'kf_payments']

def test_connection():
    """Test if Supabase is reachable and which tables exist."""
    print("\n" + "=" * 60)
    print("  KaasFlow - Supabase Connection Test")
    print("=" * 60 + "\n")
    
    print(f"URL: {SUPABASE_URL}")
    print(f"Service Key: {SUPABASE_SERVICE_KEY[:10]}...{SUPABASE_SERVICE_KEY[-4:]}\n")
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("❌ ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        return False
    
    headers = {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
        'Content-Type': 'application/json'
    }
    
    all_exist = True
    table_status = {}
    
    print("Checking tables:\n")
    for table in TABLES:
        try:
            url = f"{SUPABASE_URL}/rest/v1/{table}?limit=1"
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                print(f"  ✅ {table:<20} EXISTS")
                
                # Get count
                count_url = f"{SUPABASE_URL}/rest/v1/{table}?select=count"
                headers_with_prefer = {**headers, 'Prefer': 'count=exact'}
                count_response = requests.get(count_url, headers=headers_with_prefer, timeout=10)
                
                if count_response.ok:
                    range_header = count_response.headers.get('content-range', '0-0/0')
                    count = range_header.split('/')[-1] if '/' in range_header else '0'
                    print(f"      📊 Records: {count}")
                    table_status[table] = {'exists': True, 'count': count}
                else:
                    table_status[table] = {'exists': True, 'count': 'unknown'}
                    
            elif response.status_code == 404 or response.status_code == 406:
                print(f"  ❌ {table:<20} NOT FOUND")
                table_status[table] = {'exists': False}
                all_exist = False
            else:
                print(f"  ⚠️  {table:<20} ERROR: {response.status_code}")
                print(f"      Response: {response.text[:100]}")
                table_status[table] = {'exists': False, 'error': response.status_code}
                all_exist = False
                
        except Exception as e:
            print(f"  ❌ {table:<20} EXCEPTION: {str(e)}")
            table_status[table] = {'exists': False, 'error': str(e)}
            all_exist = False
    
    print("\n" + "=" * 60)
    if all_exist:
        print("✅ SUCCESS: All tables exist! Supabase is ready to use.")
        print("\nYou can now:")
        print("  1. Start your backend: cd kaasflow/backend && python app.py")
        print("  2. Start your frontend: cd kaasflow/frontend && python app.py")
        print("  3. Login and add data - it will auto-sync to Supabase!")
    else:
        print("❌ ISSUE: Some tables are missing!")
        print("\nTo fix this:")
        print("  1. Go to: https://supabase.com/dashboard")
        print("  2. Select your project: eahyuwpejwbqzzolajzr")
        print("  3. Click 'SQL Editor' → 'New Query'")
        print("  4. Copy SQL from: HOW_TO_FIX_SUPABASE.md")
        print("  5. Paste and click 'RUN'")
        print("\nOr open test_supabase.html in your browser for guided setup.")
    
    print("=" * 60 + "\n")
    return all_exist


if __name__ == '__main__':
    test_connection()
