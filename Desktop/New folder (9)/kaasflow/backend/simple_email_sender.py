"""
Simple Email Sender - Direct Resend Integration
Directly sends emails without complex dependencies
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

class SimpleEmailSender:
    def __init__(self):
        self.api_key = os.getenv("RESEND_API_KEY", "")
        self.from_email = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")
        self.api_url = "https://api.resend.com/emails"
        
    def send_welcome_email(self, to_email: str, user_name: str) -> dict:
        """Send welcome email"""
        subject = "🚀 Welcome to SamKass! Your Finance Manager is Ready"
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to SamKass</title>
        </head>
        <body style="font-family: Segoe UI, Tahoma, Geneva, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
            <div style="max-width: 650px; margin: 20px auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; color: white;">
                    <h1 style="font-size: 32px; margin: 0; font-weight: 700;">Welcome to SamKass!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">Your Finance Manager is Ready</p>
                </div>
                <div style="padding: 40px 30px;">
                    <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>{user_name if user_name else 'Valued Member'}</strong>,</p>
                    
                    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 6px;">
                        <h2 style="margin-top: 0; color: #0f172a; font-size: 18px;">A Word From The Founder</h2>
                        <p style="color: #1e293b; line-height: 1.7; margin: 12px 0;">Hi, I'm <strong>Mohanakannan S</strong> — the founder of SamKass.</p>
                        <p style="color: #1e293b; line-height: 1.7; margin: 12px 0;">I built SamKass because I saw a real problem. Thousands of small-scale financiers across India are still managing their entire loan business in paper notebooks, Excel sheets, and WhatsApp chats. Missed EMIs, lost records, manual reminders — it was costing them time, money, and trust.</p>
                        <p style="color: #1e293b; line-height: 1.7; margin: 12px 0;"><strong>So I built SamKass Finance Manager</strong> — a smart, offline-first app designed specifically for small financiers like you. No complicated software. No expensive subscriptions to start. Just a clean, simple tool that works even without internet, right from your phone.</p>
                        <p style="color: #1e293b; line-height: 1.7; margin: 12px 0;">Thank you for trusting SamKass. This is just the beginning — and I'm excited to be part of your journey.</p>
                        <p style="font-style: italic; color: #64748b; margin-top: 15px;">— Mohanakannan S<br>Founder, SamKass</p>
                    </div>
                    
                    <h3 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 15px;">Get Started in 3 Simple Steps</h3>
                    <ul style="list-style: none; margin: 15px 0; padding: 0;">
                        <li style="padding: 10px 0 10px 30px; position: relative; color: #334155;">
                            <span style="position: absolute; left: 0; color: #10b981; font-weight: bold; font-size: 20px;">✓</span>
                            <strong>Add Your First Client</strong> — Go to Clients → Add Client
                        </li>
                        <li style="padding: 10px 0 10px 30px; position: relative; color: #334155;">
                            <span style="position: absolute; left: 0; color: #10b981; font-weight: bold; font-size: 20px;">✓</span>
                            <strong>Create a Loan</strong> — Go to Loans → New Loan → Set EMI schedule
                        </li>
                        <li style="padding: 10px 0 10px 30px; position: relative; color: #334155;">
                            <span style="position: absolute; left: 0; color: #10b981; font-weight: bold; font-size: 20px;">✓</span>
                            <strong>Record Payments</strong> — Collect, generate receipts, share on WhatsApp
                        </li>
                    </ul>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://www.samkass.site" style="display: inline-block; background-color: #10b981; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600;">Go to SamKass</a>
                    </div>
                    
                    <p style="color: #64748b; font-size: 14px; margin-top: 20px;">Need help? Email us at <strong>samkassfinance@gmail.com</strong> or WhatsApp <strong>+91 7904987242</strong></p>
                </div>
                <div style="background-color: #f8fafc; padding: 25px 30px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 5px 0;">© 2026 SamKass. All rights reserved.</p>
                    <p style="margin: 10px 0 0 0;">You received this email because you signed up at samkass.site</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, html)
    
    def send_password_reset_otp(self, to_email: str, otp_code: str) -> dict:
        """Send password reset OTP email"""
        subject = "🔒 Your Password Reset Code - SamKass"
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
        </head>
        <body style="font-family: Segoe UI, Tahoma, Geneva, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; color: white;">
                    <h1 style="font-size: 28px; margin: 0; font-weight: 600;">Password Reset Request</h1>
                    <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.95;">Your verification code</p>
                </div>
                <div style="padding: 40px 30px; text-align: center;">
                    <p style="color: #1e293b; margin-bottom: 20px;">Your verification code is:</p>
                    <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; color: #334155; padding: 20px; font-size: 36px; font-weight: bold; letter-spacing: 6px; border-radius: 8px; display: inline-block; font-family: monospace;">
                        {otp_code}
                    </div>
                    <p style="color: #64748b; font-size: 14px; margin: 20px 0 0 0;">This code expires in 10 minutes.</p>
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; color: #92400e; font-size: 13px;">
                        <strong>⚠️ Security Notice:</strong><br>
                        Never share this code with anyone. SamKass team will never ask for your OTP.
                    </div>
                </div>
                <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 5px 0;">This is an automated security email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, html)
    
    def send_pin_reset_otp(self, to_email: str, otp_code: str) -> dict:
        """Send PIN reset OTP email"""
        subject = "🔐 Your Security PIN Reset Code - SamKass"
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PIN Reset</title>
        </head>
        <body style="font-family: Segoe UI, Tahoma, Geneva, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; color: white;">
                    <h1 style="font-size: 28px; margin: 0; font-weight: 600;">Security PIN Reset</h1>
                    <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.95;">Your verification code</p>
                </div>
                <div style="padding: 40px 30px; text-align: center;">
                    <p style="color: #1e293b; margin-bottom: 20px;">Your verification code is:</p>
                    <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; color: #334155; padding: 20px; font-size: 36px; font-weight: bold; letter-spacing: 6px; border-radius: 8px; display: inline-block; font-family: monospace;">
                        {otp_code}
                    </div>
                    <p style="color: #64748b; font-size: 14px; margin: 20px 0 0 0;">This code expires in 10 minutes.</p>
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; color: #92400e; font-size: 13px;">
                        <strong>🔐 Security Notice:</strong><br>
                        • Never share this code with anyone<br>
                        • SamKass team will never ask for your code<br>
                        • If you didn't request this, ignore this email
                    </div>
                </div>
                <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 5px 0;">This is an automated security email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, html)
    
    def send_email(self, to_email: str, subject: str, html: str) -> dict:
        """Send email via Resend API"""
        if not self.api_key:
            return {
                "success": False,
                "error": "RESEND_API_KEY not configured",
                "provider": "resend"
            }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": self.from_email,
            "to": to_email,
            "subject": subject,
            "html": html
        }
        
        try:
            print(f"\n📧 Sending email to {to_email}")
            print(f"📝 Subject: {subject}")
            print(f"📤 From: {self.from_email}")
            
            response = requests.post(
                self.api_url,
                json=payload,
                headers=headers,
                timeout=15
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                email_id = data.get("id", "unknown")
                print(f"✅ Email sent successfully!")
                print(f"📨 Email ID: {email_id}")
                return {
                    "success": True,
                    "email_id": email_id,
                    "provider": "resend",
                    "to": to_email
                }
            else:
                error_msg = response.text
                print(f"❌ Resend API error ({response.status_code})")
                print(f"Error: {error_msg}")
                return {
                    "success": False,
                    "error": error_msg,
                    "status_code": response.status_code,
                    "provider": "resend"
                }
        
        except requests.exceptions.Timeout:
            print(f"❌ Request timeout")
            return {
                "success": False,
                "error": "Request timeout",
                "provider": "resend"
            }
        except Exception as e:
            print(f"❌ Error: {e}")
            return {
                "success": False,
                "error": str(e),
                "provider": "resend"
            }


# Global instance
simple_email_sender = SimpleEmailSender()
