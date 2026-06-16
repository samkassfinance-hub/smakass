"""
Subscription Manager - Server-side subscription enforcement
Handles: expiry calculations, storage, validation, and anti-bypass checks
"""

from datetime import datetime, timedelta
import pytz
from supabase import create_client
import os

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# Plan configurations (duration in days)
SUBSCRIPTION_PLANS = {
    'oneday': {'name': '1-Day Trial', 'price': 800, 'duration': 1, 'currency': 'INR'},
    'monthly': {'name': 'Monthly Plan', 'price': 27000, 'duration': 30, 'currency': 'INR'},
    'quarterly': {'name': 'Quarterly Plan', 'price': 85000, 'duration': 90, 'currency': 'INR'},
    'yearly': {'name': 'Yearly Plan', 'price': 199900, 'duration': 365, 'currency': 'INR'}
}

def get_utc_now():
    """Get current UTC time - NEVER use client time"""
    return datetime.now(pytz.UTC)

def get_supabase_client():
    """Get Supabase client for database operations"""
    if SUPABASE_URL and SUPABASE_KEY:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    return None

def create_user_subscription_entry(user_email):
    """
    Create default FREE subscription for new user
    Called during user registration
    """
    supabase = get_supabase_client()
    if not supabase:
        print("❌ Supabase not configured for subscription creation")
        return {'success': False, 'error': 'Database not configured'}
    
    try:
        existing = supabase.table('user_subscriptions').select('*').eq('user_email', user_email).execute()
        if existing.data:
            return {'success': True, 'data': existing.data[0], 'message': 'Subscription already exists'}
        
        # Create FREE subscription
        now_utc = get_utc_now().isoformat()
        sub_data = {
            'user_email': user_email,
            'plan_type': 'free',
            'start_time': now_utc,
            'expiry_time': None,  # FREE tier never expires
            'is_active': True,
            'total_paid': 0,
            'payment_count': 0,
            'created_at': now_utc,
            'last_renewed_at': None
        }
        
        response = supabase.table('user_subscriptions').insert(sub_data).execute()
        print(f"✅ Created FREE subscription for {user_email}")
        return {'success': True, 'data': response.data[0] if response.data else sub_data}
    
    except Exception as e:
        print(f"❌ Error creating subscription: {e}")
        return {'success': False, 'error': str(e)}

def get_subscription_status(user_email):
    """
    Get current subscription status for user
    ALWAYS verifies against server time (NEVER client time)
    Returns: { plan_type, is_active, days_remaining, expiry_time }
    """
    supabase = get_supabase_client()
    if not supabase:
        return {'success': False, 'error': 'Database not configured', 'plan_type': 'free', 'is_active': False}
    
    try:
        response = supabase.table('user_subscriptions').select('*').eq('user_email', user_email).execute()
        
        if not response.data:
            # Create FREE subscription if doesn't exist
            return create_user_subscription_entry(user_email)
        
        sub = response.data[0]
        plan_type = sub.get('plan_type', 'free')
        expiry_time_str = sub.get('expiry_time')
        
        # FREE tier is always active
        if plan_type == 'free':
            return {
                'success': True,
                'plan_type': 'free',
                'is_active': True,
                'days_remaining': None,
                'expiry_time': None,
                'client_limit': 20
            }
        
        # Check if PAID subscription is expired
        if expiry_time_str:
            expiry_time = datetime.fromisoformat(expiry_time_str)
            current_time = get_utc_now()
            
            is_expired = current_time >= expiry_time
            
            if is_expired:
                # Subscription expired - mark as inactive and revert to FREE
                supabase.table('user_subscriptions').update({
                    'plan_type': 'free',
                    'is_active': False,
                    'expiry_time': None
                }).eq('user_email', user_email).execute()
                
                return {
                    'success': True,
                    'plan_type': 'free',
                    'is_active': False,
                    'days_remaining': 0,
                    'expiry_time': None,
                    'expired_at': expiry_time.isoformat(),
                    'client_limit': 20
                }
            
            # Plan is still active
            days_remaining = (expiry_time - current_time).days
            if days_remaining < 0:
                days_remaining = 0
            
            return {
                'success': True,
                'plan_type': plan_type,
                'is_active': True,
                'days_remaining': days_remaining,
                'expiry_time': expiry_time_str,
                'client_limit': float('inf')
            }
        
        return {
            'success': True,
            'plan_type': plan_type,
            'is_active': True,
            'client_limit': 20
        }
    
    except Exception as e:
        print(f"❌ Error getting subscription status: {e}")
        return {'success': False, 'error': str(e), 'plan_type': 'free', 'is_active': False}

def update_subscription_after_payment(user_email, plan_type, payment_id, amount):
    """
    Update subscription AFTER Razorpay payment verification
    Called from payment verification endpoint
    
    Args:
        user_email: User's email
        plan_type: 'oneday', 'monthly', 'quarterly', 'yearly'
        payment_id: Razorpay payment ID (for tracking)
        amount: Amount paid in paise
    
    Returns:
        { success, plan_type, expiry_time, days_remaining }
    """
    supabase = get_supabase_client()
    if not supabase:
        return {'success': False, 'error': 'Database not configured'}
    
    if plan_type not in SUBSCRIPTION_PLANS:
        return {'success': False, 'error': f'Invalid plan type: {plan_type}'}
    
    try:
        plan_config = SUBSCRIPTION_PLANS[plan_type]
        
        # Calculate expiry: now + duration days
        now_utc = get_utc_now()
        expiry_utc = now_utc + timedelta(days=plan_config['duration'])
        
        # Get current subscription to check for overlapping plans
        current = supabase.table('user_subscriptions').select('*').eq('user_email', user_email).execute()
        
        if current.data:
            sub = current.data[0]
            current_expiry_str = sub.get('expiry_time')
            
            # If overlapping plans: extend from current expiry, not from now
            if current_expiry_str:
                current_expiry = datetime.fromisoformat(current_expiry_str)
                if current_expiry > now_utc:
                    expiry_utc = current_expiry + timedelta(days=plan_config['duration'])
                    print(f"✅ Overlapping plan detected. New expiry: {expiry_utc.isoformat()}")
        
        # Update subscription in database
        update_data = {
            'plan_type': plan_type,
            'is_active': True,
            'start_time': now_utc.isoformat(),
            'expiry_time': expiry_utc.isoformat(),
            'last_renewed_at': now_utc.isoformat(),
            'last_payment_id': payment_id,
            'last_payment_amount': amount
        }
        
        # Increment payment count and total paid
        if current.data:
            sub = current.data[0]
            update_data['payment_count'] = (sub.get('payment_count', 0) or 0) + 1
            update_data['total_paid'] = (sub.get('total_paid', 0) or 0) + amount
        else:
            update_data['payment_count'] = 1
            update_data['total_paid'] = amount
        
        response = supabase.table('user_subscriptions').update(update_data).eq('user_email', user_email).execute()
        
        days_remaining = (expiry_utc - now_utc).days
        
        print(f"✅ Updated subscription for {user_email}: {plan_type} expires {expiry_utc.isoformat()}")
        
        return {
            'success': True,
            'plan_type': plan_type,
            'expiry_time': expiry_utc.isoformat(),
            'days_remaining': days_remaining,
            'start_time': now_utc.isoformat(),
            'plan_name': plan_config['name']
        }
    
    except Exception as e:
        print(f"❌ Error updating subscription: {e}")
        return {'success': False, 'error': str(e)}

def check_client_limit(user_email, client_count):
    """
    Check if user can add more clients based on subscription
    Returns: { can_add: bool, limit: int, current: int, reason: str }
    """
    status = get_subscription_status(user_email)
    
    if not status.get('success'):
        return {'can_add': False, 'reason': 'Unable to verify subscription', 'limit': 20, 'current': client_count}
    
    limit = status.get('client_limit', 20)
    
    if client_count >= limit:
        return {
            'can_add': False,
            'reason': f'Client limit reached: {client_count}/{limit}',
            'limit': limit,
            'current': client_count
        }
    
    return {
        'can_add': True,
        'limit': limit,
        'current': client_count,
        'remaining': limit - client_count if limit != float('inf') else None
    }

def verify_subscription_for_api(user_email):
    """
    Verify subscription before allowing API access
    Used as middleware for protected routes
    """
    status = get_subscription_status(user_email)
    
    if not status.get('success'):
        return {'authorized': False, 'error': 'Subscription verification failed', 'status_code': 500}
    
    plan_type = status.get('plan_type')
    is_active = status.get('is_active')
    
    # FREE tier is always allowed
    if plan_type == 'free' and is_active:
        return {'authorized': True, 'plan_type': 'free'}
    
    # PAID plans must be active and not expired
    if is_active and plan_type != 'free':
        return {'authorized': True, 'plan_type': plan_type}
    
    # Expired or inactive
    return {
        'authorized': False,
        'error': 'Subscription expired. Please renew.',
        'status_code': 403,
        'plan_type': plan_type
    }
