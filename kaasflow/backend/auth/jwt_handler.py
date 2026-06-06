import jwt
import os
from datetime import datetime, timedelta

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-default-secret-key-change-me')
JWT_REFRESH_SECRET = os.environ.get('JWT_REFRESH_SECRET', 'your-default-refresh-secret-key-change-me')
ALGORITHM = 'HS256'

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create a new JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: timedelta = None):
    """Create a new JWT refresh token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=30)
    
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, JWT_REFRESH_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str, is_refresh: bool = False):
    """Decode and verify a JWT token."""
    secret = JWT_REFRESH_SECRET if is_refresh else JWT_SECRET
    try:
        payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        try:
            fallback_secret = 'your-default-refresh-secret-key-change-me' if is_refresh else 'your-default-secret-key-change-me'
            return jwt.decode(token, fallback_secret, algorithms=[ALGORITHM])
        except:
            return None
from functools import wraps
from flask import request, jsonify

def token_required(f):
    """Decorator to require valid JWT token for API endpoints."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            # Decode token
            payload = decode_token(token)
            if not payload:
                return jsonify({'error': 'Token is invalid or expired'}), 401
            
            # Get user info from payload
            user_id = payload.get('sub') or payload.get('user_id')
            if not user_id:
                return jsonify({'error': 'Invalid token payload'}), 401
            
            # Create current_user object
            current_user = {
                'id': user_id,
                'email': payload.get('email', ''),
                'payload': payload
            }
            
            return f(current_user, *args, **kwargs)
            
        except Exception as e:
            print(f"Token verification error: {e}")
            return jsonify({'error': 'Token verification failed'}), 401
    
    return decorated