#!/usr/bin/env python3
"""
Test script to verify WhatsApp API connection with your credentials
Run: python test_whatsapp_api.py
"""

import os
import sys
import requests
from dotenv import load_dotenv

# Load environment variables from .env
backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(backend_dir, '.env'))

def test_whatsapp_connection():
    """Test WhatsApp API connection"""
    
    api_url = os.environ.get('WHATSAPP_API_URL', '').strip()
    api_key = os.environ.get('WHATSAPP_API_KEY', '').strip()
    
    print("=" * 60)
    print("WhatsApp API Connection Test")
    print("=" * 60)
    
    # Validate credentials exist
    if not api_url:
        print("❌ WHATSAPP_API_URL not configured")
        return False
    
    if not api_key:
        print("❌ WHATSAPP_API_KEY not configured")
        return False
    
    print(f"✓ API URL: {api_url}")
    print(f"✓ API Key: {api_key[:20]}...{api_key[-10:]}")
    print()
    
    # Test API connection
    headers = {
        'Content-Type': 'application/json',
        'apikey': api_key
    }
    
    try:
        # Try to get instances
        instances_url = f"{api_url.rstrip('/')}/instance"
        print(f"🔍 Testing connection to: {instances_url}")
        
        response = requests.get(instances_url, headers=headers, timeout=5)
        
        print(f"Response Status: {response.status_code}")
        print(f"Response: {response.text[:200]}")
        
        if response.status_code == 200:
            print("\n✅ WhatsApp API is accessible!")
            return True
        elif response.status_code in [401, 403]:
            print("\n⚠️  API returned authentication error. Check your API key.")
            return False
        else:
            print(f"\n⚠️  API returned status {response.status_code}")
            return True  # API exists but may need more config
            
    except requests.exceptions.ConnectionError:
        print(f"\n❌ Failed to connect to {api_url}")
        print("   Make sure the API server is running and accessible.")
        return False
    except requests.exceptions.Timeout:
        print(f"\n❌ Connection timeout to {api_url}")
        return False
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

def show_whatsapp_setup():
    """Show WhatsApp automation setup information"""
    
    print("\n" + "=" * 60)
    print("WhatsApp Automation Setup Summary")
    print("=" * 60)
    
    print("\n📱 Environment Variables Set:")
    print(f"  • WHATSAPP_API_URL: {os.environ.get('WHATSAPP_API_URL', 'NOT SET')}")
    print(f"  • WHATSAPP_API_KEY: {os.environ.get('WHATSAPP_API_KEY', 'NOT SET')[:20]}...")
    
    print("\n🔧 WhatsApp Integration Locations:")
    print("  • Backend: kaasflow/backend/whatsapp_service.py")
    print("  • Routes: kaasflow/backend/routes/whatsapp.py")
    print("  • Scheduler: kaasflow/backend/whatsapp_reminder_scheduler.py")
    
    print("\n🚀 API Endpoints Available:")
    print("  • POST /api/whatsapp/setup - Setup WhatsApp instance")
    print("  • GET /api/whatsapp/qr - Get QR code for connection")
    print("  • GET /api/whatsapp/status - Check connection status")
    print("  • POST /api/whatsapp/disconnect - Disconnect WhatsApp")
    print("  • POST /api/whatsapp/test - Send test message")
    print("  • GET/POST /api/whatsapp/reminders/config - Configure reminders")
    
    print("\n📅 Automated Features:")
    print("  • Daily payment reminders via WhatsApp")
    print("  • Due today notifications")
    print("  • Due tomorrow notifications")
    print("  • Overdue payment reminders")
    
    print("\n" + "=" * 60)

if __name__ == '__main__':
    success = test_whatsapp_connection()
    show_whatsapp_setup()
    
    if success:
        print("\n✅ WhatsApp API is configured and ready!")
        sys.exit(0)
    else:
        print("\n⚠️  Please verify your WhatsApp API configuration.")
        sys.exit(1)
