# 🚀 Deploy to Vercel - Terminal Guide

## ✅ Step 1: Update Local .env (Done!)

Fixed Resend API key in kaasflow/backend/.env:
```
RESEND_API_KEY=re_6AzZuetp_JXwyGB87X2DAKvr7JWFfiokr
RESEND_FROM_EMAIL=onboarding@resend.dev
```

Supabase credentials verified and working ✅

---

## ✅ Step 2: Commit Changes

```bash
git add kaasflow/backend/.env
git commit -m "Fix Resend API key for email delivery"
git push origin main
```

---

## ✅ Step 3: Set Vercel Environment Variables via CLI

**Install Vercel CLI first:**
```bash
npm install -g vercel
```

**Login to Vercel:**
```bash
vercel login
```

**Set environment variables for your project:**
```bash
vercel env add SUPABASE_URL
# Paste: https://puhovplmbaldrisxqssy.supabase.co

vercel env add SUPABASE_ANON_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1aG92cGxtYmFsZHJpc3hxc3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjExNTMsImV4cCI6MjA5NzE5NzE1M30.Py6KprKu6eUxRw1r3P0jPfhNAr8d8PxsgGmUYIel2WA

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1aG92cGxtYmFsZHJpc3hxc3N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYyMTE1MywiZXhwIjoyMDk3MTk3MTUzfQ.pltOHHfWO1nMg8gcpEbYN7tW3NYgq-9IMt4-dEy09T4

vercel env add RESEND_API_KEY
# Paste: re_6AzZuetp_JXwyGB87X2DAKvr7JWFfiokr

vercel env add RESEND_FROM_EMAIL
# Paste: onboarding@resend.dev

vercel env add SECRET_KEY
# Paste: your-secret-key-here

vercel env add VERCEL
# Paste: 1

vercel env add FRONTEND_URL
# Paste: https://www.samkass.site
```

---

## ✅ Step 4: Deploy

**Option A: Redeploy existing project**
```bash
vercel --prod
```

**Option B: Link and deploy**
```bash
vercel link
vercel --prod
```

---

## ✅ Step 5: Verify Deployment

```bash
# Check deployment status
vercel list

# View logs
vercel logs samkasssite.vercel.app
```

---

That's it! Your app will redeploy with corrected credentials.
