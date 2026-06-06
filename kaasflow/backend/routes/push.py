"""
SamKass - Push Notification Routes
Handles push subscription and notification action responses
"""

from flask import Blueprint, request, jsonify
from auth.jwt_handler import token_required
from supabase_db import get_supabase_client
from datetime import datetime, timedelta
import json

push_bp = Blueprint('push', __name__)

@push_bp.route('/push/subscribe', methods=['POST'])
@token_required
def subscribe_to_push(current_user):
    """Save push subscription for a user"""
    try:
        data = request.get_json()
        
        if not data or 'subscription' not in data:
            return jsonify({'error': 'Subscription data required'}), 400
        
        subscription_json = json.dumps(data['subscription'])
        user_id = current_user['id']
        
        supabase = get_supabase_client()
        
        # Check if subscription already exists
        existing = supabase.table('push_subscriptions').select('*').eq(
            'user_id', user_id
        ).eq('endpoint', data['subscription']['endpoint']).execute()
        
        if existing.data:
            # Update existing subscription
            supabase.table('push_subscriptions').update({
                'subscription_json': subscription_json,
                'active': True,
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', existing.data[0]['id']).execute()
            
            return jsonify({
                'success': True,
                'message': 'Subscription updated'
            }), 200
        else:
            # Create new subscription
            supabase.table('push_subscriptions').insert({
                'user_id': user_id,
                'subscription_json': subscription_json,
                'endpoint': data['subscription']['endpoint'],
                'active': True,
                'created_at': datetime.utcnow().isoformat()
            }).execute()
            
            return jsonify({
                'success': True,
                'message': 'Subscription created'
            }), 201
            
    except Exception as e:
        print(f"❌ Error saving push subscription: {e}")
        return jsonify({'error': str(e)}), 500

@push_bp.route('/push/unsubscribe', methods=['POST'])
@token_required
def unsubscribe_from_push(current_user):
    """Unsubscribe from push notifications"""
    try:
        data = request.get_json()
        endpoint = data.get('endpoint')
        user_id = current_user['id']
        
        supabase = get_supabase_client()
        
        # Mark subscription as inactive
        supabase.table('push_subscriptions').update({
            'active': False
        }).eq('user_id', user_id).eq('endpoint', endpoint).execute()
        
        return jsonify({
            'success': True,
            'message': 'Unsubscribed successfully'
        }), 200
        
    except Exception as e:
        print(f"❌ Error unsubscribing: {e}")
        return jsonify({'error': str(e)}), 500

@push_bp.route('/notify-action', methods=['POST'])
@token_required
def handle_notification_action(current_user):
    """Handle payment action from notification (paid/unpaid/partly_paid)"""
    try:
        data = request.get_json()
        
        loan_id = data.get('loan_id')
        action = data.get('action')  # 'paid', 'unpaid', 'partly_paid'
        amount = float(data.get('amount', 0))
        
        if not loan_id or not action:
            return jsonify({'error': 'loan_id and action required'}), 400
        
        supabase = get_supabase_client()
        
        # Get loan details
        loan_response = supabase.table('loans').select('*').eq('id', loan_id).execute()
        
        if not loan_response.data:
            return jsonify({'error': 'Loan not found'}), 404
        
        loan = loan_response.data[0]
        
        # Calculate EMI
        emi_amount = calculate_emi_amount(loan)
        
        # Get existing payments for this loan
        payments_response = supabase.table('payments').select('*').eq('loan_id', loan_id).execute()
        total_paid = sum(p['amount'] for p in payments_response.data)
        
        # Calculate total payable
        principal = loan['principal']
        interest_rate = loan['interest_rate']
        interest_type = loan['interest_type']
        duration = loan['duration']
        
        if interest_type == 'fixed':
            monthly_interest = interest_rate
        else:
            monthly_interest = (principal * interest_rate) / 100
        
        if duration and duration > 0:
            total_interest = monthly_interest * duration
            total_payable = principal + total_interest
        else:
            total_payable = principal
        
        # Process action
        if action == 'paid':
            # Full payment received
            payment_record = {
                'loan_id': loan_id,
                'client_id': loan['client_id'],
                'amount': emi_amount,
                'date': datetime.utcnow().date().isoformat(),
                'mode': 'Cash',
                'note': 'Paid via notification',
                'created_at': datetime.utcnow().isoformat()
            }
            
            supabase.table('payments').insert(payment_record).execute()
            
            # Update next_due_date
            current_due_date = datetime.fromisoformat(loan['next_due_date'])
            if loan['type'] == 'weekly':
                next_due_date = current_due_date + timedelta(days=7)
            else:  # monthly
                next_due_date = current_due_date + timedelta(days=30)
            
            # Update loan
            new_total_paid = total_paid + emi_amount
            remaining = max(0, total_payable - new_total_paid)
            
            loan_updates = {
                'next_due_date': next_due_date.date().isoformat()
            }
            
            # Mark as completed if fully paid
            if remaining <= 0:
                loan_updates['status'] = 'completed'
            
            supabase.table('loans').update(loan_updates).eq('id', loan_id).execute()
            
            return jsonify({
                'success': True,
                'message': 'Payment marked as PAID',
                'amount': emi_amount,
                'next_due_date': next_due_date.date().isoformat()
            }), 200
            
        elif action == 'unpaid':
            # Payment not received - just log it
            # No payment record created, next_due_date stays same
            return jsonify({
                'success': True,
                'message': 'Payment marked as UNPAID',
                'note': 'No changes made to loan'
            }), 200
            
        elif action == 'partly_paid':
            # Partial payment received
            if amount <= 0:
                return jsonify({'error': 'Amount must be greater than 0'}), 400
            
            payment_record = {
                'loan_id': loan_id,
                'client_id': loan['client_id'],
                'amount': amount,
                'date': datetime.utcnow().date().isoformat(),
                'mode': 'Cash',
                'note': f'Partial payment via notification (₹{amount} of ₹{emi_amount})',
                'created_at': datetime.utcnow().isoformat()
            }
            
            supabase.table('payments').insert(payment_record).execute()
            
            # Calculate remaining
            new_total_paid = total_paid + amount
            remaining = max(0, total_payable - new_total_paid)
            
            # next_due_date stays same (still pending full payment)
            return jsonify({
                'success': True,
                'message': 'Partial payment recorded',
                'amount': amount,
                'remaining_for_this_emi': emi_amount - amount,
                'total_remaining': remaining
            }), 200
        
        else:
            return jsonify({'error': 'Invalid action'}), 400
            
    except Exception as e:
        print(f"❌ Error handling notification action: {e}")
        return jsonify({'error': str(e)}), 500

def calculate_emi_amount(loan):
    """Calculate EMI amount for a loan"""
    principal = loan['principal']
    interest_rate = loan['interest_rate']
    interest_type = loan['interest_type']
    duration = loan['duration']
    loan_type = loan['type']
    
    # Calculate monthly interest
    if interest_type == 'fixed':
        monthly_interest = interest_rate
    else:
        monthly_interest = (principal * interest_rate) / 100
    
    if not duration or duration <= 0:
        return monthly_interest
    
    total_interest = monthly_interest * duration
    total_payable = principal + total_interest
    
    # Calculate installments based on type
    if loan_type == 'weekly':
        installments = duration * 4
    else:  # monthly
        installments = duration
    
    emi = total_payable / installments
    return round(emi, 2)
