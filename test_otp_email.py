#!/usr/bin/env python3
"""
Quick test script to verify OTP email delivery works
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv('kaasflow/backend/.env')

# Add backend to path
sys.path.insert(0, 'kaasflow/backend')

def test_email_sending():
    """Test the email sending function directly"""
    print("=" * 70)
    print("🧪 TESTING OTP EMAIL DELIVERY")
    print("=" * 70)
    
    # Import after adding to path
    from auth.routes import send_email
    
    # Check environment variables
    api_key = os.environ.get('RESEND_API_KEY', '')
    from_email = os.environ.get('RESEND_FROM_EMAIL', '')
    
    print(f"\n📋 Configuration:")
    print(f"  API Key: {'✅ Set' if api_key and len(api_key) > 30 else '❌ Missing'}")
    print(f"  From Email: {from_email if from_email else '❌ Not configured'}")
    
    if not api_key or len(api_key) < 30:
        print("\n❌ RESEND_API_KEY not properly configured!")
        print("Please check your .env file")
        return False
    
    # Test email
    test_email = input("\n📧 Enter your email to test OTP delivery: ").strip()
    
    if not test_email or '@' not in test_email:
        print("❌ Invalid email address")
        return False
    
    print(f"\n📤 Sending test OTP email to {test_email}...")
    
    # Generate test OTP
    import random
    test_otp = str(random.randint(100000, 999999))
    
    subject = "🔒 Test OTP - SamKass Security PIN Reset"
    body = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #10b981; margin: 0; font-size: 28px;">Security PIN Reset</h1>
            <p style="color: #64748b; font-size: 16px; margin-top: 8px;">Your verification code</p>
        </div>
        <p>Hello,</p>
        <p>This is a <strong>TEST EMAIL</strong> to verify your OTP delivery is working correctly. Here's your test OTP:</p>
        <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; color: #334155; padding: 15px; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; display: inline-block;">
                {test_otp}
            </div>
        </div>
        <p style="font-size: 14px; color: #64748b;">This is a test OTP. If you received this, your email integration is working! 🎉</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 0;">
            <strong>— The SamKass Team</strong>
        </p>
    </div>
    """
    
    # Send email
    result = send_email(test_email, subject, body)
    
    print("\n" + "=" * 70)
    if result:
        print("✅ TEST PASSED - Email sent successfully!")
        print(f"📬 Check your inbox at: {test_email}")
        print(f"🔢 Test OTP: {test_otp}")
        print("\n💡 If you don't see it:")
        print("   1. Check your spam/junk folder")
        print("   2. Wait a few moments (can take 10-30 seconds)")
        print("   3. Verify the email address is correct")
    else:
        print("❌ TEST FAILED - Email could not be sent")
        print("Check the error messages above for details")
    print("=" * 70)
    
    return result

if __name__ == "__main__":
    try:
        test_email_sending()
    except Exception as e:
        print(f"\n❌ Error running test: {e}")
        import traceback
        traceback.print_exc()
