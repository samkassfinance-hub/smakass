"""
Direct WhatsApp Test Script
Run this script to test WhatsApp sending without the API

Usage:
    python test_whatsapp_direct.py +919876543210
    python test_whatsapp_direct.py +919876543210 "Custom test message"
"""

import sys
import os

def test_whatsapp_send(phone_number, message=None):
    """
    Test sending a WhatsApp message directly using PyWhatKit
    
    Args:
        phone_number: Phone number with country code (e.g., +919876543210)
        message: Optional custom message
    """
    print("="*60)
    print("WhatsApp Direct Test")
    print("="*60)
    print()
    
    # Validate phone number
    if not phone_number.startswith('+'):
        print("❌ Error: Phone number must start with + and country code")
        print("   Example: +919876543210")
        return False
    
    # Default message
    if not message:
        message = "This is a test message from KaasFlow. Your WhatsApp integration is working correctly! ✅"
    
    print(f"📱 Phone: {phone_number}")
    print(f"💬 Message: {message}")
    print()
    
    # Check if PyWhatKit is installed
    try:
        import pywhatkit as pwk
        print("✅ PyWhatKit is installed")
    except ImportError:
        print("❌ PyWhatKit is not installed")
        print()
        print("Fix: Install PyWhatKit")
        print("     pip install pywhatkit")
        return False
    
    # Check datetime
    try:
        from datetime import datetime
        print("✅ DateTime module available")
    except ImportError:
        print("❌ DateTime module not available")
        return False
    
    print()
    print("🚀 Preparing to send test message...")
    print()
    
    # Schedule message for 2 minutes from now
    now = datetime.now()
    hour = now.hour
    minute = now.minute + 2
    
    if minute >= 60:
        hour += 1
        minute = minute - 60
    
    print(f"⏰ Scheduled time: {hour}:{minute:02d}")
    print()
    print("⚠️  IMPORTANT:")
    print("   - WhatsApp Web will open in your browser in ~2 minutes")
    print("   - Make sure you are LOGGED IN to WhatsApp Web")
    print("   - Keep this terminal open until message is sent")
    print("   - Don't close the browser tab that opens")
    print()
    
    input("Press Enter to start the test (or Ctrl+C to cancel)...")
    print()
    
    try:
        print("📤 Sending message...")
        print("   (WhatsApp Web will open automatically)")
        print()
        
        pwk.sendwhatmsg(
            phone_no=phone_number,
            message=message,
            time_hour=hour,
            time_min=minute,
            wait_time=15,  # Wait 15 seconds for WhatsApp Web to load
            tab_close=True,  # Close tab after sending
            close_time=3  # Wait 3 seconds before closing
        )
        
        print()
        print("✅ Test message sent successfully!")
        print()
        print("🔍 Check your WhatsApp to verify the message was received")
        print()
        return True
        
    except KeyboardInterrupt:
        print()
        print("⚠️  Test cancelled by user")
        return False
        
    except Exception as e:
        print()
        print(f"❌ Error sending message: {e}")
        print()
        
        error_str = str(e).lower()
        
        if "selenium" in error_str or "webdriver" in error_str:
            print("💡 Fix: This error usually means:")
            print("   - Chrome or Firefox browser is not installed")
            print("   - Browser driver is not found")
            print()
            print("   Solution:")
            print("   1. Install Chrome or Firefox browser")
            print("   2. PyWhatKit will use it automatically")
            
        elif "whatsapp" in error_str:
            print("💡 Fix: WhatsApp Web issue:")
            print("   1. Open WhatsApp Web manually: https://web.whatsapp.com")
            print("   2. Login with QR code")
            print("   3. Keep it open")
            print("   4. Run this test again")
            
        else:
            print("💡 Common fixes:")
            print("   - Make sure you're logged into WhatsApp Web")
            print("   - Check your internet connection")
            print("   - Verify phone number format: +[country][number]")
            print("   - Try closing all browser windows and retry")
        
        print()
        return False


def main():
    """Main function to run the test"""
    print()
    
    # Check command line arguments
    if len(sys.argv) < 2:
        print("❌ Error: Phone number required")
        print()
        print("Usage:")
        print(f"  python {os.path.basename(__file__)} +919876543210")
        print(f"  python {os.path.basename(__file__)} +919876543210 \"Custom message\"")
        print()
        print("Examples:")
        print("  python test_whatsapp_direct.py +919876543210")
        print("  python test_whatsapp_direct.py +919876543210 \"Hello from KaasFlow\"")
        print()
        sys.exit(1)
    
    phone = sys.argv[1]
    message = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Run the test
    success = test_whatsapp_send(phone, message)
    
    print()
    print("="*60)
    
    if success:
        print("✅ Test completed successfully!")
    else:
        print("❌ Test failed")
    
    print("="*60)
    print()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Test cancelled by user\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}\n")
        sys.exit(1)
