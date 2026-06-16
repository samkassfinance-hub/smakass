"""
Subscription Routes - API endpoints for subscription verification, status, and receipts
"""

from flask import Blueprint, request, jsonify
from subscription_manager import (
    get_subscription_status, 
    update_subscription_after_payment,
    check_client_limit,
    verify_subscription_for_api
)
from auth.jwt_handler import decode_token
import os

subscription_bp = Blueprint('subscription', __name__)

def get_user_email_from_token():
    """Extract user email from request headers or token"""
    # Check X-User-Email header
    email_header = request.headers.get('X-User-Email')
    if email_header:
        return email_header.strip()
    
    # Check Bearer token
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        try:
            payload = decode_token(token)
            if payload and payload.get('sub'):
                return payload.get('sub').strip()
        except:
            pass
    
    # Check JSON body
    if request.is_json:
        email = request.json.get('email') or request.json.get('user_email')
        if email:
            return email.strip()
    
    # Check query args
    email = request.args.get('email') or request.args.get('user_email')
    if email:
        return email.strip()
    
    return None

@subscription_bp.route('/subscription/status', methods=['GET'])
def get_status():
    """
    Get current subscription status for user
    Response includes: plan_type, is_active, days_remaining, expiry_time, client_limit
    """
    user_email = get_user_email_from_token()
    if not user_email:
        return jsonify({'error': 'Unauthorized - no user email provided'}), 401
    
    status = get_subscription_status(user_email)
    return jsonify(status), 200 if status.get('success') else 500

@subscription_bp.route('/subscription/verify', methods=['POST'])
def verify_subscription():
    """
    Verify subscription is active and user can access app
    Returns: { authorized: bool, plan_type: str, message: str }
    """
    user_email = get_user_email_from_token()
    if not user_email:
        return jsonify({'error': 'Unauthorized'}), 401
    
    result = verify_subscription_for_api(user_email)
    
    if result.get('authorized'):
        return jsonify(result), 200
    
    status_code = result.get('status_code', 403)
    return jsonify(result), status_code

@subscription_bp.route('/subscription/check-client-limit', methods=['POST'])
def check_limit():
    """
    Check if user can add more clients
    Request: { client_count: int }
    Response: { can_add: bool, limit: int, current: int, remaining: int }
    """
    user_email = get_user_email_from_token()
    if not user_email:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json or {}
    client_count = data.get('client_count', 0)
    
    result = check_client_limit(user_email, client_count)
    return jsonify(result), 200

@subscription_bp.route('/subscription/update-after-payment', methods=['POST'])
def update_after_payment():
    """
    Update subscription after successful Razorpay payment
    Called from payment verification endpoint
    
    Request: {
        plan_type: 'oneday' | 'monthly' | 'quarterly' | 'yearly',
        payment_id: 'pay_xxxxx',
        amount: 800 (in paise)
    }
    
    Response: { success, plan_type, expiry_time, days_remaining }
    """
    user_email = get_user_email_from_token()
    if not user_email:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json or {}
    plan_type = data.get('plan_type')
    payment_id = data.get('payment_id')
    amount = data.get('amount', 0)
    
    if not plan_type or not payment_id:
        return jsonify({'error': 'Missing plan_type or payment_id'}), 400
    
    result = update_subscription_after_payment(user_email, plan_type, payment_id, amount)
    return jsonify(result), 200 if result.get('success') else 400

@subscription_bp.route('/subscription/download-receipt', methods=['POST'])
def download_receipt():
    """
    Generate and download payment receipt as PDF
    
    Request: {
        plan_type: 'oneday' | 'monthly' | 'quarterly' | 'yearly',
        payment_id: 'pay_xxxxx',
        amount: 800 (in paise),
        payment_time: ISO timestamp (optional)
    }
    
    Response: PDF file
    """
    user_email = get_user_email_from_token()
    if not user_email:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json or {}
    plan_type = data.get('plan_type')
    payment_id = data.get('payment_id')
    amount = data.get('amount', 0)
    payment_time = data.get('payment_time')
    
    if not plan_type or not payment_id:
        return jsonify({'error': 'Missing plan_type or payment_id'}), 400
    
    try:
        from payment_receipt import generate_payment_receipt_pdf, generate_receipt_filename
        
        pdf_bytes = generate_payment_receipt_pdf(
            user_email=user_email,
            plan_type=plan_type,
            payment_id=payment_id,
            amount_paise=amount,
            payment_time_utc=payment_time
        )
        
        filename = generate_receipt_filename(user_email, plan_type, payment_id)
        
        return pdf_bytes, 200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
    
    except Exception as e:
        print(f"❌ Receipt generation error: {e}")
        return jsonify({'error': f'Failed to generate receipt: {str(e)}'}), 500

def register_subscription_routes(app):
    """Register subscription blueprint with Flask app"""
    app.register_blueprint(subscription_bp, url_prefix='/api')
    print("✅ Subscription routes registered")
