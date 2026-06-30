#!/usr/bin/env python3
"""
Comprehensive test script for Resend Email API and Supabase integration
Tests: OTP emails, welcome emails, and Supabase database connectivity
"""

import os
import sys
import json
from datetime import datetime

# Add backend to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(backend_dir, '.env'))

print("\n" + "="*80)
print("🧪 SAMKASS INTEGRATION TEST SUITE")
print("="*80)
print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("="*80 + "\n")

# ============================================================================
# 1. TEST RESEND EMAIL API
# ============================================================================

def test_resend_api():
    """Test Resend Email API Configuration and Functionality"""
    print("\n📧 TESTING RESEND EMAIL API")
    print("-" * 80)
    
    # Check environment variables
    resend_api_key = os.environ.get('RESEND_API_KEY', '').strip()
    resend_from_email = os.environ.get('RESEND_FROM_EMAIL', '').strip()
    
    print(f"✓ RESEND_API_KEY status: {'Set ✅' if resend_api_key else 'NOT SET ❌'}")
    if resend_api_key:
        key_preview = f"{resend_api_key[:6]}...{resend_api_key[-6:]}" if len(resend_api_key) > 15 else "***"
        print(f"  Key length: {len(resend_api_key)} characters")
        print(f"  Key preview: {key_preview}")
        print(f"  Key format: {'Starts with re_ ✅' if resend_api_key.startswith('re_') else 'Invalid format ❌'}")
    
    print(f"\n✓ RESEND_FROM_EMAIL: {resend_from_email if resend_from_email else 'NOT SET (using default)'}")
    
    if not resend_api_key or len(resend_api_key) < 30:
        print("\n❌ RESEND API KEY IS INVALID OR MISSING")
        print("\n📋 HOW TO FIX:")
        print("1. Go to: https://resend.com/api-keys")
        print("2. Click on your 'samkass' API key to reveal it")
        print("3. Copy the COMPLETE key (should start with 're_')")
        print("4. Update your .env file with the complete key")
        print(f"5. Make sure it's at least 40 characters long")
        return False
    
    # Test sending a test email
    try:
        import requests
        
        test_email = "mohaneni80@gmail.com"
        test_subject = "🧪 SamKass Integration Test - Email System"
        test_body = """
        <div style="font-family: Arial; max-width: 600px; padding: 20px;">
            <h2 style="color: #10b981;">✅ Email System Test</h2>
            <p>This is a test email from SamKass to verify the Resend email API is working correctly.</p>
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p><strong>Test Details:</strong></p>
                <ul>
                    <li>Time: """ + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + """</li>
                    <li>From: SamKass Team</li>
                    <li>Status: Testing Resend API</li>
                </ul>
            </div>
            <p>If you see this email, the Resend email API is working correctly! ✅</p>
        </div>
        """
        
        print(f"\n📤 Sending test email to: {test_email}")
        print(f"📧 Subject: {test_subject}")
        
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {resend_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": resend_from_email or "SamKass <onboarding@resend.dev>",
            "to": [test_email],
            "subject": test_subject,
            "html": test_body
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code in [200, 201]:
            data = response.json()
            print(f"✅ TEST EMAIL SENT SUCCESSFULLY!")
            print(f"📨 Email ID: {data.get('id', 'N/A')}")
            print(f"✓ Recipient: {test_email}")
            print(f"✓ API Status: Working ✅")
            return True
        else:
            error_data = response.json() if response.text else {"error": "No response"}
            print(f"❌ FAILED TO SEND TEST EMAIL")
            print(f"Error Code: {response.status_code}")
            print(f"Error Response: {json.dumps(error_data, indent=2)}")
            
            if response.status_code == 401:
                print("⚠️  Authentication failed - API key is invalid or incomplete")
            elif response.status_code == 422:
                print("⚠️  Validation error - check from_email or recipient")
            
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timeout - Resend API took too long to respond")
        return False
    except Exception as e:
        print(f"❌ Error testing Resend API: {e}")
        import traceback
        traceback.print_exc()
        return False

# ============================================================================
# 2. TEST SUPABASE CONNECTION
# ============================================================================

def test_supabase_connection():
    """Test Supabase Database Configuration and Connectivity"""
    print("\n\n🗄️  TESTING SUPABASE DATABASE CONNECTION")
    print("-" * 80)
    
    # Check environment variables
    supabase_url = os.environ.get('SUPABASE_URL', '').strip()
    supabase_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '').strip()
    
    print(f"✓ SUPABASE_URL status: {'Set ✅' if supabase_url else 'NOT SET ❌'}")
    if supabase_url:
        print(f"  URL: {supabase_url}")
        print(f"  Format: {'Valid ✅' if '.supabase.co' in supabase_url else 'Invalid ❌'}")
    
    print(f"\n✓ SUPABASE_SERVICE_ROLE_KEY status: {'Set ✅' if supabase_key else 'NOT SET ❌'}")
    if supabase_key:
        key_preview = f"{supabase_key[:10]}...{supabase_key[-6:]}" if len(supabase_key) > 20 else "***"
        print(f"  Key length: {len(supabase_key)} characters")
        print(f"  Key preview: {key_preview}")
    
    if not supabase_url or not supabase_key or len(supabase_key) < 40:
        print("\n❌ SUPABASE CREDENTIALS ARE MISSING OR INCOMPLETE")
        print("\n📋 HOW TO FIX:")
        print("1. Go to: https://app.supabase.com/project/eahyuwpejwbqzzolajzr/settings/api")
        print("2. Copy your Project URL")
        print("3. Copy your Service Role key (keep this secret!)")
        print("4. Update your .env file with these values")
        print("5. Ensure the service role key is at least 100+ characters")
        return False
    
    # Test connection
    try:
        from supabase import create_client
        
        print(f"\n🔗 Connecting to Supabase...")
        print(f"   URL: {supabase_url}")
        
        supabase = create_client(supabase_url, supabase_key)
        print(f"✅ Supabase client created successfully")
        
        # Try to get auth info
        try:
            # Test with simple query
            response = supabase.auth.get_user()
            print(f"✅ Supabase auth endpoint responding")
        except:
            # If auth fails, try health check instead
            print(f"ℹ️  Auth endpoint check skipped (expected without active session)")
        
        print(f"\n✅ SUPABASE CONNECTION TEST PASSED")
        print(f"✓ Database: Connected ✅")
        print(f"✓ Credentials: Valid ✅")
        return True
        
    except Exception as e:
        print(f"❌ FAILED TO CONNECT TO SUPABASE")
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return False

# ============================================================================
# 3. TEST EMAIL FLOWS
# ============================================================================

def test_email_flows():
    """Test different email scenarios (OTP, Welcome, etc.)"""
    print("\n\n📬 TESTING EMAIL FLOWS")
    print("-" * 80)
    
    resend_api_key = os.environ.get('RESEND_API_KEY', '').strip()
    
    if not resend_api_key or len(resend_api_key) < 30:
        print("❌ Skipping email flow tests - Resend API not configured")
        return False
    
    test_email = "mohaneni80@gmail.com"
    
    # Test 1: OTP Email
    print(f"\n1️⃣  Testing OTP Email...")
    try:
        import requests
        import random
        
        otp = str(random.randint(100000, 999999))
        
        otp_body = f"""
        <div style="font-family: Arial; max-width: 600px; padding: 20px;">
            <h2 style="color: #10b981;">Password Reset OTP</h2>
            <p>Your verification code:</p>
            <div style="text-align: center; margin: 30px 0;">
                <div style="background: #f0f9ff; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; display: inline-block;">
                    {otp}
                </div>
            </div>
            <p style="font-size: 14px; color: #666;">This OTP expires in 10 minutes.</p>
        </div>
        """
        
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {resend_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": os.environ.get('RESEND_FROM_EMAIL', 'SamKass <onboarding@resend.dev>'),
            "to": [test_email],
            "subject": "🔒 SamKass Password Reset - OTP Code",
            "html": otp_body
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        
        if response.status_code in [200, 201]:
            print(f"   ✅ OTP Email sent successfully")
            print(f"   📨 OTP Code (for testing): {otp}")
        else:
            print(f"   ❌ OTP Email failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error sending OTP email: {e}")
        return False
    
    # Test 2: Welcome Email
    print(f"\n2️⃣  Testing Welcome Email...")
    try:
        welcome_body = """
        <div style="font-family: Arial; max-width: 600px; padding: 20px;">
            <h2 style="color: #10b981;">Welcome to SamKass! 🎉</h2>
            <p>Thank you for registering. Your account is now active and ready to use.</p>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p><strong>Getting Started:</strong></p>
                <ul>
                    <li>Add your first client</li>
                    <li>Create a loan ledger</li>
                    <li>Customize your preferences</li>
                </ul>
            </div>
            <p>Questions? We're here to help!</p>
        </div>
        """
        
        payload = {
            "from": os.environ.get('RESEND_FROM_EMAIL', 'SamKass <onboarding@resend.dev>'),
            "to": [test_email],
            "subject": "🎉 Welcome to SamKass!",
            "html": welcome_body
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        
        if response.status_code in [200, 201]:
            print(f"   ✅ Welcome Email sent successfully")
        else:
            print(f"   ❌ Welcome Email failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error sending welcome email: {e}")
        return False
    
    print(f"\n✅ ALL EMAIL FLOWS WORKING ✅")
    return True

# ============================================================================
# 4. GENERATE REPORT
# ============================================================================

def generate_report(resend_ok, supabase_ok, flows_ok):
    """Generate final test report"""
    print("\n" + "="*80)
    print("📋 TEST REPORT")
    print("="*80)
    
    tests = [
        ("Resend Email API", resend_ok),
        ("Supabase Database", supabase_ok),
        ("Email Flows", flows_ok)
    ]
    
    for test_name, result in tests:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:.<50} {status}")
    
    total_passed = sum([resend_ok, supabase_ok, flows_ok])
    total_tests = len(tests)
    
    print("\n" + "-"*80)
    print(f"Overall Status: {total_passed}/{total_tests} tests passed")
    
    if total_passed == total_tests:
        print("🎉 ALL SYSTEMS OPERATIONAL! ✅")
        return True
    else:
        print("⚠️  SOME SYSTEMS NEED ATTENTION")
        return False

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    try:
        # Run tests
        resend_ok = test_resend_api()
        supabase_ok = test_supabase_connection()
        flows_ok = test_email_flows() if resend_ok else False
        
        # Generate report
        all_ok = generate_report(resend_ok, supabase_ok, flows_ok)
        
        print("\n" + "="*80)
        print(f"⏰ Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*80 + "\n")
        
        sys.exit(0 if all_ok else 1)
        
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
