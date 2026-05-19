import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Allow requests from frontend
allowed_origins = [
    os.environ.get("FRONTEND_URL", "http://localhost:5500"),
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": allowed_origins}})

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')

# Import and register auth routes
from auth.routes import auth_bp
app.register_blueprint(auth_bp, url_prefix='/api')

@app.route('/health', methods=['GET'])
def health_check():
    return {'status': 'ok'}, 200

if __name__ == '__main__':
    port = int(os.environ.get('BACKEND_PORT', 5000))
    app.run(debug=True, port=port, host='0.0.0.0')
