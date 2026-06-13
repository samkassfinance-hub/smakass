"""
WhatsApp Web Login Helper
Opens WhatsApp Web and keeps it open for you to scan QR code

Usage:
    python whatsapp_login_helper.py
"""

import webbrowser
import time

print("\n" + "="*60)
print("WhatsApp Web Login Helper")
print("="*60 + "\n")

print("🌐 Opening WhatsApp Web in your browser...")
print()

# Open WhatsApp Web
url = "https://web.whatsapp.com"
webbrowser.open(url)

print("✅ WhatsApp Web opened in browser")
print()
print("📱 Now scan the QR code:")
print()
print("   1. Look at your computer screen")
print("   2. You should see a QR code")
print("   3. Open WhatsApp on your PHONE")
print("   4. Tap the 3 dots (⋮) or Settings icon")
print("   5. Tap 'Linked Devices' or 'WhatsApp Web'")
print("   6. Tap 'Link a Device'")
print("   7. Point your phone camera at the QR code")
print("   8. SCAN the code")
print()
print("✅ After scanning:")
print("   - Check 'Stay signed in' (if asked)")
print("   - Wait for WhatsApp to load your chats")
print("   - Keep this browser tab OPEN")
print()
print("⚠️  IMPORTANT:")
print("   - Do NOT close the WhatsApp Web tab")
print("   - Keep it open in the background")
print("   - You can minimize it, but don't close")
print()
print("Once you're logged in and see your chats:")
print("   - Leave WhatsApp Web open")
print("   - Run the test script:")
print("     python test_whatsapp_stable.py +917904987242")
print()
print("="*60)
print()

# Wait to keep script running
input("Press Enter after you've successfully logged in...")

print()
print("✅ Great! WhatsApp Web should now be logged in")
print()
print("🧪 Now test sending a message:")
print("   python test_whatsapp_stable.py +917904987242")
print()
print("💡 Tips:")
print("   - Keep WhatsApp Web tab open always")
print("   - Don't logout from WhatsApp Web")
print("   - The automation will use this logged-in session")
print()
print("="*60)
print()
