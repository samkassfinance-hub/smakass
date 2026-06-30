# 🔧 WhatsApp Test Error - Troubleshooting Guide

## ❌ Error: "Error sending test message. Please try again."

This error occurs when trying to send a test WhatsApp message from the settings page.

---

## 🔍 Common Causes

1. **Backend not running**
2. **PyWhatKit not installed**
3. **Browser not available**
4. **WhatsApp Web not logged in**
5. **Phone number format incorrect**
6. **Network/firewall issues**

---

## ✅ Solutions (Try in Order)

### Solution 1: Check Backend is Running

**Problem:** API cannot be reached

**Fix:**
```bash
# Open terminal in backend folder
cd kaasflow/backend

# Start the backend
python app.py

# Should see:
# * Running on http://127.0.0.1:5000
```

**Verify:**
```bash
# In another terminal or browser:
curl http://localhost:5000/health

# Should return: {"status": "ok"}
```

---

### Solution 2: Install PyWhatKit

**Problem:** PyWhatKit library not installed

**Fix:**
```bash
cd kaasflow/backend

# Install PyWhatKit
pip install pywhatkit

# Or install all requirements
pip install -r requirements.txt
```

**Verify:**
```bash
python -c "import pywhatkit; print('PyWhatKit installed successfully')"
```

---

### Solution 3: Fix Phone Number Format

**Problem:** Invalid phone number format

**Wrong Formats:**
- ❌ `9876543210` (missing country code)
- ❌ `919876543210` (missing + sign)
- ❌ `+91 9876 543210` (spaces not allowed)

**Correct Format:**
- ✅ `+919876543210`
- ✅ `+14155552671`
- ✅ `+447911123456`

**Format:** `+[country code][number]` (no spaces)

---

### Solution 4: Use Direct Test Script

**Problem:** Backend test not working

**Fix: Use standalone test script**

```bash
cd kaasflow/backend

# Test with your number
python test_whatsapp_direct.py +919876543210

# Or with custom message
python test_whatsapp_direct.py +919876543210 "Test message"
```

**What it does:**
- ✅ Bypasses the API
- ✅ Tests PyWhatKit directly
- ✅ Shows detailed error messages
- ✅ Guides you through fixes

---

### Solution 5: Manual WhatsApp Web Test

**Problem:** PyWhatKit setup issues

**Fix: Test manually without automation**

1. **Open WhatsApp Web:**
   ```
   https://web.whatsapp.com
   ```

2. **Login with QR code** from your phone

3. **Keep it open** in the browser

4. **Try the test again** from settings page

5. **What should happen:**
   - Browser opens automatically
   - Goes to WhatsApp Web
   - Finds the contact
   - Sends the message

---

### Solution 6: Check Browser Installation

**Problem:** No browser available for PyWhatKit

**PyWhatKit needs Chrome or Firefox**

**Fix for Windows:**
```powershell
# Check if Chrome is installed
where chrome
# Or
where firefox

# If not found, install from:
# Chrome: https://www.google.com/chrome/
# Firefox: https://www.mozilla.org/firefox/
```

**Fix for Linux:**
```bash
# Install Chrome
sudo apt-get install google-chrome-stable

# Or Firefox
sudo apt-get install firefox
```

**Fix for Mac:**
```bash
# Install Chrome
brew install --cask google-chrome

# Or Firefox
brew install --cask firefox
```

---

### Solution 7: Check API URL

**Problem:** Frontend connecting to wrong backend URL

**Check in browser console (F12):**
```javascript
// On whatsapp-settings.html page
console.log('API URL:', API_URL);
// Should show: http://localhost:5000/api (or your backend URL)
```

**Fix if wrong:**
Edit `whatsapp-settings.html` and update the API URL detection:
```javascript
const API_URL = 'http://localhost:5000/api';  // Force localhost
```

---

### Solution 8: Detailed Error Logging

**Get more information about the error:**

**Open Browser DevTools (F12)**

**Go to Console tab**

**Try sending test again**

**Look for errors like:**

```
❌ "Failed to fetch" 
   → Backend not running

❌ "PyWhatKit not installed"
   → Run: pip install pywhatkit

❌ "Browser driver not found"
   → Install Chrome/Firefox

❌ "Phone number must start with +"
   → Fix number format

❌ "Database not configured"
   → Check Supabase credentials
```

---

## 🧪 Step-by-Step Test Procedure

### Test 1: Backend Health Check

```bash
# Terminal 1: Start backend
cd kaasflow/backend
python app.py
```

```bash
# Terminal 2: Test endpoint
curl http://localhost:5000/api/whatsapp/settings?user_id=test

# Expected: {"success":true,...}
```

### Test 2: Direct Python Test

```bash
cd kaasflow/backend
python test_whatsapp_direct.py +919876543210
```

**Expected Output:**
```
====================================================
WhatsApp Direct Test
====================================================

📱 Phone: +919876543210
💬 Message: This is a test message...

✅ PyWhatKit is installed
✅ DateTime module available

🚀 Preparing to send test message...

⏰ Scheduled time: 14:32

Press Enter to start the test...
```

### Test 3: Frontend Test

1. Open `whatsapp-settings.html`
2. Enter phone: `+919876543210`
3. Click "🧪 Test (Backend)"
4. Check console (F12) for errors
5. Wait 2 minutes for WhatsApp Web to open

---

## 📋 Diagnostic Checklist

Run through this checklist:

- [ ] Backend is running (`python app.py`)
- [ ] Backend responds to health check
- [ ] PyWhatKit is installed (`pip list | grep pywhatkit`)
- [ ] Chrome or Firefox is installed
- [ ] WhatsApp Web is accessible (https://web.whatsapp.com)
- [ ] Phone number format is correct (+country code)
- [ ] No firewall blocking localhost
- [ ] Browser console shows no errors
- [ ] Direct test script works

---

## 🔬 Advanced Debugging

### Debug 1: Test PyWhatKit Import

```python
# In Python shell:
python

>>> import pywhatkit
>>> print(pywhatkit.__version__)
# Should show version number

>>> print(pywhatkit.__file__)
# Should show installation path
```

### Debug 2: Test Backend Route Directly

```python
# In Python shell:
python

>>> import requests
>>> url = "http://localhost:5000/api/whatsapp/test"
>>> data = {"phone": "+919876543210", "message": "Test"}
>>> response = requests.post(url, json=data)
>>> print(response.status_code)
>>> print(response.json())
```

### Debug 3: Check Backend Logs

```bash
# Backend should show logs when test is attempted:
python app.py

# When you click test button, should see:
# ✓ Test message scheduled for XX:XX
# Or error message
```

---

## 💡 Quick Fixes Summary

| Error | Fix |
|-------|-----|
| "Error sending test message" | Check all solutions above |
| "Backend not running" | `python app.py` |
| "PyWhatKit not installed" | `pip install pywhatkit` |
| "Phone number format" | Use `+919876543210` format |
| "Failed to fetch" | Start backend server |
| "Browser not found" | Install Chrome/Firefox |

---

## 🎯 Recommended Testing Order

1. ✅ **First:** Save settings (don't test yet)
2. ✅ **Second:** Check backend is running
3. ✅ **Third:** Run direct test script
4. ✅ **Fourth:** Try frontend test button
5. ✅ **Fifth:** Wait for daily automation to run

**Why this order?**
- Saves settings first (most important)
- Tests backend separately (isolates issue)
- Direct script gives better errors
- Frontend test is convenience feature
- Daily automation is the real goal

---

## 🆘 Still Not Working?

### Option 1: Skip Test Button

The test button is optional. You can:

1. ✅ **Save your settings** (this works)
2. ✅ **Setup daily scheduler** (this is what matters)
3. ✅ **Wait for actual reminders** (real test)

The test button is just for verification. **The actual reminder system works independently.**

### Option 2: Manual Test

Instead of the test button:

```bash
# Create a test loan with due date = today
# Run the reminder script manually:
cd kaasflow/backend
python whatsapp_reminder.py

# This will send real reminders
```

### Option 3: Simplified Setup

If PyWhatKit causes issues:

1. **Save your WhatsApp number** in settings
2. **Skip the test button** for now
3. **Run reminders manually** when needed:
   ```bash
   python whatsapp_reminder.py
   ```

---

## 📞 Getting Help

If still stuck, provide this information:

### System Info:
```bash
python --version
pip list | grep pywhatkit
which chrome  # or: where chrome (Windows)
```

### Error Details:
- Exact error message from browser console
- Backend terminal output
- Output of direct test script

### Environment:
- Operating System
- Python version
- Browser installed
- Backend running? (yes/no)

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Direct test script completes successfully
2. ✅ WhatsApp Web opens automatically
3. ✅ Message is sent and received
4. ✅ No errors in console or terminal
5. ✅ Backend logs show success

---

**Remember:** The test button is just for verification. Even if it doesn't work, you can still use the reminder system by running the script manually or via scheduler!
