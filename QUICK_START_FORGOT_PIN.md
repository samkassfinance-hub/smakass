# 🚀 Quick Start: Forgot PIN with OTP

## What You Asked For ✅

You wanted to implement **OTP email verification** for PIN reset using **Resend**. 

**Good news:** It's already fully implemented! You just need to verify your setup.

---

## 📋 What I Need to Do (Step by Step)

### Step 1: Verify Resend Domain ⭐ MOST IMPORTANT

1. **Go to Resend Dashboard:** https://resend.com/login
2. **Navigate to Domains:** https://resend.com/domains
3. **Click "Add Domain"** (if not already added)
4. **Enter your domain:** `samkass.site`
5. **Copy DNS Records** shown by Resend
6. **Add DNS Records to your domain registrar:**
   - SPF Record (TXT)
   - DKIM Records (TXT - usually 2 records)
   - Optional: DMARC Record

**⏱️ Wait 5-30 minutes** for DNS propagation

7. **Click "Verify" in Resend Dashboard**
8. **Status should show:** ✅ Verified

### Step 2: Test Resend Email

Run the test script I created:

```bash
python test_resend_otp.py
```

Choose option **1** to test Resend API directly.

**Expected Result:**
- ✅ Email sent successfully
- 📧 Check your inbox for test OTP email

**If it fails:**
- Check if domain is verified (Step 1)
- Check API key in `.env` file
- Read error message (script will tell you the issue)

### Step 3: Start Your Backend

```bash
cd kaasflow/backend
python app.py
```

Backend runs on: `http://127.0.0.1:5000`

### Step 4: Test Backend Endpoint

Run the test script again:

```bash
python test_resend_otp.py
```

Choose option **2** to test backend endpoint.

**Expected Result:**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

### Step 5: Test Frontend (Full User Flow)

1. **Start Frontend:**
```bash
cd kaasflow/frontend
python app.py
```

Frontend runs on: `http://127.0.0.1:5500`

2. **Open in browser:** http://127.0.0.1:5500
3. **Log in to your account**
4. **Click "Forgot PIN?" button** (on PIN lock screen)
5. **Email auto-fills** → Click **"Send OTP"**
6. **Check your email** → Enter 6-digit OTP
7. **Enter new 4-digit PIN** → Click **"Save New PIN"**

**✅ Done!** PIN is reset.

---

## 🔧 Configuration Files (Already Set)

### Backend `.env` (kaasflow/backend/.env)
```env
RESEND_API_KEY=re_DxueLnyr_JpRSratcdi8f7xvvriXdwQtF
RESEND_FROM_EMAIL=SamKass <welcome@samkass.site>
```

✅ Already configured!

### Backend API Routes (kaasflow/backend/auth/routes.py)
- ✅ `/api/forgot-pin/send-otp` - Sends OTP email
- ✅ `/api/forgot-pin/verify-otp` - Verifies OTP
- ✅ `/api/set-pin` - Saves new PIN

✅ Already implemented!

### Frontend (kaasflow/frontend/app.js)
- ✅ Forgot PIN modal (lines 4898-5029)
- ✅ API integration
- ✅ 3-step flow (Send → Verify → Set PIN)

✅ Already implemented!

---

## 🐛 Common Issues & Solutions

### Issue 1: "Resend API error (403)"
**Problem:** Domain not verified
**Solution:** Complete Step 1 (verify domain in Resend)

### Issue 2: "Failed to send OTP"
**Problem:** API key incorrect or expired
**Solution:** 
- Go to https://resend.com/api-keys
- Generate new API key
- Update `kaasflow/backend/.env`

### Issue 3: Email not received
**Check:**
- ✅ Spam/junk folder
- ✅ Domain verified in Resend
- ✅ Email logs in Resend dashboard: https://resend.com/emails
- ✅ Backend console for error messages

### Issue 4: OTP expired
**Problem:** OTP expires after 10 minutes
**Solution:** Request new OTP

---

## 📧 What User Receives (Email Example)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Security PIN Reset
  Your verification code
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello,

We received a request to reset the Security PIN 
for your KaasFlow account. Use the OTP below:

    ┌───────────────┐
    │    123456     │
    └───────────────┘

This OTP expires in 10 minutes.

— The KaasFlow Team
```

---

## ✅ Checklist

Complete these to get OTP working:

- [ ] Domain `samkass.site` verified in Resend dashboard
- [ ] DNS records added (SPF, DKIM)
- [ ] Test script passes (option 1)
- [ ] Backend running on port 5000
- [ ] Test script passes (option 2)
- [ ] Frontend running on port 5500
- [ ] Full user flow tested (login → forgot PIN → OTP → reset)

---

## 🎯 What's Already Done

✅ Backend OTP endpoints implemented
✅ Email sending via Resend integrated
✅ Frontend forgot PIN flow complete
✅ Beautiful email templates
✅ Security: OTP expires in 10 minutes
✅ Error handling and fallbacks
✅ Test script provided

**You just need to:**
1. Verify domain in Resend ⭐
2. Test everything

---

## 🚀 Push to GitHub

After testing, commit and push:

```bash
git add .
git commit -m "Add forgot PIN OTP test script and documentation"
git push origin main
```

---

## 📞 Need Help?

If something doesn't work:
1. Run `python test_resend_otp.py` 
2. Check the error message
3. Follow the troubleshooting tips
4. Check Resend dashboard logs

---

**Your forgot PIN with OTP is ready! Just verify your domain and test.** 🎉
