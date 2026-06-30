# 🚀 Vercel Deployment - Complete Setup Guide

**Date:** June 23, 2026  
**New Resend API Key:** Activated ✅  
**Status:** Ready to Deploy

---

## 📋 Your Environment Variables

### Copy These Exactly to Vercel

**Step 1: Go to Vercel Dashboard**
```
https://vercel.com/dashboard
```

**Step 2: Click your samkass project**

**Step 3: Go to Settings → Environment Variables**

**Step 4: Add EACH variable below**

---

## 🔧 Environment Variables to Add

### 1. Supabase - Database
```
Name:  SUPABASE_URL
Value: https://puhovplmbaldrisxqssy.supabase.co
```

```
Name:  SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1aG92cGxtYmFsZHJpc3hxc3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjExNTMsImV4cCI6MjA5NzE5NzE1M30.Py6KprKu6eUxRw1r3P0jPfhNAr8d8PxsgGmUYIel2WA
```

```
Name:  SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1aG92cGxtYmFsZHJpc3hxc3N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYyMTE1MywiZXhwIjoyMDk3MTk3MTUzfQ.pltOHHfWO1nMg8gcpEbYN7tW3NYgq-9IMt4-dEy09T4
```

---

### 2. Resend - Email (NEW API KEY)

⚠️ **IMPORTANT:** Get the FULL token from https://resend.com/api-keys

The complete token starts with: `re_cGv5kXDT_` and is 40+ characters

```
Name:  RESEND_API_KEY
Value: re_cGv5kXDT_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
(Replace XXXXX... with the full token from Resend dashboard)

```
Name:  RESEND_FROM_EMAIL
Value: noreply@samkass.site
```

```
Name:  MAIL_DOMAIN
Value: samkass.site
```

```
Name:  MAIL_DOMAIN_ID
Value: 892eaaa0-3209-4d34-875c-71fa441ff4ce
```

---

### 3. Security & Config

```
Name:  SECRET_KEY
Value: your-secret-key-here
```

```
Name:  VERCEL
Value: 1
```

```
Name:  FRONTEND_URL
Value: https://www.samkass.site
```

---

## 📊 Summary of All Variables

| Name | Value | Source |
|------|-------|--------|
| SUPABASE_URL | https://puhovplmbaldrisxqssy.supabase.co | Supabase Dashboard |
| SUPABASE_ANON_KEY | eyJhbGciOi... | Supabase Dashboard |
| SUPABASE_SERVICE_ROLE_KEY | eyJhbGciOi... | Supabase Dashboard |
| RESEND_API_KEY | re_cGv5kXDT_... | **NEW** - Resend Dashboard |
| RESEND_FROM_EMAIL | noreply@samkass.site | Resend Domain |
| MAIL_DOMAIN | samkass.site | Custom Domain |
| MAIL_DOMAIN_ID | 892eaaa0-3209... | Resend API Info |
| SECRET_KEY | (generate one) | You |
| VERCEL | 1 | Vercel Config |
| FRONTEND_URL | https://www.samkass.site | Your Domain |

---

## ✅ Step-by-Step Instructions

### 1. Get the Complete Resend API Key

**Go to:** https://resend.com/api-keys

**Look for:** "Supabase Integration" API key

**Click on it** to reveal the full token (starts with `re_cGv5kXDT_`)

**Copy the ENTIRE token** - it should be 40+ characters

---

### 2. Add to Vercel

**For each variable:**
1. Go to Vercel Dashboard
2. Click your **samkass** project
3. Settings → Environment Variables
4. Click **Add Environment Variable**
5. Paste Name and Value
6. Click **Save**

**Repeat for all 10 variables above**

---

### 3. Redeploy

Once all variables are added:

```bash
git commit --allow-empty -m "Add new Resend API key for better email delivery"
git push origin main
```

**Or manually redeploy:**
1. Vercel Dashboard
2. Click your project
3. Click **Redeploy** button
4. Wait for "Ready" status ✅

---

## 🔍 Verify Deployment

After redeployment completes:

### 1. Check Build Logs
- Vercel Dashboard → Deployments → Latest
- Look for: **"Build successful"** ✅

### 2. Test Email Sending
Get your Vercel deployment URL and run:

```bash
curl -X POST https://your-vercel-url.vercel.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mohaneni80@gmail.com",
    "password": "TestPassword123!",
    "financier_name": "Test User"
  }'
```

### 3. Check Email
- Open mohaneni80@gmail.com
- Look for email from: **noreply@samkass.site** ✅
- Subject: "🚀 Welcome to SamKass! Your Finance Manager is Ready"
- Should include founder's message

### 4. Test Password Reset
```bash
curl -X POST https://your-vercel-url.vercel.app/auth/forgot-password/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "mohaneni80@gmail.com"}'
```

Should receive OTP email from: **noreply@samkass.site** ✅

---

## 🆘 Troubleshooting

### Email Not Received?

**Check 1: Is API key correct?**
- Get full token from: https://resend.com/api-keys
- Verify it starts with: `re_cGv5kXDT_`
- Paste complete token (40+ characters)

**Check 2: Are Supabase tables created?**
- Go to: https://app.supabase.com/project/puhovplmbaldrisxqssy/editor
- Click "Table Editor"
- Should see 4 tables: users, subscriptions, app_backups, audit_logs

**Check 3: Check Vercel Logs**
- Vercel Dashboard → Deployments → Logs
- Look for error messages

**Check 4: Check Resend Dashboard**
- Go to: https://resend.com/emails
- Look for failed sends or errors

---

## 📈 What's Different Now

| Before | After |
|--------|-------|
| Old Resend API | ❌ | New Resend API | ✅ |
| Generic `onboarding@resend.dev` | ❌ | Custom domain `noreply@samkass.site` | ✅ |
| Generic branding | ❌ | Professional branding | ✅ |
| Lower deliverability | ❌ | Better deliverability | ✅ |

---

## 🎯 Next Steps After Deployment

1. **Monitor email delivery** - Check Resend dashboard
2. **Test all endpoints** - Register, login, password reset, PIN reset
3. **Check logs daily** - Monitor for errors
4. **Gather user feedback** - Track any issues

---

## 📞 Important Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Resend API Keys:** https://resend.com/api-keys
- **Supabase Project:** https://app.supabase.com/project/puhovplmbaldrisxqssy
- **GitHub Repo:** https://github.com/samkassfinance-hub/smakass

---

## ✨ Final Checklist

Before deploying, verify:

- [ ] Supabase tables created (4 tables exist)
- [ ] Complete Resend API key obtained (40+ characters)
- [ ] All 10 environment variables added to Vercel
- [ ] Code pushed to GitHub
- [ ] Vercel showing "Ready" status after redeploy
- [ ] Test email received at mohaneni80@gmail.com
- [ ] Email from address shows: noreply@samkass.site

---

## 🚀 Ready to Deploy!

You're all set! Follow the steps above and your app will be live with the new email configuration.

**Questions?** Check the troubleshooting section or read the full setup guide.

---

**Status:** 🟢 **READY FOR DEPLOYMENT**

**Date:** June 23, 2026  
**API Key Status:** Updated ✅  
**Next Action:** Add environment variables to Vercel
