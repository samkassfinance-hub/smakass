# Razorpay Test Cards & OTP Reference

## Test Card Details

### Primary Test Card (Visa)
```
Card Number:  4111 1111 1111 1111
Expiry:       12/25 (or any future date)
CVV:          123 (or any 3 digits)
OTP:          000000
Status:       ✅ SUCCESS
```

### Other Test Cards

#### Mastercard
```
Card Number:  5555 5555 5555 4444
Expiry:       12/25
CVV:          123
OTP:          000000
Status:       ✅ SUCCESS
```

#### American Express
```
Card Number:  3782 822463 10005
Expiry:       12/25
CVV:          1234 (4 digits for AMEX)
OTP:          000000
Status:       ✅ SUCCESS
```

#### Discover
```
Card Number:  6011 1111 1111 1117
Expiry:       12/25
CVV:          123
OTP:          000000
Status:       ✅ SUCCESS
```

---

## Test Credentials

### Backend Configuration
```
Location: kaasflow/backend/.env

RAZORPAY_KEY_ID=rzp_test_T2ccqRvYXx6jzC
RAZORPAY_KEY_SECRET=KLpqnd34TLMJlvHNW24cB33v

Mode: 🧪 TEST (Development)
```

---

## Test Payment Scenarios

### Scenario 1: Successful Payment (₹8 - 1-Day Trial)
1. Start backend & frontend
2. Login to app
3. Click "Dashboard" → "Upgrade"
4. Select "1-Day Trial (₹8)"
5. Click "Pay with Razorpay"
6. Enter test card: `4111 1111 1111 1111`
7. Enter expiry: `12/25`
8. Enter CVV: `123`
9. Enter OTP: `000000`
10. ✅ Payment Success → Subscription activated

### Scenario 2: Different Plan Amount (₹270 - Monthly)
1. Same steps as above
2. Select "Monthly Plan (₹270)"
3. Verify correct amount shown in Razorpay
4. Complete payment
5. ✅ Verify subscription duration = 30 days

### Scenario 3: Quarterly Plan (₹850)
- Same flow
- Amount: ₹850
- Duration: 90 days
- Savings: ₹60 displayed

### Scenario 4: Yearly Plan (₹1,999)
- Same flow
- Amount: ₹1,999
- Duration: 365 days
- Savings: ₹1,241 displayed

---

## After Payment

### Success Screen Should Show:
- ✅ "Payment Successful!" message
- ✅ Amount paid (e.g., ₹270)
- ✅ Plan name (e.g., "Monthly Plan")
- ✅ Valid until date
- ✅ Two buttons:
  - "Continue Using App"
  - "Refresh Page"

### App Should:
- ✅ Update client limit to Unlimited
- ✅ Store subscription in localStorage
- ✅ Disable "Add Client" limit message
- ✅ Show "PRO" badge in header

---

## Testing Checklist

- [ ] Test card `4111 1111 1111 1111` works
- [ ] OTP `000000` works
- [ ] Payment completes successfully
- [ ] Success screen appears (no auto-reload)
- [ ] Plan shows "PRO" badge
- [ ] Client limit is unlimited
- [ ] Expiry date is correct
- [ ] Payment history saved
- [ ] User can click "Continue" without refresh
- [ ] PIN is still preserved

---

## Common Test Responses

### Successful Payment
```
Status: success
Message: Payment completed successfully
Order ID: order_T2chnBB0J3lkK0
Payment ID: pay_T2choPJGnDkqP0
```

### Failed Payment (Wrong OTP)
```
Status: error
Message: Invalid OTP
Action: Retry with OTP: 000000
```

### Failed Payment (Insufficient Funds)
```
Status: error
Message: Insufficient funds on card
Action: Use different test card
```

### Failed Payment (Declined)
```
Status: error
Message: Card declined by issuer
Action: Try different card from list above
```

---

## Debugging Tips

### Check Backend is Running
```bash
# Should see:
# ✅ RazorpayPayment initialized successfully
# 🔑 Using Key ID: rzp_test_T2ccqRvYXx6jzC
```

### Check Frontend Console
```javascript
// Should see logs:
// 💳 Opening Razorpay checkout...
// ✅ Razorpay SDK ready
// ✅ Payment successful! pay_T2choPJGnDkqP0
```

### Check Payment Was Created
```bash
python -c "
import razorpay
client = razorpay.Client(auth=('rzp_test_T2ccqRvYXx6jzC', 'KLpqnd34TLMJlvHNW24cB33v'))
orders = client.order.all()
print('Orders created:', len(orders['items']))
"
```

---

## Important Notes

⚠️ **These are test credentials only:**
- ✅ Use for development/testing
- ❌ Do NOT use for real payments
- ✅ No real money is charged
- ✅ Cards cannot be saved or reused
- ✅ Valid for unlimited test transactions

🔴 **When switching to production:**
1. Get live keys from Razorpay
2. Update RAZORPAY_KEY_ID (should start with `rzp_live_`)
3. Update RAZORPAY_KEY_SECRET
4. Restart backend
5. Real cards will be charged

---

## Razorpay Dashboard

### Test Dashboard
- URL: https://dashboard.razorpay.com/settings/api-keys
- Navigate to: Settings → API Keys
- View all test transactions here
- Switch to Live Keys when ready

### View Test Payments
1. Login to Razorpay dashboard
2. Go to Payments section
3. Filter by "Test" mode
4. See all test transactions
5. Check payment status, amount, timestamp

---

## Support

If payment fails:
1. Check browser console for errors
2. Verify test card is entered correctly
3. Verify OTP is `000000`
4. Check backend logs
5. Verify `.env` has correct credentials
6. Restart backend after `.env` changes

---

**Last Updated:** June 17, 2026  
**Status:** ✅ READY FOR TESTING
