# 🚀 Deploy Backend to Vercel (Free)

## Quick Deploy (5 Minutes)

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
vercel
```

Follow prompts:
- Set up and deploy? **Y**
- Which scope? **(Your account)**
- Link to existing project? **N**
- Project name? **samkass-backend** (or any name)
- Directory? **./ (current directory)**
- Override settings? **N**

### Step 4: Add Environment Variables

After deployment, add your secrets:

```bash
vercel env add SUPABASE_URL
# Paste: https://eahyuwpejwbqzzolajzr.supabase.co

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste: (Your Supabase service role key from .env)

vercel env add SUPABASE_ANON_KEY
# Paste: (Your Supabase anon key from .env)

vercel env add SECRET_KEY
# Paste: (Your secret key from .env)

vercel env add JWT_SECRET
# Paste: (Your JWT secret from .env)

vercel env add RESEND_API_KEY
# Paste: (Your Resend API key from .env)

vercel env add RESEND_FROM_EMAIL
# Paste: SamKass <welcome@samkass.site>

vercel env add GOOGLE_CLIENT_ID
# Paste: (Your Google Client ID from .env)

vercel env add GOOGLE_CLIENT_SECRET
# Paste: (Your Google Client Secret from .env)

vercel env add RAZORPAY_KEY_ID
# Paste: (Your Razorpay key from .env)

vercel env add RAZORPAY_KEY_SECRET
# Paste: (Your Razorpay secret from .env)

vercel env add FRONTEND_URL
# Paste: https://samkass.site
```

For each variable, select: **Production, Preview, Development** (press space to select all)

### Step 5: Redeploy with Environment Variables

```bash
vercel --prod
```

### Step 6: Get Your Backend URL

After deployment, you'll see:
```
✅ Deployed to production: https://samkass-backend.vercel.app
```

Copy this URL!

### Step 7: Update Frontend to Use Online Backend

Open `kaasflow/frontend/api.js` and change:

```javascript
const API_BASE_URL = 'https://samkass-backend.vercel.app';
```

---

## Alternative: Deploy via Vercel Dashboard

### Step 1: Go to Vercel Dashboard
https://vercel.com/new

### Step 2: Import Your GitHub Repo
- Click "Import Project"
- Connect GitHub
- Select your repository: **mohaneni/samkass**

### Step 3: Configure Project
- **Framework Preset:** Other
- **Root Directory:** `kaasflow/backend`
- **Build Command:** Leave empty
- **Output Directory:** Leave empty

### Step 4: Add Environment Variables
Click "Environment Variables" and add all the variables listed above.

### Step 5: Deploy
Click "Deploy" button.

---

## Update Frontend API URL

After backend is deployed, update your frontend to use the online backend:

### File: `kaasflow/frontend/api.js`

Find the line:
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

Change to:
```javascript
const API_BASE_URL = 'https://your-backend-url.vercel.app';
```

Replace `your-backend-url` with your actual Vercel URL.

---

## Test Your Online Backend

### Test Health Endpoint
```bash
curl https://your-backend-url.vercel.app/health
```

Should return: `{"status":"ok"}`

### Test Supabase Connection
```bash
curl https://your-backend-url.vercel.app/api/sync/status
```

Should return:
```json
{
  "supabase_configured": true,
  "supabase_url": "https://eahyuwpejwbqzzolajzr.supabase.co"
}
```

---

## Troubleshooting

### Error: Module not found
- Check `requirements.txt` includes all dependencies
- Redeploy: `vercel --prod`

### Error: Environment variables not set
- Add variables: `vercel env add VARIABLE_NAME`
- Select all environments (Production, Preview, Development)
- Redeploy: `vercel --prod`

### Error: CORS issues
- Backend already configured for `https://samkass.site`
- Make sure frontend domain matches

---

## Custom Domain (Optional)

### Add samkass.site subdomain for backend

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add domain: `api.samkass.site`
3. Follow DNS instructions
4. Update frontend to use: `https://api.samkass.site`

---

## Summary

**What you get:**
- ✅ Backend running 24/7 online
- ✅ Free hosting on Vercel
- ✅ Automatic HTTPS
- ✅ Auto-scaling
- ✅ No server maintenance

**After deployment:**
1. Backend URL: `https://your-project.vercel.app`
2. Update frontend API URL
3. Push to GitHub
4. Your app works completely online!

---

**Next: Run `cd kaasflow/backend && vercel` to deploy!**
