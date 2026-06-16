"""
SamKass Subscription Enforcement System
Server-side subscription validation, expiry tracking, and client limit enforcement
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple
import os
from supabase import create_client, Client
from functools import wraps
from flask import request, jsonify

# ─── SUBSCRIPTION PLANS DEFINITION ─────────────────────────────
SUBSCRIPTION_PLANS = {
    'oneday': {
        'name': '1-Day Plan',
        'price': 8,
        'duration_hours': 24,
        'client_limit': None,  # Unlimited
        'features': {
            'unlimited_clients': True,
            'premium_features': True,
            'full_access': True
        }
    },
    'monthly': {
        'name': 'Monthly',
        'price': 270,
        'duration_hours': 30 * 24,  # 30 days
        'client_limit': None,  # Unlimited
        'features': {
            'unlimited_clients': True,
            'premium_features': True,
            'full_access': True
        }
    },
    'quarterly': {
        'name': 'Quarterly',
        'price': 850,
        'duration_hours': 90 * 24,  # 90 days
        'client_limit': None,  # Unlimited
        'features': {
            'unlimited_clients': True,
            'premium_features': True,
            'full_access': True
        }
    },
    'yearly': {
        'name': 'Yearly',
        'price': 1999,
        'duration_hours': 365 * 24,  # 365 days
        'client_limit': None,  # Unlimited
        'features': {
            'unlimited_clients': True,
            'premium_features': True,
            'full_access': True
        }
    }
}

# Free tier rules
FREE_TIER = {
    'name': 'Free Plan',
    'price': 0,
    'client_limit': 20,  # HARD LIMIT
    'features': {
        'unlimited_clients': False,
        'premium_features': False,
        'full_access': True
    }
}


class SubscriptionManager:
    """
    Handles all subscription operations: creation, expiry checking, client limits, etc.
    All timestamps are UTC. Server time is the single source of truth.
    """
    
    def __init__(self):
        self.supabase: Client = self._init_supabase()
    
    def _init_supabase(self) -> Optional[Client]:
        """Initialize Supabase client"""
        try:
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
            if url and key:
                return create_client(url, key)
        except Exception as e:
            print(f"⚠️  Supabase initialization failed: {e}")
        return None
    
    def get_user_subscription(self, user_email: str) -> Dict:
        """
        Get subscription status for a user from the database.
        Returns subscription data including expiry time (UTC).
        
        CRITICAL: Always returns UTC timestamps for expiry.
        """
        if not self.supabase or not user_email:
            return self._default_free_tier()
        
        try:
            # Query active subscription for user
            response = self.supabase.table('subscriptions').select('*').eq('email', user_email).order('created_at', desc=True).limit(1).execute()
            
            if response.data and len(response.data) > 0:
                sub = response.data[0]
                # Return the subscription record as-is
                # expiry_time is already UTC from the database
                return {
                    'id': sub.get('id'),
                    'email': sub.get('email'),
                    'plan_type': sub.get('plan_type'),
                    'plan_name': SUBSCRIPTION_PLANS.get(sub.get('plan_type'), {}).get('name', sub.get('plan_name')),
                    'start_time': sub.get('start_time'),
                    'expiry_time': sub.get('expiry_time'),  # UTC timestamp
                    'status': sub.get('status', 'active'),
                    'payment_id': sub.get('payment_id'),
                    'razorpay_order_id': sub.get('razorpay_order_id'),
                    'amount_paid': sub.get('amount_paid'),
                    'is_expired': self._is_expired(sub.get('expiry_time'))
                }
            else:
                return self._default_free_tier()
        
        except Exception as e:
            print(f"❌ Error fetching subscription for {user_email}: {e}")
            return self._default_free_tier()
    
    def _default_free_tier(self) -> Dict:
        """Return default free tier subscription object"""
        return {
            'id': None,
            'email': None,
            'plan_type': 'free',
            'plan_name': FREE_TIER['name'],
            'start_time': None,
            'expiry_time': None,
            'status': 'active',
            'payment_id': None,
            'razorpay_order_id': None,
            'amount_paid': 0,
            'is_expired': False,
            'client_limit': FREE_TIER['client_limit']
        }
    
    def _is_expired(self, expiry_time: str) -> bool:
        """
        Check if subscription has expired.
        Compare against UTC server time (current datetime.utcnow()).
        """
        if not expiry_time:
            return False
        
        try:
            # Parse expiry_time (should be ISO format UTC)
            if isinstance(expiry_time, str):
                # Handle ISO format: "2025-01-15T10:30:00Z" or "2025-01-15T10:30:00"
                expiry_dt = datetime.fromisoformat(expiry_time.replace('Z', '+00:00'))
            else:
                expiry_dt = expiry_time
            
            # Compare with current UTC time
            current_utc = datetime.utcnow()
            return current_utc >= expiry_dt
        except Exception as e:
            print(f"⚠️  Error checking expiry: {e}")
            return False
    
    def create_subscription(
        self,
        user_email: str,
        plan_type: str,
        payment_id: str,
        razorpay_order_id: str,
        razorpay_signature: str,
        amount_paid: float,
        start_time: Optional[datetime] = None
    ) -> Tuple[bool, Dict]:
        """
        Create a new subscription record in the database.
        
        Args:
            user_email: User's email
            plan_type: 'oneday', 'monthly', 'quarterly', 'yearly'
            payment_id: Razorpay payment ID
            razorpay_order_id: Razorpay order ID
            razorpay_signature: Razorpay payment signature (for verification)
            amount_paid: Amount paid in INR
            start_time: (Optional) Explicit start time; defaults to current UTC time
        
        Returns:
            (success: bool, data: Dict with subscription details)
        
        EXPIRY CALCULATION:
        - Start time: Exact UTC moment payment was confirmed
        - Expiry time: Start time + plan duration (exactly)
        - Example: Payment at 3:45 PM UTC → 1-day plan expires at 3:45 PM UTC next day
        """
        if not self.supabase:
            return False, {'error': 'Database not available'}
        
        if plan_type not in SUBSCRIPTION_PLANS:
            return False, {'error': f'Invalid plan: {plan_type}'}
        
        try:
            plan = SUBSCRIPTION_PLANS[plan_type]
            
            # Use provided start time or current UTC time
            if start_time is None:
                start_time = datetime.utcnow()
            elif isinstance(start_time, str):
                start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            
            # Calculate expiry: add exact duration to start time
            duration = timedelta(hours=plan['duration_hours'])
            expiry_time = start_time + duration
            
            # Prepare subscription record
            subscription_data = {
                'email': user_email,
                'plan_type': plan_type,
                'plan_name': plan['name'],
                'start_time': start_time.isoformat() + 'Z',
                'expiry_time': expiry_time.isoformat() + 'Z',
                'status': 'active',
                'payment_id': payment_id,
                'razorpay_order_id': razorpay_order_id,
                'razorpay_signature': razorpay_signature,
                'amount_paid': amount_paid,
                'created_at': datetime.utcnow().isoformat() + 'Z'
            }
            
            # Upsert into database (replace if exists, insert if not)
            response = self.supabase.table('subscriptions').upsert(
                subscription_data,
                on_conflict='email'
            ).execute()
            
            if response.data:
                return True, {
                    'subscription_id': response.data[0].get('id'),
                    'plan_name': plan['name'],
                    'start_time': start_time.isoformat() + 'Z',
                    'expiry_time': expiry_time.isoformat() + 'Z',
                    'amount_paid': amount_paid
                }
            else:
                return False, {'error': 'Failed to create subscription'}
        
        except Exception as e:
            print(f"❌ Error creating subscription: {e}")
            return False, {'error': str(e)}
    
    def check_client_limit(self, user_email: str, current_client_count: int) -> Tuple[bool, Dict]:
        """
        Check if user can add another client based on subscription status.
        
        Returns:
            (can_add: bool, info: Dict with limit details)
        
        RULES:
        - Free tier: 20 client hard limit
        - Paid tier (active): Unlimited
        - Expired subscription: Reverts to free tier (20 limit)
        """
        subscription = self.get_user_subscription(user_email)
        
        # Determine effective limit
        if subscription['plan_type'] == 'free' or subscription['is_expired']:
            # Free tier or expired: 20 client limit
            limit = FREE_TIER['client_limit']
            plan_name = 'Free Plan'
        else:
            # Active paid subscription: unlimited
            limit = float('inf')
            plan_name = subscription['plan_name']
        
        can_add = current_client_count < limit
        
        return can_add, {
            'can_add': can_add,
            'current_count': current_client_count,
            'limit': limit if limit != float('inf') else 'Unlimited',
            'plan_name': plan_name,
            'is_expired': subscription['is_expired'],
            'expiry_time': subscription['expiry_time']
        }
    
    def get_client_count(self, user_email: str) -> int:
        """Get number of clients for a user from database"""
        if not self.supabase or not user_email:
            return 0
        
        try:
            response = self.supabase.table('clients').select('count', count='exact').eq('user_email', user_email).execute()
            return response.count or 0
        except Exception as e:
            print(f"⚠️  Error counting clients: {e}")
            return 0
    
    def get_subscription_status(self, user_email: str) -> Dict:
        """
        Get complete subscription status for frontend display.
        Includes expiry time, days remaining, plan details, etc.
        """
        subscription = self.get_user_subscription(user_email)
        client_count = self.get_client_count(user_email)
        
        # Calculate days remaining
        days_remaining = None
        if subscription['expiry_time'] and not subscription['is_expired']:
            try:
                expiry_dt = datetime.fromisoformat(subscription['expiry_time'].replace('Z', '+00:00'))
                current_utc = datetime.utcnow()
                days_remaining = (expiry_dt - current_utc).days
            except:
                pass
        
        can_add, limit_info = self.check_client_limit(user_email, client_count)
        
        return {
            'subscription': subscription,
            'client_count': client_count,
            'can_add_client': can_add,
            'limit_info': limit_info,
            'days_remaining': days_remaining,
            'free_tier_limit': FREE_TIER['client_limit'],
            'available_plans': {
                'oneday': SUBSCRIPTION_PLANS['oneday'],
                'monthly': SUBSCRIPTION_PLANS['monthly'],
                'quarterly': SUBSCRIPTION_PLANS['quarterly'],
                'yearly': SUBSCRIPTION_PLANS['yearly']
            }
        }


# ─── FLASK DECORATORS ─────────────────────────────────────────
subscription_manager = SubscriptionManager()


def require_active_subscription(f):
    """
    Decorator to protect routes that require an active (non-expired) subscription.
    Returns 403 if subscription is expired or not found.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get user email from request
        user_email = request.headers.get('X-User-Email') or request.json.get('email') if request.is_json else None
        
        if not user_email:
            return jsonify({'error': 'User email not provided'}), 401
        
        subscription = subscription_manager.get_user_subscription(user_email)
        
        # If free tier, allow (routes can decide their own limits)
        if subscription['plan_type'] == 'free':
            return f(*args, **kwargs)
        
        # If subscription is expired, block with 403
        if subscription['is_expired']:
            return jsonify({
                'error': 'Subscription expired',
                'message': 'Please renew your subscription to continue',
                'expiry_time': subscription['expiry_time']
            }), 403
        
        return f(*args, **kwargs)
    
    return decorated_function


def require_subscription_status(f):
    """
    Decorator to attach subscription status to request context.
    Does not block; just provides subscription info.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_email = request.headers.get('X-User-Email') or (request.json.get('email') if request.is_json else None)
        
        if user_email:
            subscription = subscription_manager.get_user_subscription(user_email)
            # Attach to request context (Flask doesn't support this directly; use g)
            from flask import g
            g.subscription = subscription
        
        return f(*args, **kwargs)
    
    return decorated_function
