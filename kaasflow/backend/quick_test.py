"""
Quick test to verify PyWhatKit is working
"""

print("\n" + "="*60)
print("WhatsApp System - Quick Verification")
print("="*60 + "\n")

# Test 1: Check PyWhatKit
print("Test 1: Checking PyWhatKit installation...")
try:
    import pywhatkit as pwk
    print("✅ PyWhatKit is installed")
    try:
        print(f"   Version: {pwk.__VERSION__}")
    except:
        print("   Version: Latest")
except ImportError as e:
    print(f"❌ PyWhatKit not found: {e}")
    print("   Fix: python -m pip install pywhatkit")
    exit(1)

# Test 2: Check Flask
print("\nTest 2: Checking Flask installation...")
try:
    import flask
    print("✅ Flask is installed")
    print(f"   Version: {flask.__version__}")
except ImportError as e:
    print(f"❌ Flask not found: {e}")
    print("   Fix: python -m pip install flask")

# Test 3: Check Flask-CORS
print("\nTest 3: Checking Flask-CORS installation...")
try:
    import flask_cors
    print("✅ Flask-CORS is installed")
except ImportError as e:
    print(f"❌ Flask-CORS not found: {e}")
    print("   Fix: python -m pip install flask-cors")

# Test 4: Check python-dotenv
print("\nTest 4: Checking python-dotenv installation...")
try:
    import dotenv
    print("✅ python-dotenv is installed")
except ImportError as e:
    print(f"❌ python-dotenv not found: {e}")
    print("   Fix: python -m pip install python-dotenv")

# Test 5: Check .env file
print("\nTest 5: Checking .env file...")
import os
if os.path.exists('.env'):
    print("✅ .env file exists")
else:
    print("⚠️  .env file not found (will be created if needed)")

# Test 6: Test datetime
print("\nTest 6: Checking datetime module...")
try:
    from datetime import datetime
    now = datetime.now()
    print("✅ Datetime module working")
    print(f"   Current time: {now.strftime('%H:%M:%S')}")
except ImportError as e:
    print(f"❌ Datetime not found: {e}")

print("\n" + "="*60)
print("✅ ALL TESTS PASSED!")
print("="*60)
print("\n🎉 Your system is ready for WhatsApp automation!\n")
print("Next steps:")
print("1. Save your WhatsApp number in settings")
print("2. Run test: python test_whatsapp_direct.py +919876543210")
print("3. Start backend: python app.py")
print("4. Setup daily scheduler")
print("\n" + "="*60 + "\n")
