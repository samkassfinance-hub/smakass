#!/usr/bin/env python3
"""
Quick test to verify payment key endpoint works
"""

import os
import sys
import requests
from dotenv import load_dotenv

# Load environment
backend_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(backend_dir, '.env')
load_dotenv(dotenv_path=env_path)

print("\n" + "="*70)
print("🔍 Testing Payment Key Endpoint")
print("="*70 + "\n")

# Check .env
print("1️⃣  Checking environment variables:")
razorpay_key = os.getenv('RAZORPAY_KEY_ID')
razorpay_secret = os.getenv('RAZORPAY_KEY_SECRET')

print(f"  RAZORPAY_KEY_ID: {razorpay_key if razorpay_key else '❌ NOT SET'}")
print(f"  RAZORPAY_KEY_SECRET: {'✅ SET' if razorpay_secret else '❌ NOT SET'}\n")

if not razorpay_key:
    print("❌ RAZORPAY_KEY_ID not found in .env")
    print("Please run: python kaasflow/backend/test_razorpay_integration.py")
    sys.exit(1)

# Test endpoint 
print("2️⃣  Testing API endpoint:")
print("  Starting backend test server...\n")

try:
    # Import and start Flask app
    from app import app
    
    # Use Flask test client
    with app.test_client() as client:
        print("  🧪 Making GET request to /api/payment/key...\n")
        
        response = client.get('/api/payment/key')
        
        print(f"  Status Code: {response.status_code}")
        print(f"  Response Headers: {dict(response.headers)}\n")
        
        if response.status_code == 200:
            data = response.get_json()
            print(f"  Response Data: {data}\n")
            
            if data.get('key'):
                key = data['key']
                print(f"  ✅ KEY FOUND: {key[:20]}...\n")
                
                if key.startswith('rzp_test_'):
                    print("  🧪 Mode: TEST (Development)")
                elif key.startswith('rzp_live_'):
                    print("  🔴 Mode: LIVE (Production)")
                
                print("\n✅ Endpoint working correctly!")
            else:
                print("  ❌ No 'key' field in response\n")
                print("❌ Endpoint not working")
        else:
            print(f"  ❌ HTTP {response.status_code}: {response.get_data(as_text=True)}\n")
            print("❌ Endpoint returned error")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "="*70 + "\n")
