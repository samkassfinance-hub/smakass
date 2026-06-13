# 🚀 Python Backend Setup Guide

## ❌ Current Issue
Python is not installed on your system. The WhatsApp automation requires Python.

---

## ✅ Solution: Install Python

### Step 1: Download Python

**Go to:** https://www.python.org/downloads/

**Download:** Python 3.11 or later (recommended)

**Important:** During installation:
- ✅ Check "Add Python to PATH"
- ✅ Check "Install pip"
- ✅ Choose "Install Now"

### Step 2: Verify Installation

After installation, open a NEW terminal and run:

```bash
python --version
# Should show: Python 3.11.x or higher

pip --version
# Should show: pip 23.x.x or higher
```

### Step 3: Install Required Packages

```bash
# Navigate to backend folder
cd kaasflow/backend

# Install all dependencies
pip install -r requirements.txt

# This installs:
# - flask (web server)
# - flask-cors (API access)
# - pywhatkit (WhatsApp automation)
# - python-dotenv (environment variables)
# - supabase (optional - for database)
# - razorpay (optional - for payments)
```

### Step 4: Start the Backend

```bash
cd kaasflow/backend
python app.py

# Should see:
#  * Running on http://127.0.0.1:5000
#  * Running on http://localhost:5000
```

---

## 🎯 Alternative: Use Standalone WhatsApp Script

If you don't want to set up the full backend right now, you can use the simplified version:

### Option A: Browser-Based (No Backend Needed)

1. **Save your WhatsApp settings** in the settings page (even if test fails)
2. **Settings are stored in browser** (localStorage)
3. **When ready to send reminders:**
   - Run the Python script directly
   - Or set up the scheduler

### Option B: Manual Reminder Script

Once Python is installed:

```bash
# Create a simple test
cd kaasflow/backend

# Install just PyWhatKit
pip install pywhatkit

# Run direct test
python test_whatsapp_direct.py +919876543210
```

---

## 📦 What Each Package Does

| Package | Purpose | Required? |
|---------|---------|-----------|
| flask | Backend web server | Yes (for API) |
| pywhatkit | WhatsApp automation | Yes (for messages) |
| python-dotenv | Environment variables | Yes |
| flask-cors | API access from frontend | Yes (for API) |
| supabase | Cloud database | No (optional) |
| razorpay | Payment processing | No (optional) |

---

## 🔧 Quick Setup Commands

After installing Python:

```bash
# All in one setup:
cd kaasflow/backend
pip install flask flask-cors pywhatkit python-dotenv
python app.py

# Or install everything:
pip install -r requirements.txt
python app.py
```

---

## ✅ Verification Checklist

- [ ] Python installed (`python --version`)
- [ ] Pip installed (`pip --version`)
- [ ] Requirements installed (`pip list`)
- [ ] .env file exists
- [ ] Backend starts successfully
- [ ] Can access http://localhost:5000/health

---

## 🆘 Common Issues

### Issue: "Python not found"
**Fix:** Install Python from python.org, check "Add to PATH"

### Issue: "pip not found"
**Fix:** Reinstall Python with "Install pip" checked

### Issue: "Module not found"
**Fix:** `pip install -r requirements.txt`

### Issue: "Port 5000 already in use"
**Fix:** Change port in .env: `BACKEND_PORT=5001`

### Issue: ".env file not found"
**Fix:** It's been created automatically, should be there now

---

## 🎉 Once Python is Installed

1. **Install packages:** `pip install -r requirements.txt`
2. **Start backend:** `python app.py`
3. **Open settings page** in browser
4. **Configure WhatsApp** settings
5. **Test** the connection
6. **Setup daily scheduler** for automation

---

## 💡 Pro Tip

You don't need the backend running 24/7. You only need it:
- When configuring WhatsApp settings
- When testing messages
- OR you can skip backend and run reminders directly with Python script

The daily automation can run standalone without the backend API!

---

**Install Python first, then we can proceed with the WhatsApp automation setup!**
