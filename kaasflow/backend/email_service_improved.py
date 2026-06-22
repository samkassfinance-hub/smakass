#!/usr/bin/env python3
"""
Improved Email Service
Optimized to avoid spam filters with proper headers and authentication
"""

import os
import requests
from dotenv import load_dotenv
import json

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")

class ImprovedEmailService:
    """Email service optimized for inbox delivery"""
    
    def __init__(self):
        self.api_key = RESEND_API_KEY
        self.from_email = RESEND_FROM_EMAIL
        self.api_url = "https://api.resend.com/emails"
    
    def send_welcome_email_improved(self, user_email, user_name):
        """
        Send welcome email with anti-spam optimizations
        """
        
        # Simplified, clean HTML without gradients (spam trigger)
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
        
        <p>Hi {user_name},</p>
        
        <p>Welcome to SamKass Finance Manager!</p>
        
        <h2 style="color: #333;">A Message from Our Founder</h2>
        
        <p>My name is Mohanakannan S, and I founded SamKass to solve a real problem.</p>
        
        <p>I noticed thousands of small-scale financiers across India manage their entire loan business using paper notebooks, Excel sheets, and WhatsApp. This costs them time, money, and the trust of their clients.</p>
        
        <p>So I built SamKass - a simple, offline-first app designed specifically for you.</p>
        
        <h3 style="color: #333;">What You Can Do:</h3>
        <ul>
            <li>Manage unlimited clients and their details</li>
            <li>Create loans with flexible interest rates</li>
            <li>Track monthly and weekly EMI collections</li>
            <li>Generate and share payment receipts instantly</li>
            <li>View detailed reports and analytics</li>
            <li>Works offline - no internet needed</li>
        </ul>
        
        <h3 style="color: #333;">Get Started:</h3>
        <ol>
            <li>Add your first client</li>
            <li>Create a loan</li>
            <li>Start tracking payments</li>
        </ol>
        
        <h3 style="color: #333;">Your Account is Secure:</h3>
        <ul>
            <li>PIN-protected access</li>
            <li>Encrypted data storage</li>
            <li>Automatic cloud backups</li>
            <li>We never sell your data</li>
        </ul>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p><strong>Free Plan Includes:</strong></p>
        <ul>
            <li>Up to 20 clients</li>
            <li>Full loan management</li>
            <li>Payment tracking</li>
            <li>Offline access</li>
        </ul>
        
        <p><strong>Premium Plans:</strong></p>
        <ul>
            <li>Monthly: 270 rupees</li>
            <li>Quarterly: 850 rupees</li>
            <li>Yearly: 1,999 rupees</li>
        </ul>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p><strong>Need help?</strong></p>
        <p>
            Email: samkassfinance@gmail.com<br>
            WhatsApp: +91 7904987242<br>
            Website: samkass.site
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p>Thank you for choosing SamKass. We're excited to help you grow your business.</p>
        
        <p>Warm regards,<br>
        <strong>Mohanakannan S</strong><br>
        Founder, SamKass Finance Manager<br>
        samkass.site</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="font-size: 12px; color: #666;">
            © 2026 SamKass. All rights reserved.<br>
            You received this email because you signed up at samkass.site
        </p>
        
    </div>
</body>
</html>
"""
        
        return self._send_email_with_headers(
            to_email=user_email,
            subject="Welcome to SamKass Finance Manager",
            html_content=html_content,
            reply_to="samkassfinance@gmail.com"
        )
    
    def send_otp_email_improved(self, user_email, otp_code):
        """
        Send OTP email with anti-spam optimizations
        """
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
        
        <h2 style="color: #333;">Reset Your PIN</h2>
        
        <p>Hi,</p>
        
        <p>You requested to reset your SamKass PIN. Here is your verification code:</p>
        
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 0; font-family: monospace;">
                {otp_code}
            </p>
        </div>
        
        <p style="color: #666;">This code is valid for 10 minutes only.</p>
        
        <p style="color: #666;">If you did not request this, please ignore this email.</p>
        
        <p style="color: #999; font-size: 12px;">Never share this code with anyone.</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="font-size: 12px; color: #666;">
            SamKass Finance Manager<br>
            samkass.site
        </p>
        
    </div>
</body>
</html>
"""
        
        return self._send_email_with_headers(
            to_email=user_email,
            subject="Your SamKass PIN Reset Code",
            html_content=html_content,
            reply_to="samkassfinance@gmail.com"
        )
    
    def _send_email_with_headers(self, to_email, subject, html_content, reply_to=None):
        """
        Send email with proper headers to avoid spam
        """
        
        if not self.api_key or not self.from_email:
            return {
                "success": False,
                "error": "Missing Resend credentials"
            }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Build payload with spam-avoiding headers
        payload = {
            "from": self.from_email,
            "to": to_email,
            "subject": subject,
            "html": html_content,
            "reply_to": reply_to or self.from_email,
            "headers": {
                "List-Unsubscribe": f"<mailto:{self.from_email}?subject=unsubscribe>",
                "X-Priority": "3",
                "X-MSMail-Priority": "Normal",
                "Importance": "Normal"
            }
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

# Create global instance
email_service_improved = ImprovedEmailService()

if __name__ == "__main__":
    print("\n" + "=" * 80)
    print("🧪 IMPROVED EMAIL SERVICE TEST")
    print("=" * 80)
    
    # Test welcome email
    print("\nSending test welcome email...")
    result1 = email_service_improved.send_welcome_email_improved(
        "mohaneni80@gmail.com",
        "Test User"
    )
    
    if result1["success"]:
        print(f"✅ Welcome email sent! ID: {result1['email_id']}")
    else:
        print(f"❌ Failed: {result1['error']}")
    
    # Test OTP email
    print("\nSending test OTP email...")
    result2 = email_service_improved.send_otp_email_improved(
        "mohaneni80@gmail.com",
        "123456"
    )
    
    if result2["success"]:
        print(f"✅ OTP email sent! ID: {result2['email_id']}")
    else:
        print(f"❌ Failed: {result2['error']}")
    
    print("\n" + "=" * 80)
    if result1["success"] and result2["success"]:
        print("✅ ALL TESTS PASSED - Check inbox (not spam)")
    print("=" * 80 + "\n")
