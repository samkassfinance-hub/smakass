"""
WhatsApp Reminder System - LOCAL STORAGE VERSION
Reads data from browser localStorage backup and sends reminders
NO SUPABASE REQUIRED - Works with localStorage only
"""

import os
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
import pywhatkit as pwk
import time

def get_today_date_str():
    """Returns today's date in YYYY-MM-DD format"""
    return datetime.now().strftime("%Y-%m-%d")


def load_local_storage_data():
    """
    Load data from localStorage backup file
    This file should be exported from the frontend
    """
    data_file = 'localStorage_backup.json'
    
    if not os.path.exists(data_file):
        print(f"❌ localStorage backup file not found: {data_file}")
        print("\nTo create this file:")
        print("1. Open your webapp in browser")
        print("2. Open Browser Console (F12)")
        print("3. Run this command:")
        print("   localStorage.getItem('kf_clients')")
        print("4. Save the output to localStorage_backup.json")
        return None
    
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except Exception as e:
        print(f"❌ Error reading localStorage backup: {e}")
        return None


def calculate_next_due_date(loan: Dict, payments: List[Dict]) -> str:
    """
    Calculate the next due date for a loan based on payments made
    Returns date string in YYYY-MM-DD format or None
    """
    try:
        start_date = datetime.strptime(loan['startDate'], "%Y-%m-%d")
        duration = loan['duration']
        loan_type = loan.get('type', 'monthly')
        
        # Calculate payment intervals
        if loan_type == 'daily':
            delta = timedelta(days=1)
        elif loan_type == 'weekly':
            delta = timedelta(weeks=1)
        else:  # monthly
            delta = timedelta(days=30)
        
        # Count how many payments have been made
        paid_count = len(payments)
        
        # If all payments are done, no next due
        if paid_count >= duration:
            return None
        
        # Calculate next due date
        next_due = start_date + (delta * (paid_count + 1))
        return next_due.strftime("%Y-%m-%d")
        
    except Exception as e:
        print(f"⚠️ Error calculating next due date: {e}")
        return None


def get_whatsapp_settings():
    """
    Read WhatsApp settings from local JSON file
    """
    settings_file = 'whatsapp_settings.json'
    
    if not os.path.exists(settings_file):
        print(f"❌ WhatsApp settings file not found: {settings_file}")
        return None
    
    try:
        with open(settings_file, 'r', encoding='utf-8') as f:
            settings_data = json.load(f)
        
        # Get first user's settings (for single-user setup)
        for user_id, settings in settings_data.items():
            if settings.get('whatsapp_enabled', False):
                return settings
        
        print("❌ No enabled WhatsApp settings found")
        return None
        
    except Exception as e:
        print(f"❌ Error reading WhatsApp settings: {e}")
        return None


def format_whatsapp_number(phone: str, country_code: str = "+91") -> str:
    """Format phone number for WhatsApp"""
    phone = phone.strip().replace(" ", "").replace("-", "")
    
    if not phone.startswith("+"):
        if phone.startswith("91"):
            phone = "+" + phone
        else:
            phone = country_code + phone
    
    return phone


def send_whatsapp_silent(client_phone: str, message: str) -> bool:
    """
    Send WhatsApp message silently (no browser opening)
    Uses instant send with minimal wait time
    """
    try:
        # Use instant send - requires WhatsApp Web to be logged in
        pwk.sendwhatmsg_instantly(
            phone_no=client_phone,
            message=message,
            wait_time=15,
            tab_close=True,
            close_time=2
        )
        
        print(f"  ✅ Message sent to {client_phone}")
        return True
        
    except Exception as e:
        print(f"  ❌ Failed to send to {client_phone}: {e}")
        return False


def create_reminder_message(client_name: str, emi_amount: float, due_date: str, business_name: str) -> str:
    """Create reminder message"""
    formatted_amount = f"₹{emi_amount:,.0f}"
    formatted_date = datetime.strptime(due_date, "%Y-%m-%d").strftime("%d-%b-%Y")
    
    message = f"""Dear {client_name},

This is a friendly reminder that your loan EMI payment of {formatted_amount} is due today ({formatted_date}).

Please make the payment at your earliest convenience to avoid late charges.

Thank you,
{business_name}"""
    
    return message


def calculate_emi(loan: Dict, payments: List[Dict]) -> float:
    """Calculate EMI amount"""
    principal = float(loan.get('principal', 0))
    interest_rate = float(loan.get('interestRate', 0))
    duration = int(loan.get('duration', 1))
    
    total_interest = (principal * interest_rate * duration) / 100
    total_payable = principal + total_interest
    emi = total_payable / duration if duration > 0 else 0
    
    return emi


def check_and_send_reminders():
    """
    Main function: Check localStorage data and send reminders
    """
    print("\n" + "="*70)
    print("WhatsApp Loan Reminder System (localStorage Mode)")
    print(f"Date: {get_today_date_str()}")
    print(f"Time: {datetime.now().strftime('%H:%M:%S')}")
    print("="*70 + "\n")
    
    # Load localStorage data
    print("📂 Loading localStorage data...")
    data = load_local_storage_data()
    
    if not data:
        print("❌ No data available. Exiting.")
        return
    
    clients = data.get('kf_clients', [])
    loans = data.get('kf_loans', [])
    payments = data.get('kf_payments', [])
    
    print(f"✅ Loaded: {len(clients)} clients, {len(loans)} loans, {len(payments)} payments")
    
    # Load WhatsApp settings
    print("\n📱 Loading WhatsApp settings...")
    settings = get_whatsapp_settings()
    
    if not settings:
        print("❌ WhatsApp not configured. Exiting.")
        return
    
    finance_whatsapp = settings.get('whatsapp_number')
    business_name = settings.get('business_name', 'KaasFlow')
    
    print(f"✅ WhatsApp Number: {finance_whatsapp}")
    print(f"✅ Business Name: {business_name}")
    
    # Create client lookup
    clients_map = {c['id']: c for c in clients}
    
    # Check loans due today
    today = get_today_date_str()
    print(f"\n🔍 Checking for loans due today ({today})...")
    
    due_today = []
    
    for loan in loans:
        if loan.get('status') != 'active':
            continue
        
        # Get payments for this loan
        loan_payments = [p for p in payments if p['loanId'] == loan['id']]
        
        # Calculate next due date
        next_due = calculate_next_due_date(loan, loan_payments)
        
        if next_due == today:
            client = clients_map.get(loan['clientId'])
            if client and client.get('phone'):
                emi = calculate_emi(loan, loan_payments)
                due_today.append({
                    'loan': loan,
                    'client': client,
                    'emi': emi,
                    'due_date': next_due
                })
    
    print(f"✅ Found {len(due_today)} loans due today")
    
    if not due_today:
        print("\n✨ No loans due today. All clear!")
        return
    
    # Send reminders
    print(f"\n📤 Sending {len(due_today)} WhatsApp reminders...")
    print("-" * 70)
    
    sent_count = 0
    failed_count = 0
    
    for idx, item in enumerate(due_today, 1):
        client = item['client']
        loan = item['loan']
        emi = item['emi']
        
        client_name = client['name']
        client_phone = format_whatsapp_number(client['phone'])
        
        print(f"\n[{idx}/{len(due_today)}] {client_name}")
        print(f"  Phone: {client_phone}")
        print(f"  EMI: ₹{emi:,.0f}")
        
        # Create message
        message = create_reminder_message(
            client_name=client_name,
            emi_amount=emi,
            due_date=item['due_date'],
            business_name=business_name
        )
        
        # Send WhatsApp
        success = send_whatsapp_silent(client_phone, message)
        
        if success:
            sent_count += 1
        else:
            failed_count += 1
        
        # Wait between messages to avoid rate limiting
        if idx < len(due_today):
            print("  ⏳ Waiting 10 seconds...")
            time.sleep(10)
    
    # Summary
    print("\n" + "="*70)
    print("✨ Reminder Check Complete")
    print(f"✅ Successfully sent: {sent_count}")
    print(f"❌ Failed: {failed_count}")
    print("="*70 + "\n")


if __name__ == "__main__":
    check_and_send_reminders()
