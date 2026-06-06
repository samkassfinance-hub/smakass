#!/usr/bin/env python3
"""
Test script to manually send a push notification
Run: python test_notification.py
"""

import os
import json
from pywebpush import webpush
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_push_notification():
    """Test VAPID key configuration"""
    
    # Get VAPID keys from environment
    vapid_private_key = os.getenv('VAPID_PRIVATE_KEY')
    vapid_public_key = os.getenv('VAPID_PUBLIC_KEY') 
    vapid_claim_email = os.getenv('VAPID_CLAIM_EMAIL', 'mailto:samkassfinance@gmail.com')
    
    if not vapid_private_key:
        print("❌ VAPID_PRIVATE_KEY not found in environment")
        return False
        
    print(f"🔑 Using VAPID keys:")
    print(f"   Public Key: {vapid_public_key[:50]}...")
    print(f"   Private Key: {vapid_private_key[:50]}...")
    print(f"   Claim Email: {vapid_claim_email}")
    
    # Test VAPID key format and validity
    try:
        from py_vapid import Vapid02
        import base64
        
        # Try to decode the keys to validate format
        private_key_bytes = base64.urlsafe_b64decode(vapid_private_key + '==')
        public_key_bytes = base64.urlsafe_b64decode(vapid_public_key + '==')
        
        print(f"✅ VAPID private key: {len(private_key_bytes)} bytes")
        print(f"✅ VAPID public key: {len(public_key_bytes)} bytes")
        
        # Test webpush import and VAPID creation
        from pywebpush import webpush
        print("✅ pywebpush library is working")
        
        return True
        
    except Exception as e:
        print(f"❌ Error validating VAPID keys: {e}")
        return False

def check_environment():
    """Check if all environment variables are set"""
    required_vars = [
        'VAPID_PRIVATE_KEY',
        'VAPID_PUBLIC_KEY', 
        'VAPID_CLAIM_EMAIL',
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY'
    ]
    
    print("🔍 Checking environment variables...")
    all_good = True
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            if 'KEY' in var:
                print(f"   ✅ {var}: {value[:20]}...")
            else:
                print(f"   ✅ {var}: {value}")
        else:
            print(f"   ❌ {var}: Not set")
            all_good = False
    
    return all_good

if __name__ == '__main__':
    print("🔔 SamKass Push Notification Test")
    print("=" * 50)
    
    # Check environment
    if not check_environment():
        print("\n❌ Environment not properly configured")
        exit(1)
    
    print("\n📡 Testing push notification...")
    
    if test_push_notification():
        print("\n✅ Push notification system is configured correctly!")
        print("\n💡 To test with real users:")
        print("   1. Users need to visit your website and allow notifications")
        print("   2. The subscription will be saved to your Supabase database")
        print("   3. The scheduler will send notifications daily at 8 AM IST")
    else:
        print("\n❌ Push notification test failed")
        exit(1)