#!/usr/bin/env python3
"""
Complete WhatsApp Automation Setup Script
This script configures and validates your WhatsApp integration
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

def print_header(text):
    print("\n" + "="*70)
    print(f"  {text}")
    print("="*70)

def print_success(text):
    print(f"✅ {text}")

def print_error(text):
    print(f"❌ {text}")

def print_warning(text):
    print(f"⚠️  {text}")

def print_info(text):
    print(f"ℹ️  {text}")

def check_env_variables():
    """Check if WhatsApp environment variables are set"""
    print_header("Checking Environment Variables")
    
    backend_dir = Path(__file__).parent
    env_file = backend_dir / '.env'
    
    if not env_file.exists():
        print_error(f".env file not found at {env_file}")
        return False
    
    load_dotenv(env_file)
    
    api_url = os.environ.get('WHATSAPP_API_URL', '').strip()
    api_key = os.environ.get('WHATSAPP_API_KEY', '').strip()
    
    print_info(f"Backend directory: {backend_dir}")
    print_info(f"Env file: {env_file}")
    
    if api_url:
        print_success(f"WHATSAPP_API_URL: {api_url}")
    else:
        print_error("WHATSAPP_API_URL not set")
        return False
    
    if api_key:
        print_success(f"WHATSAPP_API_KEY: {api_key[:20]}...{api_key[-10:]}")
    else:
        print_error("WHATSAPP_API_KEY not set")
        return False
    
    return True

def check_dependencies():
    """Check if required Python packages are installed"""
    print_header("Checking Python Dependencies")
    
    required = ['flask', 'python-dotenv', 'requests', 'supabase', 'apscheduler']
    missing = []
    
    for package in required:
        try:
            __import__(package.replace('-', '_'))
            print_success(f"{package}")
        except ImportError:
            print_error(f"{package}")
            missing.append(package)
    
    if missing:
        print_error(f"\nMissing packages: {', '.join(missing)}")
        print_info(f"Install with: pip install {' '.join(missing)}")
        return False
    
    return True

def check_backend_files():
    """Check if all required backend files exist"""
    print_header("Checking Backend Files")
    
    backend_dir = Path(__file__).parent
    required_files = [
        'whatsapp_service.py',
        'routes/whatsapp.py',
        'whatsapp_reminder_scheduler.py',
        'app.py'
    ]
    
    all_exist = True
    for file in required_files:
        file_path = backend_dir / file
        if file_path.exists():
            print_success(f"{file}")
        else:
            print_error(f"{file} - NOT FOUND")
            all_exist = False
    
    return all_exist

def check_frontend_files():
    """Check if frontend integration files exist"""
    print_header("Checking Frontend Files")
    
    backend_dir = Path(__file__).parent
    frontend_dir = backend_dir.parent / 'frontend'
    
    required_files = [
        'whatsapp-automation.js',
        'app.js',
        'index.html'
    ]
    
    all_exist = True
    for file in required_files:
        file_path = frontend_dir / file
        if file_path.exists():
            print_success(f"{file}")
        else:
            print_error(f"{file} - NOT FOUND")
            all_exist = False
    
    return all_exist

def show_setup_steps():
    """Display setup instructions"""
    print_header("WhatsApp Automation Setup Steps")
    
    steps = [
        ("1. Database Setup", [
            "Run the SQL file in Supabase:",
            "  • Go to: https://app.supabase.com",
            "  • Select your project",
            "  • SQL Editor → New Query",
            "  • Paste content from: kaasflow/backend/add_whatsapp_table.sql",
            "  • Click 'Run'"
        ]),
        ("2. Backend Configuration", [
            "Ensure .env is configured:",
            f"  • WHATSAPP_API_URL=https://www.samkass.site",
            f"  • WHATSAPP_API_KEY=387ec87f3544ad933ee9905809a4e93985238082ec697f99651d0255b9b72371"
        ]),
        ("3. Start Backend Server", [
            "Run the backend:",
            "  • cd kaasflow/backend",
            "  • python app.py (or python3 app.py)",
            "  • Server runs on: http://localhost:5000"
        ]),
        ("4. Frontend Setup", [
            "Open the app in browser:",
            "  • Frontend URL: http://localhost:5500 (or your setup)",
            "  • Go to Settings → WhatsApp Automation",
            "  • Enter your phone number",
            "  • Click 'Connect WhatsApp'"
        ]),
        ("5. Test Connection", [
            "Verify it works:",
            "  • Scan the QR code with your phone",
            "  • Click 'Send Test Message'",
            "  • Check if message arrives"
        ])
    ]
    
    for title, items in steps:
        print(f"\n{title}:")
        for item in items:
            print(f"  {item}")

def show_features():
    """Display available WhatsApp features"""
    print_header("WhatsApp Automation Features")
    
    features = [
        ("Automatic Reminders", [
            "✓ Due today reminders",
            "✓ Due tomorrow notifications",
            "✓ Overdue payment alerts"
        ]),
        ("Manual Reminders", [
            "✓ Send reminder per loan",
            "✓ Test message functionality",
            "✓ Custom message support"
        ]),
        ("API Endpoints", [
            "✓ POST /api/whatsapp/setup - Connect WhatsApp",
            "✓ GET /api/whatsapp/qr - Get QR code",
            "✓ GET /api/whatsapp/status - Check status",
            "✓ POST /api/whatsapp/test - Send test message",
            "✓ POST /api/whatsapp/disconnect - Disconnect",
            "✓ GET/POST /api/whatsapp/reminders/config - Reminder settings"
        ]),
        ("Backend Services", [
            "✓ WhatsAppService class for API calls",
            "✓ Daily scheduler for automated reminders",
            "✓ Connection management",
            "✓ Error handling and logging"
        ])
    ]
    
    for category, items in features:
        print(f"\n{category}:")
        for item in items:
            print(f"  {item}")

def show_troubleshooting():
    """Display troubleshooting tips"""
    print_header("Troubleshooting")
    
    tips = [
        ("API Connection Issues", [
            "1. Verify WHATSAPP_API_URL is correct",
            "2. Check Evolution API server is running",
            "3. Ensure API key is valid",
            "4. Check firewall/network access"
        ]),
        ("Database Issues", [
            "1. Run add_whatsapp_table.sql in Supabase",
            "2. Verify table kf_whatsapp_config exists",
            "3. Check Supabase connection string"
        ]),
        ("Frontend Issues", [
            "1. Verify whatsapp-automation.js is loaded",
            "2. Check browser console for errors",
            "3. Ensure auth tokens are valid",
            "4. Clear browser cache if needed"
        ]),
        ("Message Not Sending", [
            "1. Verify WhatsApp is connected",
            "2. Check phone number format",
            "3. Ensure client has phone in system",
            "4. Check backend logs for errors"
        ])
    ]
    
    for issue, solutions in tips:
        print(f"\n{issue}:")
        for solution in solutions:
            print(f"  {solution}")

def main():
    print("\n")
    print("╔" + "="*68 + "╗")
    print("║" + " "*15 + "WhatsApp Automation Setup & Validation" + " "*15 + "║")
    print("╚" + "="*68 + "╝")
    
    all_checks_passed = True
    
    # Run checks
    if not check_env_variables():
        all_checks_passed = False
    
    if not check_dependencies():
        print_warning("Some dependencies are missing. Install them to run the backend.")
        all_checks_passed = False
    
    if not check_backend_files():
        all_checks_passed = False
    
    if not check_frontend_files():
        all_checks_passed = False
    
    # Show information
    show_setup_steps()
    show_features()
    show_troubleshooting()
    
    # Summary
    print_header("Summary")
    
    if all_checks_passed:
        print_success("All checks passed! Your WhatsApp automation is ready to setup.")
        print_info("Follow the setup steps above to complete the configuration.")
        return 0
    else:
        print_warning("Some checks failed. Please resolve the issues above.")
        print_info("Once fixed, re-run this script to verify.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
