"""
WhatsApp Reminder System using PyWhatKit
Automatically sends loan payment reminders to clients whose due date is today
"""

import os
import sys
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
import pywhatkit as pwk
import time

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase Client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✓ Supabase client initialized for WhatsApp Reminder System")
else:
    print("✗ Supabase credentials not found. WhatsApp reminders cannot run.")
    sys.exit(1)


def get_today_date_str():
    """Returns today's date in YYYY-MM-DD format"""
    return datetime.now().strftime("%Y-%m-%d")


def calculate_next_due_date(loan: Dict, payments: List[Dict]) -> str:
    """
    Calculate the next due date for a loan based on payments made
    Returns date string in YYYY-MM-DD format or None
    """
    try:
        start_date = datetime.strptime(loan['start_date'], "%Y-%m-%d")
        duration = loan['duration']
        loan_type = loan.get('type', 'monthly')
        
        # Calculate payment intervals
        if loan_type == 'daily':
            delta = timedelta(days=1)
        elif loan_type == 'weekly':
            delta = timedelta(weeks=1)
        else:  # monthly
            delta = timedelta(days=30)  # Approximate month
        
        # Count how many payments have been made
        paid_count = len(payments)
        
        # If all payments are done, no next due
        if paid_count >= duration:
            return None
        
        # Calculate next due date
        next_due = start_date + (delta * (paid_count + 1))
        return next_due.strftime("%Y-%m-%d")
        
    except Exception as e:
        print(f"Error calculating next due date: {e}")
        return None


def calculate_loan_stats(loan: Dict, payments: List[Dict]) -> Dict:
    """Calculate loan statistics including next due date"""
    principal = float(loan.get('principal', 0))
    interest_rate = float(loan.get('interest_rate', 0))
    duration = int(loan.get('duration', 1))
    
    # Calculate total amounts
    total_interest = (principal * interest_rate * duration) / 100
    total_payable = principal + total_interest
    emi = total_payable / duration if duration > 0 else 0
    
    # Calculate total paid
    total_paid = sum(float(p.get('amount', 0)) for p in payments)
    remaining = max(0, total_payable - total_paid)
    
    # Calculate next due date
    next_due_date = calculate_next_due_date(loan, payments)
    
    # Check if overdue
    today = get_today_date_str()
    is_overdue = next_due_date and next_due_date < today and loan.get('status') == 'active'
    
    return {
        'emi': emi,
        'total_payable': total_payable,
        'total_paid': total_paid,
        'remaining': remaining,
        'next_due_date': next_due_date,
        'is_overdue': is_overdue
    }


def get_loans_due_today() -> List[Dict]:
    """
    Fetch all loans with due date = today
    Returns list of loan records with client info
    """
    try:
        today = get_today_date_str()
        
        # Get all active loans
        loans_response = supabase.table('kf_loans').select('*').eq('status', 'active').execute()
        loans = loans_response.data
        
        if not loans:
            print("No active loans found.")
            return []
        
        # Get all payments
        payments_response = supabase.table('kf_payments').select('*').execute()
        all_payments = payments_response.data
        
        # Get all clients
        clients_response = supabase.table('kf_clients').select('*').execute()
        clients = {c['id']: c for c in clients_response.data}
        
        # Filter loans due today
        due_today = []
        for loan in loans:
            # Get payments for this loan
            loan_payments = [p for p in all_payments if p['loan_id'] == loan['id']]
            
            # Calculate stats
            stats = calculate_loan_stats(loan, loan_payments)
            
            # Check if due today and has remaining balance
            if stats['next_due_date'] == today and stats['remaining'] > 0:
                client = clients.get(loan['client_id'])
                if client and client.get('phone'):
                    due_today.append({
                        'loan': loan,
                        'client': client,
                        'stats': stats,
                        'user_id': loan['user_id']
                    })
        
        print(f"Found {len(due_today)} loans due today.")
        return due_today
        
    except Exception as e:
        print(f"Error fetching loans due today: {e}")
        return []


def get_finance_user_whatsapp_settings(user_id: str) -> Dict:
    """
    Fetch finance user's WhatsApp settings from database or local file
    Returns dict with whatsapp_number and settings
    """
    try:
        import json
        import os
        
        # First try local file
        settings_file = 'whatsapp_settings.json'
        if os.path.exists(settings_file):
            try:
                with open(settings_file, 'r') as f:
                    settings_data = json.load(f)
                    if user_id in settings_data:
                        print(f"✓ Found WhatsApp settings in local file for user: {user_id}")
                        return settings_data[user_id]
            except Exception as e:
                print(f"Warning: Could not read local settings file: {e}")
        
        # Try Supabase if available
        if supabase:
            response = supabase.table('kf_whatsapp_settings').select('*').eq('user_id', user_id).execute()
            
            if response.data and len(response.data) > 0:
                print(f"✓ Found WhatsApp settings in Supabase for user: {user_id}")
                return response.data[0]
        
        print(f"✗ No WhatsApp settings found for user: {user_id}")
        return None
        
    except Exception as e:
        print(f"Error fetching WhatsApp settings: {e}")
        return None


def format_whatsapp_number(phone: str, country_code: str = "+91") -> str:
    """
    Format phone number for WhatsApp
    Removes spaces, dashes, and adds country code if needed
    """
    # Clean the number
    phone = phone.strip().replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    
    # Add country code if not present
    if not phone.startswith("+"):
        if phone.startswith("91"):
            phone = "+" + phone
        else:
            phone = country_code + phone
    
    return phone


def send_whatsapp_reminder(client_phone: str, message: str, send_now: bool = True) -> bool:
    """
    Send WhatsApp message using PyWhatKit
    
    Args:
        client_phone: Client's WhatsApp number with country code
        message: Message text to send
        send_now: If True, sends immediately; if False, schedules for next minute
    
    Returns:
        True if successful, False otherwise
    """
    try:
        if send_now:
            # Send immediately using instant send (requires WhatsApp Web to be logged in)
            pwk.sendwhatmsg_instantly(
                phone_no=client_phone,
                message=message,
                wait_time=15,  # Wait 15 seconds for WhatsApp Web to load
                tab_close=True,  # Close tab after sending
                close_time=3  # Close after 3 seconds
            )
        else:
            # Schedule for next minute
            now = datetime.now()
            hour = now.hour
            minute = now.minute + 2  # Schedule 2 minutes from now
            
            if minute >= 60:
                hour += 1
                minute = minute - 60
            
            pwk.sendwhatmsg(
                phone_no=client_phone,
                message=message,
                time_hour=hour,
                time_min=minute,
                wait_time=15,
                tab_close=True,
                close_time=3
            )
        
        print(f"✓ WhatsApp message sent to {client_phone}")
        return True
        
    except Exception as e:
        print(f"✗ Failed to send WhatsApp to {client_phone}: {e}")
        return False


def create_reminder_message(client_name: str, emi_amount: float, due_date: str, business_name: str = "KaasFlow") -> str:
    """Create a professional reminder message"""
    formatted_amount = f"₹{emi_amount:,.0f}"
    formatted_date = datetime.strptime(due_date, "%Y-%m-%d").strftime("%d-%b-%Y")
    
    message = f"""Dear {client_name},

This is a friendly reminder that your loan EMI payment of {formatted_amount} is due today ({formatted_date}).

Please make the payment at your earliest convenience to avoid late charges.

Thank you,
{business_name}"""
    
    return message


def log_reminder_sent(loan_id: str, client_id: str, user_id: str, status: str, error_msg: str = None):
    """Log reminder activity to database"""
    try:
        supabase.table('kf_whatsapp_logs').insert({
            'user_id': user_id,
            'loan_id': loan_id,
            'client_id': client_id,
            'sent_date': get_today_date_str(),
            'status': status,  # 'success' or 'failed'
            'error_message': error_msg
        }).execute()
    except Exception as e:
        print(f"Warning: Could not log reminder: {e}")


def run_daily_reminder_check():
    """
    Main function to run daily WhatsApp reminder checks
    This should be called by a scheduler (cron job or task scheduler)
    """
    print("\n" + "="*60)
    print("WhatsApp Loan Reminder System - Daily Check")
    print(f"Date: {get_today_date_str()}")
    print(f"Time: {datetime.now().strftime('%H:%M:%S')}")
    print("="*60 + "\n")
    
    # Get all loans due today
    due_today_loans = get_loans_due_today()
    
    if not due_today_loans:
        print("No loans due today. Exiting.")
        return
    
    # Group loans by user (finance user)
    loans_by_user = {}
    for item in due_today_loans:
        user_id = item['user_id']
        if user_id not in loans_by_user:
            loans_by_user[user_id] = []
        loans_by_user[user_id].append(item)
    
    # Process each finance user
    total_sent = 0
    total_failed = 0
    
    for user_id, user_loans in loans_by_user.items():
        print(f"\nProcessing loans for user: {user_id}")
        
        # Get user's WhatsApp settings
        settings = get_finance_user_whatsapp_settings(user_id)
        
        if not settings:
            print(f"  ✗ No WhatsApp settings found for user {user_id}. Skipping.")
            continue
        
        if not settings.get('whatsapp_enabled', False):
            print(f"  ✗ WhatsApp reminders disabled for user {user_id}. Skipping.")
            continue
        
        finance_whatsapp = settings.get('whatsapp_number')
        if not finance_whatsapp:
            print(f"  ✗ No WhatsApp number configured for user {user_id}. Skipping.")
            continue
        
        business_name = settings.get('business_name', 'KaasFlow')
        
        print(f"  WhatsApp configured: {finance_whatsapp}")
        print(f"  Business name: {business_name}")
        print(f"  Loans to process: {len(user_loans)}")
        
        # Send reminders for each loan
        for idx, item in enumerate(user_loans, 1):
            loan = item['loan']
            client = item['client']
            stats = item['stats']
            
            client_name = client['name']
            client_phone = format_whatsapp_number(client['phone'])
            emi_amount = stats['emi']
            
            print(f"\n  [{idx}/{len(user_loans)}] Processing: {client_name}")
            print(f"    Phone: {client_phone}")
            print(f"    EMI: ₹{emi_amount:,.0f}")
            
            # Create message
            message = create_reminder_message(
                client_name=client_name,
                emi_amount=emi_amount,
                due_date=stats['next_due_date'],
                business_name=business_name
            )
            
            # Send WhatsApp reminder
            success = send_whatsapp_reminder(client_phone, message, send_now=False)
            
            if success:
                total_sent += 1
                log_reminder_sent(loan['id'], client['id'], user_id, 'success')
                print(f"    ✓ Reminder sent successfully")
            else:
                total_failed += 1
                log_reminder_sent(loan['id'], client['id'], user_id, 'failed', 'Send failed')
                print(f"    ✗ Failed to send reminder")
            
            # Wait between messages to avoid rate limiting
            if idx < len(user_loans):
                print(f"    Waiting 30 seconds before next message...")
                time.sleep(30)
    
    # Summary
    print("\n" + "="*60)
    print("Daily Reminder Check Complete")
    print(f"Total reminders sent: {total_sent}")
    print(f"Total failures: {total_failed}")
    print("="*60 + "\n")


if __name__ == "__main__":
    """
    Run this script directly for testing or via scheduler for automated reminders
    """
    run_daily_reminder_check()
