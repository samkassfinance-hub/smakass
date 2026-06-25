"""
Email Service using Resend API
Handles welcome emails and OTP verification emails
"""

import os
import requests
from datetime import datetime
import json

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
RESEND_API_URL = "https://api.resend.com/emails"
FROM_EMAIL = os.environ.get("RESEND_FROM_EMAIL", "noreply@samkass.site")

class ResendEmailService:
    """Service to send emails via Resend API"""
    
    @staticmethod
    def send_welcome_email(user_email, username):
        """
        Send welcome email to new users on first login
        """
        if not RESEND_API_KEY:
            print("ERROR: RESEND_API_KEY not configured")
            return {"success": False, "error": "Email service not configured"}
        
        welcome_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 8px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4f46e5; padding-bottom: 20px;">
                    <h1 style="color: #4f46e5; margin: 0; font-size: 28px;">Welcome to SamKass Finance Manager</h1>
                    <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Your Smart Loan Manager is Ready!</p>
                </div>

                <!-- Greeting -->
                <h2 style="color: #1f2937; font-size: 18px; margin: 20px 0;">Hi {username},</h2>
                
                <!-- Founder Message -->
                <div style="background: #f3f4f6; padding: 15px; border-left: 4px solid #4f46e5; margin: 20px 0; border-radius: 4px;">
                    <p style="color: #374151; margin: 0; font-weight: bold;">A Word From The Founder</p>
                    <p style="color: #4b5563; margin: 10px 0 0 0; line-height: 1.6; font-size: 14px;">
                        Hi, I'm Mohanakannan S — the founder of SamKass. I built SamKass because I saw a real problem. Thousands of small-scale financiers across India are still managing their entire loan business in paper notebooks, Excel sheets, and WhatsApp chats.
                    </p>
                    <p style="color: #4b5563; margin: 10px 0 0 0; line-height: 1.6; font-size: 14px;">
                        So I built SamKass Finance Manager — a smart, offline-first app designed specifically for small financiers like you. No complicated software. No expensive subscriptions to start. Just a clean, simple tool that works even without internet, right from your phone.
                    </p>
                    <p style="color: #4b5563; margin: 10px 0 0 0; line-height: 1.6; font-size: 14px;">
                        Thank you for trusting SamKass. This is just the beginning — and I'm excited to be part of your journey.
                    </p>
                    <p style="color: #4f46e5; margin: 10px 0 0 0; font-weight: bold;">— Mohanakannan S, Founder, SamKass</p>
                </div>

                <!-- Main Message -->
                <p style="color: #1f2937; font-size: 15px; line-height: 1.8; margin: 20px 0;">
                    You've just taken the smartest step toward managing your loans, clients, and collections — the digital way.
                </p>
                <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 15px 0; padding-left: 20px;">
                    <li>✓ No more notebooks</li>
                    <li>✓ No more Excel sheets</li>
                    <li>✓ No more missed EMIs</li>
                </ul>

                <!-- Getting Started -->
                <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 16px;">Get Started in 3 Simple Steps</h3>
                    <ol style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li><strong>Add Your First Client</strong> — Go to Clients → Add Client → Enter name, phone, and ID details</li>
                        <li><strong>Create a Loan</strong> — Go to Loans → New Loan → Choose your interest type and set the EMI schedule</li>
                        <li><strong>Record Payments</strong> — Collect payments, auto-generate PDF receipts, and share them on WhatsApp</li>
                    </ol>
                </div>

                <!-- Features -->
                <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 16px;">What You Can Do With SamKass</h3>
                    <ul style="color: #4b5563; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li>Manage unlimited client profiles with full contact & ID details</li>
                        <li>Create loans with flexible interest — percentage, fixed, or custom</li>
                        <li>Track monthly & weekly EMI collections in one dashboard</li>
                        <li>Generate & share payment receipts via WhatsApp in one tap</li>
                        <li>View reports — outstanding balances, collection history & more</li>
                        <li>Works OFFLINE — no internet needed for daily operations</li>
                        <li>PIN-protected security with OTP-based account recovery</li>
                    </ul>
                </div>

                <!-- Security -->
                <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <h3 style="color: #7f1d1d; margin: 0 0 10px 0; font-size: 14px;">🔒 Your Account is Secure</h3>
                    <p style="color: #4b5563; font-size: 13px; margin: 0; line-height: 1.6;">
                        Your data is protected with PIN-lock access, Bcrypt password hashing, JWT authentication, OTP email verification, and automatic Supabase cloud backups. We never sell your data.
                    </p>
                </div>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://samkass.site" style="background: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px;">
                        Open SamKass Now
                    </a>
                </div>

                <!-- Contact -->
                <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
                    <p style="color: #4b5563; font-size: 13px; margin: 0 0 10px 0; font-weight: bold;">Need Help?</p>
                    <p style="color: #4b5563; font-size: 12px; margin: 0;">
                        📧 samkassfinance@gmail.com<br>
                        📱 +91 7904987242 (WhatsApp)<br>
                        📸 @samkassfinance (Instagram)
                    </p>
                </div>

                <!-- Footer -->
                <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px;">
                    <p style="margin: 0 0 10px 0;">
                        Built with passion for every small financier in India who deserves a smarter, simpler way to run their business.
                    </p>
                    <p style="margin: 0 0 10px 0;">
                        © 2026 SamKass. All rights reserved.
                    </p>
                    <p style="margin: 0; color: #9ca3af;">
                        <a href="https://samkass.site/privacy" style="color: #4f46e5; text-decoration: none;">Privacy Policy</a> | 
                        <a href="https://samkass.site/terms" style="color: #4f46e5; text-decoration: none;">Terms of Service</a>
                    </p>
                </div>
            </div>
        </div>
        """
        
        return ResendEmailService._send_email(
            to=user_email,
            subject="Welcome to SamKass Finance Manager - Your Smart Loan Manager is Ready!",
            html=welcome_html
        )

    @staticmethod
    def send_otp_email(user_email, otp_code, username=None):
        """
        Send OTP verification email for PIN reset
        """
        if not RESEND_API_KEY:
            print("ERROR: RESEND_API_KEY not configured")
            return {"success": False, "error": "Email service not configured"}
        
        otp_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 8px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #dc2626; padding-bottom: 20px;">
                    <h1 style="color: #dc2626; margin: 0; font-size: 24px;">PIN Reset Request</h1>
                    <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Secure Your Account</p>
                </div>

                <!-- Greeting -->
                <h2 style="color: #1f2937; font-size: 18px; margin: 20px 0;">
                    {f"Hi {username}," if username else "Hi there,"}
                </h2>

                <!-- Main Message -->
                <p style="color: #4b5563; font-size: 15px; line-height: 1.8; margin: 15px 0;">
                    We received a request to reset your PIN. If this wasn't you, please ignore this email or contact support immediately.
                </p>

                <!-- OTP Code -->
                <div style="background: #fef3c7; border: 2px solid #fbbf24; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                    <p style="color: #92400e; font-size: 12px; margin: 0 0 10px 0; font-weight: bold;">YOUR VERIFICATION CODE</p>
                    <div style="background: white; border: 2px dashed #fbbf24; padding: 15px; border-radius: 6px; margin: 10px 0;">
                        <p style="color: #dc2626; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 4px;">{otp_code}</p>
                    </div>
                    <p style="color: #92400e; font-size: 12px; margin: 10px 0 0 0;">This code expires in 10 minutes</p>
                </div>

                <!-- Instructions -->
                <div style="background: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #0284c7;">
                    <h3 style="color: #0c4a6e; margin: 0 0 10px 0; font-size: 14px;">How to Use Your Code</h3>
                    <ol style="color: #0c4a6e; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li>Go to SamKass and click "Reset PIN"</li>
                        <li>Enter your email address</li>
                        <li>Paste the code above when prompted</li>
                        <li>Create your new PIN</li>
                    </ol>
                </div>

                <!-- Security Note -->
                <div style="background: #fee2e2; padding: 12px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
                    <p style="color: #7f1d1d; font-size: 12px; margin: 0;">
                        <strong>⚠️ Security Notice:</strong> Never share this code with anyone. SamKass staff will never ask for your OTP.
                    </p>
                </div>

                <!-- Direct Link -->
                <div style="text-align: center; margin: 25px 0;">
                    <a href="https://samkass.site/reset-pin" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px;">
                        Complete PIN Reset
                    </a>
                </div>

                <!-- Help -->
                <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
                    <p style="color: #4b5563; font-size: 12px; margin: 0 0 5px 0;">Didn't request this?</p>
                    <p style="color: #4b5563; font-size: 12px; margin: 0;">
                        <a href="https://samkass.site/help" style="color: #dc2626; text-decoration: none;">Contact Support</a> immediately or ignore this email.
                    </p>
                </div>

                <!-- Footer -->
                <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 11px;">
                    <p style="margin: 0 0 5px 0;">
                        © 2026 SamKass. All rights reserved.
                    </p>
                    <p style="margin: 0;">
                        <a href="https://samkass.site/privacy" style="color: #4f46e5; text-decoration: none; margin: 0 5px;">Privacy</a> | 
                        <a href="https://samkass.site/terms" style="color: #4f46e5; text-decoration: none; margin: 0 5px;">Terms</a>
                    </p>
                </div>
            </div>
        </div>
        """
        
        return ResendEmailService._send_email(
            to=user_email,
            subject=f"Your SamKass PIN Reset Code: {otp_code}",
            html=otp_html
        )

    @staticmethod
    def _send_email(to, subject, html):
        """
        Generic email sending via Resend API
        """
        if not RESEND_API_KEY:
            return {"success": False, "error": "RESEND_API_KEY not configured"}
        
        headers = {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": FROM_EMAIL,
            "to": to,
            "subject": subject,
            "html": html
        }
        
        try:
            response = requests.post(RESEND_API_URL, json=payload, headers=headers, timeout=10)
            
            if response.status_code in [200, 201]:
                result = response.json()
                return {
                    "success": True,
                    "message": "Email sent successfully",
                    "email_id": result.get("id"),
                    "timestamp": datetime.now().isoformat()
                }
            else:
                error_msg = response.text
                print(f"Email send failed: {response.status_code} - {error_msg}")
                return {
                    "success": False,
                    "error": f"Failed to send email: {response.status_code}",
                    "details": error_msg
                }
        
        except requests.exceptions.RequestException as e:
            print(f"Email service error: {str(e)}")
            return {
                "success": False,
                "error": f"Email service error: {str(e)}"
            }
        except Exception as e:
            print(f"Unexpected error sending email: {str(e)}")
            return {
                "success": False,
                "error": f"Unexpected error: {str(e)}"
            }


# Convenient functions for direct use
def send_welcome_email(email, username):
    """Send welcome email on first login"""
    return ResendEmailService.send_welcome_email(email, username)

def send_otp_email(email, otp_code, username=None):
    """Send OTP email for PIN reset"""
    return ResendEmailService.send_otp_email(email, otp_code, username)
