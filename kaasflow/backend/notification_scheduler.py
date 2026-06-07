"""
SamKass - Interactive Loan Due Notification Scheduler
Sends push notifications with inline payment action buttons
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta
import pytz
from pywebpush import webpush, WebPushException
import json
import os
from supabase_db import get_supabase_client

# Initialize scheduler
scheduler = BackgroundScheduler()
IST = pytz.timezone('Asia/Kolkata')

def get_push_subscriptions():
    """Get all active push subscriptions from database"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('push_subscriptions').select('*').eq('active', True).execute()
        return response.data
    except Exception as e:
        print(f"❌ Error fetching push subscriptions: {e}")
        return []

def get_due_loans():
    """Get all loans that are due today or tomorrow"""
    try:
        supabase = get_supabase_client()
        today = datetime.now(IST).date()
        tomorrow = today + timedelta(days=1)
        
        # Get loans where next_due_date is today or tomorrow
        response = supabase.table('loans').select('''
            *,
            clients (
                id,
                name,
                phone
            )
        ''').eq('status', 'active').in_('next_due_date', [str(today), str(tomorrow)]).execute()
        
        return response.data
    except Exception as e:
        print(f"❌ Error fetching due loans: {e}")
        return []

def calculate_emi(loan):
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

def send_push_notification(subscription, loan, client_name, emi_amount):
    """Send push notification with action buttons"""
    try:
        vapid_private_key = os.getenv('VAPID_PRIVATE_KEY')
        vapid_claim_email = os.getenv('VAPID_CLAIM_EMAIL', 'mailto:samkassfinance@gmail.com')
        
        if not vapid_private_key:
            print("❌ VAPID_PRIVATE_KEY not configured")
            return False
        
        # Notification payload
        notification_data = {
            'title': f'🔔 EMI Due — {client_name}',
            'body': f'₹{emi_amount} is due. Click button or tap notification for Partial:',
            'icon': 'https://samkass.site/logo.png',
            'badge': 'https://samkass.site/logo.png',
            'requireInteraction': True,
            'actions': [
                {
                    'action': 'paid',
                    'title': '✅ PAID',
                    'icon': 'https://samkass.site/logo.png'
                },
                {
                    'action': 'unpaid',
                    'title': '❌ UNPAID',
                    'icon': 'https://samkass.site/logo.png'
                }
            ],
            'data': {
                'loan_id': loan['id'],
                'client_id': loan['client_id'],
                'client_name': client_name,
                'amount': emi_amount,
                'due_date': loan['next_due_date'],
                'url': '/'
            }
        }
        
        # Send push notification
        webpush(
            subscription_info=json.loads(subscription['subscription_json']),
            data=json.dumps(notification_data),
            vapid_private_key=vapid_private_key,
            vapid_claims={'sub': vapid_claim_email}
        )
        
        print(f"✅ Push notification sent to user {subscription['user_id']} for loan {loan['id']}")
        return True
        
    except WebPushException as e:
        print(f"❌ WebPush error: {e}")
        # If subscription expired, mark as inactive
        if e.response and e.response.status_code in [404, 410]:
            try:
                supabase = get_supabase_client()
                supabase.table('push_subscriptions').update({
                    'active': False
                }).eq('id', subscription['id']).execute()
                print(f"🗑️ Marked subscription {subscription['id']} as inactive")
            except Exception as db_error:
                print(f"❌ Error updating subscription: {db_error}")
        return False
    except Exception as e:
        print(f"❌ Error sending push notification: {e}")
        return False

def check_and_send_due_notifications():
    """Main job: Check for due loans and send notifications"""
    print(f"\n🔔 Running due loan notification check at {datetime.now(IST)}")
    
    # Get all due loans
    due_loans = get_due_loans()
    print(f"📊 Found {len(due_loans)} due loans")
    
    if not due_loans:
        print("✅ No due loans found")
        return
    
    # Get all active push subscriptions
    subscriptions = get_push_subscriptions()
    print(f"📱 Found {len(subscriptions)} active push subscriptions")
    
    if not subscriptions:
        print("⚠️ No active push subscriptions found")
        return
    
    # Send notifications
    notifications_sent = 0
    for loan in due_loans:
        client_name = loan.get('clients', {}).get('name', 'Unknown Client')
        emi_amount = calculate_emi(loan)
        
        # Send to all subscriptions (in production, filter by user_id)
        for subscription in subscriptions:
            if send_push_notification(subscription, loan, client_name, emi_amount):
                notifications_sent += 1
    
    print(f"✅ Sent {notifications_sent} notifications")

def start_scheduler():
    """Start the notification scheduler"""
    print("🚀 Starting SamKass notification scheduler...")
    
    # Schedule job to run daily at 8:00 AM IST
    scheduler.add_job(
        check_and_send_due_notifications,
        trigger=CronTrigger(hour=8, minute=0, timezone=IST),
        id='due_loan_notifications',
        name='Send due loan notifications',
        replace_existing=True
    )
    
    # Also run immediately on startup for testing
    # scheduler.add_job(check_and_send_due_notifications, 'date', run_date=datetime.now(IST) + timedelta(seconds=5))
    
    scheduler.start()
    print("✅ Scheduler started - will run daily at 8:00 AM IST")
    
    # Print next run time
    job = scheduler.get_job('due_loan_notifications')
    if job:
        print(f"📅 Next scheduled run: {job.next_run_time}")

def stop_scheduler():
    """Stop the scheduler"""
    scheduler.shutdown()
    print("🛑 Scheduler stopped")

if __name__ == '__main__':
    start_scheduler()
    # Keep the script running
    try:
        while True:
            pass
    except (KeyboardInterrupt, SystemExit):
        stop_scheduler()
