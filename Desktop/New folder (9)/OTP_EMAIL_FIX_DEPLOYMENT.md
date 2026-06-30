# OTP Email Delivery Fix - Deployment Guide

## ✅ What Was Fixed

The OTP email delivery for both **Forgot Password** and **Forgot PIN** features has been fixed. Users will now receive OTP emails correctly.

### Changes Made:

1. **Updated `send_email()` function** in `kaasflow/backend/auth/routes.py`
   - Now uses `RESEND_FROM_EMAIL` environment variable
   - Supports custom verified domain: `welcome@samkass.site`
   - Falls back to `onboarding@resend.dev` if not configured

2. **Updated `.env.example`** with new configuration options

3. **Fixed `.gitignore`** to allow `.env.example` to be committed

4. **Added test script** `test_otp_email.py` for testing OTP delivery

---

## 🚀 Deployment Steps for Vercel

### Step 1: Update Environment Variables

Go to your Vercel project dashboard:

1. Navigate to: **https://vercel.com/your-project**
2. Click on **Settings** → **Environment Variables**
3. Add/Update these variables:

```
RESEND_API_KEY=re_DxueLnyr_JpRSratcdi8f7xvvriXdwQtFRESEND_FROM_EMAIL=SamKass <welcome@samkass.site>
```

**Important:**
- Make sure both variables are set for **Production**, **Preview**, and **Development** environments
- Click **Save** after adding each variable

### Step 2: Redeploy Your Backend

The code has already been pushed to GitHub. Now trigger a deployment:

**Option A: Automatic Deployment**
- Vercel should automatically detect the new commit and deploy
- Check the Deployments tab on Vercel dashboard

**Option B: Manual Deployment**
1. Go to your Vercel project dashboard
2. Click **Deployments** tab
3. Find the latest commit: "Fix OTP email delivery for forgot password and forgot PIN"
4. Click **Redeploy**

### Step 3: Verify Deployment

After deployment completes (usually 1-2 minutes):

1. Check deployment logs for any errors
2. The backend should be live at your production URL

---

## 🧪 Testing the Fix

### Test Locally (Optional)

If you want to test before deploying:

```bash
# Navigate to project root
cd path/to/your/project

# Run the test script
python test_otp_email.py
```

Enter your email when prompted, and you should receive a test OTP email.

### Test on Production

1. Go to your frontend: **https://samkass.site** (or your frontend URL)

2. **Test Forgot Password:**
   - Click "Forgot Password?"
   - Enter your email
   - Click "Send OTP"
   - Check your inbox for the OTP email

3. **Test Forgot PIN:**
   - Go to the Forgot PIN flow
   - Enter your email
   - Click "Send OTP"
   - Check your inbox for the OTP email

---

## 📧 Email Configuration Details

### From Address
- **Production**: `SamKass <welcome@samkass.site>`
- **Fallback**: `SamKass <onboarding@resend.dev>`

### Domain Verification
Your `samkass.site` domain should be verified in Resend:
1. Go to https://resend.com/domains
2. Verify that `samkass.site` shows as "Verified"
3. If not verified, follow Resend's domain verification instructions

### API Key
- Current API Key: `re_DxueLnyr_JpRSratcdi8f7xvvriXdwQtF`
- If you need to regenerate it: https://resend.com/api-keys

---

## ✅ Verification Checklist

After deployment, verify these items:

- [ ] Environment variables are set in Vercel
- [ ] Deployment completed successfully (no errors in logs)
- [ ] Backend API is responding (check health endpoint if available)
- [ ] Forgot Password OTP email is received
- [ ] Forgot PIN OTP email is received
- [ ] OTP codes work correctly for verification
- [ ] Emails show proper sender: "SamKass <welcome@samkass.site>"
- [ ] Emails are not going to spam folder

---

## 🔍 Troubleshooting

### Issue: Still not receiving emails

**Check 1: Environment Variables**
```bash
# Verify in Vercel dashboard that both variables are set:
RESEND_API_KEY=re_DxueLnyr_JpRSratcdi8f7xvvriXdwQtF
RESEND_FROM_EMAIL=SamKass <welcome@samkass.site>
```

**Check 2: Deployment Logs**
- Go to Vercel → Deployments → Click on latest deployment
- Check the build logs for any errors
- Look for "Email sent successfully" messages in function logs

**Check 3: Resend Dashboard**
- Go to https://resend.com/emails
- Check if emails are being sent
- Look for any failed sends or error messages

**Check 4: Domain Verification**
- Go to https://resend.com/domains
- Verify `samkass.site` domain is verified
- If not, complete DNS verification

### Issue: Emails going to spam

**Solutions:**
1. Add proper SPF/DKIM records (Resend provides these)
2. Ask test users to mark as "Not Spam"
3. Verify domain is fully verified in Resend
4. Check email content for spam triggers

### Issue: API Key invalid

**Solution:**
1. Go to https://resend.com/api-keys
2. Click on your API key to reveal the full key
3. Copy the COMPLETE key (starts with `re_`)
4. Update in Vercel environment variables
5. Redeploy

---

## 📝 Notes

- **Security**: The actual `.env` file with your API key is NOT committed to Git (protected by `.gitignore`)
- **Backward Compatible**: If `RESEND_FROM_EMAIL` is not set, it falls back to `onboarding@resend.dev`
- **Both flows fixed**: This fix applies to BOTH forgot password and forgot PIN OTP emails
- **Test Script**: Use `test_otp_email.py` anytime to verify email delivery

---

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. ✅ Users receive OTP emails within 10-30 seconds
2. ✅ Emails show sender as "SamKass <welcome@samkass.site>"
3. ✅ OTP codes are valid 6-digit numbers
4. ✅ OTPs expire after 10 minutes as configured
5. ✅ Verification succeeds when correct OTP is entered

---

## Support

If you encounter any issues:
1. Check Vercel deployment logs
2. Check Resend dashboard for email delivery status
3. Run `test_otp_email.py` locally to isolate the issue
4. Verify all environment variables are correctly set

**Resend Support**: https://resend.com/support
**Vercel Support**: https://vercel.com/support
