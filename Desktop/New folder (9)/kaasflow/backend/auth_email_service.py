#!/usr/bin/env python3
"""
Authentication Email Service
Handles welcome emails on signup and OTP emails for password reset
"""

import os
import requests
from dotenv import load_dotenv
from email_templates import get_welcome_email_html, get_otp_email_html

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")

class AuthEmailService:
    """Service to handle all authentication-related emails"""
    
    def __init__(self):
        self.api_key = RESEND_API_KEY
        self.from_email = RESEND_FROM_EMAIL
        self.api_url = "https://api.resend.com/emails"
    
    def _validate_credentials(self):
        """Check if email credentials are configured"""
        if not self.api_key or not self.from_email:
            return False, "Missing Resend API credentials in .env file"
        return True, "OK"
    
    def _send_email(self, to_email, subject, html_content):
        """
        Generic email sending function
        
        Args:
            to_email: Recipient email
            subject: Email subject
            html_content: HTML email body
        
        Returns:
            dict: {success: bool, email_id: str, error: str}
        """
        is_valid, message = self._validate_credentials()
        if not is_valid:
            return {"success": False, "error": message}
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": self.from_email,
            "to": to_email,
            "subject": subject,
            "html": html_content
        }
        
        try:
            response = requests.post(
                self.api_url,
                json=payload,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "email_id": data.get("id"),
                    "message": f"Email sent to {to_email}"
                }
            else:
                error_data = response.json()
                error_msg = error_data.get("message") or str(error_data)
                return {
                    "success": False,
                    "error": f"API Error {response.status_code}: {error_msg}"
                }
        
        except requests.exceptions.Timeout:
            return {"success": False, "error": "Email service timeout"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def send_welcome_email(self, user_email, user_name):
        """
        Send welcome email to new user after signup
        
        Args:
            user_email: User's email address
            user_name: User's full name
        
        Returns:
            dict: {success: bool, email_id: str, error: str}
        """
        print(f"\n📧 Sending welcome email to {user_email}...")
        
        subject = "🚀 Welcome to SamKass Finance Manager — Your Smart Loan Manager is Ready!"
        html_content = get_welcome_email_html(user_name)
        
        result = self._send_email(user_email, subject, html_content)
        
        if result["success"]:
            print(f"   ✅ Welcome email sent! ID: {result['email_id']}")
        else:
            print(f"   ❌ Failed: {result['error']}")
        
        return result
    
    def send_otp_email(self, user_email, otp_code):
        """
        Send OTP email for password reset / forgot PIN
        
        Args:
            user_email: User's email address
            otp_code: 6-digit OTP code
        
        Returns:
            dict: {success: bool, email_id: str, error: str}
        """
        print(f"\n🔐 Sending OTP email to {user_email}...")
        
        subject = "🔐 Your Password Reset OTP - SamKass"
        html_content = get_otp_email_html(otp_code)
        
        result = self._send_email(user_email, subject, html_content)
        
        if result["success"]:
            print(f"   ✅ OTP email sent! ID: {result['email_id']}")
        else:
            print(f"   ❌ Failed: {result['error']}")
        
        return result
    
    def send_welcome_email_async(self, user_email, user_name):
        """
        Non-blocking welcome email send (for integration with Flask/FastAPI)
        Can be run in background thread or task queue
        """
        try:
            return self.send_welcome_email(user_email, user_name)
        except Exception as e:
            return {"success": False, "error": f"Async email failed: {str(e)}"}
    
    def send_otp_email_async(self, user_email, otp_code):
        """
        Non-blocking OTP email send (for integration with Flask/FastAPI)
        Can be run in background thread or task queue
        """
        try:
            return self.send_otp_email(user_email, otp_code)
        except Exception as e:
            return {"success": False, "error": f"Async email failed: {str(e)}"}

# Create global instance
email_service = AuthEmailService()

# ============================================================================
# TEST FUNCTIONS
# ============================================================================

def test_welcome_email():
    """Test sending welcome email"""
    print("\n" + "=" * 80)
    print("🧪 TEST 1: WELCOME EMAIL")
    print("=" * 80)
    
    result = email_service.send_welcome_email(
        user_email="mohaneni80@gmail.com",
        user_name="Mohanakannan S"
    )
    
    return result["success"]

def test_otp_email():
    """Test sending OTP email"""
    print("\n" + "=" * 80)
    print("🧪 TEST 2: OTP EMAIL")
    print("=" * 80)
    
    result = email_service.send_otp_email(
        user_email="mohaneni80@gmail.com",
        otp_code="123456"
    )
    
    return result["success"]

if __name__ == "__main__":
    print("\n" + "=" * 80)
    print("🔍 AUTH EMAIL SERVICE - TESTING")
    print("=" * 80)
    
    test1 = test_welcome_email()
    test2 = test_otp_email()
    
    print("\n" + "=" * 80)
    print("📊 TEST RESULTS")
    print("=" * 80)
    print(f"Welcome Email Test: {'✅ PASSED' if test1 else '❌ FAILED'}")
    print(f"OTP Email Test: {'✅ PASSED' if test2 else '❌ FAILED'}")
    print("=" * 80)
