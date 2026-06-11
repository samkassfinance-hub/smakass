# Vercel Environment Variables for KaasFlow Deployment

## Complete Configuration - Copy these to Vercel Dashboard

### 1. Supabase Configuration
```
SUPABASE_URL=https://eahyuwpejwbqzzolajzr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhaHl1d3BlandicXp6b2xhenpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA5MjI0NCwiZXhwIjoyMDk0NjY4MjQ0fQ.Mm4eOTioL1FpasqsqJPBeNdRP_BBW0_50ucBsf5Uoxs
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhaHl1d3BlandicXp6b2xhenpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA5MjI0NCwiZXhwIjoyMDk0NjY4MjQ0fQ.Mm4eOTioL1FpasqsqJPBeNdRP_BBW0_50ucBsf5Uoxs
```

### 2. Razorpay Payment Gateway (LIVE Keys)
```
RAZORPAY_KEY_ID=rzp_live_SuharfZYrJBbHj
RAZORPAY_KEY_SECRET=FsmmZywk4NGiI1PxIS4UWb0e
```

### 3. Google OAuth Configuration
```
GOOGLE_CLIENT_ID=1008709235007-vh9u2526ol0haffogibri3kno6rtjejl.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET_FROM_CONSOLE>
```
**Note:** You need to get the Google Client Secret from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

### 4. Email Service - Resend (Required for OTP)
```
RESEND_API_KEY=<YOUR_RESEND_API_KEY>
RESEND_FROM_EMAIL=onboarding@resend.dev
```
**Note:** Get your Resend API key from [resend.com/api-keys](https://resend.com/api-keys)

### 5. Flask/JWT Security Keys
```
SECRET_KEY=your_random_secret_key_here_min_32_chars
JWT_SECRET_KEY=another_random_jwt_secret_key_32_chars
FLASK_ENV=production
```
**Generate secure keys using:**
```bash
openssl rand -hex 32
```

### 6. Frontend URL (Update after first deployment)
```
FRONTEND_URL=https://your-vercel-app-url.vercel.app
```
**Important:** After your first Vercel deployment, update this with your actual Vercel URL.

### 7. Backend Configuration
```
BACKEND_PORT=5000
VERCEL=1
```

---

## How to Add These to Vercel:

### Option 1: Via Vercel Dashboard (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project (or import from GitHub: `mohaneni/samkass`)
3. Go to **Settings** → **Environment Variables**
4. Add each variable above:
   - **Key**: Variable name (e.g., `SUPABASE_URL`)
   - **Value**: Variable value (e.g., `https://eahyuwpejwbqzzolajzr.supabase.co`)
   - **Environment**: Select `Production`, `Preview`, and `Development`
5. Click **Save**
6. Click **Deploy** to redeploy with new environment variables

### Option 2: Via Vercel CLI
```bash
# Set each variable using CLI
vercel env add SUPABASE_URL production
vercel env add RAZORPAY_KEY_ID production
# ... (repeat for all variables)
```

---

## ⚠️ IMPORTANT SECURITY NOTES:

1. **NEVER commit .env files to Git** - These contain sensitive credentials
2. **Razorpay Keys**: These are LIVE keys - transactions will be real
3. **Supabase Service Role Key**: This has admin access to your database
4. **Generate new SECRET_KEY and JWT_SECRET_KEY** for production security
5. **Google OAuth**: Add your Vercel domain to authorized redirect URIs in Google Console

---

## Missing Values You Need to Add:

### 1. Google Client Secret
- Go to: https://console.cloud.google.com/apis/credentials
- Find your OAuth 2.0 Client ID: `1008709235007-vh9u2526ol0haffogibri3kno6rtjejl`
- Copy the **Client Secret**
- Add it as `GOOGLE_CLIENT_SECRET` in Vercel

### 2. Resend API Key
- Go to: https://resend.com/api-keys
- Create a new API key
- Add it as `RESEND_API_KEY` in Vercel

### 3. Generate Security Keys
Run these commands to generate secure keys:
```bash
# For SECRET_KEY
openssl rand -hex 32

# For JWT_SECRET_KEY
openssl rand -hex 32
```

---

## After Deployment:

1. **Update FRONTEND_URL**: After first deployment, copy your Vercel URL and update the `FRONTEND_URL` environment variable
2. **Update Google OAuth Redirect URIs**: Add your Vercel domain to authorized redirect URIs in Google Cloud Console
3. **Test Payment Integration**: Use Razorpay test mode first before going live
4. **Verify Email OTP**: Test the forgot password flow to ensure Resend is working

---

## Quick Deploy Command:

```bash
# Deploy to Vercel
vercel --prod

# Or link to existing project
vercel link
vercel --prod
```

---

**Your GitHub Repository:** https://github.com/mohaneni/samkass
**Deploy from:** Main/Master branch
