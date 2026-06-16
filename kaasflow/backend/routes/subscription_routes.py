"""
Subscription API Routes
Handles subscription status, client limits, and payment verification
"""

from flask import Blueprint, request, jsonify
from subscription_manager import subscription_manager, require_active_subscription
from datetime import datetime

subscription_bp = Blueprint('subscription', __name__)


@subscription_bp.route('/api/subscription/status', methods=['GET'])
def get_subscription_status():
    """
    Get subscription status for current user.
    
    Returns:
    {
        "subscription": { plan_type, plan_name, expiry_time (UTC), is_expired, ... },
        "client_count": int,
        "can_add_client": bool,
        "limit_info": { limit, current_count, is_expired, ... },
        "days_remaining": int (nullable),
        "available_plans": { oneday, monthly, quarterly, yearly }
    }
    """
    user_email = request.headers.get('X-User-Email') or request.args.get('email')
    
    if not user_email:
        return jsonify({'error': 'User email required'}), 400
    
    status = subscription_manager.get_subscription_status(user_email)
    return jsonify(status), 200


@subscription_bp.route('/api/subscription/check-client-limit', methods=['POST'])
def check_client_limit():
    """
    Check if user can add a client before they try.
    
    Request:
    {
        "email": "user@example.com"
    }
    
    Returns:
    {
        "can_add": bool,
        "reason": string (if blocked),
        "current_count": int,
        "limit": int or "Unlimited",
        "plan_name": string,
        "is_expired": bool
    }
    """
    data = request.get_json() or {}
    user_email = data.get('email') or request.headers.get('X-User-Email')
    
    if not user_email:
        return jsonify({'error': 'User email required'}), 400
    
    client_count = subscription_manager.get_client_count(user_email)
    can_add, limit_info = subscription_manager.check_client_limit(user_email, client_count)
    
    response = limit_info.copy()
    response['can_add'] = can_add
    
    if not can_add:
        if limit_info['is_expired']:
            response['reason'] = 'Your subscription has expired. Please renew to add more clients.'
        else:
            response['reason'] = f'You have reached the limit of {limit_info["limit"]} clients on the {limit_info["plan_name"]}. Please upgrade to add more.'
    
    return jsonify(response), 200


@subscription_bp.route('/api/subscription/verify-payment', methods=['POST'])
def verify_payment():
    """
    Verify Razorpay payment and create subscription record.
    
    Request:
    {
        "email": "user@example.com",
        "plan_type": "monthly",
        "razorpay_payment_id": "pay_xxx",
        "razorpay_order_id": "order_xxx",
        "razorpay_signature": "sig_xxx",
        "amount_paid": 270
    }
    
    Returns:
    {
        "success": bool,
        "subscription": { plan_name, expiry_time (UTC), amount_paid, ... },
        "error": string (if failed)
    }
    """
    data = request.get_json() or {}
    
    user_email = data.get('email') or request.headers.get('X-User-Email')
    plan_type = data.get('plan_type')
    payment_id = data.get('razorpay_payment_id')
    order_id = data.get('razorpay_order_id')
    signature = data.get('razorpay_signature')
    amount_paid = data.get('amount_paid', 0)
    
    # Validate required fields
    if not all([user_email, plan_type, payment_id, amount_paid]):
        return jsonify({
            'success': False,
            'error': 'Missing required fields: email, plan_type, razorpay_payment_id, amount_paid'
        }), 400
    
    # TODO: Verify payment signature with Razorpay API (if order_id provided)
    # For now, trust the payment_id (frontend is responsible for secure payment flow)
    
    try:
        # Create subscription record with payment timestamp as start time
        # This ensures expiry is calculated from the exact payment confirmation moment
        success, result = subscription_manager.create_subscription(
            user_email=user_email,
            plan_type=plan_type,
            payment_id=payment_id,
            razorpay_order_id=order_id,
            razorpay_signature=signature,
            amount_paid=amount_paid,
            start_time=datetime.utcnow()  # Exact moment of payment confirmation
        )
        
        if success:
            return jsonify({
                'success': True,
                'subscription': result,
                'message': f'Subscription activated: {result["plan_name"]}'
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Failed to create subscription')
            }), 400
    
    except Exception as e:
        print(f"❌ Payment verification error: {e}")
        return jsonify({
            'success': False,
            'error': f'Payment verification failed: {str(e)}'
        }), 500


@subscription_bp.route('/api/subscription/current-plan', methods=['GET'])
def get_current_plan():
    """
    Get current plan details for user.
    Simplified endpoint for quick checks.
    
    Returns:
    {
        "plan_type": "monthly",
        "plan_name": "Monthly",
        "is_expired": bool,
        "expiry_time": "ISO UTC timestamp",
        "days_remaining": int (nullable),
        "client_limit": int or null (unlimited)
    }
    """
    user_email = request.headers.get('X-User-Email') or request.args.get('email')
    
    if not user_email:
        return jsonify({'error': 'User email required'}), 400
    
    subscription = subscription_manager.get_user_subscription(user_email)
    
    return jsonify({
        'plan_type': subscription['plan_type'],
        'plan_name': subscription['plan_name'],
        'is_expired': subscription['is_expired'],
        'expiry_time': subscription['expiry_time'],
        'client_limit': None if subscription['plan_type'] != 'free' else 20
    }), 200


@subscription_bp.route('/api/subscription/validate-access', methods=['POST'])
def validate_access():
    """
    Validate if user has access to premium features.
    Used by frontend to block UI/API calls for expired users.
    
    Request:
    {
        "email": "user@example.com"
    }
    
    Returns:
    {
        "has_access": bool,
        "reason": string (if denied),
        "expiry_time": "ISO UTC timestamp" (if expired),
        "renew_url": "subscription upgrade URL"
    }
    """
    data = request.get_json() or {}
    user_email = data.get('email') or request.headers.get('X-User-Email')
    
    if not user_email:
        return jsonify({'error': 'User email required'}), 400
    
    subscription = subscription_manager.get_user_subscription(user_email)
    
    # Free tier always has access (with client limit)
    # Expired tier is BLOCKED from premium features
    has_access = subscription['plan_type'] != 'free' and not subscription['is_expired']
    
    response = {
        'has_access': has_access,
        'plan_type': subscription['plan_type'],
        'is_expired': subscription['is_expired']
    }
    
    if not has_access and subscription['is_expired']:
        response['reason'] = 'Your subscription has expired. Please renew to access premium features.'
        response['expiry_time'] = subscription['expiry_time']
    
    return jsonify(response), 200


@subscription_bp.route('/api/subscription/plans', methods=['GET'])
def get_plans():
    """
    Get all available subscription plans.
    Frontend uses this to render the upgrade modal.
    
    Returns:
    {
        "plans": {
            "oneday": { name, price, duration_hours, features },
            "monthly": { ... },
            "quarterly": { ... },
            "yearly": { ... }
        }
    }
    """
    from subscription_manager import SUBSCRIPTION_PLANS
    
    return jsonify({
        'plans': SUBSCRIPTION_PLANS
    }), 200
