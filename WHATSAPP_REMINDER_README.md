# 📱 WhatsApp Loan Reminder System

A fully automated WhatsApp reminder system for loan payments using **PyWhatKit**. Sends daily reminders to clients whose loan payment is due today.

---

## 🎯 Key Features

- ✅ **Fully Automated** - Runs daily without manual intervention
- ✅ **PyWhatKit Integration** - Uses PyWhatKit exclusively for sending messages
- ✅ **One-Time Setup** - Configure WhatsApp number once in settings page
- ✅ **Smart Detection** - Automatically finds loans due today
- ✅ **Client Phone Integration** - Uses phone numbers from client profiles
- ✅ **Audit Logging** - Tracks all reminders sent
- ✅ **Easy Scheduling** - Works with Windows Task Scheduler or Linux cron
- ✅ **No Manual Sending** - Everything happens automatically

---

## 📂 Files Created

### Backend Files:
```
kaasflow/backend/
├── whatsapp_reminder.py           # Main automation script
├── whatsapp_schema.sql            # Database schema (2 tables)
├── routes/whatsapp_routes.py      # API endpoints
├── run_daily_reminders.bat        # Windows scheduler script
├── run_daily_reminders.sh         # Linux/Mac scheduler script
└── requirements.txt               # Updated with pywhatkit
```

### Frontend Files:
```
kaasflow/frontend/
└── whatsapp-settings.html         # Settings page for WhatsApp config
```

### Documentation:
```
root/
├── WHATSAPP_AUTOMATION_SETUP.md   # Complete technical setup guide
├── WHATSAPP_USER_GUIDE.md         # Simple user guide
└── WHATSAPP_REMINDER_README.md    # This file
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd kaasflow/backend
pip install -r requirements.txt
```

### 2. Setup Database
Run `whatsapp_schema.sql` in your Supabase SQL Editor

### 3. Configure WhatsApp
1. Open your app
2. Go to **Settings** → **WhatsApp Reminders**
3. Click **Configure**
4. Enter your WhatsApp number (e.g., `+919876543210`)
5. Enter business name
6. Save settings

### 4. Test the System
Click **Send Test Message** on the settings page

### 5. Setup Daily Scheduler

**Windows:**
1. Open Task Scheduler
2. Create task to run `run_daily_reminders.bat` daily at 9 AM

**Linux/Mac:**
```bash
crontab -e
# Add: 0 9 * * * /path/to/run_daily_reminders.sh
```

### 6. Done!
System will now check daily and send reminders automatically.

---

## 🔧 How It Works

```
┌─────────────────────────────────────────────────────┐
│  Daily at 9:00 AM (Scheduler triggers)             │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  whatsapp_reminder.py runs                          │
│  1. Connects to Supabase database                   │
│  2. Fetches all active loans                        │
│  3. Calculates next due date for each loan          │
│  4. Filters loans with due date = TODAY             │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  For each loan due today:                           │
│  1. Get client's WhatsApp number                    │
│  2. Get finance user's WhatsApp settings            │
│  3. Create reminder message                         │
│  4. Send via PyWhatKit                              │
│  5. Log the activity                                │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│  PyWhatKit:                                         │
│  1. Opens WhatsApp Web in browser                   │
│  2. Sends message from your WhatsApp                │
│  3. Closes browser tab                              │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### Table: `kf_whatsapp_settings`
Stores WhatsApp configuration per user (one record per finance user)

| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID | Primary key, links to kf_users |
| whatsapp_number | TEXT | Finance user's WhatsApp number |
| whatsapp_enabled | BOOLEAN | Enable/disable reminders |
| business_name | TEXT | Business name shown in messages |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

### Table: `kf_whatsapp_logs`
Tracks all reminders sent (audit log)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Finance user ID |
| loan_id | TEXT | Loan that triggered reminder |
| client_id | TEXT | Client who received reminder |
| sent_date | DATE | Date reminder was sent |
| status | TEXT | 'success' or 'failed' |
| error_message | TEXT | Error details if failed |
| created_at | TIMESTAMP | Log timestamp |

---

## 🔌 API Endpoints

### GET `/api/whatsapp/settings`
Get WhatsApp settings for a user
```bash
GET /api/whatsapp/settings?user_id=123
```

### POST `/api/whatsapp/settings`
Save WhatsApp settings
```json
{
  "user_id": "123",
  "whatsapp_number": "+919876543210",
  "business_name": "My Finance Co",
  "whatsapp_enabled": true
}
```

### POST `/api/whatsapp/test`
Send test message
```json
{
  "phone": "+919876543210",
  "message": "Test message"
}
```

### GET `/api/whatsapp/logs`
Get reminder logs
```bash
GET /api/whatsapp/logs?user_id=123
```

---

## 💬 Message Format

Default message sent to clients:

```
Dear [Client Name],

This is a friendly reminder that your loan EMI payment 
of ₹[Amount] is due today ([Date]).

Please make the payment at your earliest convenience 
to avoid late charges.

Thank you,
[Business Name]
```

To customize, edit the `create_reminder_message()` function in `whatsapp_reminder.py`.

---

## 🧪 Testing

### Test 1: Settings Page
```
1. Open whatsapp-settings.html
2. Enter your WhatsApp number
3. Click "Send Test Message"
4. Wait 2 minutes
5. Check if you received the message
```

### Test 2: Manual Run
```bash
cd kaasflow/backend
python whatsapp_reminder.py
```
This will run the checker immediately and show output.

### Test 3: With Real Data
```
1. Create a test client with your WhatsApp number
2. Create a test loan with due date = today
3. Run manual test
4. Check if you received reminder
```

---

## 📈 Monitoring

### View Today's Statistics
```sql
SELECT 
    COUNT(*) as total_sent,
    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM kf_whatsapp_logs
WHERE sent_date = CURRENT_DATE;
```

### View Recent Reminders
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
```bash
# Windows
type kaasflow\backend\whatsapp_reminder.log

# Linux/Mac
tail -f kaasflow/backend/whatsapp_reminder.log
```

---

## ⚠️ Important Requirements

### Must Have:
1. **WhatsApp Web Login** - You must be logged into WhatsApp Web
2. **Computer Running** - Computer must be on at reminder time
3. **Python 3.8+** - Required for PyWhatKit
4. **Valid Phone Numbers** - Clients must have valid WhatsApp numbers
5. **Country Code** - All numbers must include country code (e.g., +91)
6. **Browser** - Chrome or Firefox installed

### Best Practices:
- Keep WhatsApp Web session active
- Don't send more than 50-100 messages per day initially
- Test thoroughly before production use
- Monitor logs daily for first week
- Ensure client data is up to date

---

## 🐛 Common Issues & Solutions

### Issue: Message not sending
**Solutions:**
- Verify WhatsApp Web is logged in
- Check phone number format: `+[country][number]`
- Ensure no spaces in phone number
- Increase wait_time in script
- Check browser is installed

### Issue: PyWhatKit not found
```bash
pip install --upgrade pywhatkit
```

### Issue: No loans found due today
**Check:**
- Loan status is 'active'
- Due date calculation is correct
- Payments are recorded properly
- Database connection working

### Issue: Rate limiting
**Solution:**
- Increase delay between messages (line 269 in whatsapp_reminder.py)
- Default: 30 seconds, increase to 60-120 seconds

---

## 🔐 Security

- WhatsApp number stored securely in Supabase
- All reminders logged for audit
- Row Level Security (RLS) enabled
- Environment variables for credentials
- No plaintext passwords
- Client data encrypted in transit

---

## 📝 Customization

### Change Message Template
Edit `create_reminder_message()` in `whatsapp_reminder.py`

### Change Reminder Time
Update scheduler configuration:
- **Windows:** Task Scheduler properties
- **Linux/Mac:** Crontab entry

### Add Multiple Reminders
Modify script to check for:
- Tomorrow's due dates
- Overdue loans
- Weekly summaries

### Custom Conditions
Edit `get_loans_due_today()` function to add filters

---

## 🎯 Success Metrics

After setup, you should see:
- ✅ Test message received successfully
- ✅ Daily reminders sent automatically
- ✅ Logs show 'success' status
- ✅ Clients confirming receipt
- ✅ Improved payment collection rate

---

## 📚 Additional Resources

- **Setup Guide:** `WHATSAPP_AUTOMATION_SETUP.md` - Complete technical setup
- **User Guide:** `WHATSAPP_USER_GUIDE.md` - Simple guide for finance users
- **PyWhatKit Docs:** https://github.com/Ankit404butfound/PyWhatKit

---

## 🎉 Summary

This WhatsApp automation system:
1. ✅ Checks daily for loans due today
2. ✅ Sends automated WhatsApp reminders
3. ✅ Uses PyWhatKit exclusively
4. ✅ Requires one-time setup only
5. ✅ Works with existing client data
6. ✅ Logs all activities
7. ✅ Runs fully automated
8. ✅ No manual intervention needed

**Configure once, automate forever!**

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section in `WHATSAPP_AUTOMATION_SETUP.md`
2. Review logs: `whatsapp_reminder.log`
3. Verify database tables and data
4. Test each component individually
5. Check PyWhatKit documentation

---

**Version:** 1.0  
**Last Updated:** January 2026  
**Compatibility:** Windows, Linux, Mac  
**Python Version:** 3.8+  
**Dependencies:** PyWhatKit, Flask, Supabase
