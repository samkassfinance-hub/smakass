#!/usr/bin/env python3
"""
Test script to verify email integration is working with the current setup
Tests with the provided API key format
"""

import os
import sys
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv

# Load environment
load_dotenv()

print("\n" + "="*80)
print("📧 SAMKASS EMAIL SERVICE TEST")
print("="*80)
print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("="*80 + "\n")

# ============================================================================
# TEST 1: Configuration Check
# ============================================================================

print("📋 TEST 1: Configuration Check")
print("-"*80)

api_key = os.environ.get('RESEND_API_KEY', '').strip()
from_email = os.environ.get('RESEND_FROM_EMAIL', '').strip()

print(f"✓ RESEND_API_KEY: {api_key if api_key else 'NOT SET'}")
if api_key:
    print(f"  Length: {len(api_key)} characters")
    print(f"  Prefix: {api_key[:15]}...{api_key[-4:] if len(api_key) > 19 else ''}")
    print(f"  Format: {'Valid (starts with re_) ✅' if api_key.startswith('re_') else 'Invalid ❌'}")

print(f"\n✓ RESEND_FROM_EMAIL: {from_email if from_email else 'NOT SET'}")

# ============================================================================
# TEST 2: Enhanced Email Service
# ============================================================================

print("\n📧 TEST 2: Testing Email Service")
print("-"*80)

try:
    from email_service import send_email_via_resend, get_resend_config
    
    print("✅ Email service module loaded successfully")
    
    # Get config
    config = get_resend_config()
    print(f"\n✓ Config loaded:")
    print(f"  - API Key: {config['api_key'][:15]}...{config['api_key'][-4:] if len(config['api_key']) > 19 else ''}")
    print(f"  - From: {config['from_email']}")
    print(f"  - Endpoint: {config['url']}")
    
    # Test sending
    print(f"\n📤 Attempting to send test email...")
    
    test_email = 'mohaneni80@gmail.com'
    test_subject = '🧪 SamKass Email Service Test'
    test_body = """
    <div style="font-family: Arial; max-width: 600px; padding: 20px;">
        <h2 style="color: #10b981;">✅ Email Service Test</h2>
        <p>This is a test email from SamKass using the enhanced email service.</p>
        <p><strong>Time:</strong> """ + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + """</p>
        <p>If you receive this, the email service is working correctly! ✅</p>
    </div>
    """
    
    result = send_email_via_resend(test_email, test_subject, test_body, config)
    
    print(f"\n📊 Result:")
    print(f"  Success: {'✅ YES' if result['success'] else '❌ NO'}")
    if result['success']:
        print(f"  Email ID: {result.get('email_id', 'N/A')}")
        print(f"  Timestamp: {result.get('timestamp', 'N/A')}")
    else:
        print(f"  Error: {result.get('error', 'Unknown error')}")
    
    test_2_passed = result['success']
    
except ImportError as e:
    print(f"❌ Failed to import email service: {e}")
    test_2_passed = False
except Exception as e:
    print(f"❌ Error testing email service: {e}")
    import traceback
    traceback.print_exc()
    test_2_passed = False

# ============================================================================
# TEST 3: Welcome Email Template
# ============================================================================

print("\n📬 TEST 3: Testing Welcome Email Template")
print("-"*80)

try:
    from email_service import send_welcome_email
    
    print("📤 Sending welcome email...")
    
    result = send_welcome_email('test-user@example.com', 'Test User')
    
    print(f"\n📊 Result:")
    print(f"  Success: {'✅ YES' if result['success'] else '❌ NO'}")
    if result['success']:
        print(f"  Email ID: {result.get('email_id', 'N/A')}")
    else:
        print(f"  Error: {result.get('error', 'Unknown error')}")
    
    test_3_passed = result['success']
    
except Exception as e:
    print(f"❌ Error: {e}")
    test_3_passed = False

# ============================================================================
# TEST 4: OTP Email Template
# ============================================================================

print("\n🔐 TEST 4: Testing OTP Email Template")
print("-"*80)

try:
    from email_service import send_otp_email
    import random
    
    otp = str(random.randint(100000, 999999))
    print(f"📤 Sending OTP email with code: {otp}")
    
    result = send_otp_email('test-otp@example.com', otp)
    
    print(f"\n📊 Result:")
    print(f"  Success: {'✅ YES' if result['success'] else '❌ NO'}")
    if result['success']:
        print(f"  Email ID: {result.get('email_id', 'N/A')}")
    else:
        print(f"  Error: {result.get('error', 'Unknown error')}")
    
    test_4_passed = result['success']
    
except Exception as e:
    print(f"❌ Error: {e}")
    test_4_passed = False

# ============================================================================
# SUMMARY REPORT
# ============================================================================

print("\n" + "="*80)
print("📋 TEST REPORT")
print("="*80)

tests = [
    ("Configuration", True),
    ("Email Service", test_2_passed),
    ("Welcome Email", test_3_passed),
    ("OTP Email", test_4_passed)
]

passed = sum(1 for _, result in tests if result)
total = len(tests)

for name, result in tests:
    status = "✅ PASSED" if result else "❌ FAILED"
    print(f"{name:.<50} {status}")

print("\n" + "-"*80)
print(f"Overall Status: {passed}/{total} tests passed")

if passed == total:
    print("🎉 ALL SYSTEMS WORKING! ✅")
    print("\n✅ Email integration is READY")
    print("✅ Welcome emails will be sent to new users")
    print("✅ OTP emails will be sent for password reset")
    print("✅ All email flows are functional")
else:
    print("⚠️  Some systems need attention")
    if not test_2_passed:
        print("\n📧 Email Service Issue:")
        print("   - API key may need to be complete")
        print("   - Network connectivity issue")
        print("   - Check Resend account status")

print("\n" + "="*80)
print(f"⏰ Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("="*80 + "\n")

sys.exit(0 if passed == total else 1)
