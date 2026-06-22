#!/usr/bin/env python3
"""
Test Email Integration
Tests welcome email, password reset OTP, and PIN reset OTP
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

from email_service_advanced import email_service_advanced


def test_configuration():
    """Test email service configuration"""
    print("\n" + "="*80)
    print("🔍 CONFIGURATION CHECK")
    print("="*80)
    
    print(f"\n📧 Custom Domain Configuration:")
    print(f"   Domain: {email_service_advanced.custom_domain}")
    print(f"   From Email: {email_service_advanced.mail_from_email}")
    print(f"   Support Email: {email_service_advanced.mail_support_email}")
    print(f"   Domain ID: {email_service_advanced.mail_domain_id}")
    print(f"   Region: {email_service_advanced.mail_region}")
    
    print(f"\n🔑 API Keys:")
    if email_service_advanced.resend_api_key:
        masked_key = f"{email_service_advanced.resend_api_key[:10]}...{email_service_advanced.resend_api_key[-5:]}"
        print(f"   Resend API Key: {masked_key}")
    else:
        print(f"   Resend API Key: ❌ NOT SET")
    
    if email_service_advanced.mail_domain_id:
        print(f"   ✅ Custom domain configured")
    else:
        print(f"   ⚠️  Custom domain not configured (will use Resend only)")
    
    print("\n" + "="*80)


def test_welcome_email():
    """Test welcome email"""
    print("\n" + "="*80)
    print("🧪 TEST 1: WELCOME EMAIL")
    print("="*80)
    
    user_email = "mohaneni80@gmail.com"
    user_name = "Mohanakannan S"
    
    print(f"\n📨 Sending welcome email...")
    print(f"   To: {user_email}")
    print(f"   Name: {user_name}")
    
    result = email_service_advanced.send_welcome_email(user_email, user_name)
    
    print(f"\n📊 Result:")
    print(f"   Success: {result.get('success', False)}")
    print(f"   Provider: {result.get('provider', 'N/A')}")
    print(f"   Email ID: {result.get('email_id', 'N/A')}")
    if result.get('error'):
        print(f"   Error: {result.get('error')}")
    
    return result.get('success', False)


def test_password_reset_otp():
    """Test password reset OTP email"""
    print("\n" + "="*80)
    print("🧪 TEST 2: PASSWORD RESET OTP EMAIL")
    print("="*80)
    
    user_email = "mohaneni80@gmail.com"
    otp_code = "123456"
    
    print(f"\n📨 Sending password reset OTP...")
    print(f"   To: {user_email}")
    print(f"   OTP: {otp_code}")
    
    result = email_service_advanced.send_password_reset_otp(user_email, otp_code)
    
    print(f"\n📊 Result:")
    print(f"   Success: {result.get('success', False)}")
    print(f"   Provider: {result.get('provider', 'N/A')}")
    print(f"   Email ID: {result.get('email_id', 'N/A')}")
    if result.get('error'):
        print(f"   Error: {result.get('error')}")
    
    return result.get('success', False)


def test_pin_reset_otp():
    """Test PIN reset OTP email"""
    print("\n" + "="*80)
    print("🧪 TEST 3: PIN RESET OTP EMAIL")
    print("="*80)
    
    user_email = "mohaneni80@gmail.com"
    otp_code = "654321"
    
    print(f"\n📨 Sending PIN reset OTP...")
    print(f"   To: {user_email}")
    print(f"   OTP: {otp_code}")
    
    result = email_service_advanced.send_pin_reset_otp(user_email, otp_code)
    
    print(f"\n📊 Result:")
    print(f"   Success: {result.get('success', False)}")
    print(f"   Provider: {result.get('provider', 'N/A')}")
    print(f"   Email ID: {result.get('email_id', 'N/A')}")
    if result.get('error'):
        print(f"   Error: {result.get('error')}")
    
    return result.get('success', False)


def print_summary(results):
    """Print test summary"""
    print("\n" + "="*80)
    print("📊 TEST SUMMARY")
    print("="*80)
    
    test_names = ["Welcome Email", "Password Reset OTP", "PIN Reset OTP"]
    
    for i, (name, result) in enumerate(zip(test_names, results), 1):
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{i}. {name}: {status}")
    
    passed = sum(results)
    total = len(results)
    percentage = (passed / total) * 100 if total > 0 else 0
    
    print(f"\n📈 Overall: {passed}/{total} passed ({percentage:.0f}%)")
    
    print("\n" + "="*80)


def print_email_log():
    """Print email log"""
    log = email_service_advanced.get_email_log()
    
    if not log:
        print("\n📋 No emails sent yet.")
        return
    
    print("\n" + "="*80)
    print("📧 EMAIL LOG")
    print("="*80)
    
    for i, email in enumerate(log, 1):
        print(f"\n{i}. Email Record")
        print(f"   To: {email.get('to', 'N/A')}")
        print(f"   Provider: {email.get('provider', 'N/A')}")
        print(f"   Email ID: {email.get('email_id', 'N/A')}")
        print(f"   Time: {email.get('timestamp', 'N/A')}")
    
    print("\n" + "="*80)


def main():
    """Run all tests"""
    print("\n" + "█"*80)
    print("█" + " "*78 + "█")
    print("█" + "  ADVANCED EMAIL SERVICE - INTEGRATION TEST".center(78) + "█")
    print("█" + " "*78 + "█")
    print("█"*80)
    
    # Check configuration
    test_configuration()
    
    # Run tests
    print("\n🚀 Starting tests...\n")
    
    results = []
    results.append(test_welcome_email())
    results.append(test_password_reset_otp())
    results.append(test_pin_reset_otp())
    
    # Print summary
    print_summary(results)
    
    # Print email log
    print_email_log()
    
    # Print next steps
    print("\n" + "="*80)
    print("📌 NEXT STEPS")
    print("="*80)
    print("""
1. Check your email at: mohaneni80@gmail.com
2. Look for these emails:
   • Welcome email (subject: "🚀 Welcome to SamKass!")
   • Password reset email (subject: "🔒 Your Password Reset Code")
   • PIN reset email (subject: "🔐 Your Security PIN Reset Code")

3. Verify emails contain:
   • Correct domain (samkass.site if custom domain configured)
   • Correct sender address
   • Proper formatting and styling
   • Correct OTP codes (123456, 654321)

4. Check spam/junk folder if emails not in inbox

5. For issues, check:
   • .env file has RESEND_API_KEY
   • .env file has MAIL_DOMAIN settings
   • API key has sufficient permissions
   • Domain is verified in Resend
""")
    print("="*80)
    
    # Return exit code
    return 0 if all(results) else 1


if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
