import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Allow requests from frontend
CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}})

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')

@app.route('/health', methods=['GET'])
def health_check():
    return {'status': 'ok', 'message': 'SamKass backend is running!'}, 200

@app.route('/api/test-notification-config', methods=['GET'])
def test_notification_config():
    """Test notification configuration"""
    vapid_private_key = os.getenv('VAPID_PRIVATE_KEY')
    vapid_public_key = os.getenv('VAPID_PUBLIC_KEY')
    vapid_claim_email = os.getenv('VAPID_CLAIM_EMAIL')
    
    return jsonify({
        'vapid_configured': bool(vapid_private_key and vapid_public_key),
        'vapid_public_key': vapid_public_key[:50] + '...' if vapid_public_key else None,
        'vapid_claim_email': vapid_claim_email,
        'notification_system': 'ready'
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('BACKEND_PORT', 5000))
    print(f"🚀 Starting SamKass backend server on port {port}")
    print(f"📋 VAPID Keys: {'✅ Configured' if os.getenv('VAPID_PRIVATE_KEY') else '❌ Missing'}")
    app.run(debug=True, port=port, host='0.0.0.0')