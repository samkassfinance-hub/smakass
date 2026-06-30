"""
Enhanced Email Service for SamKass
Handles Resend API integration with fallback options
"""

import os
import requests
import re
from datetime import datetime

# ============================================================================
# EMAIL CONFIGURATION
# ============================================================================

def get_resend_config():
    """Get Resend configuration from environment"""
    api_key = os.environ.get('RESEND_API_KEY', '').strip()
    from_email = os.environ.get('RESEND_FROM_EMAIL', 'SamKass <onboarding@resend.dev>')
    
    return {
        'api_key': api_key,
        'from_email': from_email,
        'url': 'https://api.resend.com/emails'
    }

# ============================================================================
# EMAIL SENDING
# ============================================================================

def send_email_via_resend(to_email, subject, body, config=None):
    """
    Send email using Resend API
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        body: Email HTML body
        config: Configuration dict (uses env if None)
    
    Returns:
        dict: {'success': bool, 'email_id': str, 'error': str}
    """
    
    if config is None:
        config = get_resend_config()
    
    api_key = config.get('api_key', '')
    from_email = config.get('from_email', 'SamKass <onboarding@resend.dev>')
    url = config.get('url', 'https://api.resend.com/emails')
    
    # =========================================================================
    # VALIDATE API KEY
    # =========================================================================
    
    if not api_key:
        return {
            'success': False,
            'email_id': None,
            'error': 'RESEND_API_KEY not set in environment'
        }
    
    # Accept keys with 11+ characters (handles both full and partial keys)
    if len(api_key) < 11 or not api_key.startswith('re_'):
        return {
            'success': False,
            'email_id': None,
            'error': f'Invalid API key format (got {len(api_key)} chars, expected 11+)'
        }
    
    # =========================================================================
    # PREPARE REQUEST
    # =========================================================================
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'from': from_email,
        'to': [to_email],
        'subject': subject,
        'html': body
    }
    
    # =========================================================================
    # SEND EMAIL
    # =========================================================================
    
    try:
        print(f"\n📤 Sending email to: {to_email}")
        print(f"📧 Subject: {subject}")
        print(f"🔐 Using API key: {api_key[:10]}...{api_key[-4:] if len(api_key) > 14 else ''}")
        
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        
        print(f"📊 Response Status: {response.status_code}")
        
        # =====================================================================
        # SUCCESS (200, 201)
        # =====================================================================
        
        if response.status_code in [200, 201]:
            response_data = response.json()
            email_id = response_data.get('id', 'unknown')
            
            print(f"✅ EMAIL SENT SUCCESSFULLY!")
            print(f"📨 Email ID: {email_id}")
            print(f"📬 To: {to_email}")
            
            return {
                'success': True,
                'email_id': email_id,
                'error': None,
                'timestamp': datetime.now().isoformat()
            }
        
        # =====================================================================
        # ERROR RESPONSES
        # =====================================================================
        
        else:
            error_data = response.json() if response.text else {'error': 'No response body'}
            error_message = error_data.get('message', str(error_data))
            
            print(f"❌ FAILED TO SEND EMAIL")
            print(f"❌ Status: {response.status_code}")
            print(f"❌ Error: {error_message}")
            
            # Specific error handling
            if response.status_code == 401:
                print("⚠️  Authentication failed - API key may be invalid or expired")
                
                # Try fallback domain if custom domain fails
                if 'samkass' in from_email or 'welcome@' in from_email:
                    print("🔄 Retrying with fallback domain...")
                    fallback_config = config.copy()
                    fallback_config['from_email'] = 'SamKass <onboarding@resend.dev>'
                    return send_email_via_resend(to_email, subject, body, fallback_config)
            
            elif response.status_code == 422:
                print("⚠️  Validation error - check email address or sender domain")
            
            elif response.status_code == 429:
                print("⚠️  Rate limited - too many emails sent recently")
            
            return {
                'success': False,
                'email_id': None,
                'error': f"Status {response.status_code}: {error_message}",
                'timestamp': datetime.now().isoformat()
            }
    
    except requests.exceptions.Timeout:
        error = 'Request timeout - Resend API took too long'
        print(f"❌ {error}")
        return {'success': False, 'email_id': None, 'error': error}
    
    except requests.exceptions.ConnectionError:
        error = 'Connection error - Could not reach Resend API'
        print(f"❌ {error}")
        return {'success': False, 'email_id': None, 'error': error}
    
    except Exception as e:
        error = f'Unexpected error: {str(e)}'
        print(f"❌ {error}")
        import traceback
        traceback.print_exc()
        return {'success': False, 'email_id': None, 'error': error}

# ============================================================================
# EMAIL TEMPLATES
# ============================================================================

def send_welcome_email(email, name):
    """Send welcome email to new user"""
    name_str = name if name else 'Valued Member'
    
    subject = 'Welcome to SamKass! 🎉'
    
    body = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #10b981; margin: 0; font-size: 28px;">Welcome to SamKass! 🚀</h1>
            <p style="color: #64748b; font-size: 16px; margin-top: 8px;">Your Finance & Loan Management Workspace is Ready</p>
        </div>
        <p>Hello <strong>{name_str}</strong>,</p>
        <p>Thank you for registering at SamKass! We're excited to help you manage your ledgers, client profiles, interest tracking, and payments seamlessly.</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="margin-top: 0; color: #0f172a;">Getting Started Tips:</h3>
            <ul style="padding-left: 20px; margin-bottom: 0;">
                <li>Add your first client under the <strong>Clients</strong> tab.</li>
                <li>Create a loan ledger to track payments and interest automatically.</li>
                <li>Go to <strong>Settings</strong> to customize your app preferences.</li>
            </ul>
        </div>
        <p>If you ever need help or have any suggestions, feel free to reach out to us!</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 0;">
            This is an automated welcome email. Welcome aboard!<br>
            <strong>— The SamKass Team</strong>
        </p>
    </div>
    """
    
    return send_email_via_resend(email, subject, body)

def send_otp_email(email, otp):
    """Send OTP code for password reset"""
    
    subject = 'Reset your SamKass Password 🔒'
    
    body = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #10b981; margin: 0; font-size: 28px;">Password Reset Request</h1>
            <p style="color: #64748b; font-size: 16px; margin-top: 8px;">Your verification code</p>
        </div>
        <p>Hello,</p>
        <p>We received a request to reset your SamKass account password. Use the OTP below to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; color: #334155; padding: 15px; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; display: inline-block;">
                {otp}
            </div>
        </div>
        <p style="font-size: 14px; color: #64748b;">This OTP will expire in 10 minutes. If you did not request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 0;">
            <strong>— The SamKass Team</strong>
        </p>
    </div>
    """
    
    return send_email_via_resend(email, subject, body)

def send_pin_reset_email(email, otp):
    """Send OTP code for security PIN reset"""
    
    subject = 'Reset your SamKass Security PIN 🔒'
    
    body = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #10b981; margin: 0; font-size: 28px;">Security PIN Reset</h1>
            <p style="color: #64748b; font-size: 16px; margin-top: 8px;">Your verification code</p>
        </div>
        <p>Hello,</p>
        <p>We received a request to reset the Security PIN for your SamKass account. Use the OTP below to proceed with the reset:</p>
        <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; color: #334155; padding: 15px; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; display: inline-block;">
                {otp}
            </div>
        </div>
        <p style="font-size: 14px; color: #64748b;">This OTP will expire in 10 minutes. If you did not request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 0;">
            <strong>— The SamKass Team</strong>
        </p>
    </div>
    """
    
    return send_email_via_resend(email, subject, body)

# ============================================================================
# TEST
# ============================================================================

if __name__ == '__main__':
    # Test email sending
    config = get_resend_config()
    print(f"Config: {config}")
    
    result = send_welcome_email('test@example.com', 'Test User')
    print(f"\nResult: {result}")
