# 🚀 Deploy Backend to Vercel

## Quick Deploy (5 minutes)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy Backend
```bash
cd kaasflow/backend
vercel --prod
```

### Step 4: Add Environment Variables

After deployment, add these environment variables in Vercel Dashboard:

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

Copy all values from your local `kaasflow/backend/.env` file:

```
SUPABASE_URL=[your Supabase URL]
SUPABASE_SERVICE_ROLE_KEY=[your service role key]
SUPABASE_ANON_KEY=[your anon key]
SECRET_KEY=[your secret key]
FRONTEND_URL=https://samkass.site
JWT_SECRET=[your JWT secret]
RESEND_API_KEY=[your Resend key]
RESEND_FROM_EMAIL=SamKass <welcome@samkass.site>
GOOGLE_CLIENT_ID=[your Google client ID]
GOOGLE_CLIENT_SECRET=[your Google secret]
RAZORPAY_KEY_ID=[your Razorpay key]
RAZORPAY_KEY_SECRET=[your Razorpay secret]
```

**Note:** Get all actual values from `kaasflow/backend/.env`

### Step 5: Update Frontend API Base URL

In your frontend, update the API base URL to your Vercel backend URL.

## ✅ Done!

Your backend is now online at: `https://your-project.vercel.app`

Test it: `https://your-project.vercel.app/health`
