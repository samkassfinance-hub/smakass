#!/usr/bin/env python3
"""
Test Supabase Connection and Configuration
Run this to verify everything is set up correctly
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def test_connection() -> bool:
    """Test basic Supabase connection"""
    print("\n🔍 Testing Supabase Connection...")
    print("─" * 60)
    
    try:
        url = os.environ.get("SUPABASE_URL")
        anon_key = os.environ.get("SUPABASE_ANON_KEY")
        service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        # Check environment variables
        print("✓ Checking environment variables...")
        if not url:
            print("  ❌ SUPABASE_URL not found")
            return False
        print(f"  ✓ SUPABASE_URL: {url}")
        
        if not anon_key:
            print("  ❌ SUPABASE_ANON_KEY not found")
        else:
            print(f"  ✓ SUPABASE_ANON_KEY: {anon_key[:20]}...")
        
        if not service_key:
            print("  ⚠️  SUPABASE_SERVICE_ROLE_KEY not found (optional)")
        else:
            print(f"  ✓ SUPABASE_SERVICE_ROLE_KEY: {service_key[:20]}...")
        
        # Try to initialize client
        print("\n✓ Initializing Supabase client...")
        key = service_key or anon_key
        client = create_client(url, key)
        print("  ✓ Client initialized successfully")
        
        # Try to connect
        print("\n✓ Testing database connection...")
        response = client.table('users').select('*').limit(1).execute()
        print("  ✓ Database connection successful")
        print(f"  ✓ Query returned: {len(response.data)} rows")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False


def test_table_exists(client: Client, table_name: str) -> bool:
    """Check if a table exists"""
    try:
        client.table(table_name).select('*').limit(1).execute()
        return True
    except Exception as e:
        return False


def check_tables(client: Client) -> None:
    """Check for required tables"""
    print("\n📋 Checking Required Tables...")
    print("─" * 60)
    
    required_tables = [
        'users',
        'subscriptions',
        'app_backups',
        'audit_logs'
    ]
    
    for table in required_tables:
        exists = test_table_exists(client, table)
        status = "✓" if exists else "❌"
        print(f"{status} {table}")
    
    print("\n⚠️  If tables are missing, run:")
    print("   python3 supabase_migrations.py")


def test_sample_query(client: Client) -> None:
    """Test a sample query"""
    print("\n🧪 Testing Sample Queries...")
    print("─" * 60)
    
    try:
        # Test users table
        print("Querying users table...")
        response = client.table('users').select('*').limit(5).execute()
        print(f"✓ Found {len(response.data)} users")
        
        if response.data:
            print("  Sample user:", response.data[0])
        
    except Exception as e:
        print(f"Note: {e}")


def print_connection_info() -> None:
    """Print connection information"""
    print("\n📌 Connection Information")
    print("─" * 60)
    
    url = os.environ.get("SUPABASE_URL")
    print(f"URL: {url}")
    print(f"Region: {url.split('.')[0].split('-')[-1] if url else 'N/A'}")
    
    print("\nDashboard Links:")
    if url:
        project_id = url.split('.')[0].split('/')[-1]
        print(f"• Project: https://app.supabase.com/project/{project_id}")
        print(f"• Database: https://app.supabase.com/project/{project_id}/editor")
        print(f"• Auth: https://app.supabase.com/project/{project_id}/auth/users")


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print(" SUPABASE CONNECTION TEST")
    print("="*60)
    
    # Test connection
    if not test_connection():
        print("\n❌ Connection failed. Please check your .env file.")
        sys.exit(1)
    
    try:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
        client = create_client(url, key)
        
        # Check tables
        check_tables(client)
        
        # Test sample query
        test_sample_query(client)
        
        # Print connection info
        print_connection_info()
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
        print("="*60)
        print("\nYour Supabase integration is ready to use.")
        print("Import and use the SupabaseService in your routes:")
        print("  from supabase_client import supabase_service")
        print("  service = supabase_service")
        print("  user = service.get_user_by_email('user@example.com')")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
