from flask import Blueprint, request, jsonify, make_response
from datetime import timedelta
import os
import sqlite3
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from .google_oauth import verify_google_token
from .jwt_handler import create_access_token, create_refresh_token, decode_token
from .password_handler import hash_password, verify_password
from .magic_link import generate_magic_link_token, verify_magic_link_token
from .rate_limiter import check_rate_limit, record_failed_attempt, clear_attempts

auth_bp = Blueprint('pro_auth', __name__)

is_vercel = os.environ.get("VERCEL") == "1"
if is_vercel:
    DATABASE_PATH = "/tmp/users.db"
    # Copy starting users.db to /tmp if it doesn't exist
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
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing auth database: {e}")

# Initialize the new table
init_pro_auth_db()

def send_email(to_email, subject, body):
    resend_api_key = os.environ.get('RESEND_API_KEY')
    
    # Try sending with Resend first if API key is present
    if resend_api_key:
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {resend_api_key}",
            "Content-Type": "application/json"
        }
        # Use verified from email if defined, otherwise fall back to Resend's default sandbox domain
        from_email = os.environ.get('RESEND_FROM_EMAIL', 'KaasFlow <onboarding@resend.dev>')
        payload = {
            "from": from_email,
            "to": [to_email],
            "subject": subject,
            "html": body
        }
        try:
            import requests
            r = requests.post(url, json=payload, headers=headers, timeout=10)
            if r.status_code in [200, 201]:
                print(f"Email sent successfully via Resend to {to_email}")
                return True
            else:
                print(f"Resend API error ({r.status_code}): {r.text}")
        except Exception as e:
            print(f"Failed to send email via Resend: {e}")

    # Fallback to SMTP
    smtp_host = os.environ.get('SMTP_HOST')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_pass = os.environ.get('SMTP_PASS')
    
    if not all([smtp_host, smtp_user, smtp_pass]):
        print(f"SMTP not configured. Email to {to_email} would have been: {body}")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))
        
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

def send_welcome_email(email, name):
    name_str = name if name else "Valued Member"
    subject = "Welcome to KaasFlow! 🎉"
    body = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #10b981; margin: 0; font-size: 28px;">Welcome to KaasFlow! 🚀</h1>
            <p style="color: #64748b; font-size: 16px; margin-top: 8px;">Your Finance & Loan Management Workspace is Ready</p>
        </div>
        <p>Hello <strong>{name_str}</strong>,</p>
        <p>Thank you for registering at KaasFlow! We're excited to help you manage your ledgers, client profiles, interest tracking, and payments seamlessly.</p>
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
            <strong>— The KaasFlow Team</strong>
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
            print(f"Error sending welcome email to new Google user: {e}")
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
    business = data.get('business_name', '')
    
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
        send_welcome_email(email, name)
    except Exception as e:
        print(f"Error sending welcome email to newly registered email user: {e}")
        
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

@auth_bp.route('/magic-link/request', methods=['POST'])
def magic_link_request():
    email = request.json.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400
        
    token = generate_magic_link_token(email)
    # In production, use your actual domain
    base_url = request.host_url.rstrip('/')
    magic_link = f"{base_url}/auth/magic-link/verify?token={token}"
    
    subject = "Reset your KaasFlow Password 🔒"
    body = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #10b981; margin: 0; font-size: 28px;">Password Reset Request</h1>
            <p style="color: #64748b; font-size: 16px; margin-top: 8px;">Retrieve access to your KaasFlow Account</p>
        </div>
        <p>Hello,</p>
        <p>We received a request to log in and reset the password for your KaasFlow account. Click the button below to sign in automatically and secure your account:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{magic_link}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">Reset Password & Sign In</a>
        </div>
        <p style="font-size: 14px; color: #64748b;">This link will expire in 15 minutes. If you did not request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 0;">
            <strong>— The KaasFlow Team</strong>
        </p>
    </div>
    """
    if send_email(email, subject, body):
        return jsonify({'success': True, 'message': 'Password reset link sent to your email'})
    else:
        is_local = any(local in request.host_url for local in ['localhost', '127.0.0.1', '5500'])
        if is_local:
            return jsonify({
                'success': False,
                'message': 'Email service not configured. For development, here is your link:',
                'link': magic_link
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Email service is currently unavailable. Please verify configuration or try again later.'
            }), 500


@auth_bp.route('/magic-link/verify', methods=['GET'])
def magic_link_verify():
    token = request.args.get('token')
    if not token:
        return "Missing token", 400
        
    email = verify_magic_link_token(token)
    if not email:
        return "Invalid or expired magic link", 401
        
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM pro_users WHERE email = ?', (email,)).fetchone()
    if not user:
        conn.execute('INSERT INTO pro_users (email) VALUES (?)', (email,))
        conn.commit()
        user = conn.execute('SELECT * FROM pro_users WHERE email = ?', (email,)).fetchone()
    conn.close()
    
    access_token = create_access_token({"sub": user['email'], "id": user['id']})
    refresh_token = create_refresh_token({"sub": user['email'], "id": user['id']})
    
    import urllib.parse
    redirect_url = f"/?token={access_token}&email={urllib.parse.quote(user['email'])}"
    
    # For magic link, we redirect to the frontend root with cookies and token params
    response = make_response("Redirecting...", 302)
    response.headers['Location'] = redirect_url
    
    response.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='Strict')
    response.set_cookie('refresh_token', refresh_token, httponly=True, secure=True, samesite='Strict')
    
    return response

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
        
    # Create new access token
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
    
    response = jsonify({
        'success': True,
        'token': access_token,
        'user': {
            'email': user['email'],
            'name': user['full_name'],
            'picture': user['profile_pic']
        }
    })
    
    # Set cookies
    response.set_cookie('access_token', access_token, httponly=True, secure=True, samesite='Strict')
    response.set_cookie('refresh_token', refresh_token, httponly=True, secure=True, samesite='Strict')
    
    return response

# ── FORGOT SECURITY PIN FLOW ────────────────────────────────────────

# In-memory store for PIN reset OTPs (email -> {'otp': '123456', 'expires_at': datetime})
pin_reset_otps = {}

@auth_bp.route('/forgot-pin/send-otp', methods=['POST'])
def send_forgot_pin_otp():
    email = request.json.get('email')
    if not email:
        return jsonify({'error': 'Email required'}), 400
        
    # Generate 6-digit OTP
    import random, datetime
    otp = str(random.randint(100000, 999999))
    
    # Store OTP with 10-minute expiration
    pin_reset_otps[email] = {
        'otp': otp,
        'expires_at': datetime.datetime.now() + datetime.timedelta(minutes=10)
    }
    
    subject = "Reset your KaasFlow Security PIN 🔒"
    body = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #10b981; margin: 0; font-size: 28px;">Security PIN Reset</h1>
            <p style="color: #64748b; font-size: 16px; margin-top: 8px;">Your verification code</p>
        </div>
        <p>Hello,</p>
        <p>We received a request to reset the Security PIN for your KaasFlow account. Use the OTP below to proceed with the reset:</p>
        <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; color: #334155; padding: 15px; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; display: inline-block;">
                {otp}
            </div>
        </div>
        <p style="font-size: 14px; color: #64748b;">This OTP will expire in 10 minutes. If you did not request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="font-size: 14px; color: #64748b; text-align: center; margin-bottom: 0;">
            <strong>— The KaasFlow Team</strong>
        </p>
    </div>
    """
    
    if send_email(email, subject, body):
        return jsonify({'success': True, 'message': 'OTP sent to your email'})
    else:
        is_local = any(local in request.host_url for local in ['localhost', '127.0.0.1', '5500'])
        if is_local:
            return jsonify({
                'success': True,
                'message': 'Email service not configured. For development, here is your OTP:',
                'otp': otp
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to send OTP email. Please try again later.'
            }), 500

@auth_bp.route('/forgot-pin/verify-otp', methods=['POST'])
def verify_forgot_pin_otp():
    email = request.json.get('email')
    user_otp = request.json.get('otp')
    
    if not email or not user_otp:
        return jsonify({'error': 'Email and OTP required'}), 400
        
    stored_data = pin_reset_otps.get(email)
    
    import datetime
    if not stored_data:
        return jsonify({'error': 'No OTP request found for this email'}), 404
        
    if datetime.datetime.now() > stored_data['expires_at']:
        del pin_reset_otps[email]
        return jsonify({'error': 'OTP has expired'}), 400
        
    if stored_data['otp'] != str(user_otp).strip():
        return jsonify({'error': 'Invalid OTP'}), 400
        
    # Success, clear the OTP
    del pin_reset_otps[email]
    return jsonify({'success': True, 'message': 'OTP verified successfully'})
