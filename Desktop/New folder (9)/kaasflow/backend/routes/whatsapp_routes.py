"""
WhatsApp Settings and Manual Reminder Routes
"""

from flask import Blueprint, request, jsonify
import os
from supabase import create_client, Client

# Initialize Supabase Client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY and SUPABASE_URL != "your_supabase_url_here":
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("WhatsApp Routes: Supabase connected")
    except Exception as e:
        print(f"WhatsApp Routes: Supabase connection failed: {e}")
        supabase = None
else:
    print("WhatsApp Routes: Running without Supabase (optional)")

whatsapp_bp = Blueprint('whatsapp', __name__)


def get_user_id_from_request():
    """Extract user ID from request (simplified for now)"""
    # You can enhance this with JWT token validation
    return request.json.get('user_id') or request.args.get('user_id')


@whatsapp_bp.route('/whatsapp/settings', methods=['GET'])
def get_whatsapp_settings():
    """Get WhatsApp settings for a user"""
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "User ID required"}), 400
    
    try:
        import json
        import os
        
        settings_file = 'whatsapp_settings.json'
        
        # First try local file
        if os.path.exists(settings_file):
            try:
                with open(settings_file, 'r') as f:
                    settings_data = json.load(f)
                    if user_id in settings_data:
                        return jsonify({"success": True, "data": settings_data[user_id]})
            except Exception as e:
                print(f"⚠️ Error reading local settings: {e}")
        
        # Try Supabase if configured
        if supabase:
            try:
                response = supabase.table('kf_whatsapp_settings').select('*').eq('user_id', user_id).execute()
                if response.data and len(response.data) > 0:
                    return jsonify({"success": True, "data": response.data[0]})
            except Exception as e:
                print(f"⚠️ Supabase read failed: {e}")
        
        # Return default settings if nothing found
        return jsonify({
            "success": True,
            "data": {
                "whatsapp_number": "",
                "whatsapp_enabled": False,
                "business_name": "KaasFlow"
            }
        })
    
    except Exception as e:
        print(f"Error fetching WhatsApp settings: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@whatsapp_bp.route('/whatsapp/settings', methods=['POST'])
def save_whatsapp_settings():
    """Save or update WhatsApp settings for a user"""
    data = request.json
    user_id = data.get('user_id')
    whatsapp_number = data.get('whatsapp_number')
    whatsapp_enabled = data.get('whatsapp_enabled', True)
    business_name = data.get('business_name', 'KaasFlow')
    
    if not user_id:
        return jsonify({"success": False, "error": "User ID required"}), 400
    
    if not whatsapp_number:
        return jsonify({"success": False, "error": "WhatsApp number required"}), 400
    
    # Save to local file as fallback if Supabase not configured
    try:
        import json
        import os
        
        settings_file = 'whatsapp_settings.json'
        settings_data = {}
        
        # Load existing settings
        if os.path.exists(settings_file):
            try:
                with open(settings_file, 'r') as f:
                    settings_data = json.load(f)
            except:
                settings_data = {}
        
        # Update/add user settings
        settings_data[user_id] = {
            'whatsapp_number': whatsapp_number,
            'whatsapp_enabled': whatsapp_enabled,
            'business_name': business_name,
            'updated_at': str(__import__('datetime').datetime.now())
        }
        
        # Save to file
        with open(settings_file, 'w') as f:
            json.dump(settings_data, f, indent=2)
        
        print(f"✅ WhatsApp settings saved to local file for user: {user_id}")
        
        # Also try Supabase if configured
        if supabase:
            try:
                response = supabase.table('kf_whatsapp_settings').upsert({
                    'user_id': user_id,
                    'whatsapp_number': whatsapp_number,
                    'whatsapp_enabled': whatsapp_enabled,
                    'business_name': business_name
                }).execute()
                print(f"✅ WhatsApp settings also saved to Supabase")
            except Exception as e:
                print(f"⚠️ Supabase save failed (using local file): {e}")
        
        return jsonify({
            "success": True, 
            "data": settings_data[user_id],
            "message": "Settings saved successfully"
        })
    
    except Exception as e:
        print(f"Error saving WhatsApp settings: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@whatsapp_bp.route('/whatsapp/test', methods=['POST'])
def test_whatsapp():
    """Send a test WhatsApp message"""
    data = request.json
    phone = data.get('phone')
    message = data.get('message', 'This is a test message from KaasFlow.')
    
    if not phone:
        return jsonify({"success": False, "error": "Phone number required"}), 400
    
    try:
        # Import PyWhatKit
        try:
            import pywhatkit as pwk
        except ImportError:
            return jsonify({
                "success": False, 
                "error": "PyWhatKit not installed. Run: pip install pywhatkit"
            }), 500
        
        from datetime import datetime
        import threading
        
        # Validate phone number format
        if not phone.startswith('+'):
            return jsonify({
                "success": False, 
                "error": "Phone number must start with + and country code (e.g., +919876543210)"
            }), 400
        
        # Schedule for 2 minutes from now
        now = datetime.now()
        hour = now.hour
        minute = now.minute + 2
        
        if minute >= 60:
            hour += 1
            minute = minute - 60
        
        # Run in a separate thread to avoid blocking
        def send_message():
            try:
                pwk.sendwhatmsg(
                    phone_no=phone,
                    message=message,
                    time_hour=hour,
                    time_min=minute,
                    wait_time=15,
                    tab_close=True,
                    close_time=3
                )
                print(f"✓ Test message scheduled for {hour}:{minute:02d}")
            except Exception as e:
                print(f"✗ Error in send_message thread: {e}")
        
        # Start the message sending in background
        thread = threading.Thread(target=send_message)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            "success": True, 
            "message": f"Test message scheduled for {hour}:{minute:02d}. WhatsApp Web will open shortly. Make sure you're logged in!"
        })
    
    except Exception as e:
        error_msg = str(e)
        print(f"Error sending test WhatsApp: {error_msg}")
        
        # Provide helpful error messages
        if "pywhatkit" in error_msg.lower():
            return jsonify({
                "success": False, 
                "error": "PyWhatKit not properly installed. Run: pip install pywhatkit"
            }), 500
        elif "selenium" in error_msg.lower() or "webdriver" in error_msg.lower():
            return jsonify({
                "success": False, 
                "error": "Browser driver not found. PyWhatKit requires Chrome/Firefox browser to be installed."
            }), 500
        else:
            return jsonify({
                "success": False, 
                "error": f"Failed to send test message: {error_msg}. Make sure WhatsApp Web is accessible and you have Chrome/Firefox installed."
            }), 500


@whatsapp_bp.route('/whatsapp/logs', methods=['GET'])
def get_whatsapp_logs():
    """Get WhatsApp reminder logs for a user"""
    if not supabase:
        return jsonify({"success": False, "error": "Database not configured"}), 500
    
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"success": False, "error": "User ID required"}), 400
    
    try:
        response = supabase.table('kf_whatsapp_logs') \
            .select('*') \
            .eq('user_id', user_id) \
            .order('created_at', desc=True) \
            .limit(100) \
            .execute()
        
        return jsonify({"success": True, "data": response.data})
    
    except Exception as e:
        print(f"Error fetching WhatsApp logs: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
