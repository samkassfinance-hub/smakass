import os
from flask import Blueprint, request, jsonify
from auth.jwt_handler import token_required, decode_token
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

def get_user_from_token():
    """Extract user from auth header without decorator"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    try:
        payload = decode_token(token)
        return payload
    except:
        return None

@whatsapp_bp.route('/whatsapp/setup', methods=['POST'])
def setup_whatsapp():
    try:
        current_user = get_user_from_token()
        if not current_user:
            return jsonify({'success': False, 'error': 'Authentication failed'}), 401
            
        user_id = current_user.get('sub') or current_user.get('id')
        if not user_id:
            return jsonify({'success': False, 'error': 'User ID not found'}), 401
            
        instance_name = get_instance_name(user_id)
        
        try:
            service = get_whatsapp_service()
        except ValueError as ve:
            return jsonify({'success': False, 'error': str(ve)}), 400
        
        # Create instance
        result = service.create_instance(instance_name)
        if not result:
            return jsonify({'success': False, 'error': 'Failed to create WhatsApp instance'}), 500
            
        supabase = get_supabase_client()
        
        # Save/upsert to kf_whatsapp_config
        try:
            # Check if exists
            existing = supabase.table('kf_whatsapp_config').select('*').eq('user_id', user_id).execute()
            if existing.data:
                supabase.table('kf_whatsapp_config').update({
                    'instance_name': instance_name,
                    'updated_at': datetime.utcnow().isoformat()
                }).eq('user_id', user_id).execute()
            else:
                supabase.table('kf_whatsapp_config').insert({
                    'user_id': user_id,
                    'instance_name': instance_name,
                    'updated_at': datetime.utcnow().isoformat()
                }).execute()
        except Exception as db_err:
            print(f"Database error in setup: {db_err}")
            pass
            
        return jsonify({'success': True, 'instance_name': instance_name}), 200
    except ValueError as ve:
        return jsonify({'success': False, 'error': str(ve)}), 400
    except Exception as e:
        print(f"WhatsApp setup error: {e}")
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500

@whatsapp_bp.route('/whatsapp/qr', methods=['GET'])
def get_qr():
    try:
        current_user = get_user_from_token()
        if not current_user:
            return jsonify({'success': False, 'error': 'Authentication failed'}), 401
            
        user_id = current_user.get('sub') or current_user.get('id')
        if not user_id:
            return jsonify({'success': False, 'error': 'User ID not found'}), 401
            
        instance_name = get_instance_name(user_id)
        
        try:
            service = get_whatsapp_service()
        except ValueError as ve:
            return jsonify({'success': False, 'error': str(ve)}), 400
        
        qr_data = service.get_qr_code(instance_name)
        if not qr_data:
            return jsonify({'success': False, 'error': 'Failed to get QR code'}), 500
            
        return jsonify({'success': True, 'qr': qr_data.get('base64')}), 200
    except Exception as e:
        print(f"QR code error: {e}")
        return jsonify({'success': False, 'error': f'Error getting QR: {str(e)}'}), 500

@whatsapp_bp.route('/whatsapp/status', methods=['GET'])
def get_status():
    try:
        current_user = get_user_from_token()
        if not current_user:
            return jsonify({'success': False, 'error': 'Authentication failed'}), 401
            
        user_id = current_user.get('sub') or current_user.get('id')
        if not user_id:
            return jsonify({'success': False, 'error': 'User ID not found'}), 401
            
        instance_name = get_instance_name(user_id)
        
        try:
            service = get_whatsapp_service()
        except ValueError as ve:
            return jsonify({'success': False, 'error': str(ve)}), 400
        
        is_connected = service.get_connection_status(instance_name)
        
        supabase = get_supabase_client()
        try:
            config = supabase.table('kf_whatsapp_config').select('*').eq('user_id', user_id).execute()
            if config.data:
                db_connected = config.data[0].get('is_connected', False)
                if is_connected != db_connected:
                    update_data = {'is_connected': is_connected, 'updated_at': datetime.utcnow().isoformat()}
                    if is_connected and not db_connected:
                        update_data['connected_at'] = datetime.utcnow().isoformat()
                    supabase.table('kf_whatsapp_config').update(update_data).eq('user_id', user_id).execute()
        except Exception as db_err:
            print(f"Database error in status: {db_err}")
            pass
        
        return jsonify({'success': True, 'connected': is_connected}), 200
    except Exception as e:
        print(f"Status check error: {e}")
        return jsonify({'success': False, 'error': f'Error checking status: {str(e)}'}), 500

@whatsapp_bp.route('/whatsapp/disconnect', methods=['POST'])
def disconnect():
    try:
        current_user = get_user_from_token()
        if not current_user:
            return jsonify({'success': False, 'error': 'Authentication failed'}), 401
            
        user_id = current_user.get('sub') or current_user.get('id')
        if not user_id:
            return jsonify({'success': False, 'error': 'User ID not found'}), 401
            
        instance_name = get_instance_name(user_id)
        service = get_whatsapp_service()
        
        service.disconnect(instance_name)
        
        supabase = get_supabase_client()
        try:
            supabase.table('kf_whatsapp_config').update({
                'is_connected': False,
                'updated_at': datetime.utcnow().isoformat()
            }).eq('user_id', user_id).execute()
        except Exception as e:
            pass
            
        return jsonify({'success': True, 'message': 'Disconnected'}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@whatsapp_bp.route('/whatsapp/test', methods=['POST'])
def send_test():
    try:
        current_user = get_user_from_token()
        if not current_user:
            return jsonify({'success': False, 'error': 'Authentication failed'}), 401
            
        user_id = current_user.get('sub') or current_user.get('id')
        if not user_id:
            return jsonify({'success': False, 'error': 'User ID not found'}), 401
            
        data = request.get_json()
        phone = data.get('phone')
        if not phone:
            return jsonify({'error': 'Phone number is required'}), 400
            
        instance_name = get_instance_name(user_id)
        service = get_whatsapp_service()
        
        if not service.get_connection_status(instance_name):
            return jsonify({'error': 'WhatsApp is not connected'}), 400
            
        result = service.send_text_message(instance_name, phone, "Hello from SamKass! Your WhatsApp automation is working.")
        if result:
            return jsonify({'success': True, 'message': 'Test message sent'}), 200
        return jsonify({'error': 'Failed to send message'}), 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@whatsapp_bp.route('/whatsapp/reminders/config', methods=['GET', 'POST'])
def reminder_config():
    try:
        current_user = get_user_from_token()
        if not current_user:
            return jsonify({'success': False, 'error': 'Authentication failed'}), 401
            
        user_id = current_user.get('sub') or current_user.get('id')
        if not user_id:
            return jsonify({'success': False, 'error': 'User ID not found'}), 401
            
        supabase = get_supabase_client()
        
        if request.method == 'GET':
            try:
                config = supabase.table('kf_whatsapp_config').select('*').eq('user_id', user_id).execute()
                if not config.data:
                    return jsonify({'success': True, 'config': None}), 200
                return jsonify({'success': True, 'config': config.data[0]}), 200
            except Exception as e:
                return jsonify({'error': str(e)}), 500
                
        if request.method == 'POST':
            data = request.get_json()
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
                else:
                    updates['user_id'] = user_id
                    updates['instance_name'] = get_instance_name(user_id)
                    supabase.table('kf_whatsapp_config').insert(updates).execute()
                    
                return jsonify({'success': True, 'message': 'Config updated'}), 200
            except Exception as e:
                return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
