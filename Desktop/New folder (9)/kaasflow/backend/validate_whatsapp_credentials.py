#!/usr/bin/env python3
"""
Validate WhatsApp Meta API Credentials
Tests if the Phone Number ID, Business Account ID, and Access Token are valid
"""

import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get credentials from .env
WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
WHATSAPP_BUSINESS_ACCOUNT_ID = os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID")

def validate_credentials():
    """Test if WhatsApp credentials are valid"""
    
    print("=" * 70)
    print("🔍 WHATSAPP CREDENTIALS VALIDATION")
    print("=" * 70)
    
    # Check if credentials exist
    print("\n1️⃣  Checking if credentials are loaded...")
    if not WHATSAPP_ACCESS_TOKEN:
        print("   ❌ WHATSAPP_ACCESS_TOKEN is missing from .env file")
        return False
    print("   ✅ Access Token found")
    
    if not WHATSAPP_PHONE_NUMBER_ID:
        print("   ❌ WHATSAPP_PHONE_NUMBER_ID is missing from .env file")
        return False
    print("   ✅ Phone Number ID found")
    
    if not WHATSAPP_BUSINESS_ACCOUNT_ID:
        print("   ❌ WHATSAPP_BUSINESS_ACCOUNT_ID is missing from .env file")
        return False
    print("   ✅ Business Account ID found")
    
    # Test API connection
    print("\n2️⃣  Testing API connection...")
    
    url = f"https://graph.instagram.com/v18.0/{WHATSAPP_PHONE_NUMBER_ID}"
    
    headers = {
        "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=5)
        
        if response.status_code == 200:
            print("   ✅ API connection successful!")
            data = response.json()
            print(f"   📱 Phone Number: {data.get('display_phone_number', 'N/A')}")
            print(f"   🆔 Phone Number ID: {data.get('id', 'N/A')}")
            print(f"   📊 Quality Rating: {data.get('quality_rating', 'N/A')}")
            return True
        
        elif response.status_code == 401:
            print("   ❌ Authentication failed!")
            print("   Reason: Invalid Access Token")
            print(f"   Response: {response.json().get('error', {}).get('message', 'Unknown error')}")
            return False
        
        elif response.status_code == 404:
            print("   ❌ Phone Number ID not found!")
            print("   Reason: Invalid Phone Number ID")
            return False
        
        else:
            print(f"   ❌ API Error: {response.status_code}")
            print(f"   Response: {response.json()}")
            return False
            
    except requests.exceptions.Timeout:
        print("   ❌ Connection timeout - check your internet connection")
        return False
    
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Connection error: {str(e)}")
        return False

def display_credentials_info():
    """Display masked credentials for verification"""
    
    print("\n3️⃣  Credentials Summary:")
    print(f"   Access Token: {WHATSAPP_ACCESS_TOKEN[:20]}...{WHATSAPP_ACCESS_TOKEN[-10:]}")
    print(f"   Phone Number ID: {WHATSAPP_PHONE_NUMBER_ID}")
    print(f"   Business Account ID: {WHATSAPP_BUSINESS_ACCOUNT_ID}")

if __name__ == "__main__":
    is_valid = validate_credentials()
    display_credentials_info()
    
    print("\n" + "=" * 70)
    if is_valid:
        print("✅ ALL CREDENTIALS ARE VALID!")
        print("You're ready to send WhatsApp reminders!")
    else:
        print("❌ CREDENTIALS VALIDATION FAILED")
        print("Please check your credentials and try again")
    print("=" * 70)
