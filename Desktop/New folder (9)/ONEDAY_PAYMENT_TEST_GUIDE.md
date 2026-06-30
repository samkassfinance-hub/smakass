# 1-Day Trial Payment Testing Guide (₹8)

## What's Fixed
✅ Added complete 1-Day Trial plan (₹8 for 1 day)
✅ Updated Razorpay payment handler to accept 'oneday' plan
✅ Added to upgrade modal display
✅ Auto-expiry after 1 day
✅ All premium features included during trial

---

## How to Test

### Step 1: Load Your App
1. Go to your app: https://samkass.site (or your dev URL)
2. Login with your account
3. Click **"Upgrade to Premium"** button

### Step 2: See the 1-Day Plan
The upgrade modal should show 4 plans in this order:
1. Monthly Plan - ₹270
2. Quarterly Plan - ₹850
3. Yearly Plan - ₹1,999
4. **1-Day Trial - ₹8** ← NEW (at the bottom)

### Step 3: Click 1-Day Trial
- Click **"Pay ₹8"** button on the 1-Day Trial card
- Should see payment options modal (Razorpay or Direct UPI)
- Click **"Pay with Razorpay"** button

### Step 4: Razorpay Popup Should Open
- A Razorpay payment modal should popup
- Amount should show: **₹8**
- Plan description should show: "1-Day Trial Plan"

### Step 5: Test Payment (Use Test Card)
```
Card Number:  4111111111111111
Expiry:       12/25 (any future date)
CVV:          123 (any 3 digits)
Name:         Any name
```

### Step 6: Verify Success
After successful payment, you should see:
- ✅ "Payment successful" toast notification
- ✅ Subscription activated screen showing 1-day expiry
- ✅ Premium features unlocked
- ✅ Browser localStorage shows: 
  - `kf_subscription` with `planId: "oneday"`
  - `expiryDate` exactly 1 day from now

---

## Browser Console Check
Press F12 and go to Console tab, paste this:
```javascript
// Should show oneday plan info
console.log(JSON.parse(localStorage.getItem('kf_subscription')));
```

Output should show:
```json
{
  "planId": "oneday",
  "expiryDate": "2026-06-17T XX:XX:XX.000Z",
  "startDate": "2026-06-16T XX:XX:XX.000Z",
  "totalPaid": 8,
  "paymentHistory": [
    {
      "date": "...",
      "amount": 8,
      "planId": "oneday",
      "planName": "1-Day Trial",
      "txnId": "pay_XXXXXXX"
    }
  ]
}
```

---

## Troubleshooting

### Issue: Razorpay popup doesn't open

**Check 1:** Browser console (F12)
- Should NOT show errors about "Razorpay SDK" or "checksum failed"
- Should show logs like "💳 Opening Razorpay checkout..."

**Check 2:** Verify Razorpay Key
```javascript
// In console, check if key is loaded
console.log(window.RazorpayPayment.keyId);
// Should output: rzp_live_SuharfZYrJBbHj
```

**Check 3:** Try manual payment trigger
```javascript
// In console, manually trigger payment
window.KFSubscription.selectPlan('oneday');
```

### Issue: Payment says "Invalid plan"
- Clear browser cache: Ctrl+Shift+Delete
- Hard reload: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Make sure you're using the latest code

### Issue: ₹8 shows as different amount
- Check that plan duration is "1" day (not 30)
- Verify price is exactly 8 (not 80)
- Check in browser DevTools Network tab for payment request details

---

## What Happens After 1 Day

The app automatically:
1. Checks expiry on every page load
2. Shows warning: "Your subscription expired"
3. Downgrades to free plan (max 20 clients)
4. Locks premium features
5. Keeps payment history intact
6. Allows re-purchase of any plan

To test immediate expiry (don't wait 24 hours):
```javascript
// In console, set expiry to past
let sub = JSON.parse(localStorage.getItem('kf_subscription'));
sub.expiryDate = new Date(Date.now() - 1000).toISOString();
localStorage.setItem('kf_subscription', JSON.stringify(sub));
location.reload();
// Now you should see "Subscription Expired" message
```

---

## Support
If payment still doesn't work:
1. Check browser console for specific errors
2. Verify Razorpay SDK is loading: check Network tab for `checkout.razorpay.com`
3. Test with a different browser
4. Clear all cache and cookies for the site
5. Check that you're not in incognito/private mode (may block popups)
