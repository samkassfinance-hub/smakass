import os
from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='.', static_url_path='')

# Allow requests from backend
allowed_origins = [
    os.environ.get("BACKEND_URL", "http://localhost:5000"),
    "http://127.0.0.1:5000"
]
CORS(app, supports_credentials=True)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if path and os.path.exists(os.path.join('.', path)):
        return send_from_directory('.', path)
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('FRONTEND_PORT', 5500))
    app.run(debug=True, port=port, host='0.0.0.0')