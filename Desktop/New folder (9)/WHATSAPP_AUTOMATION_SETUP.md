# 🚀 WhatsApp Loan Reminder Automation - Complete Setup Guide

This guide will help you set up automated WhatsApp reminders for loan payments using PyWhatKit.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Database Setup](#database-setup)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Daily Scheduler Setup](#daily-scheduler-setup)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**What This System Does:**
- Automatically checks daily for loans with due dates = today
- Sends WhatsApp reminders to clients using their phone numbers
- Uses PyWhatKit to send messages from your WhatsApp number
- Provides a settings page for one-time configuration
- Logs all reminder activities for audit

**How It Works:**
1. Finance user configures WhatsApp number once in settings page
2. System runs daily (via scheduler) to check loan due dates
3. For each loan due today, sends automated WhatsApp reminder to client
4. Messages are sent from finance user's WhatsApp via WhatsApp Web

---

## ✅ Prerequisites

### Required Software:
- **Python 3.8+** installed
- **WhatsApp** account with active number
- **Chrome/Firefox browser** for WhatsApp Web
- **Supabase** account (for database)
- **Windows Task Scheduler** (Windows) or **cron** (Linux/Mac)

### Required Python Packages:
```bash
pip install pywhatkit flask supabase python-dotenv
```

---

## 🗄️ Database Setup

### Step 1: Run SQL Schema

1. Login to your **Supabase Dashboard**
2. Go to **SQL Editor** → **New Query**
3. Copy and paste the contents of `kaasflow/backend/whatsapp_schema.sql`
4. Click **Run** to create the tables

This creates two tables:
- `kf_whatsapp_settings` - Stores WhatsApp configuration per user
- `kf_whatsapp_logs` - Tracks all reminders sent (audit log)

### Step 2: Verify Tables

Run this query to verify:
```sql
SELECT * FROM kf_whatsapp_settings;
SELECT * FROM kf_whatsapp_logs;
```

---

## 🔧 Backend Setup

### Step 1: Install Dependencies

Navigate to backend directory:
```bash
cd kaasflow/backend
pip install -r requirements.txt
```

This will install:
- `pywhatkit` - For WhatsApp automation
- `flask` - For API routes
- `supabase` - For database operations
- Other required packages

### Step 2: Configure Environment Variables

Edit your `.env` file in `kaasflow/backend/.env`:

```env
# Existing variables...
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key

# WhatsApp Settings (Optional - configured via UI)
# These can be set per-user via the settings page
```

### Step 3: Test Backend

Start the Flask backend:
```bash
python app.py
```

Test the WhatsApp routes:
```bash
# Get settings
curl http://localhost:5000/api/whatsapp/settings?user_id=test-user

# Save settings
curl -X POST http://localhost:5000/api/whatsapp/settings \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test-user","whatsapp_number":"+919876543210","business_name":"KaasFlow"}'
```

---

## 🎨 Frontend Setup

### Step 1: Access Settings Page

The WhatsApp settings page is available at:
```
http://localhost:5500/whatsapp-settings.html
```

Or add a link to your main dashboard in `index.html`:
```html
<a href="whatsapp-settings.html" class="settings-link">
  📱 WhatsApp Settings
</a>
```

### Step 2: Configure WhatsApp Settings

1. Open the settings page
2. Enter your WhatsApp number with country code (e.g., `+919876543210`)
3. Enter your business name
4. Enable automatic reminders
5. Click **Save Settings**

### Step 3: Send Test Message

Click **Send Test Message** to verify setup:
- This will schedule a test message to your number in 2 minutes
- Make sure you're logged into WhatsApp Web
- The browser will open automatically

---

## ⏰ Daily Scheduler Setup

The system needs to run daily to check for due dates and send reminders.

### Windows (Task Scheduler)

**Step 1:** Open Task Scheduler
- Press `Win + R`, type `taskschd.msc`, press Enter

**Step 2:** Create Basic Task
- Click **Create Basic Task**
- Name: `WhatsApp Loan Reminders`
- Description: `Daily check for loan due dates and send WhatsApp reminders`

**Step 3:** Set Trigger
- When: **Daily**
- Start time: **9:00 AM** (or your preferred time)
- Recur every: **1 day**

**Step 4:** Set Action
- Action: **Start a program**
- Program/script: `C:\path\to\kaasflow\backend\run_daily_reminders.bat`
- Start in: `C:\path\to\kaasflow\backend\`

**Step 5:** Finish Setup
- Check "Open Properties dialog" and click Finish
- In Properties → Settings:
  - ✓ Run task as soon as possible after scheduled start is missed
  - ✓ If task fails, restart every: 10 minutes (try 3 times)

### Linux/Mac (Cron)

**Step 1:** Make script executable
```bash
chmod +x kaasflow/backend/run_daily_reminders.sh
```

**Step 2:** Edit crontab
```bash
crontab -e
```

**Step 3:** Add cron job
```bash
# Run daily at 9:00 AM
0 9 * * * /full/path/to/kaasflow/backend/run_daily_reminders.sh

# Run daily at 9:00 AM with logging
0 9 * * * /full/path/to/kaasflow/backend/run_daily_reminders.sh >> /var/log/whatsapp_reminders.log 2>&1
```

**Step 4:** Verify cron job
```bash
crontab -l
```

### Manual Testing

You can also run the reminder script manually:

**Windows:**
```bash
cd kaasflow\backend
python whatsapp_reminder.py
```

**Linux/Mac:**
```bash
cd kaasflow/backend
python3 whatsapp_reminder.py
```

---

## 🧪 Testing

### Test Scenario 1: Send Test Message

1. Open `whatsapp-settings.html`
2. Configure your WhatsApp number
3. Click **Send Test Message**
4. Wait 2 minutes
5. WhatsApp Web should open and send the test message

### Test Scenario 2: Manual Reminder Run

1. Create a test client with WhatsApp number
2. Create a test loan with due date = today
3. Run the reminder script manually:
   ```bash
   python whatsapp_reminder.py
   ```
4. Check the output for success/failure messages

### Test Scenario 3: Check Logs

Query the logs table:
```sql
SELECT * FROM kf_whatsapp_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🐛 Troubleshooting

### Issue: "WhatsApp Web not opening"

**Solution:**
- Make sure Chrome/Firefox is installed
- Ensure you're logged into WhatsApp Web
- Check if popup blockers are disabled
- Try increasing `wait_time` in `whatsapp_reminder.py` (line 178)

### Issue: "Message not sending"

**Solutions:**
1. Verify WhatsApp number format: `+[country_code][number]` (e.g., `+919876543210`)
2. Ensure no spaces or special characters in phone number
3. Verify client has a valid WhatsApp account
4. Check if you're logged into WhatsApp Web
5. Increase wait time between messages

### Issue: "PyWhatKit import error"

**Solution:**
```bash
pip install --upgrade pywhatkit
```

### Issue: "No loans due today found"

**Debugging steps:**
1. Check loan due date calculation:
   ```python
   python -c "from whatsapp_reminder import get_loans_due_today; print(get_loans_due_today())"
   ```
2. Verify loan data in database:
   ```sql
   SELECT l.*, c.name, c.phone 
   FROM kf_loans l 
   JOIN kf_clients c ON l.client_id = c.id 
   WHERE l.status = 'active';
   ```

### Issue: "Supabase connection failed"

**Solution:**
- Verify `.env` file has correct `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
- Check network connectivity
- Verify Supabase project is active

### Issue: "Rate limiting / Too many messages"

**Solution:**
- WhatsApp may block if too many messages sent quickly
- Increase delay between messages in `whatsapp_reminder.py` (line 269)
- Default is 30 seconds, increase to 60-120 seconds if needed

---

## 📊 Monitoring & Logs

### View Reminder Statistics

Query today's statistics:
```sql
SELECT 
    COUNT(*) as total_sent,
    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM kf_whatsapp_logs
WHERE sent_date = CURRENT_DATE;
```

### View Recent Activity

```sql
SELECT 
    wl.*,
    c.name as client_name,
    c.phone as client_phone
FROM kf_whatsapp_logs wl
JOIN kf_clients c ON wl.client_id = c.id
ORDER BY wl.created_at DESC
LIMIT 20;
```

### Check Scheduler Logs

**Windows:**
```
type kaasflow\backend\whatsapp_reminder.log
```

**Linux/Mac:**
```bash
tail -f kaasflow/backend/whatsapp_reminder.log
```

---

## 🎯 Best Practices

1. **Test First:** Always test with your own number before going live
2. **Monitor Logs:** Check logs daily for first week to ensure smooth operation
3. **Backup Settings:** Keep a backup of WhatsApp settings
4. **Keep Computer On:** Computer must be running at scheduled time
5. **Stay Logged In:** Keep WhatsApp Web session active
6. **Phone Format:** Always use international format with country code
7. **Client Data:** Ensure all clients have valid WhatsApp numbers
8. **Rate Limits:** Don't send more than 50-100 messages per day initially

---

## 🔐 Security Notes

- WhatsApp number is stored securely in Supabase
- Messages are sent only to clients with active loans due today
- All reminder activities are logged for audit
- Use environment variables for sensitive credentials
- Enable Row Level Security (RLS) in Supabase for production

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the logs: `whatsapp_reminder.log`
3. Verify database tables and data
4. Test each component individually
5. Check PyWhatKit documentation: https://github.com/Ankit404butfound/PyWhatKit

---

## 🎉 Success Checklist

- ✅ Database tables created
- ✅ Backend dependencies installed
- ✅ Environment variables configured
- ✅ WhatsApp settings saved via UI
- ✅ Test message sent successfully
- ✅ Manual reminder script runs without errors
- ✅ Daily scheduler configured
- ✅ Client phone numbers in correct format
- ✅ WhatsApp Web stays logged in
- ✅ Logs show successful reminders

**You're all set! The system will now automatically send WhatsApp reminders daily for loans due today.**

---

## 📝 Summary

This WhatsApp automation system:
- ✅ Uses PyWhatKit exclusively for sending messages
- ✅ Checks loan due dates daily automatically
- ✅ Sends reminders only for loans due TODAY
- ✅ Requires one-time WhatsApp number setup in settings page
- ✅ Runs fully automated via Windows Task Scheduler or cron
- ✅ Logs all activities for monitoring and audit
- ✅ Works with existing loan and client data in the database

The finance user simply configures their WhatsApp number once, and the system handles everything else automatically!
