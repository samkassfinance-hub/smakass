"""
Supabase Authentication Integration
Handles user registration, login, and JWT token management
"""

import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple
from supabase_client import supabase_service

class AuthIntegration:
    """Authentication service with Supabase backend"""
    
    TOKEN_EXPIRY_HOURS = 24
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password with salt"""
        salt = secrets.token_hex(32)
        hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return f"{salt}${hash_obj.hex()}"
    
    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        try:
            salt, hash_val = password_hash.split('$')
            hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
            return hash_obj.hex() == hash_val
        except Exception as e:
            print(f"Error verifying password: {e}")
            return False
    
    @staticmethod
    def register(email: str, password: str, name: str = "", phone: str = "") -> Tuple[bool, Dict]:
        """
        Register new user
        
        Args:
            email: User email
            password: User password (will be hashed)
            name: User name (optional)
            phone: User phone (optional)
        
        Returns:
            (success, response_data)
        """
        try:
            # Check if user already exists
            existing = supabase_service.get_user_by_email(email)
            if existing:
                return False, {"error": "Email already registered"}
            
            # Create user
            password_hash = AuthIntegration.hash_password(password)
            user_data = {
                "email": email,
                "name": name or email.split('@')[0],
                "phone": phone,
                "password_hash": password_hash,
                "email_verified": False,
                "is_active": True
            }
            
            new_user = supabase_service.create_user(user_data)
            if new_user:
                # Generate welcome token
                from auth.jwt_handler import generate_token
                token = generate_token(email)
                
                return True, {
                    "user": {
                        "id": new_user.get("id"),
                        "email": new_user.get("email"),
                        "name": new_user.get("name")
                    },
                    "token": token,
                    "message": "Registration successful"
                }
            else:
                return False, {"error": "Failed to create user"}
        
        except Exception as e:
            print(f"Registration error: {e}")
            return False, {"error": str(e)}
    
    @staticmethod
    def login(email: str, password: str) -> Tuple[bool, Dict]:
        """
        Login user
        
        Args:
            email: User email
            password: User password
        
        Returns:
            (success, response_data)
        """
        try:
            # Get user
            user = supabase_service.get_user_by_email(email)
            if not user:
                return False, {"error": "Invalid email or password"}
            
            # Check if user is active
            if not user.get("is_active"):
                return False, {"error": "Account is inactive"}
            
            # Verify password
            if not AuthIntegration.verify_password(password, user.get("password_hash", "")):
                return False, {"error": "Invalid email or password"}
            
            # Generate token
            from auth.jwt_handler import generate_token
            token = generate_token(email)
            
            # Update last login
            supabase_service.update_user(user.get("id"), {
                "last_login": datetime.utcnow().isoformat()
            })
            
            return True, {
                "user": {
                    "id": user.get("id"),
                    "email": user.get("email"),
                    "name": user.get("name")
                },
                "token": token,
                "message": "Login successful"
            }
        
        except Exception as e:
            print(f"Login error: {e}")
            return False, {"error": str(e)}
    
    @staticmethod
    def update_profile(user_id: str, updates: Dict) -> Tuple[bool, Dict]:
        """
        Update user profile
        
        Args:
            user_id: User ID
            updates: Dictionary of fields to update (name, phone, etc.)
        
        Returns:
            (success, response_data)
        """
        try:
            # Don't allow updating email or password via this method
            updates.pop("email", None)
            updates.pop("password_hash", None)
            
            updated_user = supabase_service.update_user(user_id, updates)
            if updated_user:
                return True, {
                    "user": {
                        "id": updated_user.get("id"),
                        "email": updated_user.get("email"),
                        "name": updated_user.get("name"),
                        "phone": updated_user.get("phone")
                    },
                    "message": "Profile updated"
                }
            else:
                return False, {"error": "Failed to update profile"}
        
        except Exception as e:
            print(f"Update profile error: {e}")
            return False, {"error": str(e)}
    
    @staticmethod
    def change_password(user_id: str, old_password: str, new_password: str) -> Tuple[bool, Dict]:
        """
        Change user password
        
        Args:
            user_id: User ID
            old_password: Current password
            new_password: New password
        
        Returns:
            (success, response_data)
        """
        try:
            # Get user
            user = supabase_service.get_user(user_id)
            if not user:
                return False, {"error": "User not found"}
            
            # Verify old password
            if not AuthIntegration.verify_password(old_password, user.get("password_hash", "")):
                return False, {"error": "Current password is incorrect"}
            
            # Hash new password
            new_hash = AuthIntegration.hash_password(new_password)
            
            # Update
            supabase_service.update_user(user_id, {"password_hash": new_hash})
            return True, {"message": "Password changed successfully"}
        
        except Exception as e:
            print(f"Change password error: {e}")
            return False, {"error": str(e)}
    
    @staticmethod
    def reset_password(email: str, new_password: str) -> Tuple[bool, Dict]:
        """
        Reset user password (admin/email verification required in production)
        
        Args:
            email: User email
            new_password: New password
        
        Returns:
            (success, response_data)
        """
        try:
            # Get user
            user = supabase_service.get_user_by_email(email)
            if not user:
                return False, {"error": "User not found"}
            
            # Hash new password
            new_hash = AuthIntegration.hash_password(new_password)
            
            # Update
            supabase_service.update_user(user.get("id"), {"password_hash": new_hash})
            return True, {"message": "Password reset successful"}
        
        except Exception as e:
            print(f"Reset password error: {e}")
            return False, {"error": str(e)}
    
    @staticmethod
    def get_user_profile(user_id: str) -> Optional[Dict]:
        """Get user profile"""
        try:
            user = supabase_service.get_user(user_id)
            if user:
                # Remove sensitive data
                user.pop("password_hash", None)
                return user
            return None
        except Exception as e:
            print(f"Error getting user profile: {e}")
            return None


# Example Flask routes using this integration

def setup_auth_routes(app, url_prefix='/api/auth'):
    """Setup authentication routes"""
    from flask import request, jsonify
    
    @app.route(f'{url_prefix}/register', methods=['POST'])
    def register():
        data = request.json or {}
        email = data.get('email', '').strip()
        password = data.get('password', '')
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        
        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400
        
        success, response = AuthIntegration.register(email, password, name, phone)
        return jsonify(response), 201 if success else 400
    
    @app.route(f'{url_prefix}/login', methods=['POST'])
    def login():
        data = request.json or {}
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({"error": "Email and password required"}), 400
        
        success, response = AuthIntegration.login(email, password)
        return jsonify(response), 200 if success else 401
    
    @app.route(f'{url_prefix}/profile/<user_id>', methods=['GET'])
    def get_profile(user_id):
        user = AuthIntegration.get_user_profile(user_id)
        if user:
            return jsonify({"user": user}), 200
        return jsonify({"error": "User not found"}), 404
    
    @app.route(f'{url_prefix}/profile/<user_id>', methods=['PUT'])
    def update_profile(user_id):
        data = request.json or {}
        success, response = AuthIntegration.update_profile(user_id, data)
        return jsonify(response), 200 if success else 400
    
    @app.route(f'{url_prefix}/change-password', methods=['POST'])
    def change_password():
        data = request.json or {}
        user_id = data.get('user_id')
        old_password = data.get('old_password', '')
        new_password = data.get('new_password', '')
        
        if not user_id or not old_password or not new_password:
            return jsonify({"error": "Missing required fields"}), 400
        
        success, response = AuthIntegration.change_password(user_id, old_password, new_password)
        return jsonify(response), 200 if success else 400
    
    @app.route(f'{url_prefix}/reset-password', methods=['POST'])
    def reset_password_route():
        data = request.json or {}
        email = data.get('email', '').strip()
        new_password = data.get('new_password', '')
        
        if not email or not new_password:
            return jsonify({"error": "Email and new password required"}), 400
        
        success, response = AuthIntegration.reset_password(email, new_password)
        return jsonify(response), 200 if success else 400


if __name__ == "__main__":
    # Test the integration
    print("Testing Auth Integration...\n")
    
    # Test registration
    print("1. Testing registration...")
    success, response = AuthIntegration.register(
        "test@example.com",
        "password123",
        "Test User",
        "+1234567890"
    )
    print(f"   Result: {response}\n")
    
    # Test login
    if success:
        print("2. Testing login...")
        user_id = response['user']['id']
        login_success, login_response = AuthIntegration.login("test@example.com", "password123")
        print(f"   Result: {login_response}\n")
        
        # Test profile update
        print("3. Testing profile update...")
        update_success, update_response = AuthIntegration.update_profile(user_id, {
            "name": "Updated User"
        })
        print(f"   Result: {update_response}\n")
