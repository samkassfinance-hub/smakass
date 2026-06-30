#!/usr/bin/env python3
"""
Test Supabase and Resend Email Integration
Verifies database connection and email functionality
"""

import os
import sys
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Get credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")

print("=" * 80)
print("🔍 SUPABASE & EMAIL INTEGRATION TEST")
print("=" * 80)

# ============================================================================
# PART 1: Test Supabase Connection
# ============================================================================

print("\n1️⃣  TESTING SUPABASE DATABASE CONNECTION")
print("-" * 80)

try:
    from supabase import create_client, Client
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("❌ Missing Supabase credentials in .env file")
        sys.exit(1)
    
    print(f"   📍 Supabase URL: {SUPABASE_URL}")
    print(f"   🔑 Service Role Key: {SUPABASE_SERVICE_ROLE_KEY[:20]}...{SUPABASE_SERVICE_ROLE_KEY[-10:]}")
    
    # Create Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    # Test connection by querying users table
    response = supabase.table("kf_users").select("count", count="exact").execute()
    
    print("   ✅ Supabase connection successful!")
    print(f"   📊 Total users in database: {response.count or 0}")
    
    supabase_working = True
    
except ImportError:
    print("   ⚠️  Supabase library not installed")
    print("   Run: pip install supabase")
    supabase_working = False
    
except Exception as e:
    print(f"   ❌ Supabase connection failed: {str(e)}")
    supabase_working = False

# ============================================================================
# PART 2: Test Resend Email API
# ============================================================================

print("\n2️⃣  TESTING RESEND EMAIL API")
print("-" * 80)

try:
    import requests
    
    if not RESEND_API_KEY or not RESEND_FROM_EMAIL:
        print("❌ Missing Resend credentials in .env file")
        sys.exit(1)
    
    print(f"   📧 From Email: {RESEND_FROM_EMAIL}")
    print(f"   🔑 API Key: {RESEND_API_KEY[:20]}...{RESEND_API_KEY[-10:]}")
    
    # Test Resend API with a simple API call
    url = "https://api.resend.com/emails"
    
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Send a test email
    payload = {
        "from": RESEND_FROM_EMAIL,
        "to": "mohaneni80@gmail.com",  # Your email
        "subject": "🧪 Test Email - Supabase Integration Check",
        "html": f"""
        <h2>Integration Test Successful!</h2>
        <p>This is a test email from your KaasFlow application.</p>
        <p><strong>Test Details:</strong></p>
        <ul>
            <li>Sent at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} IST</li>
            <li>Supabase Status: {'✅ Connected' if supabase_working else '❌ Failed'}</li>
            <li>Email API: ✅ Working</li>
        </ul>
        <p>If you received this email, both Supabase and Resend integration are working correctly!</p>
        """
    }
    
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        print("   ✅ Email API connection successful!")
        print(f"   📬 Test email sent successfully!")
        print(f"   📧 Email ID: {data.get('id', 'N/A')}")
        email_working = True
    else:
        print(f"   ❌ Email API error: {response.status_code}")
        print(f"   Response: {response.json()}")
        email_working = False
        
except ImportError:
    print("   ⚠️  Requests library not installed")
    print("   Run: pip install requests")
    email_working = False
    
except Exception as e:
    print(f"   ❌ Email API failed: {str(e)}")
    email_working = False

# ============================================================================
# PART 3: Test OTP Email Template
# ============================================================================

print("\n3️⃣  TESTING OTP EMAIL TEMPLATE")
print("-" * 80)

try:
    import requests
    
    url = "https://api.resend.com/emails"
    
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    
    otp_code = "123456"
    
    payload = {
        "from": RESEND_FROM_EMAIL,
        "to": "mohaneni80@gmail.com",
        "subject": "🔐 Your Password Reset OTP",
        "html": f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Requested</h2>
            <p>Your One-Time Password (OTP) for password reset is:</p>
            <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
                <h1 style="color: #2196F3; letter-spacing: 5px; margin: 0;">{otp_code}</h1>
            </div>
            <p style="color: #666;">This OTP is valid for 10 minutes.</p>
            <p style="color: #666;">If you didn't request this, please ignore this email.</p>
            <p style="color: #999; font-size: 12px;">Never share your OTP with anyone.</p>
        </div>
        """
    }
    
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    
    if response.status_code == 200:
        print("   ✅ OTP email template sent successfully!")
        print(f"   📧 Email ID: {response.json().get('id', 'N/A')}")
        otp_working = True
    else:
        print(f"   ❌ OTP email failed: {response.status_code}")
        otp_working = False
        
except Exception as e:
    print(f"   ❌ OTP email test failed: {str(e)}")
    otp_working = False

# ============================================================================
# PART 4: Test Welcome Email Template
# ============================================================================

print("\n4️⃣  TESTING WELCOME EMAIL TEMPLATE")
print("-" * 80)

try:
    import requests
    
    url = "https://api.resend.com/emails"
    
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "from": RESEND_FROM_EMAIL,
        "to": "mohaneni80@gmail.com",
        "subject": "🎉 Welcome to KaasFlow!",
        "html": """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2196F3;">Welcome to KaasFlow! 🎉</h2>
            <p>Thank you for joining our community. We're excited to help you manage your workflow efficiently.</p>
            <div style="background-color: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3>Getting Started:</h3>
                <ul>
                    <li>Complete your profile</li>
                    <li>Set up your clients</li>
                    <li>Configure payment settings</li>
                    <li>Enable WhatsApp reminders</li>
                </ul>
            </div>
            <p style="color: #666;">Need help? <a href="https://kaasflow.com/support">Contact our support team</a></p>
            <p style="color: #999; font-size: 12px;">© 2026 KaasFlow. All rights reserved.</p>
        </div>
        """
    }
    
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    
    if response.status_code == 200:
        print("   ✅ Welcome email template sent successfully!")
        print(f"   📧 Email ID: {response.json().get('id', 'N/A')}")
        welcome_working = True
    else:
        print(f"   ❌ Welcome email failed: {response.status_code}")
        welcome_working = False
        
except Exception as e:
    print(f"   ❌ Welcome email test failed: {str(e)}")
    welcome_working = False

# ============================================================================
# SUMMARY
# ============================================================================

print("\n" + "=" * 80)
print("📊 INTEGRATION TEST SUMMARY")
print("=" * 80)

results = {
    "Supabase Database": "✅" if supabase_working else "❌",
    "Resend Email API": "✅" if email_working else "❌",
    "OTP Email Template": "✅" if otp_working else "❌",
    "Welcome Email Template": "✅" if welcome_working else "❌",
}

for service, status in results.items():
    print(f"{status} {service}")

all_working = all([supabase_working, email_working, otp_working, welcome_working])

print("=" * 80)
if all_working:
    print("✅ ALL INTEGRATIONS WORKING PERFECTLY!")
    print("\nYou can now:")
    print("  • Send OTP emails for password reset")
    print("  • Send welcome emails to new users")
    print("  • Store and retrieve user data from Supabase")
    print("  • Set up WhatsApp reminders for due dates")
else:
    print("⚠️  SOME INTEGRATIONS NEED ATTENTION")
    print("\nPlease check the errors above and:")
    print("  1. Verify all credentials in .env file")
    print("  2. Check API keys are valid and not expired")
    print("  3. Ensure internet connection is working")
    print("  4. Review service status pages")

print("=" * 80)
