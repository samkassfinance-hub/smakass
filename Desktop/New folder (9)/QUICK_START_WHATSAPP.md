# 🚀 WhatsApp Reminders - Quick Start (5 Minutes)

## What You'll Get
Automatic WhatsApp reminders to clients whose loan payment is due TODAY.

---

## Step 1: Install (2 min)

```bash
cd kaasflow/backend
pip install -r requirements.txt
```

---

## Step 2: Setup Database (2 min)

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy-paste contents of `kaasflow/backend/whatsapp_schema.sql`
4. Click **Run**

---

## Step 3: Configure WhatsApp (1 min)

1. Open your app
2. Go to **Settings** → **WhatsApp Reminders** → **Configure**
3. Enter your WhatsApp number: `+919876543210`
4. Enter business name
5. Click **Save**

---

## Step 4: Test

Click **Send Test Message** button.

Wait 2 minutes. You'll receive a test WhatsApp message!

---

## Step 5: Setup Daily Automation

### Windows (Task Scheduler)
1. Open Task Scheduler
2. Create new task
3. Trigger: Daily at 9 AM
4. Action: Run `kaasflow/backend/run_daily_reminders.bat`
5. Save

### Linux/Mac (Cron)
```bash
crontab -e
# Add this line:
0 9 * * * /full/path/to/kaasflow/backend/run_daily_reminders.sh
```

---

## ✅ Done!

The system will now:
- Check daily at 9 AM for loans due today
- Automatically send WhatsApp reminders
- Log all activities

---

## 📋 Requirements

Before reminders work, ensure:
- ✅ Computer is ON at reminder time (9 AM)
- ✅ You're logged into **WhatsApp Web**
- ✅ Client phone numbers include country code (`+91`)
- ✅ Clients have WhatsApp on those numbers

---

## 🆘 Need Help?

- **Full Setup:** See `WHATSAPP_AUTOMATION_SETUP.md`
- **User Guide:** See `WHATSAPP_USER_GUIDE.md`
- **Technical Docs:** See `WHATSAPP_REMINDER_README.md`

---

## 🧪 Quick Test

To test manually without waiting:
```bash
cd kaasflow/backend
python whatsapp_reminder.py
```

This runs the checker immediately and shows you what would happen.

---

**That's it! Configure once, automate forever!** 🎉
