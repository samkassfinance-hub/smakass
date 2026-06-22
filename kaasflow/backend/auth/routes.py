from flask import Blueprint, request, jsonify, make_response
from datetime import timedelta
import os
import sqlite3
import random
import datetime

from .google_oauth import verify_google_token
from .jwt_handler import create_access_token, create_refresh_token, decode_token
from .password_handler import hash_password, verify_password
from .magic_link import generate_magic_link_token, verify_magic_link_token
from .rate_limiter import check_rate_limit, record_failed_attempt, clear_attempts

# Import enhanced email service
try:
    from auth_email_service import email_service
    USE_NEW_EMAIL_SERVICE = True
except ImportError:
    USE_NEW_EMAIL_SERVICE = False
    email_service = None

auth_bp = Blueprint('pro_auth', __name__)

is_vercel = os.environ.get("VERCEL") == "1"
if is_vercel:
    DATABASE_PATH = "/tmp/users.db"
    original_db = os.path.join(os.path.dirname(__file__), '..', 'users.db')
    if not os.path.exists(DATABASE_PATH) and os.path.exists(original_db):
        import shutil
        try:
            shutil.copy2(original_db, DATABASE_PATH)
            print("Successfully copied users.db to /tmp")
        except Exception as e:
            print(f"Failed to copy users.db to /tmp: {e}")
else:
    DATABASE_PATH = os.path.join(os.path.dirname(__file__), '..', 'users.db')

def get_db_connection():
    db_dir = os.path.dirname(DATABASE_PATH)
    if db_dir and not os.path.exists(db_dir):
        try:
            os.makedirs(db_dir, exist_ok=True)
        except Exception as e:
            print(f"Failed to create database directory {db_dir}: {e}")
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_pro_auth_db():
    try:
        conn = get_db_connection()
        conn.execute('''
            CREATE TABLE IF NOT EXISTS pro_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT,
                google_id TEXT UNIQUE,
                full_name TEXT,
                profile_pic TEXT,
                app_pin TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        try:
            conn.execute('ALTER TABLE pro_users ADD COLUMN app_pin TEXT')
        except Exception:
            pass
        conn.commit()
        conn.close()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing auth database: {e}")

init_pro_auth_db()

def send_email(to_email, subject, body):
    """Send email using Resend API - Uses environment variable"""
    
    # Get API key from environment variable (must be set in Vercel dashboard)
    resend_api_key = os.environ.get('RESEND_API_KEY', '')
    
    if not resend_api_key or len(resend_api_key) < 30:
        print("=" * 70)
        print("❌ RESEND API KEY NOT CONFIGURED")
        print("=" * 70)
        print("📋 TO FIX THIS:")
        print("1. Go to https://resend.com/api-keys")
        print("2. Click on your 'samkass' API key to reveal it")
        print("3. Copy the COMPLETE key (starts with re_)")
        print("4. Update .env file or Vercel environment variables")
        print("5. The key should be much longer than 40 characters")
        print("=" * 70)
        
        # For testing: Extract and show OTP from email body
        if "OTP" in body or "otp" in body.lower():
            import re
            otp_match = re.search(r'\b\d{6}\b', body)
            if otp_match:
                print(f"🔢 OTP CODE for {to_email}: {otp_match.group()}")
                print("⚠️  User can see this OTP in backend logs for testing")
        print("=" * 70)
        return False
    
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {resend_api_key}",
        "Content-Type": "application/json"
    }
    
    # Try custom domain first, fallback to onboarding domain if it fails
    from_email = os.environ.get('RESEND_FROM_EMAIL', 'SamKass <onboarding@resend.dev>')
    
    payload = {
        "from": from_email,
        "to": [to_email],
        "subject": subject,
        "html": body
    }
    
    try:
        import requests
        print(f"📤 Sending email to {to_email} via Resend...")
        print(f"📧 From: {from_email}")
        print(f"🔑 API Key length: {len(resend_api_key)} chars")
        
        r = requests.post(url, json=payload, headers=headers, timeout=15)
        
        print(f"📊 Resend API Response Status: {r.status_code}")
        
        if r.status_code in [200, 201]:
            response_data = r.json()
            email_id = response_data.get('id', 'N/A')
            print(f"✅ Email sent successfully!")
            print(f"📨 Email ID: {email_id}")
            print(f"📬 Sent to: {to_email}")
            return True
        else:
            error_text = r.text
            print(f"❌ Resend API error ({r.status_code})")
            print(f"❌ Error response: {error_text}")
            
            try:
                error_json = r.json()
                error_message = error_json.get('message', 'Unknown error')
                print(f"❌ Error message: {error_message}")
                
                # Provide helpful troubleshooting
                if r.status_code == 401:
                    print("⚠️  Authentication failed - API key is invalid or incomplete")
                    print("💡 Get your COMPLETE API key from: https://resend.com/api-keys")
                    print("💡 The key should be 40+ characters long")
                elif r.status_code == 403:
                    print("⚠️  Access forbidden - check API key permissions")
                elif r.status_code == 422:
                    print("⚠️  Validation error - likely domain not verified")
                    print(f"💡 Current from_email: {from_email}")
                    
                    # Try fallback to onboarding domain if custom domain fails
                    if 'samkass.site' in from_email or 'welcome@' in from_email:
                        print("🔄 Retrying with onboarding domain...")
                        fallback_payload = payload.copy()
                        fallback_payload["from"] = "SamKass <onboarding@resend.dev>"
                        
                        r2 = requests.post(url, json=fallback_payload, headers=headers, timeout=15)
                        if r2.status_code in [200, 201]:
                            response_data = r2.json()
                            email_id = response_data.get('id', 'N/A')
                            print(f"✅ Email sent successfully with fallback domain!")
                            print(f"📨 Email ID: {email_id}")
                            return True
                        else:
                            print(f"❌ Fallback also failed: {r2.status_code} - {r2.text}")
                    
            except:
                pass
            
            # Still extract OTP for console logging
            if "OTP" in body or "otp" in body.lower():
                import re
                otp_match = re.search(r'\b\d{6}\b', body)
                if otp_match:
                    print(f"🔢 OTP CODE (for testing): {otp_match.group()}")
            
            return False
            
    except requests.exceptions.Timeout:
        print(f"❌ Request timeout - Resend API took too long to respond")
        return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection error - Could not reach Resend API")
        return False
    except Exception as e:
        print(f"❌ Unexpected error sending email: {e}")
        import traceback
        traceback.print_exc()
        return False

def send_welcome_email(email, name):
    name_str = name if name else "Valued Member"
    subject = "Welcome to SamKass! 🎉"
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
    return send_email(email, subject, body)

@auth_bp.route('/google', methods=['POST'])
def google_auth():
    token = request.json.get('token')
    if not token:
        return jsonify({'error': 'Token missing'}), 400
        
    id_info = verify_google_token(token)
    if not id_info:
        return jsonify({'error': 'Invalid Google token'}), 401
        
    email = id_info.get('email')
    google_id = id_info.get('sub')
    name = id_info.get('name')
    picture = id_info.get('picture')
    
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM pro_users WHERE email = ?', (email,)).fetchone()
    
    if not user:
        conn.execute('INSERT INTO pro_users (email, google_id, full_name, profile_pic) VALUES (?, ?, ?, ?)',
                     (email, google_id, name, picture))
        conn.commit()
        user = conn.execute('SELECT * FROM pro_users WHERE email = ?', (email,)).fetchone()
        try:
            send_welcome_email(email, name)
        except Exception as e:
            print(f"Error sending welcome email: {e}")
    elif not user['google_id']:
        conn.execute('UPDATE pro_users SET google_id = ?, full_name = ?, profile_pic = ? WHERE email = ?',
                     (google_id, name, picture, email))
        conn.commit()
        user = conn.execute('SELECT * FROM pro_users WHERE email = ?', (email,)).fetchone()
        
    conn.close()
    return create_auth_response(user)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('financier_name', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
        
    conn = get_db_connection()
    existing = conn.execute('SELECT id FROM pro_users WHERE email = ?', (email,)).fetchone()
    if existing:
        conn.close()
        return jsonify({'error': 'Email already registered'}), 409
        
    pw_hash = hash_password(password)
    conn.execute('INSERT INTO pro_users (email, password_hash, full_name) VALUES (?, ?, ?)',
                 (email, pw_hash, name))
    conn.commit()
    user = conn.execute('SELECT * FROM pro_users WHERE email = ?', (email,)).fetchone()
    conn.close()
    
    try:
        # Use new email service if available
        if USE_NEW_EMAIL_SERVICE and email_service:
            result = email_service.send_welcome_email(email, name)
            if result["success"]:
                print(f"✅ Welcome email sent to {email}")
            else:
                print(f"⚠️  Welcome email failed: {result.get('error')}")
        else:
            send_welcome_email(email, name)
    except Exception as e:
        print(f"Error sending welcome email: {e}")
        
    return create_auth_response(user)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    remember_me = data.get('remember_me', False)
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
        
    if not check_rate_limit(email):
        return jsonify({'error': 'Too many failed attempts. Please try again later.'}), 429
        
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM pro_users WHERE email = ?', (email,)).fetchone()
    conn.close()
    
    if user and user['password_hash'] and verify_password(password, user['password_hash']):
        clear_attempts(email)
        expiry = timedelta(days=30) if remember_me else timedelta(minutes=15)
        return create_auth_response(user, access_expiry=expiry)
    else:
        record_failed_attempt(email)
        return jsonify({'error': 'Invalid email or password'}), 401

# ── FORGOT PASSWORD FLOW (OTP-based) ────────────────────────────────────────
password_reset_otps = {}

@auth_bp.route('/forgot-password/send-otp', methods=['POST'])
def forgot_password_send_otp():
    email = request.json.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400
        
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM pro_users WHERE email = ?', (email,)).fetchone()
    conn.close()
    
    if not user:
        return jsonify({'success': True, 'message': 'If this email is registered, you will receive an OTP'})
    
    otp = str(random.randint(100000, 999999))
    password_reset_otps[email] = {
        'otp': otp,
        'expires_at': datetime.datetime.now() + datetime.timedelta(minutes=10)
    }
    
    subject = "Reset your SamKass Password 🔒"
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
    
    email_sent = send_email(email, subject, body)
    
    # Always return success to user (security best practice)
    return jsonify({'success': True, 'message': 'OTP sent to your email. Check your inbox and spam folder.'})

@auth_bp.route('/forgot-password/verify-otp', methods=['POST'])
def forgot_password_verify_otp():
    email = request.json.get('email')
    user_otp = request.json.get('otp')
    
    if not email or not user_otp:
        return jsonify({'error': 'Email and OTP required'}), 400
        
    stored_data = password_reset_otps.get(email)
    
    if not stored_data:
        return jsonify({'error': 'No OTP request found for this email'}), 404
        
    if datetime.datetime.now() > stored_data['expires_at']:
        del password_reset_otps[email]
        return jsonify({'error': 'OTP has expired'}), 400
        
    if stored_data['otp'] != str(user_otp).strip():
        return jsonify({'error': 'Invalid OTP'}), 400
        
    reset_token = generate_magic_link_token(email)
    del password_reset_otps[email]
    
    return jsonify({
        'success': True, 
        'message': 'OTP verified successfully',
        'reset_token': reset_token
    })

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    reset_token = request.json.get('reset_token')
    new_password = request.json.get('new_password')
    
    if not reset_token or not new_password:
        return jsonify({'error': 'Reset token and new password required'}), 400
        
    email = verify_magic_link_token(reset_token)
    if not email:
        return jsonify({'error': 'Invalid or expired reset token'}), 401
        
    pw_hash = hash_password(new_password)
    
    try:
        conn = get_db_connection()
        conn.execute('UPDATE pro_users SET password_hash = ? WHERE email = ?', (pw_hash, email))
        conn.commit()
        user = conn.execute('SELECT * FROM pro_users WHERE email = ?', (email,)).fetchone()
        conn.close()
        return create_auth_response(user)
    except Exception as e:
        print(f"Error resetting password: {e}")
        return jsonify({'error': 'Failed to reset password'}), 500

# ── FORGOT SECURITY PIN FLOW ────────────────────────────────────────
pin_reset_otps = {}

@auth_bp.route('/forgot-pin/send-otp', methods=['POST'])
def send_forgot_pin_otp():
    email = request.json.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400
        
    otp = str(random.randint(100000, 999999))
    pin_reset_otps[email] = {
        'otp': otp,
        'expires_at': datetime.datetime.now() + datetime.timedelta(minutes=10)
    }
    
    # Try to send OTP email using new service first
    if USE_NEW_EMAIL_SERVICE and email_service:
        result = email_service.send_otp_email(email, otp)
        if result["success"]:
            print(f"✅ OTP email sent to {email} (Email ID: {result['email_id']})")
        else:
            print(f"⚠️  OTP email failed: {result.get('error')}")
    else:
        # Fallback to old email method
        subject = "Reset your SamKass Security PIN 🔒"
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
        
        email_sent = send_email(email, subject, body)
    
    # Always return success (security best practice)
    return jsonify({'success': True, 'message': 'OTP sent to your email. Check your inbox and spam folder.'})

@auth_bp.route('/forgot-pin/verify-otp', methods=['POST'])
def verify_forgot_pin_otp():
    email = request.json.get('email')
    user_otp = request.json.get('otp')
    
    if not email or not user_otp:
        return jsonify({'error': 'Email and OTP required'}), 400
        
    stored_data = pin_reset_otps.get(email)
    
    if not stored_data:
        return jsonify({'error': 'No OTP request found for this email'}), 404
        
    if datetime.datetime.now() > stored_data['expires_at']:
        del pin_reset_otps[email]
        return jsonify({'error': 'OTP has expired'}), 400
        
    if stored_data['otp'] != str(user_otp).strip():
        return jsonify({'error': 'Invalid OTP'}), 400
        
    del pin_reset_otps[email]
    return jsonify({'success': True, 'message': 'OTP verified successfully'})

@auth_bp.route('/set-pin', methods=['POST'])
def set_pin():
    data = request.json
    email = data.get('email')
    pin = data.get('pin')
    if not email or not pin:
        return jsonify({'error': 'Email and pin required'}), 400
        
    try:
        conn = get_db_connection()
        conn.execute('UPDATE pro_users SET app_pin = ? WHERE email = ?', (pin, email))
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error saving pin: {e}")
        return jsonify({'error': 'Failed to save PIN'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    response = jsonify({'message': 'Logged out successfully'})
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    return response

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    refresh_token = request.cookies.get('refresh_token')
    if not refresh_token:
        return jsonify({'error': 'Refresh token missing'}), 401
        
    payload = decode_token(refresh_token, is_refresh=True)
    if not payload:
        return jsonify({'error': 'Invalid refresh token'}), 401
        
    new_access_token = create_access_token({"sub": payload['sub'], "id": payload['id']})
    response = jsonify({'message': 'Token refreshed'})
    response.set_cookie('access_token', new_access_token, httponly=True, secure=True, samesite='Strict')
    return response

import uuid

def get_uuid_for_email(email):
    return str(uuid.uuid5(uuid.NAMESPACE_URL, email))

def create_auth_response(user, access_expiry=None):
    user_uuid = get_uuid_for_email(user['email'])
    access_token = create_access_token({"sub": user['email'], "id": user_uuid}, expires_delta=access_expiry)
    refresh_token = create_refresh_token({"sub": user['email'], "id": user_uuid})
    
    response_user = {
        'email': user['email'],
        'name': user['full_name'],
        'picture': user['profile_pic']
    }
    
    if 'app_pin' in user.keys() and user['app_pin']:
        response_user['appPin'] = user['app_pin']
    
    response = jsonify({
        'success': True,
        'token': access_token,
        'user': response_user
    })
    
    response.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='Strict')
    response.set_cookie('refresh_token', refresh_token, httponly=True, secure=True, samesite='Strict')
    
    return response
