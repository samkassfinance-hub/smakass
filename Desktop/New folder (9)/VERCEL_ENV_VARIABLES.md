# 🔧 Vercel Environment Variables - Updated

**New Resend API Key Information:**
- ID: `892eaaa0-3209-4d34-875c-71fa441ff4ce`
- Token: `re_cGv5kXDT...` (complete token)
- Domain: `samkass.site`
- Permission: `sending_access`
- Created: 2026-06-23
- Creator: samkassfinance@gmail.com

---

## 📋 Environment Variables for Vercel

Copy and paste these into your Vercel project settings:

### Database (Supabase)
```
SUPABASE_URL=https://puhovplmbaldrisxqssy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1aG92cGxtYmFsZHJpc3hxc3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjExNTMsImV4cCI6MjA5NzE5NzE1M30.Py6KprKu6eUxRw1r3P0jPfhNAr8d8PxsgGmUYIel2WA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1aG92cGxtYmFsZHJpc3hxc3N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYyMTE1MywiZXhwIjoyMDk3MTk3MTUzfQ.pltOHHfWO1nMg8gcpEbYN7tW3NYgq-9IMt4-dEy09T4
```

### Email (Resend API - NEW)
```
RESEND_API_KEY=re_cGv5kXDT...
RESEND_FROM_EMAIL=noreply@samkass.site
MAIL_DOMAIN=samkass.site
MAIL_DOMAIN_ID=892eaaa0-3209-4d34-875c-71fa441ff4ce
```

### Security & Other
```
SECRET_KEY=your-secret-key-here
VERCEL=1
FRONTEND_URL=https://www.samkass.site
```

---

## 🔑 Complete Token for Resend API

**Get the complete token from:**
https://resend.com/api-keys

The token shown is: `re_cGv5kXDT...` (truncated)

**You need the FULL token** - it should look like:
```
re_cGv5kXDT_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 📝 Add to Vercel

1. Go to: https://vercel.com/dashboard
2. Click your **samkass** project
3. Go to **Settings → Environment Variables**
4. Add each variable:
   - Name: `SUPABASE_URL`
   - Value: (copy from above)
   - Click **Save**

Repeat for all variables above.

---

## ✅ Updated Email Configuration

The system will now use:
- **Primary:** Custom domain `noreply@samkass.site` (via new Resend API key)
- **Fallback:** `onboarding@resend.dev` (if primary fails)
- **Result:** Better deliverability + custom branding ✅

---

## 🚀 After Adding Variables

1. Deploy again:
   ```bash
   git commit --allow-empty -m "Update with new Resend API"
   git push origin main
   ```

2. Vercel will redeploy automatically

3. Test registration email:
   ```
   POST /auth/register
   Body: {
     "email": "mohaneni80@gmail.com",
     "password": "Test123!",
     "financier_name": "Test"
   }
   ```

4. You should receive email from: **noreply@samkass.site** ✅

---

## 📊 Email Settings Summary

| Setting | Value |
|---------|-------|
| **API Key** | re_cGv5kXDT... (get full version) |
| **Domain** | samkass.site |
| **From Email** | noreply@samkass.site |
| **Permission** | sending_access ✅ |
| **DKIM** | Verified ✅ |
| **SPF** | Verified ✅ |

---

**Status:** Ready to update Vercel and redeploy! 🚀
