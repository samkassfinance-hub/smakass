import os
import sys

# Ensure backend directory is in sys.path for Vercel
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# CRITICAL: Load .env FIRST before any other imports
from dotenv import load_dotenv
env_path = os.path.join(backend_dir, '.env')
load_dotenv(dotenv_path=env_path)

# Verify WhatsApp credentials loaded
whatsapp_url = os.environ.get('WHATSAPP_API_URL', '')
whatsapp_key = os.environ.get('WHATSAPP_API_KEY', '')
print(f"\n🔧 Environment loaded:")
print(f"   WHATSAPP_API_URL: {whatsapp_url}")
print(f"   WHATSAPP_API_KEY: {'SET' if whatsapp_key else 'NOT SET'}")

from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from auth.jwt_handler import decode_token

# Create Flask app instance (Vercel needs this at top level)
app = Flask(__name__)

# Allow requests from frontend
allowed_origins = [
    os.environ.get("FRONTEND_URL", "http://localhost:5500"),
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5501",
    "http://127.0.0.1:5502",
    "http://localhost:5502",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://www.samkass.site",
    "https://samkass.site"
]

CORS(app, supports_credentials=True, resources={r"/*": {"origins": allowed_origins}})

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')

# Initialize Supabase Client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase client initialized successfully.")
    except Exception as e:
        print(f"⚠️ Warning: Failed to initialize Supabase client: {e}")
        supabase = None

# Import and register all blueprints
from auth.routes import auth_bp
from razorpay_integration import payment_routes
from routes.push import push_bp
from routes.test_push import test_push_bp
from routes.cron import cron_bp
from routes.whatsapp import whatsapp_bp

app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/auth', name='auth_prefix')
app.register_blueprint(push_bp, url_prefix='/api')
app.register_blueprint(test_push_bp, url_prefix='/api')
app.register_blueprint(cron_bp, url_prefix='/api/cron')
app.register_blueprint(whatsapp_bp, url_prefix='/api')

# Register payment routes
payment_routes(app)

# Start notification scheduler (only in production/local, not in Vercel serverless)
if not os.environ.get('VERCEL'):
    try:
        from notification_scheduler import start_scheduler
        from whatsapp_reminder_scheduler import start_whatsapp_scheduler
        start_scheduler()
        print("✅ Notification scheduler started")
        start_whatsapp_scheduler()
        print("✅ WhatsApp reminder scheduler started")
    except Exception as e:
        print(f"⚠️ Could not start scheduler: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    return {'status': 'ok'}, 200

@app.route('/api/debug-env', methods=['GET'])
def debug_env():
    resend_key = os.environ.get("RESEND_API_KEY")
    resend_key_masked = f"{resend_key[:6]}...{resend_key[-4:]}" if resend_key and len(resend_key) > 10 else ("Set" if resend_key else "Not Set")
    
    supabase_key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    supabase_key_masked = f"{supabase_key[:6]}...{supabase_key[-4:]}" if supabase_key and len(supabase_key) > 10 else ("Set" if supabase_key else "Not Set")

    return jsonify({
        "VERCEL": os.environ.get("VERCEL"),
        "FRONTEND_URL": os.environ.get("FRONTEND_URL"),
        "RESEND_API_KEY": resend_key_masked,
        "RESEND_FROM_EMAIL": os.environ.get("RESEND_FROM_EMAIL"),
        "SUPABASE_URL": os.environ.get("SUPABASE_URL"),
        "SUPABASE_SERVICE_ROLE_KEY": supabase_key_masked,
        "GOOGLE_CLIENT_ID": os.environ.get("GOOGLE_CLIENT_ID"),
        "WHATSAPP_API_URL": os.environ.get("WHATSAPP_API_URL"),
        "WHATSAPP_API_KEY": "SET" if os.environ.get("WHATSAPP_API_KEY") else "NOT SET",
        "supabase_client_initialized": supabase is not None
    })


# ── Cloud Sync Routes ────────────────────────────────────────

def get_user_email_from_token():
    """Extract user email with multi-channel authentication fallbacks"""
    import urllib.parse
    
    # 1. Check X-User-Email header first
    email_header = request.headers.get('X-User-Email')
    if email_header:
        return email_header.strip()

    # 2. Check Authorization header Bearer token
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        
        # Try standard JWT decode
        try:
            payload = decode_token(token)
            if payload and payload.get('sub'):
                return payload.get('sub').strip()
        except Exception as e:
            print(f"JWT decode failed: {e}")
            
        # Try custom session token format: session:email:timestamp
        if ':' in token:
            parts = token.split(':')
            for part in parts:
                unquoted = urllib.parse.unquote(part)
                if '@' in unquoted:
                    return unquoted.strip()
        # Try hyphen separation: session-email-timestamp
        elif '-' in token:
            parts = token.split('-')
            for part in parts:
                unquoted = urllib.parse.unquote(part)
                if '@' in unquoted:
                    return unquoted.strip()
                    
    # 3. Check request JSON body or query args as final fallbacks
    try:
        if request.is_json and request.json:
            email = request.json.get('email') or request.json.get('user_email')
            if email:
                return email.strip()
    except Exception as e:
        print(f"Failed to read JSON body: {e}")
        
    email = request.args.get('email') or request.args.get('user_email')
    if email:
        return email.strip()
        
    return None

@app.route('/api/sync/status', methods=['GET'])
def sync_status():
    return jsonify({"supabase_configured": supabase is not None})

@app.route('/api/sync/backup', methods=['POST'])
def sync_backup():
    if not supabase:
        return jsonify({"success": False, "errors": ["Supabase not configured"]}), 500
    user_email = get_user_email_from_token()
    if not user_email:
        return jsonify({"success": False, "errors": ["Unauthorized"]}), 401
    data = request.json
    try:
        response = supabase.table('app_backups').upsert({
            "user_email": user_email,
            "clients_json": data.get("clients", []),
            "loans_json": data.get("loans", []),
            "payments_json": data.get("payments", []),
            "settings_json": data.get("settings", {})
        }).execute()
        return jsonify({"success": True, "data": response.data})
    except Exception as e:
        print(f"Sync Backup Error: {e}")
        return jsonify({"success": False, "errors": [str(e)]}), 500

@app.route('/api/sync/restore', methods=['GET'])
def sync_restore():
    if not supabase:
        return jsonify({"success": False, "error": "Supabase not configured"}), 500
    user_email = get_user_email_from_token()
    if not user_email:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
    try:
        response = supabase.table('app_backups').select('*').eq('user_email', user_email).execute()
        if not response.data:
            return jsonify({"success": True, "data": {"clients": [], "loans": [], "payments": [], "settings": {}}})
        backup = response.data[0]
        return jsonify({
            "success": True, 
            "data": {
                "clients": backup.get("clients_json", []),
                "loans": backup.get("loans_json", []),
                "payments": backup.get("payments_json", []),
                "settings": backup.get("settings_json", {})
            }
        })
    except Exception as e:
        print(f"Sync Restore Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# IMPORTANT: Export app for Vercel
handler = app

if __name__ == '__main__':
    port = int(os.environ.get('BACKEND_PORT', 5000))
    app.run(debug=True, port=port, host='0.0.0.0')
