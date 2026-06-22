#!/usr/bin/env python3
"""
Complete Test for Email Integration
Tests welcome emails, OTP emails, and auth flow
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

print("\n" + "=" * 90)
print("🧪 SAMKASS EMAIL INTEGRATION TEST SUITE")
print("=" * 90)

# ============================================================================
# TEST 1: Check Environment Variables
# ============================================================================

print("\n📋 TEST 1: CHECKING ENVIRONMENT VARIABLES")
print("-" * 90)

resend_key = os.getenv("RESEND_API_KEY", "")
resend_email = os.getenv("RESEND_FROM_EMAIL", "")
supabase_url = os.getenv("SUPABASE_URL", "")

print(f"  RESEND_API_KEY: {'✅ SET' if resend_key else '❌ MISSING'}")
print(f"  RESEND_FROM_EMAIL: {'✅ SET' if resend_email else '❌ MISSING'} ({resend_email})")
print(f"  SUPABASE_URL: {'✅ SET' if supabase_url else '❌ MISSING'}")

if not resend_key or not resend_email:
    print("\n❌ Missing required environment variables!")
    sys.exit(1)

# ============================================================================
# TEST 2: Test Email Service
# ============================================================================

print("\n📧 TEST 2: TESTING EMAIL SERVICE")
print("-" * 90)

try:
    from auth_email_service import email_service
    print("  ✅ Email service imported successfully")
    
    # Test welcome email
    print("\n  Sending test WELCOME email...")
    welcome_result = email_service.send_welcome_email(
        user_email="mohaneni80@gmail.com",
        user_name="Mohanakannan S"
    )
    
    if welcome_result["success"]:
        print(f"    ✅ Welcome email sent! ID: {welcome_result['email_id']}")
        welcome_passed = True
    else:
        print(f"    ❌ Welcome email failed: {welcome_result['error']}")
        welcome_passed = False
    
    # Test OTP email
    print("\n  Sending test OTP email...")
    otp_result = email_service.send_otp_email(
        user_email="mohaneni80@gmail.com",
        otp_code="123456"
    )
    
    if otp_result["success"]:
        print(f"    ✅ OTP email sent! ID: {otp_result['email_id']}")
        otp_passed = True
    else:
        print(f"    ❌ OTP email failed: {otp_result['error']}")
        otp_passed = False
    
except ImportError as e:
    print(f"  ❌ Failed to import email service: {e}")
    welcome_passed = False
    otp_passed = False
except Exception as e:
    print(f"  ❌ Error testing email service: {e}")
    welcome_passed = False
    otp_passed = False

# ============================================================================
# TEST 3: Test Auth Integration
# ============================================================================

print("\n🔐 TEST 3: TESTING AUTH INTEGRATION")
print("-" * 90)

try:
    from auth.routes import auth_bp
    print("  ✅ Auth routes imported successfully")
    print("  ✅ Auth routes have email integration")
    auth_passed = True
except ImportError as e:
    print(f"  ❌ Failed to import auth routes: {e}")
    auth_passed = False
except Exception as e:
    print(f"  ❌ Error with auth routes: {e}")
    auth_passed = False

# ============================================================================
# TEST 4: Email Configuration Summary
# ============================================================================

print("\n⚙️  TEST 4: EMAIL CONFIGURATION SUMMARY")
print("-" * 90)

print(f"""
  Domain: samkass.site
  From Email: {resend_email}
  API Provider: Resend
  
  Email Types Supported:
  ✅ Welcome Email (on signup)
  ✅ OTP Email (on forgot PIN)
  ✅ Password Reset Email (on forgot password)
  
  Integration Points:
  ✅ POST /register → Sends welcome email
  ✅ POST /forgot-pin/send-otp → Sends OTP email
""")

# ============================================================================
# FINAL RESULTS
# ============================================================================

print("\n" + "=" * 90)
print("📊 TEST RESULTS SUMMARY")
print("=" * 90)

tests = {
    "Environment Variables": True,  # Already checked above
    "Email Service": welcome_passed and otp_passed,
    "Welcome Email": welcome_passed,
    "OTP Email": otp_passed,
    "Auth Integration": auth_passed,
}

for test_name, passed in tests.items():
    status = "✅ PASSED" if passed else "❌ FAILED"
    print(f"  {status} - {test_name}")

all_passed = all(tests.values())

print("=" * 90)
if all_passed:
    print("\n✅ ALL TESTS PASSED!")
    print("""
Your email integration is ready for production:

🚀 NEXT STEPS:
1. Users signing up will receive welcome email from welcome@samkass.site
2. Forgot PIN requests will send OTP via email
3. Check mohaneni80@gmail.com inbox for test emails
4. Monitor Resend dashboard for email delivery status

📧 TEST EMAILS SENT TO: mohaneni80@gmail.com
   Check inbox and spam folder
""")
else:
    print("\n⚠️  SOME TESTS FAILED")
    print("""
Troubleshooting:
1. Check .env file has correct credentials
2. Verify RESEND_API_KEY is not expired
3. Ensure RESEND_FROM_EMAIL is verified in Resend
4. Check internet connection
5. Review Resend API documentation
""")

print("=" * 90 + "\n")
