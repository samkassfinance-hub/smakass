# ⚡ Quick Vercel Setup - 10 Minutes

## 🎯 Your New Email API Key

```
Token ID:    892eaaa0-3209-4d34-875c-71fa441ff4ce
Token:       re_cGv5kXDT_... (full token)
Domain:      samkass.site
From Email:  noreply@samkass.site
Permission:  sending_access ✅
DKIM:        Verified ✅
SPF:         Verified ✅
```

---

## 📋 10 Environment Variables for Vercel

Add these in Vercel: Settings → Environment Variables

### Supabase (Database)
```
SUPABASE_URL=https://puhovplmbaldrisxqssy.supabase.co

SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1aG92cGxtYmFsZHJpc3hxc3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjExNTMsImV4cCI6MjA5NzE5NzE1M30.Py6KprKu6eUxRw1r3P0jPfhNAr8d8PxsgGmUYIel2WA

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1aG92cGxtYmFsZHJpc3hxc3N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYyMTE1MywiZXhwIjoyMDk3MTk3MTUzfQ.pltOHHfWO1nMg8gcpEbYN7tW3NYgq-9IMt4-dEy09T4
```

### Email (NEW Resend API)
```
RESEND_API_KEY=re_cGv5kXDT_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

RESEND_FROM_EMAIL=noreply@samkass.site

MAIL_DOMAIN=samkass.site

MAIL_DOMAIN_ID=892eaaa0-3209-4d34-875c-71fa441ff4ce
```

### Other
```
SECRET_KEY=your-secret-key-here

VERCEL=1

FRONTEND_URL=https://www.samkass.site
```

---

## 🚀 Steps

### 1. Get Full Resend API Key
- Open: https://resend.com/api-keys
- Click "Supabase Integration"
- Copy the FULL token (starts with `re_cGv5kXDT_`)

### 2. Add to Vercel
- Open: https://vercel.com/dashboard
- Click your **samkass** project
- Settings → Environment Variables
- Add each variable above

### 3. Deploy
```bash
git commit --allow-empty -m "Deploy with new Resend API"
git push origin main
```

### 4. Wait
- Vercel auto-deploys (2-5 minutes)
- Check dashboard for "Ready" status ✅

### 5. Test
Register test user:
```bash
curl -X POST https://your-vercel-url.vercel.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mohaneni80@gmail.com",
    "password": "Test123!",
    "financier_name": "Test"
  }'
```

Check email at mohaneni80@gmail.com ✅

---

## ✅ Checklist

- [ ] Supabase tables created (4 tables)
- [ ] Full Resend API key copied from https://resend.com/api-keys
- [ ] All 10 variables added to Vercel
- [ ] Code pushed to GitHub
- [ ] Vercel shows "Ready"
- [ ] Test email received from noreply@samkass.site
- [ ] Welcome email has founder's message

---

## 🆘 Issues?

**Email not received?**
1. Check spam folder
2. Verify API key is COMPLETE (40+ characters)
3. Check Vercel logs
4. Check Resend dashboard

**Deployment failed?**
1. Check all variables are added
2. Verify Supabase tables exist
3. Check Vercel build logs

---

**Status:** 🟢 Ready to deploy!

Go to: https://vercel.com/dashboard and add the variables above.

Then: `git push origin main` to trigger deployment.
