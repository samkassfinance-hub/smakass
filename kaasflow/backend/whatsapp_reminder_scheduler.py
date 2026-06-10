import os
import time
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
import pytz
from supabase_db import get_supabase_client
from whatsapp_service import WhatsAppService

IST = pytz.timezone('Asia/Kolkata')

def calc_monthly_interest(principal, rate, interest_type):
    if not principal or not rate:
        return 0
    if interest_type == 'fixed':
        return (principal / 1000) * (rate * 100)
    else:
        return principal * (rate / 100)

def calc_next_due(loan, payments):
    duration = loan.get('duration', 0)
    if not duration or duration <= 0:
        return None
        
    start_date = loan.get('start_date')
    if not start_date:
        return None
        
    d = datetime.strptime(start_date, '%Y-%m-%d')
    loan_type = loan.get('type', 'monthly')
    step = 'week' if loan_type == 'weekly' else 'month'
    
    total_installments = duration * 4 if loan_type == 'weekly' else duration
    installments = 0
    
    principal = loan.get('principal', 0)
    interest_rate = loan.get('interest_rate', 0)
    interest_type = loan.get('interest_type', 'percentage')
    
    monthly_interest = calc_monthly_interest(principal, interest_rate, interest_type)
    total_payable = principal + (monthly_interest * duration)
    
    if total_installments > 0:
        emi = round(total_payable / total_installments, 2)
    else:
        emi = 0
        
    while installments < total_installments:
        if step == 'month':
            # Add one month handling year rollover
            month = d.month - 1 + 1
            year = d.year + month // 12
            month = month % 12 + 1
            day = min(d.day, [31,
                29 if year % 4 == 0 and not year % 400 == 0 else 28,
                31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])
            d = d.replace(year=year, month=month, day=day)
        else:
            d += timedelta(days=7)
            
        installments += 1
        due = d.strftime('%Y-%m-%d')
        
        # Calculate amount paid on this due date
        paid = sum(float(p.get('amount', 0)) for p in payments if p.get('date') == due)
        if paid < emi * 0.9:
            return due
            
    return None

def get_whatsapp_service():
    api_url = os.environ.get('WHATSAPP_API_URL', '')
    api_key = os.environ.get('WHATSAPP_API_KEY', '')
    return WhatsAppService(api_url, api_key)

def send_due_today_reminder(client_name, amount, phone, service, instance_name, business_name):
    message = f"Hello {client_name},\n\nThis is a reminder that your installment of ₹{amount} is due today.\n\nPlease make payment on time.\n\nThank you.\n— {business_name}"
    service.send_text_message(instance_name, phone, message)

def send_due_tomorrow_reminder(client_name, amount, phone, service, instance_name, business_name):
    message = f"Hello {client_name},\n\nYour installment of ₹{amount} is due tomorrow.\n\nPlease keep your payment ready.\n\nThank you.\n— {business_name}"
    service.send_text_message(instance_name, phone, message)

def send_overdue_reminder(client_name, amount, phone, service, instance_name, business_name):
    message = f"Hello {client_name},\n\nOur records show that your installment of ₹{amount} is overdue.\n\nPlease contact us or make payment as soon as possible.\n\nThank you.\n— {business_name}"
    service.send_text_message(instance_name, phone, message)

def run_daily_reminders():
    print("Running daily WhatsApp reminders...")
    try:
        supabase = get_supabase_client()
        if not supabase:
            print("Supabase client not initialized")
            return
            
        # 1. Get all users with WhatsApp connected
        config_res = supabase.table('kf_whatsapp_config').select('*').eq('is_connected', True).execute()
        configs = config_res.data
        if not configs:
            print("No connected WhatsApp users found.")
            return
            
        service = get_whatsapp_service()
        today = datetime.now(IST).date()
        today_str = today.strftime('%Y-%m-%d')
        tomorrow = today + timedelta(days=1)
        tomorrow_str = tomorrow.strftime('%Y-%m-%d')
        
        # 2. For each user
        for config in configs:
            user_id = config.get('user_id')
            instance_name = config.get('instance_name')
            
            # Check what's enabled
            due_today_enabled = config.get('due_today_enabled', True)
            due_tomorrow_enabled = config.get('due_tomorrow_enabled', True)
            overdue_enabled = config.get('overdue_enabled', True)
            
            if not any([due_today_enabled, due_tomorrow_enabled, overdue_enabled]):
                continue
                
            # Get user settings for business name
            settings_res = supabase.table('kf_settings').select('business_name, financier_name').eq('user_id', user_id).execute()
            business_name = "SamKass"
            if settings_res.data:
                business_name = settings_res.data[0].get('business_name') or settings_res.data[0].get('financier_name') or "SamKass"
                
            # Get active loans
            loans_res = supabase.table('kf_loans').select('*').eq('user_id', user_id).eq('status', 'active').execute()
            if not loans_res.data:
                loans_res = supabase.table('loans').select('*').eq('user_id', user_id).eq('status', 'active').execute()
            loans = loans_res.data or []
            
            # Get payments
            payments_res = supabase.table('kf_payments').select('*').eq('user_id', user_id).execute()
            if not payments_res.data:
                payments_res = supabase.table('payments').select('*').eq('user_id', user_id).execute()
            payments = payments_res.data or []
            
            # Get clients for phones
            clients_res = supabase.table('kf_clients').select('id, name, phone').eq('user_id', user_id).execute()
            if not clients_res.data:
                clients_res = supabase.table('clients').select('id, name, phone').eq('user_id', user_id).execute()
            clients = {c['id']: c for c in (clients_res.data or [])}
            
            for loan in loans:
                loan_payments = [p for p in payments if p.get('loan_id') == loan.get('id')]
                next_due = calc_next_due(loan, loan_payments)
                
                if not next_due:
                    continue
                    
                client = clients.get(loan.get('client_id'))
                if not client or not client.get('phone'):
                    continue
                    
                phone = client['phone']
                client_name = client['name']
                
                # Calculate EMI amount
                principal = float(loan.get('principal', 0))
                interest_rate = float(loan.get('interest_rate', 0))
                interest_type = loan.get('interest_type', 'percentage')
                duration = int(loan.get('duration', 0))
                total_installments = duration * 4 if loan.get('type') == 'weekly' else duration
                monthly_interest = calc_monthly_interest(principal, interest_rate, interest_type)
                total_payable = principal + (monthly_interest * duration)
                emi_amount = round(total_payable / total_installments, 2) if total_installments > 0 else 0
                
                if next_due == tomorrow_str and due_tomorrow_enabled:
                    send_due_tomorrow_reminder(client_name, emi_amount, phone, service, instance_name, business_name)
                elif next_due == today_str and due_today_enabled:
                    send_due_today_reminder(client_name, emi_amount, phone, service, instance_name, business_name)
                elif next_due < today_str and overdue_enabled:
                    send_overdue_reminder(client_name, emi_amount, phone, service, instance_name, business_name)

    except Exception as e:
        print(f"Error in WhatsApp daily reminders: {e}")

def start_whatsapp_scheduler():
    scheduler = BackgroundScheduler(timezone=IST)
    # Run daily at 9:00 AM
    scheduler.add_job(run_daily_reminders, 'cron', hour=9, minute=0)
    scheduler.start()
    print("WhatsApp Reminder Scheduler started")
