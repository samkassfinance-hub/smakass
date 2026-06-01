# 🚀 Deploy Backend Online NOW

## Option 1: Deploy with Vercel (Easiest - 2 Minutes)

### Step 1: Click This Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mohaneni/samkass&project-name=samkass-backend&root-directory=kaasflow/backend)

### Step 2: After Clicking:
1. Login to Vercel (free)
2. Give project permissions
3. Click "Deploy"

### Step 3: Add Environment Variables

After deploy, go to: **Settings → Environment Variables**

Add these (copy values from your `kaasflow/backend/.env` file):

| Variable | Value |
|----------|-------|
| SUPABASE_URL | Your Supabase URL |
| SUPABASE_SERVICE_ROLE_KEY | Your service role key |
| SUPABASE_ANON_KEY | Your anon key |
| SECRET_KEY | Your secret key |
| JWT_SECRET | Your JWT secret |
| RESEND_API_KEY | Your Resend API key |
| RESEND_FROM_EMAIL | `SamKass <welcome@samkass.site>` |
| GOOGLE_CLIENT_ID | Your Google Client ID |
| GOOGLE_CLIENT_SECRET | Your Google Client Secret |
| RAZORPAY_KEY_ID | Your Razorpay key |
| RAZORPAY_KEY_SECRET | Your Razorpay secret |
| FRONTEND_URL | `https://samkass.site` |

### Step 4: Redeploy

Go to **Deployments** → Click **...** → **Redeploy**

### Step 5: Get Your URL

You'll see: `https://your-project.vercel.app`

Copy this URL!

---

## Option 2: Deploy with Vercel CLI

```bash
# Install Vercel
npm install -g vercel

# Login
vercel login

# Go to backend folder
cd kaasflow/backend

# Deploy
vercel

# Follow prompts, then add env variables:
vercel env add SUPABASE_URL
# ... add all variables

# Deploy to production
vercel --prod
```

---

## Option 3: Deploy via GitHub Actions (Automatic)

I'll set this up - every time you push to GitHub, it auto-deploys!

---

## After Deployment

### Update Frontend

Your frontend at `https://samkass.site` is already configured to use production API!

It automatically detects when running online and uses the backend URL.

### Test Your Backend

```bash
# Test health
curl https://your-backend-url.vercel.app/health

# Should return: {"status":"ok"}
```

---

## What You Get

✅ Backend running 24/7 online  
✅ Free hosting forever  
✅ Automatic HTTPS  
✅ No server to manage  
✅ Auto-scaling  
✅ 99.99% uptime  

---

## Custom Domain (Optional)

Add `api.samkass.site` subdomain:

1. Vercel Dashboard → Settings → Domains
2. Add: `api.samkass.site`
3. Update DNS records (they'll show you how)
4. Done!

---

**Your backend will be online in 2 minutes!** 🚀
