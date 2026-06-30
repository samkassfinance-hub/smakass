#!/usr/bin/env python3
"""
Send Welcome Email to New Users
Uses Resend API to send the founder's welcome message from samkass.site
"""

import os
import requests
from dotenv import load_dotenv
from email_templates import get_welcome_email_html

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")

def send_welcome_email(user_email, user_name):
    """
    Send welcome email with founder's message
    
    Args:
        user_email: User's email address
        user_name: User's name for personalization
    
    Returns:
        dict: Response with success status and email ID
    """
    
    if not RESEND_API_KEY or not RESEND_FROM_EMAIL:
        return {
            "success": False,
            "error": "Missing Resend credentials in .env file"
        }
    
    url = "https://api.resend.com/emails"
    
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "from": RESEND_FROM_EMAIL,
        "to": user_email,
        "subject": "🚀 Welcome to SamKass Finance Manager — Your Smart Loan Manager is Ready!",
        "html": get_welcome_email_html(user_name)
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return {
                "success": True,
                "email_id": data.get("id"),
                "message": f"Welcome email sent to {user_email}"
            }
        else:
            return {
                "success": False,
                "error": f"API Error {response.status_code}: {response.json()}"
            }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def send_test_welcome_email():
    """Send a test welcome email to verify setup"""
    
    print("=" * 80)
    print("📧 SENDING TEST WELCOME EMAIL")
    print("=" * 80)
    
    result = send_welcome_email("mohaneni80@gmail.com", "Test User")
    
    if result["success"]:
        print(f"\n✅ Email sent successfully!")
        print(f"   Email ID: {result['email_id']}")
        print(f"   To: mohaneni80@gmail.com")
        print(f"   From: {RESEND_FROM_EMAIL}")
    else:
        print(f"\n❌ Failed to send email")
        print(f"   Error: {result['error']}")
    
    print("=" * 80)
    return result

if __name__ == "__main__":
    send_test_welcome_email()
