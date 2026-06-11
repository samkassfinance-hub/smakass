"""
Mock Evolution API Server for Local Testing
Provides WhatsApp API endpoints without needing the full Evolution API setup
"""

from flask import Flask, request, jsonify
import os
import json
import base64
from datetime import datetime

app = Flask(__name__)

# In-memory storage for instances
instances = {}
qr_codes = {}

# Mock QR Code (base64 encoded small image)
MOCK_QR_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

class MockInstance:
    def __init__(self, name, api_key):
        self.name = name
        self.api_key = api_key
        self.state = "connecting"  # connecting, open, close
        self.created_at = datetime.now()
        self.phone = None
        self.messages = []
        
    def connect(self):
        self.state = "open"
        
    def disconnect(self):
        self.state = "close"
        
    def to_dict(self):
        return {
            "instance": {
                "name": self.name,
                "state": self.state,
                "phoneNumber": self.phone,
                "createdAt": self.created_at.isoformat()
            }
        }

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

@app.route('/instance/create', methods=['POST'])
def create_instance():
    auth_key = request.headers.get('apikey')
    expected_key = os.getenv('AUTHENTICATION_API_KEY', '387ec87f3544ad933ee9905809a4e93985238082ec697f99651d0255b9b72371')
    
    if auth_key != expected_key:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    instance_name = data.get('instanceName')
    
    if not instance_name:
        return jsonify({'error': 'instanceName is required'}), 400
    
    if instance_name in instances:
        return jsonify({'error': f'Instance {instance_name} already exists'}), 409
    
    instance = MockInstance(instance_name, auth_key)
    instances[instance_name] = instance
    qr_codes[instance_name] = MOCK_QR_BASE64
    
    return jsonify({
        'success': True,
        'instance': instance.to_dict(),
        'message': f'Instance {instance_name} created successfully'
    }), 201

@app.route('/instance/connect/<instance_name>', methods=['GET'])
def get_qr_code(instance_name):
    auth_key = request.headers.get('apikey')
    expected_key = os.getenv('AUTHENTICATION_API_KEY', '387ec87f3544ad933ee9905809a4e93985238082ec697f99651d0255b9b72371')
    
    if auth_key != expected_key:
        return jsonify({'error': 'Unauthorized'}), 401
    
    if instance_name not in instances:
        return jsonify({'error': f'Instance {instance_name} not found'}), 404
    
    # Generate a more realistic mock QR (small PNG)
    qr_data = qr_codes.get(instance_name, MOCK_QR_BASE64)
    
    return jsonify({
        'success': True,
        'base64': f'data:image/png;base64,{qr_data}',
        'instance': instance_name
    }), 200

@app.route('/instance/connectionState/<instance_name>', methods=['GET'])
def get_connection_status(instance_name):
    auth_key = request.headers.get('apikey')
    expected_key = os.getenv('AUTHENTICATION_API_KEY', '387ec87f3544ad933ee9905809a4e93985238082ec697f99651d0255b9b72371')
    
    if auth_key != expected_key:
        return jsonify({'error': 'Unauthorized'}), 401
    
    if instance_name not in instances:
        return jsonify({'error': f'Instance {instance_name} not found'}), 404
    
    instance = instances[instance_name]
    
    # Simulate connection after a few seconds
    time_elapsed = (datetime.now() - instance.created_at).total_seconds()
    if time_elapsed > 5 and instance.state != "open":
        instance.connect()
        instance.phone = "+919876543210"  # Mock phone
    
    return jsonify({
        'success': True,
        'instance': instance.to_dict()
    }), 200

@app.route('/message/sendText/<instance_name>', methods=['POST'])
def send_message(instance_name):
    auth_key = request.headers.get('apikey')
    expected_key = os.getenv('AUTHENTICATION_API_KEY', '387ec87f3544ad933ee9905809a4e93985238082ec697f99651d0255b9b72371')
    
    if auth_key != expected_key:
        return jsonify({'error': 'Unauthorized'}), 401
    
    if instance_name not in instances:
        return jsonify({'error': f'Instance {instance_name} not found'}), 404
    
    instance = instances[instance_name]
    
    if instance.state != "open":
        return jsonify({'error': 'Instance is not connected'}), 400
    
    data = request.get_json()
    phone = data.get('number')
    message = data.get('textMessage', {}).get('text', '')
    
    if not phone or not message:
        return jsonify({'error': 'number and textMessage.text are required'}), 400
    
    # Store message
    msg_obj = {
        'id': f"msg_{len(instance.messages) + 1}",
        'phone': phone,
        'message': message,
        'timestamp': datetime.now().isoformat(),
        'status': 'sent'
    }
    instance.messages.append(msg_obj)
    
    return jsonify({
        'success': True,
        'message': msg_obj,
        'status': 'sent'
    }), 200

@app.route('/instance/logout/<instance_name>', methods=['DELETE'])
def logout_instance(instance_name):
    auth_key = request.headers.get('apikey')
    expected_key = os.getenv('AUTHENTICATION_API_KEY', '387ec87f3544ad933ee9905809a4e93985238082ec697f99651d0255b9b72371')
    
    if auth_key != expected_key:
        return jsonify({'error': 'Unauthorized'}), 401
    
    if instance_name in instances:
        instances[instance_name].disconnect()
    
    return jsonify({'success': True, 'message': f'Instance {instance_name} logged out'}), 200

@app.route('/instance/delete/<instance_name>', methods=['DELETE'])
def delete_instance(instance_name):
    auth_key = request.headers.get('apikey')
    expected_key = os.getenv('AUTHENTICATION_API_KEY', '387ec87f3544ad933ee9905809a4e93985238082ec697f99651d0255b9b72371')
    
    if auth_key != expected_key:
        return jsonify({'error': 'Unauthorized'}), 401
    
    if instance_name in instances:
        del instances[instance_name]
        if instance_name in qr_codes:
            del qr_codes[instance_name]
    
    return jsonify({'success': True, 'message': f'Instance {instance_name} deleted'}), 200

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    print(f"🚀 Mock Evolution API Server running on port {port}")
    print(f"API Key: {os.getenv('AUTHENTICATION_API_KEY', 'not-set')}")
    app.run(host='0.0.0.0', port=port, debug=True)
