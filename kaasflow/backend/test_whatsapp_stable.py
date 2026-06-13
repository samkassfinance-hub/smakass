"""
Stable WhatsApp Test Script
Keeps browser open longer for QR code scanning

Usage:
    python test_whatsapp_stable.py +917904987242
"""

import sys
import os

def test_whatsapp_stable(phone_number):
    """
    Test WhatsApp with longer wait times for QR scanning
    """
    print("\n" + "="*60)
    print("WhatsApp Stable Test - Extended QR Code Time")
    print("="*60 + "\n")
    
    # Validate phone number
    if not phone_number.startswith('+'):
        print("❌ Error: Phone number must start with + and country code")
        print("   Example: +917904987242")
        return False
    
    print(f"📱 Phone: {phone_number}")
    print(f"💬 Message: Test from KaasFlow - WhatsApp automation working! ✅")
    print()
    
    # Check PyWhatKit
    try:
        import pywhatkit as pwk
        print("✅ PyWhatKit is installed")
    except ImportError:
        print("❌ PyWhatKit not installed")
        print("   Fix: python -m pip install pywhatkit")
        return False
    
    from datetime import datetime
    import time
    
    print("✅ Ready to send")
    print()
    
    # Schedule for 3 minutes from now (more time to scan QR)
    now = datetime.now()
    hour = now.hour
    minute = now.minute + 3
    
    if minute >= 60:
        hour += 1
        minute = minute - 60
    
    print("⏰ Message scheduled for:", f"{hour}:{minute:02d}")
    print()
    print("🔑 IMPORTANT - How to scan QR code:")
    print("   1. Browser will open WhatsApp Web in ~3 minutes")
    print("   2. You'll see a QR code on the screen")
    print("   3. Open WhatsApp on your PHONE")
    print("   4. Tap the 3 dots (⋮) or Settings")
    print("   5. Tap 'Linked Devices' or 'WhatsApp Web'")
    print("   6. Tap 'Link a Device'")
    print("   7. SCAN the QR code on your computer screen")
    print("   8. Wait for WhatsApp Web to load")
    print("   9. Message will send automatically!")
    print()
    print("⚠️  Keep the browser window OPEN until message is sent!")
    print()
    
    input("Press Enter when ready to start (or Ctrl+C to cancel)...")
    print()
    print("🚀 Starting WhatsApp test...")
    print("   Browser will open in 3 minutes...")
    print("   Get your phone ready to scan QR code!")
    print()
    
    try:
        # Use longer wait times
        pwk.sendwhatmsg(
            phone_no=phone_number,
            message="🎉 Test message from KaasFlow! Your WhatsApp automation is working correctly! ✅",
            time_hour=hour,
            time_min=minute,
            wait_time=40,  # Wait 40 seconds for scanning QR and loading (increased from 15)
            tab_close=True,
            close_time=5  # Wait 5 seconds after sending before closing
        )
        
        print()
        print("✅ Test completed!")
        print()
        print("🔍 Check your WhatsApp to verify:")
        print(f"   - Message sent to: {phone_number}")
        print("   - Should appear in your sent messages")
        print()
        return True
        
    except Exception as e:
        print()
        print(f"❌ Error: {e}")
        print()
        
        error_str = str(e).lower()
        
        if "selenium" in error_str or "chrome" in error_str or "webdriver" in error_str:
            print("💡 Browser Issue:")
            print("   Install Chrome browser from: https://www.google.com/chrome/")
            print("   PyWhatKit needs Chrome or Firefox to work")
            
        elif "timeout" in error_str or "timed out" in error_str:
            print("💡 Timeout Issue:")
            print("   The QR code scan took too long")
            print("   Solutions:")
            print("   1. Login to WhatsApp Web manually first")
            print("   2. Open https://web.whatsapp.com")
            print("   3. Scan QR code and check 'Stay signed in'")
            print("   4. Keep it open")
            print("   5. Run this test again")
            
        else:
            print("💡 General troubleshooting:")
            print("   1. Make sure Chrome/Firefox is installed")
            print("   2. Check internet connection")
            print("   3. Login to WhatsApp Web manually first")
            print("   4. Try again")
        
        print()
        return False


def main():
    print()
    
    if len(sys.argv) < 2:
        print("❌ Usage: python test_whatsapp_stable.py +917904987242")
        print()
        sys.exit(1)
    
    phone = sys.argv[1]
    success = test_whatsapp_stable(phone)
    
    print("="*60)
    if success:
        print("✅ TEST SUCCESSFUL!")
        print()
        print("Next steps:")
        print("1. ✅ Verify message received on phone")
        print("2. Setup daily scheduler")
        print("3. Add client phone numbers")
        print("4. Start automation!")
    else:
        print("❌ TEST FAILED")
        print()
        print("Try this instead:")
        print("1. Open https://web.whatsapp.com manually")
        print("2. Scan QR code and login")
        print("3. Keep the tab open")
        print("4. Run this test again")
    print("="*60)
    print()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Test cancelled\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}\n")
        sys.exit(1)
