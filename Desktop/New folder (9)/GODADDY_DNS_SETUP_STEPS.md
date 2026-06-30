# 🔧 GoDaddy DNS Setup - Step by Step

**Problem:** Domain forward is blocking your app  
**Solution:** Replace with CNAME DNS records  
**Time:** 5 minutes to setup + 24-48 hours to propagate

---

## ⚠️ FIRST: Delete Domain Forward

### Step 1: Go to GoDaddy
- URL: https://www.godaddy.com/account
- Login with your credentials

### Step 2: Find Forwarding
1. Click **"Manage All"** or find **samkass.site**
2. Look for **"Forwarding"** option
3. Click on it

### Step 3: Delete Forward
- Find your domain forward
- Click **Delete** or **Remove**
- Confirm deletion
- **Wait 5-10 minutes** for it to take effect

---

## ✅ NEXT: Add DNS Records

### Step 1: Go to DNS Settings
1. In GoDaddy account, find **samkass.site**
2. Click **"Manage"** or **"DNS"**
3. Look for **"DNS Records"** section

### Step 2: Add CNAME for www

**Click "Add Record"** and fill:
```
Type:     CNAME
Name:     www
Value:    cname.vercel-dns.com
TTL:      3600
Priority: (leave blank)
```

Click **Save**

### Step 3: Add A Record for Root (Optional but Recommended)

**Click "Add Record"** and fill:
```
Type:     A
Name:     @ (or leave blank)
Value:    76.76.19.165
TTL:      3600
```

Click **Save**

---

## 🔄 Verify in Vercel

### Step 1: Go to Vercel
- URL: https://vercel.com/dashboard
- Find **samkasssite** project

### Step 2: Add Domain
1. Click project
2. Go to **Settings** → **Domains**
3. Click **Add Domain**
4. Enter: `samkass.site`

### Step 3: Follow Vercel's Instructions
Vercel will show you:
- Exact DNS records needed
- Or: Just use the CNAME we provided above

---

## 📋 Complete DNS Records to Add

In GoDaddy, add these exact records:

### Record 1: www subdomain
```
Type:    CNAME
Host:    www
Target:  cname.vercel-dns.com
TTL:     3600
```

### Record 2: Root domain (optional)
```
Type:    A
Host:    @ (or blank)
Value:   76.76.19.165
TTL:     3600
```

**OR** (if Vercel gives different records, use Vercel's)

---

## ⏳ Wait for DNS Propagation

DNS takes **24-48 hours** to fully propagate.

**Check progress:**
- URL: https://dnschecker.org
- Search: `samkass.site`
- Look for CNAME record

**Status:**
- 🟡 Yellow/Orange = Still propagating
- 🟢 Green = Ready!

---

## 🧪 Test After DNS Propagates

### Test 1: Website Access
```
https://samkass.site
```
Should show your web app

### Test 2: API Response
```bash
curl https://samkass.site/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```
Should respond with data

### Test 3: Email Sending
1. Register at: https://samkass.site
2. Check email for welcome message
3. Should arrive from: onboarding@resend.dev

### Test 4: Database
1. Go to Supabase: https://app.supabase.com/project/puhovplmbaldrisxqssy
2. Check "users" table
3. Should see new user record

---

## ✅ Success Checklist

After completing all steps:

- [ ] Deleted domain forward from GoDaddy
- [ ] Added CNAME record in GoDaddy DNS
- [ ] Added A record (optional) in GoDaddy DNS
- [ ] Added domain in Vercel project
- [ ] Waited 24-48 hours for propagation
- [ ] Tested https://samkass.site - loads
- [ ] Tested API - responds
- [ ] Tested email - sent successfully
- [ ] Tested database - data stored

---

## 🆘 Troubleshooting

### DNS Records Not Working?

**Check 1: Records Added Correctly?**
1. Go to GoDaddy DNS
2. Verify CNAME is there
3. Check spelling: `cname.vercel-dns.com`

**Check 2: TTL Too High?**
1. Try TTL: 300 (5 minutes) instead of 3600
2. Save and wait 5 minutes
3. Test again

**Check 3: Old Forward Still There?**
1. Go to Forwarding settings
2. Make sure forward is DELETED
3. Wait 10 minutes

**Check 4: Domain Propagation**
1. Go to: https://dnschecker.org
2. Enter: samkass.site
3. If red/yellow = still propagating
4. Wait and check again later

### Still Not Working After 48 Hours?

1. **Contact GoDaddy Support**
   - Verify DNS records are saved
   - Check for any conflicts

2. **Contact Vercel Support**
   - Verify domain is correctly added
   - Check deployment status

3. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R
   - Or use different browser

---

## 📞 Support Contacts

- **GoDaddy:** https://support.godaddy.com
- **Vercel:** https://vercel.com/support
- **DNS Checker:** https://dnschecker.org

---

## 🎯 Summary

**Before (Domain Forward):**
```
❌ API doesn't work
❌ Emails don't work
❌ Database doesn't work
❌ Complex routing fails
```

**After (CNAME DNS):**
```
✅ API works
✅ Emails work
✅ Database works
✅ Everything works
```

---

**Action:** Follow steps above to setup DNS in GoDaddy

**Timeline:** 5 min setup + 24-48 hours propagation

**Result:** Full working app at samkass.site!

---

*Root cause: Domain forward incompatible with SPAs and APIs*
*Solution: CNAME DNS records*
*Status: Ready to configure*
