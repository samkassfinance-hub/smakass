"""
Test WhatsApp Reminder with Local Data (No Supabase needed)
This creates test data and sends a reminder directly
"""

import pywhatkit as pwk
from datetime import datetime, timedelta
import time

# Test configuration
CLIENT_PHONE = "+919344208525"  # Client's WhatsApp number
FINANCE_PHONE = "+917904987242"  # Your WhatsApp number (sender)
CLIENT_NAME = "Demo Client 1"
EMI_AMOUNT = 5000
BUSINESS_NAME = "Your Business Name"

def create_reminder_message():
    """Create test reminder message"""
    formatted_amount = f"₹{EMI_AMOUNT:,.0f}"
    today_date = datetime.now().strftime("%d-%b-%Y")
    
    message = f"""Dear {CLIENT_NAME},

This is a friendly reminder that your loan EMI payment of {formatted_amount} is due today ({today_date}).

Please make the payment at your earliest convenience to avoid late charges.

Thank you,
{BUSINESS_NAME}"""
    
    return message

def send_test_reminder():
    """Send test WhatsApp reminder"""
    print("\n" + "="*60)
    print("WhatsApp Test Reminder")
    print("="*60)
    print(f"\nSending FROM: {FINANCE_PHONE}")
    print(f"Sending TO: {CLIENT_PHONE}")
    print(f"Client: {CLIENT_NAME}")
    print(f"Amount: ₹{EMI_AMOUNT:,.0f}")
    print("\n" + "-"*60)
    
    message = create_reminder_message()
    print("Message:")
    print(message)
    print("-"*60)
    
    print("\nScheduling message for 2 minutes from now...")
    
    try:
        # Schedule for 2 minutes from now
        now = datetime.now()
        hour = now.hour
        minute = now.minute + 2
        
        if minute >= 60:
            hour += 1
            minute = minute - 60
        
        print(f"Will send at: {hour:02d}:{minute:02d}")
        print("\nOpening WhatsApp Web...")
        print("Make sure you're logged into WhatsApp Web!")
        
        pwk.sendwhatmsg(
            phone_no=CLIENT_PHONE,
            message=message,
            time_hour=hour,
            time_min=minute,
            wait_time=40,  # Wait 40 seconds for WhatsApp Web to load
            tab_close=True,
            close_time=3
        )
        
        print("\n✓ WhatsApp reminder scheduled successfully!")
        print(f"✓ Message will be sent to {CLIENT_PHONE}")
        print("\nIMPORTANT: Don't close WhatsApp Web until message is sent!")
        
    except Exception as e:
        print(f"\n✗ Error sending reminder: {e}")

if __name__ == "__main__":
    print("\n🚀 Testing WhatsApp Reminder System")
    print(f"📱 This will send a test reminder from YOUR number to: {CLIENT_PHONE}")
    print("\nStarting in 3 seconds...")
    time.sleep(3)
    
    send_test_reminder()
