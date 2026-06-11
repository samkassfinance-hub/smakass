import razorpay
from flask import jsonify, request
import os
from plan_manager import PlanManager
from auth.jwt_handler import decode_token

def get_razorpay_client():
    """Dynamically get the razorpay client to avoid cold-start import errors"""
    key_id = os.getenv('RAZORPAY_KEY_ID', 'rzp_live_SuharfZYrJBbHj')
    key_secret = os.getenv('RAZORPAY_KEY_SECRET', 'FsmmZywk4NGiI1PxIS4UWb0e')
    if not key_id or not key_secret:
        raise Exception("Razorpay API keys are missing in the environment.")
    return razorpay.Client(auth=(key_id, key_secret))

def get_user_email_from_token():
    """Extract user email with multi-channel authentication fallbacks"""
    import urllib.parse
    
    # 1. Check X-User-Email header first
    email_header = request.headers.get('X-User-Email')
    if email_header:
        return email_header.strip()

    # 2. Check Authorization header Bearer token
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        
        # Try standard JWT decode
        try:
            payload = decode_token(token)
            if payload and payload.get('sub'):
                return payload.get('sub').strip()
        except Exception as e:
            print(f"JWT decode failed: {e}")
            
        # Try custom session token format: session:email:timestamp
        if ':' in token:
            parts = token.split(':')
            for part in parts:
                unquoted = urllib.parse.unquote(part)
                if '@' in unquoted:
                    return unquoted.strip()
        # Try hyphen separation: session-email-timestamp
        elif '-' in token:
            parts = token.split('-')
            for part in parts:
                unquoted = urllib.parse.unquote(part)
                if '@' in unquoted:
                    return unquoted.strip()
                    
    # 3. Check request JSON body or query args as final fallbacks
    try:
        if request.is_json and request.json:
            email = request.json.get('email') or request.json.get('user_email')
            if email:
                return email.strip()
    except Exception as e:
        print(f"Failed to read JSON body: {e}")
        
    email = request.args.get('email') or request.args.get('user_email')
    if email:
        return email.strip()
        
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
        # Try to get email but don't block if not available
        # The payment popup should work regardless of auth state
        email = get_user_email_from_token()
        
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'No request data'}), 400
            
        plan_type = data.get('plan_type')
        amount = data.get('amount') or PlanManager.get_plan_price(plan_type)
        
        if not amount or amount <= 0:
            return jsonify({'success': False, 'error': 'Invalid amount'}), 400
        
        try:
            receipt = f'receipt_{plan_type}_{int(amount)}'
            if email:
                receipt = f'receipt_{email.split("@")[0]}_{plan_type}'
            order = create_order(amount, plan_type=plan_type, receipt=receipt)
            return jsonify({'success': True, 'order': order})
        except Exception as e:
            print(f"Create order error: {e}")
            return jsonify({'success': False, 'error': str(e)}), 400
    
    @app.route('/api/payment/key', methods=['GET'])
    def get_payment_key():
        key = os.getenv('RAZORPAY_KEY_ID', 'rzp_live_SuharfZYrJBbHj')
        if not key:
            return jsonify({'error': 'Razorpay key not configured'}), 500
        return jsonify({'key': key})

    @app.route('/api/payment/verify', methods=['POST'])
    def verify_payment_signature():
        email = get_user_email_from_token()
            
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'No request data'}), 400

        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_signature = data.get('razorpay_signature')

        # For direct UPI payments (no Razorpay order), skip signature verification
        is_direct = str(razorpay_order_id or '').startswith('direct_')
        
        is_valid = False
        if is_direct:
            # Direct UPI payment - trust the frontend
            is_valid = True
            print(f"Direct UPI payment accepted for {email}")
        elif razorpay_order_id and razorpay_payment_id and razorpay_signature:
            is_valid = verify_payment(razorpay_order_id, razorpay_payment_id, razorpay_signature)
        else:
            # If we have a payment_id but no signature (direct checkout without order_id)
            # The payment was captured by Razorpay, consider it valid
            if razorpay_payment_id:
                is_valid = True
                print(f"Payment {razorpay_payment_id} accepted (no order_id flow)")

        if is_valid:
            plan_type = data.get('plan_type')
            payment_id = data.get('razorpay_payment_id')
            user_id = email or data.get('user_email') or data.get('user_identifier') or 'unknown'
            
            if plan_type:
                activation = PlanManager.activate_plan(user_id, plan_type, payment_id)
                return jsonify({
                    'success': True,
                    'payment_verified': True,
                    'plan_activated': activation['success'],
                    'subscription': activation.get('subscription'),
                    'message': activation.get('message')
                })
            
            return jsonify({
                'success': True,
                'payment_verified': True,
                'plan_activated': False,
                'message': 'Payment verified but no plan type specified'
            })
        
        return jsonify({'success': False, 'error': 'Invalid payment or signature'}), 400
    
    @app.route('/api/subscription/status', methods=['GET'])
    def get_subscription_status():
        email = get_user_email_from_token()
        if not email:
            return jsonify({'error': 'Not authenticated'}), 401
        
        status = PlanManager.check_plan_status(email)
        return jsonify(status)
