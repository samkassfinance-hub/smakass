# 🔧 Step-by-Step: Fix Emails Going to Spam - Verify Your Domain

## Root Cause

**Why emails go to spam:**
- Using `onboarding@resend.dev` (Resend's shared domain)
- Shared domains have lower reputation
- Gmail thinks it's a generic transactional email
- No domain ownership verification

**Solution:**
- Verify `samkass.site` domain in Resend
- Send emails from `welcome@samkass.site`
- Your own domain = trusted sender
- Gmail will mark as authentic

---

## Step-by-Step Process

### STEP 1: Go to Resend Dashboard

1. Open browser and go to: https://resend.com
2. Click "Sign In" (top right)
3. Login with your account
4. You should see dashboard with email sending history

### STEP 2: Access Domains Section

1. In left sidebar, look for **"Domains"** (or similar)
2. Click on **"Domains"**
3. You'll see a list of domains (or empty if new)
4. Look for button **"Add Domain"** or **"Add a new domain"**
5. Click it

### STEP 3: Add Your Domain

1. A form will appear asking for domain name
2. Type: **`samkass.site`**
3. Click **"Add Domain"**
4. Wait 5-10 seconds for processing

### STEP 4: Get DNS Records

After adding domain, Resend will show you 3 DNS records:

**You'll see something like:**

```
Record Type 1: CNAME
Name: [something like: nnn2r._domainkey.samkass.site]
Value: [something like: nnn2r.dkim.resend.domains]

Record Type 2: CNAME  
Name: [something like: feedback._domainkey.samkass.site]
Value: [something like: feedback.dkim.resend.domains]

Record Type 3: MX or SPF
Name: [your domain or @]
Value: [something like: mx.resend.com or include:resend.com]
```

**⚠️ IMPORTANT:** Copy all these values exactly! Don't change anything!

### STEP 5: Login to Your Domain Provider

You need to go to where you bought samkass.site domain.

**Common providers:**
- GoDaddy
- Namecheap
- HostGator
- Bluehost
- Domain.com
- Any other registrar

**If you don't know where you bought it:**
1. Check your email for domain receipt
2. Look for invoice/order confirmation
3. Go to that website
4. Login with your account

### STEP 6: Find DNS Settings

Once logged into your domain provider:

1. Look for **"DNS Settings"** or **"DNS Management"**
2. Click on it
3. You'll see existing DNS records
4. Look for **"Add Record"** or **"Add DNS Record"** button

### STEP 7: Add First DNS Record (CNAME 1)

**Type of Record:** CNAME

1. In "Record Type" dropdown, select **CNAME**
2. In "Name" field, paste the first name from Resend
   - Example: `nnn2r._domainkey`
3. In "Value" or "Points to" field, paste the first value
   - Example: `nnn2r.dkim.resend.domains`
4. Click **"Add"** or **"Save"**

### STEP 8: Add Second DNS Record (CNAME 2)

**Type of Record:** CNAME

1. Click **"Add Record"** again
2. In "Record Type" dropdown, select **CNAME**
3. In "Name" field, paste the second name from Resend
   - Example: `feedback._domainkey`
4. In "Value" field, paste the second value
   - Example: `feedback.dkim.resend.domains`
5. Click **"Add"** or **"Save"**

### STEP 9: Add Third DNS Record (SPF or MX)

**Type of Record:** MX or SPF (check what Resend says)

1. Click **"Add Record"** again
2. In "Record Type" dropdown, select what Resend specified
3. In "Name" field, enter: `@` or leave blank
4. In "Value" field, paste the value from Resend
5. Click **"Add"** or **"Save"**

### STEP 10: Wait for DNS Propagation

After adding all 3 records:

1. **WAIT 24-48 HOURS**
2. DNS changes take time to propagate
3. Don't refresh yet, just wait

**During this wait:**
- Email sending still works (using backup domain)
- But emails might still go to spam for a while
- After 24-48 hours, it will work properly

### STEP 11: Verify Domain in Resend

1. Go back to Resend dashboard
2. Click **"Domains"**
3. Find **samkass.site** in the list
4. There should be a **"Verify"** button or status showing verification progress
5. Click **"Verify"** (if available)
6. Resend will check if DNS records are correct

**Status will show:**
- ⏳ **Pending** = Waiting for DNS propagation
- ✅ **Verified** = All DNS records correct! (can take 24-48 hours)
- ❌ **Failed** = Check records again

### STEP 12: Update Your .env File

Once domain is verified (after 24-48 hours):

1. Open your `.env` file
2. Find this line:
   ```
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ```
3. Change it to:
   ```
   RESEND_FROM_EMAIL=welcome@samkass.site
   ```
4. Save the file
5. Restart your backend server

### STEP 13: Test Emails

After restarting backend:

1. Test signup (create new account)
2. Check if welcome email goes to INBOX
3. Test forgot PIN (request OTP)
4. Check if OTP email goes to INBOX
5. **NOT in spam!**

### STEP 14: Verify Everything Works

Check:
- ✅ Welcome emails go to inbox
- ✅ OTP emails go to inbox
- ✅ Emails arrive in 1-2 minutes
- ✅ No emails in spam folder
- ✅ All content displays correctly

---

## Troubleshooting DNS Records

### Problem: Records not accepted

**Solution:**
1. Copy-paste values exactly (no extra spaces)
2. Check spelling carefully
3. Remove any trailing dots (unless domain provider requires)
4. Try adding one record at a time (not all at once)

### Problem: Verification stuck as "Pending"

**Solution:**
1. Wait full 48 hours (not just 24)
2. Click "Re-verify" button in Resend
3. Check all 3 records are exactly correct
4. Contact domain provider support

### Problem: Verification shows "Failed"

**Solution:**
1. Go back to domain provider
2. Double-check each record
3. Make sure values match exactly what Resend shows
4. Delete wrong records and add again
5. Try "Re-verify" in Resend

---

## Summary of Changes

| Current | Final | Result |
|---------|-------|--------|
| `onboarding@resend.dev` | `welcome@samkass.site` | ✅ Goes to INBOX |
| Shared domain | Your domain | ✅ Better reputation |
| Generic sender | Branded sender | ✅ Professional |
| Spam risk: HIGH | Spam risk: LOW | ✅ Trusted |

---

## Timeline

```
Step 1-5: Prepare & setup (15 minutes)
Step 6-9: Add DNS records (10 minutes)
Step 10: Wait (24-48 HOURS)
Step 11: Verify in Resend (5 minutes)
Step 12: Update .env file (5 minutes)
Step 13: Test emails (10 minutes)
Step 14: Verify success (5 minutes)

TOTAL TIME: ~25 minutes + 24-48 hours wait
```

---

## What Each DNS Record Does

### CNAME Record 1 (DKIM - Domain Key)
- **Purpose:** Authenticates that samkass.site sent the email
- **Effect:** Email passes DKIM check (not spam)
- **Gmail sees:** ✅ This email is legitimate

### CNAME Record 2 (Feedback)
- **Purpose:** Tracks bounce/complaint feedback
- **Effect:** Maintains domain reputation
- **Gmail sees:** ✅ Domain monitors quality

### SPF/MX Record 3
- **Purpose:** Tells mail servers where emails come from
- **Effect:** Email passes SPF check (not spam)
- **Gmail sees:** ✅ Email routing is correct

---

## After Domain Verification

Once domain is verified:

1. **All emails go to INBOX** ✅
2. **Users see:** From: welcome@samkass.site
3. **Gmail trusts:** samkass.site domain
4. **Spam rate:** < 0.1%
5. **Delivery rate:** 99.99%

---

## Quick Command for .env Update

Once verified, run in terminal:

```bash
# Edit .env file
nano kaasflow/backend/.env

# Change this line:
# RESEND_FROM_EMAIL=onboarding@resend.dev

# To this:
# RESEND_FROM_EMAIL=welcome@samkass.site

# Save: Press Ctrl+X, then Y, then Enter
```

Or manually:
1. Open `kaasflow/backend/.env` in editor
2. Find `RESEND_FROM_EMAIL=onboarding@resend.dev`
3. Replace with `RESEND_FROM_EMAIL=welcome@samkass.site`
4. Save file
5. Restart backend

---

## Need Help?

### Resend Support
- Website: https://resend.com
- Docs: https://resend.com/docs/dashboard/domains
- Email verification guide: https://resend.com/docs/dashboard/domains#configure-a-domain

### Domain Provider Support
- Search their help section for "DNS records"
- Contact their customer service

### Verify DNS Records Are Correct
- Use: https://www.dnschecker.org/
- Enter your domain: samkass.site
- Check if records match Resend

---

## ✅ Success Checklist

- [ ] Created Resend account & logged in
- [ ] Added samkass.site domain to Resend
- [ ] Copied all 3 DNS records
- [ ] Logged into domain provider
- [ ] Added CNAME record 1
- [ ] Added CNAME record 2
- [ ] Added SPF/MX record
- [ ] Waited 24-48 hours
- [ ] Verified domain in Resend (shows ✅ Verified)
- [ ] Updated .env file with new email
- [ ] Restarted backend
- [ ] Tested welcome email (goes to inbox)
- [ ] Tested OTP email (goes to inbox)
- [ ] All working! 🎉

---

**Follow these steps and your emails will go to inbox, not spam!** ✅
