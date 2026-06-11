# 🔔 External Cron Setup Guide (FREE Option)

## Option 1: cron-job.org (Recommended - FREE, No Server Needed)

### Step 1: Create Account
1. Go to: https://cron-job.org/en/
2. Click "Sign up" (free forever)
3. Verify your email

### Step 2: Create New Cron Job
1. Click "Create cron job"
2. Fill in these details:

**Title:**
```
SamKass Daily Notifications
```

**URL:**
```
https://samkass.site/api/cron/send-notifications
```

**Schedule:**
- Select: `Custom`
- Cron expression: `30 2 * * *`
- This means: 02:30 UTC = 08:00 AM IST

**Advanced Settings:**
- **Request Method:** `GET` or `POST`
- **Custom Headers:** Click "Add header"
  - Name: `X-Cron-Secret`
  - Value: `your-secret-from-vercel-env`

**Notifications:**
- Enable "Notify on failure"
- Add your email

### Step 3: Test It
1. Save the cron job
2. Click "Execute now" button
3. Check "Execution History" tab
4. Should see HTTP 200 status
5. Check your phone — you should get a test notification

### Step 4: Monitor
- Check "Execution History" daily
- Should see successful executions at 02:30 UTC

---

## Option 2: EasyCron (FREE, Simpler UI)

### Step 1: Create Account
1. Go to: https://www.easycron.com/
2. Sign up for free account (up to 10 cron jobs)

### Step 2: Create Cron Job
**URL:**
```
https://samkass.site/api/cron/send-notifications
```

**Cron Expression:**
```
30 2 * * *
```

**Custom HTTP Header:**
```
X-Cron-Secret: your-secret-here
```

**Timezone:** UTC

### Step 3: Test & Monitor
- Click "Test" button
- Enable email notifications for failures

---

## Option 3: GitHub Actions (FREE, GitHub Required)

### Step 1: Create `.github/workflows/cron.yml`
```yaml
name: Send Daily Notifications

on:
  schedule:
    - cron: '30 2 * * *'  # 02:30 UTC = 08:00 AM IST
  workflow_dispatch:  # Allow manual trigger

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Notification Endpoint
        run: |
          curl -X POST https://samkass.site/api/cron/send-notifications \
            -H "X-Cron-Secret: ${{ secrets.CRON_SECRET }}"
```

### Step 2: Add Secret
1. Go to GitHub repo → Settings → Secrets → Actions
2. Add new secret:
   - Name: `CRON_SECRET`
   - Value: (your secret from Vercel)

### Step 3: Test
1. Go to Actions tab
2. Click "Send Daily Notifications"
3. Click "Run workflow" → "Run"

---

## Option 4: Render.com Cron Jobs (FREE)

### Step 1: Create Render Account
1. Go to: https://render.com/
2. Sign up for free

### Step 2: Create Cron Job
1. Dashboard → "New +" → "Cron Job"
2. **Name:** `samkass-notifications`
3. **Command:**
```bash
curl -X POST https://samkass.site/api/cron/send-notifications \
  -H "X-Cron-Secret: $CRON_SECRET"
```
4. **Schedule:** `30 2 * * *`
5. **Environment Variable:**
   - Key: `CRON_SECRET`
   - Value: (your secret)

---

## Option 5: UptimeRobot (FREE, Easy)

### Step 1: Create Account
1. Go to: https://uptimerobot.com/
2. Sign up (free for 50 monitors)

### Step 2: Create Monitor
1. Click "Add New Monitor"
2. **Monitor Type:** HTTP(s)
3. **Friendly Name:** `SamKass Daily Notifications`
4. **URL:** `https://samkass.site/api/cron/send-notifications`
5. **Monitoring Interval:** Every 24 hours at specific time
   - Set to: 08:00 AM IST
6. **HTTP Method:** POST
7. **Custom HTTP Headers:**
```
X-Cron-Secret: your-secret-here
```

---

## Security: Generate CRON_SECRET

### Option 1: OpenSSL (Linux/Mac)
```bash
openssl rand -hex 32
```

### Option 2: Python
```python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Option 3: Node.js
```javascript
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Option 4: Online (LastPass)
https://www.lastpass.com/features/password-generator

**Settings:**
- Length: 32 characters
- Include: Letters + Numbers
- Copy and save securely

---

## Add CRON_SECRET to Vercel

### Method 1: Vercel Dashboard
1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Click "Add New"
3. **Key:** `CRON_SECRET`
4. **Value:** (paste your generated secret)
5. **Environments:** Production, Preview, Development
6. Click "Save"

### Method 2: Vercel CLI
```bash
vercel env add CRON_SECRET
# Paste your secret when prompted
# Select: Production, Preview, Development
```

### Method 3: Using .env (Local Testing Only)
```bash
cd kaasflow/backend
echo "CRON_SECRET=your-secret-here" >> .env
```

⚠️ **NEVER commit .env to git!**

---

## Testing Your Setup

### 1. Test Endpoint Manually
```bash
curl -X POST https://samkass.site/api/cron/send-notifications \
  -H "X-Cron-Secret: your-actual-secret" \
  -H "Content-Type: application/json" \
  -v
```

**Expected Response:**
```json
{
  "sent": 2,
  "success": true,
  "total_due_loans": 3,
  "users_notified": 2,
  "timestamp": "2025-01-06T08:00:00+05:30"
}
```

### 2. Test Wrong Secret (Should Fail)
```bash
curl -X POST https://samkass.site/api/cron/send-notifications \
  -H "X-Cron-Secret: wrong-secret" \
  -v
```

**Expected Response:**
```json
{
  "error": "Unauthorized",
  "debug": "received=true"
}
```

### 3. Create Test Loan
1. Login to samkass.site
2. Create a test client
3. Create a loan with `next_due_date` = today
4. Trigger cron manually from your chosen service
5. Check your phone/browser for notification

---

## Monitoring & Alerts

### Email Alerts (Recommended)
Most cron services offer email notifications:
- ✅ Enable "Notify on failure"
- ✅ Enable "Notify on success" (first week only)
- ✅ Add your email address

### Check Logs
**Vercel Logs:**
```bash
vercel logs --follow
# Or go to: https://vercel.com/your-project/logs
```

**Look for:**
```
✅ Cron: Request from Vercel Cron verified
📊 Cron: Found 5 due loans
👥 Cron: Found 2 users with due loans
📱 Cron: Found 2 active push subscriptions
✅ Cron: Sent notification to user user@example.com
```

---

## Troubleshooting

### Issue: Cron job shows "401 Unauthorized"
**Fix:**
1. Verify `X-Cron-Secret` header is exactly as set in Vercel
2. Check for extra spaces or line breaks
3. Try regenerating the secret

### Issue: Cron job shows "500 Internal Server Error"
**Fix:**
1. Check Vercel logs: `vercel logs`
2. Verify all environment variables are set
3. Test endpoint manually with curl

### Issue: Cron runs but no notifications
**Fix:**
1. Check if users have active push subscriptions:
   ```bash
   curl https://samkass.site/api/push-subscriptions \
     -H "Authorization: Bearer YOUR_JWT"
   ```
2. Check if loans exist with `next_due_date <= today`
3. Grant notification permission in browser

---

## Recommended Setup (FREE)

**Best combination:**
1. **Primary:** cron-job.org (most reliable, free forever)
2. **Backup:** UptimeRobot (runs if cron-job.org fails)
3. **Monitoring:** Email alerts enabled on both

This ensures notifications are sent even if one service has downtime.

---

## Cost Comparison

| Service | Free Tier | Reliability | Setup Time |
|---------|-----------|-------------|------------|
| cron-job.org | ✅ Forever | ⭐⭐⭐⭐⭐ | 5 min |
| EasyCron | ✅ 10 jobs | ⭐⭐⭐⭐ | 5 min |
| GitHub Actions | ✅ 2000 min/mo | ⭐⭐⭐⭐⭐ | 10 min |
| Render Cron | ✅ Limited | ⭐⭐⭐⭐ | 8 min |
| UptimeRobot | ✅ 50 monitors | ⭐⭐⭐⭐ | 5 min |
| Vercel Cron | ❌ $20/month | ⭐⭐⭐⭐⭐ | 2 min |

**Recommendation:** Use cron-job.org (FREE + reliable)

---

## ✅ Success Checklist

After setup, verify:
- [ ] Cron job created in your chosen service
- [ ] Schedule set to `30 2 * * *` (08:00 AM IST)
- [ ] `X-Cron-Secret` header configured
- [ ] CRON_SECRET environment variable set in Vercel
- [ ] Manual test successful (HTTP 200)
- [ ] Email alerts enabled
- [ ] Test notification received on device

**Status: Ready for daily 8 AM notifications! 🎉**
