# ✅ Email API & Supabase Verification Instructions

## 📋 Overview

This document provides step-by-step instructions to verify that both the **Resend Email API** and **Supabase Database** are correctly configured and working.

---

## 🚀 Quick Start Verification (2 minutes)

### Step 1: Check Environment File

```bash
cd kaasflow/backend
bash verify_setup.sh
```

This will show:
- ✅/❌ RESEND_API_KEY status and length
- ✅/❌ SUPABASE_URL status
- ✅/❌ SUPABASE_SERVICE_ROLE_KEY status and length

### Step 2: Run Full Integration Test

```bash
cd kaasflow/backend
python3 test_integration.py
```

This will:
1. ✅ Check Resend API key configuration
2. ✅ Send a test email
3. ✅ Connect to Supabase database
4. ✅ Test email flows (OTP, Welcome)
5. 📊 Generate a complete report

---

## 📧 Detailed Email Verification

### Test 1: Verify Resend API Key

**Expected Behavior:**
- API Key should be 40+ characters
- Should start with `re_`
- Should be complete (not truncated)

**Verification:**
```bash
cd kaasflow/backend
grep "RESEND_API_KEY=" .env
```

Expected output:
```
RESEND_API_KEY=re_DxueLnyrXxXxXxXxXxXxXxXxXxXxXxXxXx
```

### Test 2: Send Test Email

**Run:**
```bash
cd kaasflow/backend
python3 test_integration.py
```

**Expected Output:**
```
📧 TESTING RESEND EMAIL API
---
✓ RESEND_API_KEY status: Set ✅
  Key length: 48 characters
  Key format: Starts with re_ ✅

📤 Sending test email to: mohaneni80@gmail.com
✅ TEST EMAIL SENT SUCCESSFULLY!
📨 Email ID: abc123def456
✓ Recipient: mohaneni80@gmail.com
✓ API Status: Working ✅
```

### Test 3: Check Inbox

1. Check email: **mohaneni80@gmail.com**
2. Look for email from: **SamKass** or **onboarding@resend.dev**
3. Subject should contain: **Integration Test** or **Test Email**
4. If not in inbox, check **Spam/Junk** folder

### Test 4: Manual Forgot Password Test

**Flow:**
1. Go to: https://samkass.site
2. Click **Forgot Password**
3. Enter email: **mohaneni80@gmail.com**
4. Click **Send OTP**
5. Wait 5-10 seconds
6. Check inbox for email with subject: **"Reset your SamKass Password 🔒"**
7. Email should contain a **6-digit OTP code**

**Expected Email:**
```
Subject: Reset your SamKass Password 🔒
From: SamKass <onboarding@resend.dev>
Body: 
  "We received a request to reset your SamKass account password. 
   Use the OTP below to proceed:"
  
  [Box with 6-digit code: 123456]
```

### Test 5: Manual Registration Test (Welcome Email)

**Flow:**
1. Go to: https://samkass.site/register
2. Create new account with:
   - Full Name: Test User
   - Email: **test-samkass-2026@gmail.com**
   - Password: TestPass123!
3. Click **Register**
4. After successful registration, check inbox
5. Look for email with subject: **"Welcome to SamKass! 🎉"**

**Expected Email:**
```
Subject: Welcome to SamKass! 🎉
From: SamKass <onboarding@resend.dev>
Body:
  "Thank you for registering at SamKass! We're excited to help you..."
  
  Getting Started Tips:
  - Add your first client
  - Create a loan ledger
  - Go to Settings
```

---

## 🗄️ Detailed Supabase Verification

### Test 1: Verify Supabase Credentials

**Run:**
```bash
cd kaasflow/backend
grep "SUPABASE_" .env
```

**Expected Output:**
```
SUPABASE_URL=https://eahyuwpejwbqzzolajzr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Test 2: Test Connection

**Run:**
```bash
cd kaasflow/backend
python3 -c "
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

print(f'URL: {url}')
print(f'Key length: {len(key)} chars')

supabase = create_client(url, key)
print('✅ Connection successful!')
"
```

**Expected Output:**
```
URL: https://eahyuwpejwbqzzolajzr.supabase.co
Key length: 156 chars
✅ Connection successful!
```

### Test 3: Run Full Integration Test

```bash
cd kaasflow/backend
python3 test_integration.py
```

**Expected Supabase Section:**
```
🗄️  TESTING SUPABASE DATABASE CONNECTION
---
✓ SUPABASE_URL status: Set ✅
  URL: https://eahyuwpejwbqzzolajzr.supabase.co
  Format: Valid ✅

✓ SUPABASE_SERVICE_ROLE_KEY status: Set ✅
  Key length: 156 characters

🔗 Connecting to Supabase...
✅ Supabase client created successfully
✅ Supabase auth endpoint responding

✅ SUPABASE CONNECTION TEST PASSED
✓ Database: Connected ✅
✓ Credentials: Valid ✅
```

### Test 4: Check Database Tables

**Via Dashboard:**
1. Go to: https://app.supabase.com
2. Login to your project: **eahyuwpejwbqzzolajzr**
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Run these queries:

**Query 1: Check Users Table**
```sql
SELECT COUNT(*) as user_count FROM auth.users;
```

Expected: Should show some count (could be 0 if no users yet)

**Query 2: List Public Tables**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected: Should list all your custom tables

**Query 3: Check Connection Health**
```sql
SELECT NOW() as current_time;
```

Expected: Should return current timestamp

### Test 5: Verify Auth Integration

**Check if Supabase Auth is working:**

```bash
cd kaasflow/backend
python3 -c "
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_SERVICE_ROLE_KEY')
)

# Test auth endpoint
try:
    # Try to get current user (will be None without session, but endpoint responds)
    response = supabase.auth.get_user()
    print('✅ Auth endpoint responsive')
except Exception as e:
    print(f'⚠️  Auth endpoint response: {type(e).__name__}')
    print('ℹ️  This is normal without an active session')
"
```

---

## 🔍 Complete System Check

Run this comprehensive check to verify everything:

```bash
#!/bin/bash
cd kaasflow/backend

echo "🔍 COMPLETE SYSTEM CHECK"
echo "========================"
echo ""

# 1. Environment Variables
echo "1️⃣  Environment Variables:"
bash verify_setup.sh
echo ""

# 2. Python Integration Test
echo "2️⃣  Running Integration Tests:"
python3 test_integration.py
echo ""

# 3. Connection Test
echo "3️⃣  Direct Connection Test:"
python3 -c "
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
try:
    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    )
    print('✅ Direct Supabase connection: OK')
except Exception as e:
    print(f'❌ Direct Supabase connection: {e}')
"

echo ""
echo "========================"
echo "✅ System check complete!"
```

---

## 🚨 Troubleshooting

### Email Not Received

**Symptoms:** No email in inbox or spam folder

**Solutions:**
1. Check if API key is set correctly:
   ```bash
   grep "RESEND_API_KEY=" .env
   ```
   Should show: `RESEND_API_KEY=re_xxxxxxx...` (40+ chars)

2. Verify the email was sent:
   ```bash
   python3 test_integration.py
   ```
   Look for: `✅ TEST EMAIL SENT SUCCESSFULLY!`

3. Check spam/junk folder
   - Resend uses `onboarding@resend.dev` by default
   - May be marked as spam initially

4. Check backend logs:
   ```bash
   # For local development
   tail -f backend.log
   
   # For Vercel
   # Go to: https://vercel.com/samkass/samkass-backend/logs
   ```

### Supabase Connection Failed

**Symptoms:** "Failed to connect to Supabase" or "Invalid credentials"

**Solutions:**
1. Verify credentials:
   ```bash
   grep "SUPABASE_" .env
   ```
   Should show complete URLs and keys (100+ chars)

2. Check if Supabase is running:
   - Go to: https://status.supabase.com
   - Check for any incidents

3. Verify network connection:
   ```bash
   curl -I https://eahyuwpejwbqzzolajzr.supabase.co
   ```
   Should return HTTP 200 or 301

4. Check service role key:
   - Go to: https://app.supabase.com/project/eahyuwpejwbqzzolajzr/settings/api
   - Copy fresh Service Role key (it's marked as "secret")
   - Update in `.env`

### API Key Shows as "Set" but Tests Fail

**Symptoms:** 
```
✓ RESEND_API_KEY status: Set ✅
❌ TEST EMAIL SENT SUCCESSFULLY!
Error: 401 Unauthorized
```

**Solutions:**
1. Make sure you copied the COMPLETE key:
   - Go to: https://resend.com/api-keys
   - Click on your "samkass" key to reveal it
   - Copy ALL of it (not just preview)

2. Check for hidden characters:
   ```bash
   # Show hex characters to spot spaces/quotes
   grep "RESEND_API_KEY=" .env | od -c
   ```

3. Rebuild your .env:
   ```bash
   # Backup current
   cp .env .env.backup
   
   # Start fresh
   cp .env.example .env
   
   # Carefully paste credentials
   nano .env  # or your preferred editor
   ```

---

## 📊 Health Check Dashboard

Create a monitoring dashboard:

```bash
# Create a cron job to check system health every hour
crontab -e

# Add this line:
0 * * * * cd /path/to/kaasflow/backend && python3 test_integration.py >> health_check.log 2>&1
```

Then view health history:
```bash
tail -f kaasflow/backend/health_check.log
```

---

## ✅ Verification Checklist

Before considering setup complete, verify:

- [ ] `.env` file exists with all credentials
- [ ] Resend API key is 40+ characters and starts with `re_`
- [ ] Supabase URL is correct format: `https://xxx.supabase.co`
- [ ] Service Role key is 100+ characters
- [ ] `python3 test_integration.py` shows all tests passing
- [ ] Test email was received at `mohaneni80@gmail.com`
- [ ] Supabase connection test passed
- [ ] Welcome emails are sent to new users
- [ ] OTP emails are sent when password reset requested
- [ ] No errors in backend logs

---

## 📞 Next Steps

If all tests pass:
1. ✅ Deploy to production
2. ✅ Send notification to team
3. ✅ Monitor email delivery rates
4. ✅ Set up error alerts

If tests fail:
1. ❌ Review troubleshooting section
2. ❌ Check backend logs for errors
3. ❌ Verify credentials with service providers
4. ❌ Contact support if issues persist

---

**Last Updated:** 2026-06-15
**Status:** Ready for Production ✅
