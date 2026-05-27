import razorpay
from flask import jsonify, request
import os
from plan_manager import PlanManager
from auth.jwt_handler import decode_token

def get_razorpay_client():
    """Dynamically get the razorpay client to avoid cold-start import errors"""
    key_id = os.getenv('RAZORPAY_KEY_ID')
    key_secret = os.getenv('RAZORPAY_KEY_SECRET')
    if not key_id or not key_secret:
        raise Exception("Razorpay API keys are missing in the environment.")
    return razorpay.Client(auth=(key_id, key_secret))

def get_user_email_from_token():
    """Extract user email from Authorization header JWT"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    try:
        payload = decode_token(token)
        return payload.get('sub') if payload else None
    except:
        return None

def create_order(amount, currency='INR', receipt=None, plan_type=None):
    """Create a Razorpay order"""
    data = {
        'amount': int(amount * 100),  # Amount in paise
        'currency': currency,
        'receipt': receipt or f'receipt_{int(amount)}',
        'payment_capture': 1,
        'notes': {'plan_type': plan_type} if plan_type else {}
    }
    return get_razorpay_client().order.create(data=data)

def verify_payment(razorpay_order_id, razorpay_payment_id, razorpay_signature):
    """Verify payment signature using Razorpay client utility"""
    try:
        get_razorpay_client().utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        })
        return True
    except Exception as e:
        print(f"Signature verification failed: {e}")
        return False

def payment_routes(app):
    """Register payment routes"""
    
    @app.route('/api/payment/create-order', methods=['POST'])
    def create_payment_order():
        email = get_user_email_from_token()
        if not email:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401
            
        data = request.json
        plan_type = data.get('plan_type')
        amount = data.get('amount') or PlanManager.get_plan_price(plan_type)
        
        try:
            order = create_order(amount, plan_type=plan_type)
            return jsonify({'success': True, 'order': order})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 400
    
    @app.route('/api/payment/key', methods=['GET'])
    def get_payment_key():
        key = os.getenv('RAZORPAY_KEY_ID')
        if not key:
            return jsonify({'error': 'Razorpay key not configured'}), 500
        return jsonify({'key': key})

    @app.route('/api/payment/verify', methods=['POST'])
    def verify_payment_signature():
        email = get_user_email_from_token()
        if not email:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401
            
        data = request.json
        is_valid = verify_payment(
            data.get('razorpay_order_id'),
            data.get('razorpay_payment_id'),
            data.get('razorpay_signature')
        )
        
        if is_valid:
            plan_type = data.get('plan_type')
            payment_id = data.get('razorpay_payment_id')
            
            if plan_type:
                activation = PlanManager.activate_plan(email, plan_type, payment_id)
                return jsonify({
                    'success': True,
                    'payment_verified': True,
                    'plan_activated': activation['success'],
                    'subscription': activation.get('subscription'),
                    'message': activation.get('message')
                })
        
        return jsonify({'success': False, 'error': 'Invalid signature'}), 400
    
    @app.route('/api/subscription/status', methods=['GET'])
    def get_subscription_status():
        email = get_user_email_from_token()
        if not email:
            return jsonify({'error': 'Not authenticated'}), 401
        
        status = PlanManager.check_plan_status(email)
        return jsonify(status)

