"""
Cron job endpoints for scheduled tasks
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import pytz
import os
from pywebpush import webpush, WebPushException
import json
from supabase_db import get_supabase_client

cron_bp = Blueprint('cron', __name__)

IST = pytz.timezone('Asia/Kolkata')

def calculate_emi(loan):
    """Calculate EMI amount for a loan"""
    principal = loan.get('principal', 0)
    interest_rate = loan.get('interest_rate', 0)
    interest_type = loan.get('interest_type', 'percentage')
    duration = loan.get('duration', 0)
    loan_type = loan.get('type', 'monthly')
    
    if interest_type == 'fixed':
        monthly_interest = interest_rate
    else:
        monthly_interest = (principal * interest_rate) / 100
    
    if not duration or duration <= 0:
        return monthly_interest
    
    total_interest = monthly_interest * duration
    total_payable = principal + total_interest
    
    installments = duration * 4 if loan_type == 'weekly' else duration
    emi = total_payable / installments
    
    return round(emi, 2)

@cron_bp.route('/send-notifications', methods=['GET', 'POST'])
def send_notifications():
    """Send push notifications for due loans - called by external cron job"""
    
    # Verify cron secret
    cron_secret = request.headers.get('X-Cron-Secret')
    expected_secret = os.getenv('CRON_SECRET', 'change-this-secret')
    
    print(f"🔐 Cron: Received secret: {cron_secret}")
    print(f"🔐 Cron: Expected secret: {expected_secret}")
    
    if cron_secret != expected_secret:
        print(f"❌ Cron: Secret mismatch!")
        return jsonify({'error': 'Unauthorized', 'debug': f'received={cron_secret is not None}'}), 401
    
    try:
        supabase = get_supabase_client()
        today = datetime.now(IST).date()
        
        print(f"🔔 Cron: Checking for due loans on {today}")
        
        # Get all active loans due today or overdue
        loans_response = supabase.table('loans').select('''
            *,
            clients (
                id,
                name,
                phone
            )
        ''').eq('status', 'active').lte('next_due_date', str(today)).execute()
        
        due_loans = loans_response.data
        print(f"📊 Cron: Found {len(due_loans)} due loans")
        
        if not due_loans:
            return jsonify({'sent': 0, 'success': True, 'message': 'No due loans'})
        
        # Group loans by user_id
        loans_by_user = {}
        for loan in due_loans:
            user_id = loan.get('user_id')
            if not user_id:
                continue
                
            if user_id not in loans_by_user:
                loans_by_user[user_id] = []
            
            client = loan.get('clients', {})
            emi_amount = calculate_emi(loan)
            
            loans_by_user[user_id].append({
                'loan_id': loan['id'],
                'client_id': client.get('id'),
                'client_name': client.get('name', 'Unknown'),
                'amount': emi_amount,
                'due_date': loan.get('next_due_date')
            })
        
        print(f"👥 Cron: Found {len(loans_by_user)} users with due loans")
        
        # Get push subscriptions for these users
        user_ids = list(loans_by_user.keys())
        subs_response = supabase.table('push_subscriptions').select('*').in_('user_id', user_ids).eq('active', True).execute()
        
        subscriptions = subs_response.data
        print(f"📱 Cron: Found {len(subscriptions)} active push subscriptions")
        
        vapid_private_key = os.getenv('VAPID_PRIVATE_KEY')
        vapid_claim_email = os.getenv('VAPID_CLAIM_EMAIL', 'mailto:samkassfinance@gmail.com')
        
        if not vapid_private_key:
            return jsonify({'error': 'VAPID keys not configured'}), 500
        
        sent_count = 0
        
        # Send notification to each user
        for subscription in subscriptions:
            user_id = subscription['user_id']
            user_loans = loans_by_user.get(user_id, [])
            
            if not user_loans:
                continue
            
            # Create notification payload
            total_amount = sum(loan['amount'] for loan in user_loans)
            client_names = ', '.join(set(loan['client_name'] for loan in user_loans[:3]))
            
            if len(user_loans) > 3:
                client_names += f' +{len(user_loans) - 3} more'
            
            notification_data = {
                'title': '🔔 SamKass — EMI Due',
                'body': f'{len(user_loans)} EMI(s) due today: {client_names}. Total: ₹{total_amount:.2f}',
                'icon': 'https://samkass.site/logo.png',
                'badge': 'https://samkass.site/logo.png',
                'requireInteraction': True,
                'tag': 'emi-due',
                'renotify': True,
                'actions': [
                    {'action': 'paid', 'title': '✅ Paid', 'icon': 'https://samkass.site/logo.png'},
                    {'action': 'unpaid', 'title': '❌ Unpaid', 'icon': 'https://samkass.site/logo.png'}
                ],
                'data': {
                    'loans': user_loans,
                    'timestamp': datetime.now(IST).isoformat()
                }
            }
            
            try:
                # Send push notification
                webpush(
                    subscription_info=json.loads(subscription['subscription_json']),
                    data=json.dumps(notification_data),
                    vapid_private_key=vapid_private_key,
                    vapid_claims={'sub': vapid_claim_email}
                )
                
                sent_count += 1
                print(f"✅ Cron: Sent notification to user {user_id}")
                
            except WebPushException as e:
                print(f"❌ Cron: WebPush error for user {user_id}: {e}")
                
                # Mark subscription as inactive if expired
                if e.response and e.response.status_code in [404, 410]:
                    supabase.table('push_subscriptions').update({
                        'active': False
                    }).eq('id', subscription['id']).execute()
                    
            except Exception as e:
                print(f"❌ Cron: Error sending to user {user_id}: {e}")
        
        return jsonify({
            'sent': sent_count,
            'success': True,
            'total_due_loans': len(due_loans),
            'users_notified': sent_count,
            'timestamp': datetime.now(IST).isoformat()
        })
        
    except Exception as e:
        print(f"❌ Cron: Fatal error: {e}")
        return jsonify({'error': str(e), 'success': False}), 500

@cron_bp.route('/notify-action', methods=['POST'])
def notify_action():
    """Handle notification button clicks - works without JWT"""
    
    try:
        data = request.get_json()
        loans = data.get('loans', [])
        action = data.get('action')
        amount = data.get('amount')
        
        if not loans or not action:
            return jsonify({'error': 'Missing loans or action'}), 400
        
        supabase = get_supabase_client()
        updated_count = 0
        
        for loan_data in loans:
            loan_id = loan_data.get('loan_id')
            
            if not loan_id:
                continue
            
            # Get loan from database
            loan_response = supabase.table('loans').select('*').eq('id', loan_id).execute()
            
            if not loan_response.data:
                continue
            
            loan = loan_response.data[0]
            
            # Update based on action
            update_data = {}
            
            if action == 'paid':
                # Calculate next due date
                current_due = datetime.strptime(loan['next_due_date'], '%Y-%m-%d')
                
                if loan['type'] == 'weekly':
                    next_due = current_due + timedelta(days=7)
                else:
                    next_due = current_due + timedelta(days=30)
                
                update_data['next_due_date'] = next_due.strftime('%Y-%m-%d')
                
                # Check if loan is completed
                # This is simplified - you may want to check remaining payments
                
            elif action == 'unpaid':
                # Just record as unpaid - due date stays same
                pass
            
            elif action == 'partly_paid' and amount:
                # Record partial payment amount
                update_data['last_partial_amount'] = amount
            
            # Update the loan
            if update_data:
                supabase.table('loans').update(update_data).eq('id', loan_id).execute()
            
            updated_count += 1
        
        return jsonify({
            'success': True,
            'updated': updated_count
        })
        
    except Exception as e:
        print(f"❌ Notify action error: {e}")
        return jsonify({'error': str(e)}), 500
