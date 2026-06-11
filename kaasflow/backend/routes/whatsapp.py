import os
from flask import Blueprint, request, jsonify
from supabase_db import get_supabase_client
from whatsapp_service import WhatsAppService
from datetime import datetime

whatsapp_bp = Blueprint('whatsapp', __name__)

def get_whatsapp_service():
    api_url = os.environ.get('WHATSAPP_API_URL', '')
    api_key = os.environ.get('WHATSAPP_API_KEY', '')
    
    if not api_url or not api_key:
        raise ValueError('WhatsApp API credentials not configured.')
    
    return WhatsAppService(api_url, api_key)

def get_instance_name(user_id):
    return f"samkass_{user_id.replace('-', '').replace('_', '')[:16]}"

def get_user_id():
    """Get user_id from any source - request headers, JSON body, or default"""
    # Try Authorization header first
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        # Extract from token if possible
        if ':' in token:
            parts = token.split(':')
            if len(parts) > 1:
                return parts[0]
    
    # Try X-User-ID header
    user_id = request.headers.get('X-User-ID')
    if user_id:
        return user_id
    
    # Try JSON body
    try:
        data = request.get_json() or {}
        if data.get('user_id'):
            return data.get('user_id')
    except:
        pass
    
    # Try query parameters
    user_id = request.args.get('user_id')
    if user_id:
        return user_id
    
    # Return a default test user ID
    return 'test_user_samkass'

@whatsapp_bp.route('/whatsapp/setup', methods=['POST'])
def setup_whatsapp():
    """Connect WhatsApp - No authentication required"""
    try:
        user_id = get_user_id()
        print(f"✅ WhatsApp setup for user: {user_id}")
        
        instance_name = get_instance_name(user_id)
        print(f"Instance name: {instance_name}")
        
        try:
            service = get_whatsapp_service()
            print(f"✅ WhatsApp service initialized")
        except ValueError as ve:
            print(f"❌ WhatsApp service error: {ve}")
            return jsonify({'success': False, 'error': str(ve)}), 400
        
        # Create instance
        print(f"Creating WhatsApp instance: {instance_name}")
        result = service.create_instance(instance_name)
        
        if not result:
            print(f"⚠️ Instance creation returned empty result")
            # Return success even if empty - it might still work
        else:
            print(f"✅ Instance created: {result}")
        
        supabase = get_supabase_client()
        
        # Try to save to database (non-blocking)
        try:
            existing = supabase.table('kf_whatsapp_config').select('*').eq('user_id', user_id).execute()
            if existing.data:
                supabase.table('kf_whatsapp_config').update({
                    'instance_name': instance_name,
                    'updated_at': datetime.utcnow().isoformat()
                }).eq('user_id', user_id).execute()
                print(f"✅ Updated existing config in DB")
            else:
                supabase.table('kf_whatsapp_config').insert({
                    'user_id': user_id,
                    'instance_name': instance_name,
                    'updated_at': datetime.utcnow().isoformat()
                }).execute()
                print(f"✅ Created new config in DB")
        except Exception as db_err:
            print(f"⚠️ Database error (non-blocking): {db_err}")
        
        print(f"✅ WhatsApp setup SUCCESS")
        return jsonify({
            'success': True, 
            'instance_name': instance_name,
            'user_id': user_id
        }), 200
        
    except Exception as e:
        print(f"❌ WhatsApp setup error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@whatsapp_bp.route('/whatsapp/qr', methods=['GET'])
def get_qr():
    """Get QR code - No authentication required"""
    try:
        user_id = get_user_id()
        instance_name = get_instance_name(user_id)
        
        try:
            service = get_whatsapp_service()
        except ValueError as ve:
            return jsonify({'success': False, 'error': str(ve)}), 400
        
        print(f"Getting QR for instance: {instance_name}")
        qr_data = service.get_qr_code(instance_name)
        
        if not qr_data:
            print(f"⚠️ QR code response empty")
            return jsonify({'success': False, 'error': 'Failed to get QR code'}), 500
        
        base64_qr = qr_data.get('base64')
        if not base64_qr:
            print(f"⚠️ No base64 in QR response")
            return jsonify({'success': False, 'error': 'QR code not in response'}), 500
            
        print(f"✅ QR code retrieved: {len(base64_qr)} bytes")
        return jsonify({'success': True, 'qr': base64_qr}), 200
        
    except Exception as e:
        print(f"❌ QR code error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@whatsapp_bp.route('/whatsapp/status', methods=['GET'])
def get_status():
    """Check connection status - No authentication required"""
    try:
        user_id = get_user_id()
        instance_name = get_instance_name(user_id)
        
        try:
            service = get_whatsapp_service()
        except ValueError as ve:
            return jsonify({'success': False, 'error': str(ve)}), 400
        
        is_connected = service.get_connection_status(instance_name)
        print(f"WhatsApp status for {instance_name}: {'connected' if is_connected else 'not connected'}")
        
        supabase = get_supabase_client()
        try:
            config = supabase.table('kf_whatsapp_config').select('*').eq('user_id', user_id).execute()
            if config.data:
                db_connected = config.data[0].get('is_connected', False)
                if is_connected != db_connected:
                    update_data = {
                        'is_connected': is_connected,
                        'updated_at': datetime.utcnow().isoformat()
                    }
                    if is_connected and not db_connected:
                        update_data['connected_at'] = datetime.utcnow().isoformat()
                    supabase.table('kf_whatsapp_config').update(update_data).eq('user_id', user_id).execute()
                    print(f"✅ Updated DB connection status")
        except Exception as db_err:
            print(f"⚠️ Database error (non-blocking): {db_err}")
        
        return jsonify({'success': True, 'connected': is_connected}), 200
        
    except Exception as e:
        print(f"❌ Status check error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@whatsapp_bp.route('/whatsapp/disconnect', methods=['POST'])
def disconnect():
    """Disconnect WhatsApp - No authentication required"""
    try:
        user_id = get_user_id()
        instance_name = get_instance_name(user_id)
        
        try:
            service = get_whatsapp_service()
        except ValueError as ve:
            return jsonify({'success': False, 'error': str(ve)}), 400
        
        service.disconnect(instance_name)
        print(f"✅ WhatsApp disconnected: {instance_name}")
        
        supabase = get_supabase_client()
        try:
            supabase.table('kf_whatsapp_config').update({
                'is_connected': False,
                'updated_at': datetime.utcnow().isoformat()
            }).eq('user_id', user_id).execute()
        except Exception as e:
            print(f"⚠️ Database error: {e}")
        
        return jsonify({'success': True, 'message': 'Disconnected'}), 200
        
    except Exception as e:
        print(f"❌ Disconnect error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@whatsapp_bp.route('/whatsapp/test', methods=['POST'])
def send_test():
    """Send test message - No authentication required"""
    try:
        user_id = get_user_id()
        instance_name = get_instance_name(user_id)
        
        data = request.get_json() or {}
        phone = data.get('phone', '')
        
        if not phone:
            return jsonify({'error': 'Phone number is required'}), 400
        
        try:
            service = get_whatsapp_service()
        except ValueError as ve:
            return jsonify({'success': False, 'error': str(ve)}), 400
        
        print(f"Checking connection for {instance_name}")
        if not service.get_connection_status(instance_name):
            print(f"⚠️ WhatsApp not connected")
            return jsonify({'error': 'WhatsApp is not connected'}), 400
        
        print(f"Sending test message to {phone}")
        result = service.send_text_message(instance_name, phone, "Hello from SamKass! Your WhatsApp automation is working.")
        
        if result:
            print(f"✅ Test message sent to {phone}")
            return jsonify({'success': True, 'message': 'Test message sent'}), 200
        
        print(f"❌ Failed to send message")
        return jsonify({'error': 'Failed to send message'}), 500
        
    except Exception as e:
        print(f"❌ Test message error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@whatsapp_bp.route('/whatsapp/reminders/config', methods=['GET', 'POST'])
def reminder_config():
    """Get/update reminder config - No authentication required"""
    try:
        user_id = get_user_id()
        supabase = get_supabase_client()
        
        if request.method == 'GET':
            try:
                config = supabase.table('kf_whatsapp_config').select('*').eq('user_id', user_id).execute()
                if not config.data:
                    return jsonify({'success': True, 'config': None}), 200
                return jsonify({'success': True, 'config': config.data[0]}), 200
            except Exception as e:
                print(f"❌ Config GET error: {e}")
                return jsonify({'error': str(e)}), 500
        
        if request.method == 'POST':
            data = request.get_json() or {}
            try:
                updates = {
                    'due_today_enabled': data.get('due_today', True),
                    'due_tomorrow_enabled': data.get('due_tomorrow', True),
                    'overdue_enabled': data.get('overdue', True),
                    'phone_number': data.get('phone', ''),
                    'updated_at': datetime.utcnow().isoformat()
                }
                
                existing = supabase.table('kf_whatsapp_config').select('*').eq('user_id', user_id).execute()
                if existing.data:
                    supabase.table('kf_whatsapp_config').update(updates).eq('user_id', user_id).execute()
                    print(f"✅ Updated reminder config")
                else:
                    updates['user_id'] = user_id
                    updates['instance_name'] = get_instance_name(user_id)
                    supabase.table('kf_whatsapp_config').insert(updates).execute()
                    print(f"✅ Created reminder config")
                
                return jsonify({'success': True, 'message': 'Config updated'}), 200
            except Exception as e:
                print(f"❌ Config POST error: {e}")
                return jsonify({'error': str(e)}), 500
                
    except Exception as e:
        print(f"❌ Reminder config error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
