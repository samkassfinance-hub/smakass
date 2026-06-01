import os
import sys

# Ensure backend directory is in sys.path for Vercel
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
env_path = os.path.join(backend_dir, '.env')
load_dotenv(dotenv_path=env_path)

app = Flask(__name__)

# Allow requests from frontend
allowed_origins = [
    os.environ.get("FRONTEND_URL", "http://localhost:5500"),
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://www.samkass.site",
    "https://samkass.site"
]

CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": allowed_origins}})

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')

# Import and register auth routes
from auth.routes import auth_bp
from routes.sync import sync_bp
from razorpay_integration import payment_routes

import os
from supabase import create_client, Client
from auth.jwt_handler import decode_token
from flask import request, jsonify

# Initialize Supabase Client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Supabase client initialized successfully.")
    except Exception as e:
        print(f"Warning: Failed to initialize Supabase client: {e}")
        supabase = None
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(sync_bp, url_prefix='/api/sync')

# Register payment routes
payment_routes(app)

@app.route('/health', methods=['GET'])
def health_check():
    return {'status': 'ok'}, 200

@app.route('/api/debug-env', methods=['GET'])
def debug_env():
    import os
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
        "supabase_client_initialized": supabase is not None
    })


if __name__ == '__main__':
    port = int(os.environ.get('BACKEND_PORT', 5000))
    app.run(debug=True, port=port, host='0.0.0.0')

