# ✅ WhatsApp Reminder System - Installation Checklist

Use this checklist to verify your installation is complete and working.

---

## 📦 Prerequisites

- [ ] Python 3.8 or higher installed
- [ ] Supabase account created
- [ ] WhatsApp account active
- [ ] Chrome or Firefox browser installed

---

## 🗄️ Database Setup

- [ ] Opened Supabase SQL Editor
- [ ] Ran `whatsapp_schema.sql` successfully
- [ ] Table `kf_whatsapp_settings` created
- [ ] Table `kf_whatsapp_logs` created
- [ ] Verified tables exist with sample query

---

## 🔧 Backend Setup

- [ ] Navigated to `kaasflow/backend` directory
- [ ] Ran `pip install -r requirements.txt`
- [ ] PyWhatKit installed successfully
- [ ] `.env` file exists with Supabase credentials
- [ ] `SUPABASE_URL` configured
- [ ] `SUPABASE_SERVICE_KEY` configured
- [ ] Ran `python setup_whatsapp.py` (all checks passed)
- [ ] Backend routes registered in `app.py`

---

## 🎨 Frontend Setup

- [ ] File `whatsapp-settings.html` exists
- [ ] Settings page accessible from app
- [ ] WhatsApp settings card visible in Settings tab
- [ ] "Configure" button links to settings page

---

## ⚙️ Configuration

- [ ] Opened WhatsApp settings page
- [ ] Entered WhatsApp number with country code (e.g., `+919876543210`)
- [ ] Entered business name
- [ ] Enabled automatic reminders
- [ ] Saved settings successfully
- [ ] Settings appear in database (`kf_whatsapp_settings` table)

---

## 🧪 Testing

### Test 1: Database Connection
- [ ] Ran `python setup_whatsapp.py`
- [ ] Supabase connection successful
- [ ] Tables found and accessible

### Test 2: Send Test Message
- [ ] Clicked "Send Test Message" in settings
- [ ] No errors appeared
- [ ] Waited 2 minutes
- [ ] Received test message on WhatsApp

### Test 3: Manual Reminder Run
- [ ] Created test client with your WhatsApp number
- [ ] Created test loan with due date = today
- [ ] Ran `python whatsapp_reminder.py` manually
- [ ] Script completed without errors
- [ ] Received reminder on WhatsApp
- [ ] Log entry created in `kf_whatsapp_logs` table

---

## ⏰ Scheduler Setup

### Windows Users
- [ ] Opened Task Scheduler
- [ ] Created new task: "WhatsApp Loan Reminders"
- [ ] Set trigger: Daily at 9:00 AM
- [ ] Set action: Run `run_daily_reminders.bat`
- [ ] Configured "Run whether user is logged on or not"
- [ ] Set "Run with highest privileges"
- [ ] Tested task runs manually

### Linux/Mac Users
- [ ] Made script executable: `chmod +x run_daily_reminders.sh`
- [ ] Edited crontab: `crontab -e`
- [ ] Added cron entry: `0 9 * * * /path/to/run_daily_reminders.sh`
- [ ] Verified cron entry: `crontab -l`
- [ ] Tested script runs manually: `./run_daily_reminders.sh`

---

## 🔍 Verification

### Data Validation
- [ ] All client phone numbers include country code (+91, etc.)
- [ ] No spaces or dashes in phone numbers
- [ ] At least one active loan exists
- [ ] Loan due dates are calculated correctly
- [ ] Payments are recorded properly

### System Validation
- [ ] WhatsApp Web stays logged in
- [ ] Computer stays on at reminder time
- [ ] No popup blockers interfering
- [ ] Browser opens automatically
- [ ] Messages send successfully

---

## 📊 Monitoring Setup

- [ ] Know how to check logs: `tail -f whatsapp_reminder.log`
- [ ] Can query database logs:
  ```sql
  SELECT * FROM kf_whatsapp_logs 
  ORDER BY created_at DESC 
  LIMIT 10;
  ```
- [ ] Can check today's statistics:
  ```sql
  SELECT COUNT(*) FROM kf_whatsapp_logs 
  WHERE sent_date = CURRENT_DATE;
  ```
- [ ] Understand success/failure status

---

## 📱 Client Data

- [ ] All clients have phone numbers
- [ ] Phone numbers include country code
- [ ] Phone numbers are valid WhatsApp numbers
- [ ] Tested with at least one client
- [ ] Client confirmed receiving message

---

## 🔐 Security

- [ ] Environment variables not exposed
- [ ] `.env` file in `.gitignore`
- [ ] Supabase Row Level Security enabled
- [ ] WhatsApp number stored securely
- [ ] Logs contain no sensitive data

---

## 📚 Documentation

- [ ] Read `QUICK_START_WHATSAPP.md`
- [ ] Reviewed `WHATSAPP_AUTOMATION_SETUP.md`
- [ ] Bookmarked `WHATSAPP_USER_GUIDE.md` for users
- [ ] Know where to find troubleshooting info
- [ ] Understand how the system works

---

## 🎯 Production Readiness

### Before Going Live
- [ ] Tested with small batch (5-10 clients)
- [ ] Monitored logs for one week
- [ ] Verified all reminders sent successfully
- [ ] Got positive feedback from test clients
- [ ] Customized message template if needed
- [ ] Adjusted timing if needed
- [ ] Team trained on monitoring
- [ ] Support process documented

### Ongoing Maintenance
- [ ] Check logs daily for first week
- [ ] Check logs weekly after that
- [ ] Monitor success/failure rates
- [ ] Update phone numbers as needed
- [ ] Keep WhatsApp Web logged in
- [ ] Backup settings periodically

---

## 🚨 Troubleshooting Knowledge

### Know How To:
- [ ] Check if WhatsApp Web is logged in
- [ ] Verify phone number format
- [ ] Read error logs
- [ ] Test database connection
- [ ] Run script manually
- [ ] Check scheduler status
- [ ] Increase wait time if needed
- [ ] Handle rate limiting

### Common Issues
- [ ] Know what to do if message doesn't send
- [ ] Know how to fix database connection errors
- [ ] Know how to handle PyWhatKit errors
- [ ] Know when to increase delays
- [ ] Know how to update phone numbers

---

## ✨ Optional Enhancements

- [ ] Customized message template
- [ ] Adjusted reminder time
- [ ] Added multiple reminders (before due date)
- [ ] Implemented overdue reminders
- [ ] Added email fallback
- [ ] Created dashboard widget
- [ ] Setup monitoring alerts

---

## 📞 Support Resources

- [ ] Saved bookmark to documentation folder
- [ ] Know who to contact for technical issues
- [ ] Have backup of configuration
- [ ] Documented any custom changes
- [ ] Created runbook for team

---

## 🎉 Final Verification

### System Working When:
- [x] Test message received
- [x] Daily reminders send automatically
- [x] Logs show success status
- [x] Clients confirm receiving messages
- [x] No errors in logs
- [x] Scheduler runs on time
- [x] All components integrated
- [x] Team trained and confident

---

## ✅ Sign-Off

**Installation completed by:** _________________

**Date:** _________________

**Tested by:** _________________

**Approved by:** _________________

**Notes:**
```
[Any special configuration or notes]
```

---

## 📈 Success Metrics (Track These)

After 1 Week:
- [ ] Number of reminders sent: _______
- [ ] Success rate: _______% 
- [ ] Client feedback: _______
- [ ] Payment improvement: _______% 
- [ ] Time saved: _______ hours

After 1 Month:
- [ ] Total reminders sent: _______
- [ ] Success rate: _______% 
- [ ] Collection rate improved: _______% 
- [ ] Client satisfaction: _______
- [ ] ROI achieved: Yes / No

---

**Status:** ⬜ In Progress  |  ⬜ Complete  |  ⬜ Production

**Go-Live Date:** _________________

---

*Print this checklist and use it during installation*
