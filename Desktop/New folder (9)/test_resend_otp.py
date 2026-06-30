#!/usr/bin/env python3
"""
Test Script for Resend OTP Email Integration
Run this to test if your Resend configuration is working correctly
"""

import os
import sys
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv('kaasflow/backend/.env')

def test_resend_api():
    """Test Resend API directly"""
    print("=" * 60)
    print("RESEND OTP EMAIL TEST")
    print("=" * 60)
    
    api_key = os.environ.get('RESEND_API_KEY')
    from_email = os.environ.get('RESEND_FROM_EMAIL', 'KaasFlow <onboarding@resend.dev>')
    
    if not api_key:
        print("❌ ERROR: RESEND_API_KEY not found in .env file")
        return False
        
    print(f"✅ API Key Found: {api_key[:10]}...{api_key[-4:]}")
    print(f"✅ From Email: {from_email}")
    print()
    
    # Get test email from user
    to_email = input("Enter your email to test: ").strip()
    if not to_email:
        print("❌ No email provided")
        return False
    
    # Generate test OTP
    import random
    test_otp = str(random.randint(100000, 999999))
    
    print(f"\n🔢 Generated Test OTP: {test_otp}")
    print("\n📧 Sending test email via Resend...")
    
    # Send test email
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    body = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #10b981; margin: 0; font-size: 28px;">Security PIN Reset TEST</h1>
            <p style="color: #64748b; font-size: 16px; margin-top: 8px;">Your verification code</p>
        </div>
        <p>Hello,</p>
        <p>This is a <strong>TEST EMAIL</strong> to verify your Resend integration is working correctly.</p>
        <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; color: #334155; padding: 15px; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; display: inline-block;">
                {test_otp}
            </div>
        </div>
        <p style="font-size: 14px; color: #64748b;">This is a test OTP. Your Resend integration is working! 🎉</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 0;">
            <strong>— The KaasFlow Team</strong>
        </p>
    </div>
    """
    
    payload = {
        "from": from_email,
        "to": [to_email],
        "subject": "🧪 TEST: Reset your KaasFlow Security PIN",
        "html": body
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📊 Response Body: {response.text}")
        
        if response.status_code in [200, 201]:
            print("\n✅ SUCCESS! Email sent via Resend")
            print(f"✅ Check your inbox at: {to_email}")
            print(f"✅ Test OTP was: {test_otp}")
            return True
        else:
            print(f"\n❌ FAILED: Resend API returned error")
            print(f"❌ Status Code: {response.status_code}")
            print(f"❌ Error: {response.text}")
            
            # Common error messages
            if response.status_code == 403:
                print("\n💡 TIP: This usually means your domain is not verified in Resend")
                print("   Go to: https://resend.com/domains")
                print("   Verify your domain and add DNS records")
            elif response.status_code == 401:
                print("\n💡 TIP: Invalid API key")
                print("   Go to: https://resend.com/api-keys")
                print("   Generate a new API key and update .env file")
            
            return False
            
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return False

def test_backend_endpoint():
    """Test the backend /forgot-pin/send-otp endpoint"""
    print("\n" + "=" * 60)
    print("BACKEND ENDPOINT TEST")
    print("=" * 60)
    
    # Check if backend is running
    backend_url = "http://127.0.0.1:5000"
    
    print(f"\n🔍 Checking if backend is running at {backend_url}...")
    
    try:
        health_check = requests.get(f"{backend_url}/health", timeout=3)
        if health_check.status_code == 200:
            print("✅ Backend is running!")
        else:
            print("⚠️  Backend responded but health check failed")
    except:
        print("❌ Backend is not running!")
        print("\n💡 Start the backend first:")
        print("   cd kaasflow/backend")
        print("   python app.py")
        return False
    
    # Test forgot-pin endpoint
    test_email = input("\nEnter email to test forgot-pin endpoint: ").strip()
    if not test_email:
        print("❌ No email provided")
        return False
    
    print(f"\n📧 Testing /api/forgot-pin/send-otp endpoint...")
    
    try:
        response = requests.post(
            f"{backend_url}/api/forgot-pin/send-otp",
            json={"email": test_email},
            timeout=10
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📊 Response Body: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("\n✅ SUCCESS! Backend endpoint is working")
                if 'otp' in data:
                    print(f"✅ Development OTP (email not sent): {data['otp']}")
                else:
                    print(f"✅ Check your email at: {test_email}")
                return True
        
        print("\n❌ FAILED: Backend endpoint returned error")
        return False
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    print("""
╔═══════════════════════════════════════════════════════════╗
║     KAASFLOW - RESEND OTP EMAIL TEST SCRIPT              ║
╚═══════════════════════════════════════════════════════════╝
    """)
    
    choice = input("""
Choose test to run:
  1. Test Resend API directly (recommended first)
  2. Test Backend /forgot-pin/send-otp endpoint
  3. Both

Enter choice (1-3): """).strip()
    
    if choice == "1":
        test_resend_api()
    elif choice == "2":
        test_backend_endpoint()
    elif choice == "3":
        test_resend_api()
        print("\n")
        test_backend_endpoint()
    else:
        print("Invalid choice")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)
