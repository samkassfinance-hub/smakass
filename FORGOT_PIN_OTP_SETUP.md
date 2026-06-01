# Forgot PIN - OTP Email Verification Setup Guide

## ✅ Current Status
Your forgot PIN flow with Resend email OTP is **ALREADY IMPLEMENTED**! Here's what you need to verify:

---

## 🔧 Step 1: Verify Resend Configuration

### Check Your `.env` File
Location: `kaasflow/backend/.env`

Make sure these are set:
```env
RESEND_API_KEY=re_DxueLnyr_JpRSratcdi8f7xvvriXdwQtF
RESEND_FROM_EMAIL=SamKass <welcome@samkass.site>
```

### ✅ Verify Your Domain in Resend Dashboard
1. Go to https://resend.com/domains
2. Make sure `samkass.site` is verified
3. Check DNS records are added correctly:
   - SPF Record
   - DKIM Records
   - DMARC Record (optional but recommended)

---

## 🚀 Step 2: Test the Backend API

### Test OTP Send Endpoint
```bash
curl -X POST http://localhost:5000/api/forgot-pin/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

### Test OTP Verify Endpoint
```bash
curl -X POST http://localhost:5000/api/forgot-pin/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com", "otp":"123456"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

---

## 📱 Step 3: Test Frontend Flow

### How Users Reset Their PIN:

1. **Open App** → If logged in, go to Settings or click "Forgot PIN?"
2. **Click "Forgot PIN?"** button
3. **Step 1:** Email is auto-filled (from current session)
   - Click **"Send OTP"** button
4. **Step 2:** Enter 6-digit OTP received via email
   - Click **"Verify OTP"** button
5. **Step 3:** Enter new 4-digit PIN
   - Click **"Save New PIN"** button

### Frontend Files Already Configured:
- `kaasflow/frontend/app.js` (lines 4898-5029)
- Modal: `#forgotPinModal` in `index.html`
- API calls are properly routed

---

## 🔍 Step 4: Troubleshooting

### If Email Fails to Send:

**Check Backend Logs:**
```bash
# Run backend and check console output
python kaasflow/backend/app.py
```

Look for:
- ✅ `"Email sent successfully via Resend to user@example.com"`
- ❌ `"Resend API error (403): ..."`
- ❌ `"Failed to send email via Resend: ..."`

### Common Issues:

#### 1. **403 Forbidden Error**
**Problem:** Domain not verified in Resend
**Solution:** 
- Go to Resend dashboard → Domains
- Verify `samkass.site` domain
- Add required DNS records

#### 2. **Invalid API Key**
**Problem:** RESEND_API_KEY is wrong or expired
**Solution:**
- Go to https://resend.com/api-keys
- Generate new API key
- Update `.env` file

#### 3. **"From" Email Not Verified**
**Problem:** Using email from unverified domain
**Solution:**
- Make sure `RESEND_FROM_EMAIL=SamKass <welcome@samkass.site>`
- Verify `samkass.site` in Resend dashboard

#### 4. **OTP Not Received**
**Problem:** Email in spam or not sent
**Solution:**
- Check spam/junk folder
- Check Resend dashboard → Logs to see delivery status
- For development: Backend returns OTP in response if email fails

---

## 🎯 Step 5: Production Checklist

### Before Going Live:

- [ ] Domain `samkass.site` verified in Resend
- [ ] DNS records properly configured (SPF, DKIM)
- [ ] `RESEND_API_KEY` is production key (not test key)
- [ ] `RESEND_FROM_EMAIL` uses verified domain
- [ ] Test forgot PIN flow end-to-end
- [ ] Test on mobile device
- [ ] Check email deliverability (inbox, not spam)
- [ ] Set up email monitoring in Resend dashboard

---

## 🧪 Development Testing

### For Local Testing (If Email Fails):
The backend returns the OTP in the API response when running locally:

```json
{
  "success": true,
  "message": "Email service not configured. For development, here is your OTP:",
  "otp": "123456"
}
```

This allows you to test without email being sent!

---

## 📝 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/forgot-pin/send-otp` | POST | Send 6-digit OTP to user's email |
| `/api/forgot-pin/verify-otp` | POST | Verify OTP entered by user |
| `/api/set-pin` | POST | Save new PIN after verification |

---

## 🔐 Security Features

- ✅ OTP expires after 10 minutes
- ✅ OTP is 6 digits (cryptographically random)
- ✅ OTP stored in-memory (cleared after use or expiry)
- ✅ Rate limiting on authentication endpoints
- ✅ PIN stored securely in database per user

---

## 📧 Email Template

Your users receive a professional email like this:

```
Subject: Reset your KaasFlow Security PIN 🔒

━━━━━━━━━━━━━━━━━━━━━━
   Security PIN Reset
   Your verification code
━━━━━━━━━━━━━━━━━━━━━━

Hello,

We received a request to reset the Security PIN 
for your KaasFlow account. Use the OTP below to 
proceed with the reset:

    ┌─────────────┐
    │   123456    │
    └─────────────┘

This OTP will expire in 10 minutes.

— The KaasFlow Team
```

---

## ✅ What You Need To Do Now

1. **Verify Resend Domain:** https://resend.com/domains
2. **Test the Flow:**
   - Start backend: `python kaasflow/backend/app.py`
   - Start frontend: `python kaasflow/frontend/app.py`
   - Click "Forgot PIN?" → Send OTP → Check email
3. **Push to Production** (already done with previous fix!)

---

## 🎉 Summary

**Everything is already coded and ready!** You just need to:
1. Verify your domain in Resend dashboard
2. Make sure DNS records are added
3. Test the forgot PIN flow

The code handles everything automatically:
- ✅ Email sending via Resend API
- ✅ OTP generation and validation
- ✅ PIN reset and storage
- ✅ Professional email templates
- ✅ Error handling and fallbacks

Let me know if you encounter any issues during testing!
