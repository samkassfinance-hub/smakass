"""
Advanced Email Service with Custom Domain Integration
Sends welcome emails, OTP emails, and PIN reset emails via custom domain + Resend fallback
"""

import os
import requests
from datetime import datetime
from dotenv import load_dotenv
from typing import Dict, Tuple

load_dotenv()

class AdvancedEmailService:
    """Email service with custom domain (samkass.site) and Resend fallback"""
    
    def __init__(self):
        # Custom domain configuration (primary)
        self.custom_domain = os.getenv("MAIL_DOMAIN", "samkass.site")
        self.mail_from_email = os.getenv("MAIL_FROM_EMAIL", "noreply@samkass.site")
        self.mail_support_email = os.getenv("MAIL_SUPPORT_EMAIL", "support@samkass.site")
        self.mail_domain_id = os.getenv("MAIL_DOMAIN_ID")
        self.mail_region = os.getenv("MAIL_REGION", "ap-northeast-1")
        
        # Resend fallback
        self.resend_api_key = os.getenv("RESEND_API_KEY")
        self.resend_from_email = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")
        
        # API endpoints
        self.custom_domain_api = "https://api.resend.com/emails"  # Resend API handles custom domains
        self.resend_api = "https://api.resend.com/emails"
        
        self.email_log = []
    
    def _get_headers(self, api_key: str) -> Dict:
        """Get headers for API request"""
        return {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def _send_via_custom_domain(self, to_email: str, subject: str, html: str) -> Tuple[bool, Dict]:
        """
        Send email using custom domain (samkass.site)
        """
        if not self.mail_domain_id or not self.resend_api_key:
            return False, {"error": "Custom domain not configured"}
        
        try:
            headers = self._get_headers(self.resend_api_key)
            payload = {
                "from": self.mail_from_email,
                "to": [to_email],
                "subject": subject,
                "html": html,
                "reply_to": self.mail_support_email,
                "headers": {
                    "X-Entity-Ref": self.mail_domain_id,
                    "X-Priority": "1"
                }
            }
            
            response = requests.post(
                self.custom_domain_api,
                json=payload,
                headers=headers,
                timeout=15
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                return True, {
                    "success": True,
                    "email_id": data.get("id"),
                    "provider": "custom_domain",
                    "from": self.mail_from_email,
                    "to": to_email,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                error_msg = response.json().get("message", str(response.text))
                return False, {
                    "error": error_msg,
                    "status": response.status_code,
                    "provider": "custom_domain"
                }
        
        except Exception as e:
            return False, {"error": str(e), "provider": "custom_domain"}
    
    def _send_via_resend(self, to_email: str, subject: str, html: str) -> Tuple[bool, Dict]:
        """
        Send email using Resend (fallback)
        """
        if not self.resend_api_key:
            return False, {"error": "Resend API key not configured"}
        
        try:
            headers = self._get_headers(self.resend_api_key)
            payload = {
                "from": self.resend_from_email,
                "to": [to_email],
                "subject": subject,
                "html": html,
                "reply_to": self.mail_support_email
            }
            
            response = requests.post(
                self.resend_api,
                json=payload,
                headers=headers,
                timeout=15
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                return True, {
                    "success": True,
                    "email_id": data.get("id"),
                    "provider": "resend",
                    "from": self.resend_from_email,
                    "to": to_email,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                error_msg = response.json().get("message", str(response.text))
                return False, {
                    "error": error_msg,
                    "status": response.status_code,
                    "provider": "resend"
                }
        
        except Exception as e:
            return False, {"error": str(e), "provider": "resend"}
    
    def send_email(self, to_email: str, subject: str, html: str, 
                   use_custom_domain: bool = True) -> Dict:
        """
        Send email with fallback strategy
        
        Args:
            to_email: Recipient email
            subject: Email subject
            html: HTML content
            use_custom_domain: Try custom domain first (default True)
        
        Returns:
            Dict with success status and details
        """
        print(f"\n📧 Sending email to {to_email}")
        print(f"📝 Subject: {subject}")
        
        if use_custom_domain:
            # Try custom domain first
            success, result = self._send_via_custom_domain(to_email, subject, html)
            if success:
                print(f"✅ Email sent via custom domain ({self.mail_from_email})")
                print(f"📨 Email ID: {result['email_id']}")
                self.email_log.append(result)
                return result
            else:
                print(f"⚠️ Custom domain failed: {result.get('error')}")
            
            # Fallback to Resend
            print(f"🔄 Falling back to Resend API...")
            success, result = self._send_via_resend(to_email, subject, html)
            if success:
                print(f"✅ Email sent via Resend ({self.resend_from_email})")
                print(f"📨 Email ID: {result['email_id']}")
                self.email_log.append(result)
                return result
            else:
                print(f"❌ Resend also failed: {result.get('error')}")
                return {"success": False, "error": result.get("error"), "provider": "both"}
        else:
            # Use Resend directly
            success, result = self._send_via_resend(to_email, subject, html)
            if success:
                print(f"✅ Email sent via Resend")
                print(f"📨 Email ID: {result['email_id']}")
                self.email_log.append(result)
                return result
            else:
                print(f"❌ Failed: {result.get('error')}")
                return result
    
    def get_email_template_welcome(self, user_name: str) -> str:
        """Get welcome email HTML template - Custom version with founder message"""
        name = user_name if user_name else "Valued Member"
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to SamKass Finance Manager</title>
            <style>
                * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }}
                .container {{ max-width: 650px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }}
                .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; color: white; }}
                .header h1 {{ font-size: 32px; font-weight: 700; margin-bottom: 10px; line-height: 1.2; }}
                .header p {{ font-size: 16px; opacity: 0.95; }}
                .content {{ padding: 40px 30px; }}
                .greeting {{ font-size: 16px; margin-bottom: 25px; color: #1e293b; }}
                .greeting strong {{ color: #10b981; }}
                .section {{ margin-bottom: 30px; }}
                .section-title {{ font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 15px; border-bottom: 2px solid #10b981; padding-bottom: 10px; }}
                .founder-message {{ background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 6px; }}
                .founder-message p {{ margin-bottom: 12px; color: #1e293b; line-height: 1.7; }}
                .founder-signature {{ font-style: italic; color: #64748b; margin-top: 15px; }}
                .steps {{ list-style: none; margin: 15px 0; }}
                .steps li {{ padding: 12px 0; padding-left: 30px; position: relative; color: #334155; line-height: 1.6; }}
                .steps li:before {{ content: '✓'; position: absolute; left: 0; color: #10b981; font-weight: bold; font-size: 20px; }}
                .features {{ list-style: none; margin: 15px 0; }}
                .features li {{ padding: 10px 0; padding-left: 30px; position: relative; color: #334155; }}
                .features li:before {{ content: '•'; position: absolute; left: 0; color: #10b981; font-weight: bold; font-size: 20px; }}
                .cta-button {{ display: inline-block; background-color: #10b981; color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; text-align: center; transition: background-color 0.3s; }}
                .cta-button:hover {{ background-color: #059669; }}
                .divider {{ border-top: 1px solid #e2e8f0; margin: 25px 0; }}
                .contact-section {{ background-color: #f8fafc; padding: 20px; border-radius: 6px; }}
                .contact-section p {{ margin: 8px 0; color: #334155; }}
                .contact-link {{ color: #10b981; text-decoration: none; font-weight: 600; }}
                .footer {{ background-color: #f8fafc; padding: 25px 30px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }}
                .footer p {{ margin: 5px 0; }}
                .footer-links {{ margin-top: 15px; }}
                .footer-links a {{ color: #64748b; text-decoration: none; margin: 0 10px; }}
                .pricing-box {{ background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%); border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                .pricing-option {{ margin-bottom: 12px; padding: 10px; background: white; border-radius: 4px; }}
                .price-name {{ font-weight: 600; color: #0f172a; }}
                .price-value {{ color: #10b981; font-size: 18px; font-weight: 700; }}
                .separator {{ height: 2px; background: linear-gradient(to right, transparent, #10b981, transparent); margin: 15px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to SamKass Finance Manager</h1>
                    <p>Your Smart Loan Manager is Ready!</p>
                </div>
                
                <div class="content">
                    <p class="greeting">Hi <strong>{name}</strong>,</p>
                    
                    <!-- Founder Message Section -->
                    <div class="section">
                        <div class="section-title">A Word From The Founder</div>
                        <div class="founder-message">
                            <p>Hi, I'm <strong>Mohanakannan S</strong> — the founder of SamKass.</p>
                            <p>I built SamKass because I saw a real problem. Thousands of small-scale financiers across India are still managing their entire loan business in paper notebooks, Excel sheets, and WhatsApp chats. Missed EMIs, lost records, manual reminders — it was costing them time, money, and trust.</p>
                            <p>So I built <strong>SamKass Finance Manager</strong> — a smart, offline-first app designed specifically for small financiers like you. No complicated software. No expensive subscriptions to start. Just a clean, simple tool that works even without internet, right from your phone.</p>
                            <p>Every feature in SamKass was built with one goal in mind: to make your daily loan management effortless, organized, and secure.</p>
                            <p>Thank you for trusting SamKass. This is just the beginning — and I'm excited to be part of your journey.</p>
                            <p class="founder-signature">— Mohanakannan S<br>Founder, SamKass | samkass.site</p>
                        </div>
                    </div>
                    
                    <div class="separator"></div>
                    
                    <!-- Welcome Message -->
                    <div class="section">
                        <p style="font-size: 16px; color: #1e293b; line-height: 1.8; margin-bottom: 15px;">
                            You've just taken the smartest step toward managing your loans, clients, and collections — the digital way.
                        </p>
                        <p style="color: #64748b; font-size: 14px;">
                            <strong>No more notebooks.</strong> No more Excel sheets. <strong>No more missed EMIs.</strong><br>
                            SamKass is now your all-in-one finance management system.
                        </p>
                    </div>
                    
                    <!-- Getting Started -->
                    <div class="section">
                        <div class="section-title">Get Started in 3 Simple Steps</div>
                        <ul class="steps">
                            <li><strong>Add Your First Client</strong> — Go to Clients → Add Client → Enter name, phone, and ID details</li>
                            <li><strong>Create a Loan</strong> — Go to Loans → New Loan → Choose your interest type and set the EMI schedule</li>
                            <li><strong>Record Payments</strong> — Collect payments, auto-generate PDF receipts, and share them on WhatsApp</li>
                        </ul>
                        <p style="color: #10b981; font-weight: 600; margin-top: 15px;">That's it — your business is now running on SamKass.</p>
                    </div>
                    
                    <!-- Features -->
                    <div class="section">
                        <div class="section-title">What You Can Do With SamKass</div>
                        <ul class="features">
                            <li>Manage unlimited client profiles with full contact & ID details</li>
                            <li>Create loans with flexible interest — percentage, fixed, or custom</li>
                            <li>Track monthly & weekly EMI collections in one dashboard</li>
                            <li>Generate & share payment receipts via WhatsApp in one tap</li>
                            <li>View reports — outstanding balances, collection history & more</li>
                            <li>Ask the AI Assistant anything about your loans or clients</li>
                            <li>PIN-protected security with OTP-based account recovery</li>
                            <li>Works OFFLINE — no internet needed for daily operations</li>
                        </ul>
                    </div>
                    
                    <!-- Install PWA -->
                    <div class="section" style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #dcfce7;">
                        <div class="section-title" style="border-bottom: 2px solid #22c55e;">Install SamKass On Your Phone</div>
                        <p style="color: #1e293b; margin-bottom: 12px;">SamKass is a Progressive Web App (PWA) — install it on your home screen for instant access, just like a native app.</p>
                        <ul class="features">
                            <li><strong>On Android:</strong> Open samkass.site in Chrome → tap menu → "Add to Home Screen"</li>
                            <li><strong>On iOS:</strong> Open samkass.site in Safari → tap Share → "Add to Home Screen"</li>
                        </ul>
                        <p style="color: #64748b; font-size: 13px; margin-top: 12px;"><em>It's fast, offline-ready, and always available.</em></p>
                    </div>
                    
                    <!-- Pricing Section -->
                    <div class="section">
                        <div class="section-title">Your Free Plan Includes</div>
                        <ul class="features">
                            <li>Up to 20 clients</li>
                            <li>Full loan creation & EMI tracking</li>
                            <li>Payment recording & receipt generation</li>
                            <li>AI Assistant & built-in calculator</li>
                            <li>Offline access</li>
                        </ul>
                        <div class="separator"></div>
                        <p style="font-weight: 600; color: #0f172a; margin-bottom: 15px;">Want unlimited clients and full premium access?</p>
                        <div class="pricing-box">
                            <div class="pricing-option">
                                <span class="price-name">Monthly</span> → <span class="price-value">₹270</span> (30 days)
                            </div>
                            <div class="pricing-option">
                                <span class="price-name">Quarterly</span> → <span class="price-value">₹850</span> (90 days) — Save ₹60
                            </div>
                            <div class="pricing-option">
                                <span class="price-name">Yearly</span> → <span class="price-value">₹1,999</span> (365 days) — Save ₹1,241
                            </div>
                            <p style="text-align: center; color: #10b981; font-weight: 600; margin-top: 15px;">Best Value →</p>
                        </div>
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="https://www.samkass.site/upgrade" class="cta-button">UPGRADE NOW</a>
                        </div>
                    </div>
                    
                    <!-- Security -->
                    <div class="section" style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                        <div class="section-title" style="border-bottom: 2px solid #f59e0b; color: #92400e;">Your Account is Secure</div>
                        <p style="color: #92400e; margin-bottom: 10px;">Your data is protected with:</p>
                        <ul class="features" style="color: #92400e;">
                            <li>PIN-lock access on every session</li>
                            <li>Bcrypt password hashing</li>
                            <li>JWT-secured authentication</li>
                            <li>OTP email verification</li>
                            <li>Automatic Supabase cloud backups</li>
                        </ul>
                        <p style="color: #92400e; font-weight: 600; margin-top: 15px;"><strong>We never sell your data. Ever.</strong></p>
                    </div>
                    
                    <!-- Support -->
                    <div class="section">
                        <div class="section-title">Need Help?</div>
                        <p style="color: #1e293b; margin-bottom: 15px;">We're always here for you.</p>
                        <div class="contact-section">
                            <p>📧 <a href="mailto:samkassfinance@gmail.com" class="contact-link">samkassfinance@gmail.com</a></p>
                            <p>💬 <a href="https://wa.me/917904987242" class="contact-link">+91 7904987242</a> (WhatsApp)</p>
                            <p>📱 <a href="https://instagram.com/samkassfinance" class="contact-link">@samkassfinance</a> (Instagram)</p>
                            <p>🌐 <a href="https://www.samkass.site" class="contact-link">samkass.site</a></p>
                        </div>
                        <p style="color: #64748b; font-size: 14px; margin-top: 15px;">Or use the built-in Help & FAQ section right inside the app.</p>
                    </div>
                    
                    <div class="separator"></div>
                    
                    <p style="text-align: center; color: #64748b; font-size: 15px; line-height: 1.8;">
                        Built with passion for every small financier in India who deserves a smarter, simpler way to run their business.<br>
                        <strong style="color: #1e293b;">Let's grow together.</strong>
                    </p>
                    
                    <p style="text-align: center; margin-top: 20px; color: #10b981; font-weight: 600;">
                        Warm regards,<br>
                        Mohanakannan S<br>
                        Founder, SamKass Finance Manager<br>
                        samkass.site
                    </p>
                </div>
                
                <div class="footer">
                    <p>© 2026 SamKass. All rights reserved.</p>
                    <p style="margin-top: 10px;">You received this email because you signed up at samkass.site</p>
                    <div class="footer-links">
                        <a href="https://www.samkass.site/privacy">Privacy Policy</a> | 
                        <a href="https://www.samkass.site/terms">Terms of Service</a> | 
                        <a href="https://www.samkass.site">Visit Website</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
    
    def get_email_template_otp(self, otp_code: str, purpose: str = "reset") -> str:
        """Get OTP email HTML template"""
        title = "Password Reset" if purpose == "password" else "Security PIN Reset"
        emoji = "🔐" if purpose == "pin" else "🔒"
        
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{title} - SamKass</title>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }}
                .container {{ max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }}
                .header {{ background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; color: white; }}
                .header h1 {{ margin: 0; font-size: 28px; font-weight: 600; }}
                .header p {{ margin: 8px 0 0 0; font-size: 16px; opacity: 0.9; }}
                .content {{ padding: 30px; color: #1e293b; }}
                .otp-box {{ background-color: #f1f5f9; border: 2px dashed #cbd5e1; color: #334155; padding: 20px; font-size: 36px; font-weight: bold; letter-spacing: 6px; border-radius: 8px; text-align: center; margin: 30px 0; font-family: 'Courier New', monospace; }}
                .warning {{ background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; color: #92400e; font-size: 14px; }}
                .footer {{ background-color: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; }}
                .footer p {{ margin: 5px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{emoji} {title} Request</h1>
                    <p>Your verification code</p>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>We received a request to reset your SamKass account {purpose.lower()}. Use the verification code below to proceed:</p>
                    
                    <div class="otp-box">{otp_code}</div>
                    
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>This OTP will expire in 10 minutes</li>
                            <li>Never share this code with anyone</li>
                            <li>SamKass team will never ask for your OTP</li>
                        </ul>
                    </div>
                    
                    <p style="color: #64748b; font-size: 14px;">If you did not request this, you can safely ignore this email. Your account remains secure.</p>
                </div>
                <div class="footer">
                    <p>This is an automated security email. Please do not reply directly.</p>
                    <p style="margin-top: 15px; font-weight: 600;">— The SamKass Security Team</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def send_welcome_email(self, user_email: str, user_name: str = "") -> Dict:
        """Send welcome email to new user"""
        subject = "🚀 Welcome to SamKass! Your Finance Manager is Ready"
        html = self.get_email_template_welcome(user_name)
        return self.send_email(user_email, subject, html)
    
    def send_password_reset_otp(self, user_email: str, otp_code: str) -> Dict:
        """Send password reset OTP email"""
        subject = "🔒 Your Password Reset Code - SamKass"
        html = self.get_email_template_otp(otp_code, purpose="password")
        return self.send_email(user_email, subject, html)
    
    def send_pin_reset_otp(self, user_email: str, otp_code: str) -> Dict:
        """Send PIN reset OTP email"""
        subject = "🔐 Your Security PIN Reset Code - SamKass"
        html = self.get_email_template_otp(otp_code, purpose="pin")
        return self.send_email(user_email, subject, html)
    
    def get_email_log(self) -> list:
        """Get log of all sent emails"""
        return self.email_log
    
    def print_email_log_summary(self) -> None:
        """Print summary of email sending"""
        print("\n" + "="*80)
        print("📧 EMAIL SERVICE LOG")
        print("="*80)
        
        if not self.email_log:
            print("No emails sent yet.")
            return
        
        success_count = sum(1 for e in self.email_log if e.get("success"))
        
        print(f"\n📊 Summary:")
        print(f"   Total emails: {len(self.email_log)}")
        print(f"   Successful: {success_count}")
        print(f"   Failed: {len(self.email_log) - success_count}")
        
        print(f"\n📋 Details:")
        for i, email in enumerate(self.email_log, 1):
            print(f"\n   {i}. {email.get('to')}")
            print(f"      Provider: {email.get('provider', 'unknown')}")
            print(f"      ID: {email.get('email_id', 'N/A')}")
            print(f"      Time: {email.get('timestamp', 'N/A')}")
        
        print("\n" + "="*80)


# Global instance
email_service_advanced = AdvancedEmailService()


# ============================================================================
# TEST FUNCTIONS
# ============================================================================

def test_send_welcome_email():
    """Test welcome email"""
    print("\n" + "="*80)
    print("🧪 TEST 1: WELCOME EMAIL")
    print("="*80)
    
    result = email_service_advanced.send_welcome_email(
        user_email="mohaneni80@gmail.com",
        user_name="Mohanakannan S"
    )
    
    print(f"Result: {result}")
    return result.get("success", False)


def test_send_password_otp():
    """Test password reset OTP email"""
    print("\n" + "="*80)
    print("🧪 TEST 2: PASSWORD RESET OTP")
    print("="*80)
    
    result = email_service_advanced.send_password_reset_otp(
        user_email="mohaneni80@gmail.com",
        otp_code="123456"
    )
    
    print(f"Result: {result}")
    return result.get("success", False)


def test_send_pin_otp():
    """Test PIN reset OTP email"""
    print("\n" + "="*80)
    print("🧪 TEST 3: PIN RESET OTP")
    print("="*80)
    
    result = email_service_advanced.send_pin_reset_otp(
        user_email="mohaneni80@gmail.com",
        otp_code="654321"
    )
    
    print(f"Result: {result}")
    return result.get("success", False)


if __name__ == "__main__":
    print("\n" + "="*80)
    print("🔧 ADVANCED EMAIL SERVICE - TESTING")
    print("="*80)
    
    print("\n📋 Configuration:")
    print(f"   Custom Domain: {email_service_advanced.custom_domain}")
    print(f"   From Email: {email_service_advanced.mail_from_email}")
    print(f"   Support Email: {email_service_advanced.mail_support_email}")
    print(f"   Resend Fallback: Enabled")
    print(f"   Region: {email_service_advanced.mail_region}")
    
    # Run tests
    test1 = test_send_welcome_email()
    test2 = test_send_password_otp()
    test3 = test_send_pin_otp()
    
    # Print summary
    email_service_advanced.print_email_log_summary()
    
    print("\n" + "="*80)
    print("📊 TEST RESULTS")
    print("="*80)
    print(f"Welcome Email: {'✅ PASSED' if test1 else '❌ FAILED'}")
    print(f"Password Reset OTP: {'✅ PASSED' if test2 else '❌ FAILED'}")
    print(f"PIN Reset OTP: {'✅ PASSED' if test3 else '❌ FAILED'}")
    print("="*80)
