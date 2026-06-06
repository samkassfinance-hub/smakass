"""
Test endpoint for push notifications
"""

from flask import Blueprint, request, jsonify
from auth.jwt_handler import token_required
from notification_scheduler import send_push_notification, get_push_subscriptions
import json

test_push_bp = Blueprint('test_push', __name__)

@test_push_bp.route('/test-push', methods=['POST'])
@token_required
def test_push_notification(current_user):
    """Send a test push notification to all subscriptions"""
    try:
        # Get all active subscriptions
        subscriptions = get_push_subscriptions()
        
        if not subscriptions:
            return jsonify({
                'success': False,
                'error': 'No active push subscriptions found'
            }), 404
        
        # Create test notification data
        test_loan = {
            'id': 'test-123',
            'client_id': 'test-client',
            'next_due_date': '2025-01-06'
        }
        
        client_name = 'Test Client'
        emi_amount = 5000.00
        
        # Send to all subscriptions
        sent_count = 0
        for subscription in subscriptions:
            if send_push_notification(subscription, test_loan, client_name, emi_amount):
                sent_count += 1
        
        return jsonify({
            'success': True,
            'message': f'Test notification sent to {sent_count} subscriptions',
            'total_subscriptions': len(subscriptions),
            'sent_count': sent_count
        }), 200
        
    except Exception as e:
        print(f"❌ Error sending test notification: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@test_push_bp.route('/push-subscriptions', methods=['GET'])
@token_required
def get_subscriptions_info(current_user):
    """Get info about push subscriptions"""
    try:
        subscriptions = get_push_subscriptions()
        
        subscription_info = []
        for sub in subscriptions:
            subscription_info.append({
                'id': sub['id'],
                'user_id': sub['user_id'],
                'active': sub['active'],
                'created_at': sub.get('created_at'),
                'endpoint_preview': sub['endpoint'][:50] + '...' if len(sub['endpoint']) > 50 else sub['endpoint']
            })
        
        return jsonify({
            'success': True,
            'total_subscriptions': len(subscriptions),
            'subscriptions': subscription_info
        }), 200
        
    except Exception as e:
        print(f"❌ Error getting subscriptions: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500