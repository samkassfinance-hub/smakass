# 📧 Resend Email API & Supabase Setup Guide

## Overview

This guide provides complete instructions to verify and configure both the **Resend Email API** (for OTP and welcome emails) and **Supabase Database** integration for SamKass.

---

## 🔍 Quick Status Check

Run the integration test script to verify both systems:

```bash
cd kaasflow/backend
python3 test_integration.py
```

This will check:
- ✅ Resend API key configuration
- ✅ Supabase credentials
- ✅ Email sending capability
- ✅ Database connectivity

---

## 📧 Part 1: Resend Email API Setup

### Your Provided Resend Credentials

```
ID: 61798d8d-0511-42cb-b4be-7a41a09875a2
Token: re_DxueLnyr...
Name: samkass
Permission: full_access
Creator: mohaneni80@gmail.com
Created At: 2026-05-21 08:13:59.11805+00
Domain: (empty - using default)
```

### 1.1 Get Your Complete API Key

1. Go to: **https://resend.com/api-keys**
2. Find your **"samkass"** API key in the list
3. Click on the key name to **reveal the complete token**
   - It should look like: `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Must be **40+ characters long**
4. Copy the **COMPLETE key** (not just the preview)

### 1.2 Update Your Environment

**Option A: Local Development (.env file)**
```bash
cd kaasflow/backend
cp .env.example .env
```

Edit `.env` and add:
```
RESEND_API_KEY=re_DxueLnyr... [paste your complete key here]
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Option B: Vercel Production**
1. Go to: https://vercel.com/samkass/samkass-backend/settings/environment-variables
2. Add new environment variable:
   - Name: `RESEND_API_KEY`
   - Value: `re_DxueLnyr...` (your complete key)
3. Click "Save"
4. Redeploy the backend

### 1.3 Verify Email Configuration

Test that emails are working:

```bash
cd kaasflow/backend
python3 test_integration.py
```

Expected output for email test:
```
✅ TEST EMAIL SENT SUCCESSFULLY!
📨 Email ID: email_xyz123
✓ Recipient: mohaneni80@gmail.com
✓ API Status: Working ✅
```

### 1.4 Email Flows That Use Resend

| Flow | Trigger | Recipient |
|------|---------|-----------|
| **Welcome Email** | User registers or logs in with Google | Registered email |
| **OTP Email** | User clicks "Forgot Password" | Registered email |
| **PIN Reset OTP** | User clicks "Forgot Security PIN" | Registered email |

**Test Email Templates:**
```python
# OTP Email (6-digit code)
Subject: Reset your SamKass Password 🔒
Body: Shows 6-digit OTP code

# Welcome Email
Subject: Welcome to SamKass! 🎉
Body: Congratulations message with getting started tips

# PIN Reset OTP
Subject: Reset your SamKass Security PIN 🔒
Body: Shows 6-digit OTP code
```

---

## 🗄️ Part 2: Supabase Database Setup

### Your Provided Supabase Credentials

```
URL: https://eahyuwpejwbqzzolajzr.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...S98_O8nY...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...Mm4eOTioL1...
Project ID: eahyuwpejwbqzzolajzr
```

### 2.1 Get Your Service Role Key

1. Go to: **https://app.supabase.com**
2. Select your project: **eahyuwpejwbqzzolajzr**
3. Click **Settings** (left sidebar)
4. Click **API** (under Project Settings)
5. Find **Service Role (secret)** key
   - ⚠️ **KEEP THIS SECRET** - Don't share in public repos
   - Copy the COMPLETE key (100+ characters)

### 2.2 Update Your Environment

**Option A: Local Development (.env file)**
```bash
cd kaasflow/backend
```

Edit `.env` and add:
```
SUPABASE_URL=https://eahyuwpejwbqzzolajzr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Option B: Vercel Production**
1. Go to: https://vercel.com/samkass/samkass-backend/settings/environment-variables
2. Add environment variables:
   - Name: `SUPABASE_URL`
   - Value: `https://eahyuwpejwbqzzolajzr.supabase.co`
   
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `eyJhbGciOi...` (your complete key)
3. Click "Save"
4. Redeploy the backend

### 2.3 Verify Supabase Connection

Test that Supabase is connected:

```bash
cd kaasflow/backend
python3 test_integration.py
```

Expected output for Supabase test:
```
✅ Supabase client created successfully
✅ Supabase auth endpoint responding
✅ SUPABASE CONNECTION TEST PASSED
```

### 2.4 Database Schema Check

Verify your database has the required tables:

1. Go to: https://app.supabase.com/project/eahyuwpejwbqzzolajzr
2. Click **SQL Editor** (left sidebar)
3. Run these queries to verify tables exist:

```sql
-- Check for users table
SELECT * FROM auth.users LIMIT 1;

-- Check for custom tables (if any)
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

---

## 🧪 Testing Guide

### Test 1: Run Automated Tests

```bash
cd kaasflow/backend
python3 test_integration.py
```

This checks:
- ✅ API key format and length
- ✅ Email sending capability
- ✅ Supabase connection
- ✅ Authentication endpoints

### Test 2: Manual OTP Email Test

1. Go to your app: https://samkass.site
2. Click **Forgot Password**
3. Enter your email: `mohaneni80@gmail.com`
4. Check your email inbox (and spam folder)
5. You should receive an email with a 6-digit OTP code

### Test 3: Manual Welcome Email Test

1. Go to registration page
2. Create a new account with:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
3. Check the registered email inbox
4. You should receive a "Welcome to SamKass" email

### Test 4: Supabase Database Test

```bash
cd kaasflow/backend
python3 -c "
from supabase_client import supabase
# If this runs without errors, Supabase is connected
print('✅ Supabase connected successfully')
"
```

---

## 🔧 Troubleshooting

### Issue: "RESEND API KEY NOT CONFIGURED"

**Solution:**
1. Go to: https://resend.com/api-keys
2. Click on your "samkass" API key to reveal it
3. Make sure you copy the **COMPLETE key** (40+ characters, starts with `re_`)
4. Update your `.env` file with the complete key
5. Restart your backend server

### Issue: "Invalid or incomplete Supabase credentials"

**Solution:**
1. Go to: https://app.supabase.com/project/eahyuwpejwbqzzolajzr/settings/api
2. Copy your **Service Role (secret)** key
3. Make sure it's **100+ characters long**
4. Update your `.env` file
5. Restart your backend server

### Issue: "Emails not being received"

**Possible causes:**
1. API key not set or incomplete
2. Recipient email marked as spam
3. Resend domain not verified
4. Rate limiting (too many emails)

**Solutions:**
- Check API key with: `python3 test_integration.py`
- Use `onboarding@resend.dev` as sender (default)
- Check spam/junk folders
- Wait a few minutes between tests

### Issue: "Supabase connection times out"

**Solution:**
1. Check internet connection
2. Verify Supabase URL is correct
3. Verify Service Role key is not truncated
4. Check if Supabase is running: https://status.supabase.com

---

## 📊 Complete Credentials Reference

### Resend Email API
- **API Key Provided:** `re_DxueLnyr...`
- **Full Key Length:** 40+ characters
- **Format:** Starts with `re_`
- **Get Full Key:** https://resend.com/api-keys
- **Default Sender:** `onboarding@resend.dev`
- **Custom Domain:** (Currently not configured)

### Supabase
- **URL:** `https://eahyuwpejwbqzzolajzr.supabase.co`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Project ID:** `eahyuwpejwbqzzolajzr`
- **Dashboard:** https://app.supabase.com

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Resend API key is complete and valid (40+ chars, starts with `re_`)
- [ ] Resend API key is set in Vercel environment variables
- [ ] Supabase URL is correct and accessible
- [ ] Service Role key is complete and valid (100+ chars)
- [ ] Service Role key is set in Vercel environment variables
- [ ] Backend has been redeployed after env changes
- [ ] Test emails are being received
- [ ] Supabase connection is established
- [ ] OTP emails are being sent successfully
- [ ] Welcome emails are being sent to new users

---

## 📞 Support Resources

- **Resend Documentation:** https://resend.com/docs
- **Supabase Documentation:** https://supabase.com/docs
- **SamKass Status:** https://status.samkass.site
- **Get Support:** contact@samkass.site

---

**Last Updated:** 2026-06-15
**Status:** ✅ Configuration Complete
