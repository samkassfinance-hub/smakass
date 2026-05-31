# 🔥 Razorpay Payment Integration - Complete Setup Guide

## ✅ Your Razorpay Credentials

```
Key ID:     rzp_live_SuharfZYrJBbHj
Key Secret: FsmmZywk4NGiI1PxIS4UWb0e
```

**⚠️ IMPORTANT:** These are **LIVE** credentials. Test payments will charge real money!

---

## 📋 Setup Checklist

### 1️⃣ Backend Setup

**File:** `backend/.env`

```env
RAZORPAY_KEY_ID=rzp_live_SuharfZYrJBbHj
RAZORPAY_KEY_SECRET=FsmmZywk4NGiI1PxIS4UWb0e
```

✅ Already configured in your `.env` file!

### 2️⃣ Install Python Dependencies

```bash
cd backend
pip install razorpay
```

### 3️⃣ Test Backend Integration

```bash
cd backend
python test_razorpay_backend.py
```

**Expected Output:**
```
✅ ORDER CREATED SUCCESSFULLY!
   Order ID: order_xxxxxxxxxxxxx
   Amount: ₹270 (27000 paise)
   Currency: INR
   Status: created
```

### 4️⃣ Frontend Setup

**File:** `frontend/razorpay.js`

The Key ID is hardcoded as fallback:
```javascript
keyId: 'rzp_live_SuharfZYrJBbHj'
```

✅ Already configured!

### 5️⃣ Start Backend Server

```bash
cd backend
python app.py
```

Server should start on `http://127.0.0.1:5000`

### 6️⃣ Test Payment Flow

Open in browser:
```
http://127.0.0.1:5500/test_razorpay.html
```

Or test in your main app:
```
http://127.0.0.1:5500/index.html
```

---

## 🧪 Testing Payment Flow

### Test with Razorpay Test Cards

**⚠️ Since you're using LIVE keys, you CANNOT use test cards!**

For testing without real charges, you need to:
1. Switch to **Test Mode** keys from Razorpay Dashboard
2. Use test cards like: `4111 1111 1111 1111`

### Current Setup (LIVE Mode)

With your current LIVE keys, any payment will:
- ✅ Charge the real card
- ✅ Transfer money to your Razorpay account
- ✅ Activate the subscription

---

## 🔍 Troubleshooting

### Issue: "Razorpay keys are missing"

**Solution:**
```bash
# Check if .env file exists
cat backend/.env | grep RAZORPAY

# Should show:
# RAZORPAY_KEY_ID=rzp_live_SuharfZYrJBbHj
# RAZORPAY_KEY_SECRET=FsmmZywk4NGiI1PxIS4UWb0e
```

### Issue: "Order creation failed"

**Possible causes:**
1. Backend not running → Start with `python app.py`
2. Wrong API endpoint → Check console for 404 errors
3. CORS issues → Backend should allow your frontend origin

**Check backend logs:**
```bash
# Backend should show:
POST /api/payment/create-order - 200 OK
```

### Issue: "Payment verification failed"

**Possible causes:**
1. Invalid signature → Check if Key Secret matches
2. Network timeout → Retry the payment
3. Backend error → Check backend console logs

### Issue: "Razorpay checkout not opening"

**Solution:**
```javascript
// Check if Razorpay SDK is loaded
console.log(window.Razorpay); // Should not be undefined

// Check browser console for errors
```

---

## 📊 Payment Flow Diagram

```
User clicks "Pay ₹270"
         ↓
Frontend calls: POST /api/payment/create-order
         ↓
Backend creates Razorpay order
         ↓
Frontend opens Razorpay checkout modal
         ↓
User enters card details & pays
         ↓
Razorpay processes payment
         ↓
Frontend receives payment response
         ↓
Frontend calls: POST /api/payment/verify
         ↓
Backend verifies signature
         ↓
Backend activates subscription in database
         ↓
✅ Success! User gets unlimited access
```

---

## 🔐 Security Notes

1. **Never expose Key Secret in frontend code**
   - ✅ It's only in backend `.env` file
   - ✅ Frontend only uses Key ID

2. **Always verify payment signature on backend**
   - ✅ Implemented in `razorpay_integration.py`

3. **Use HTTPS in production**
   - ⚠️ Required for live payments
   - ⚠️ Razorpay will reject HTTP origins

---

## 🚀 Production Deployment

### Before going live:

1. **Update CORS origins in `app.py`:**
   ```python
   allowed_origins = [
       "https://www.samkass.site",
       "https://samkass.site"
   ]
   ```

2. **Set production environment variables:**
   ```bash
   export RAZORPAY_KEY_ID=rzp_live_SuharfZYrJBbHj
   export RAZORPAY_KEY_SECRET=FsmmZywk4NGiI1PxIS4UWb0e
   export FRONTEND_URL=https://www.samkass.site
   ```

3. **Enable webhook for payment notifications:**
   - Go to Razorpay Dashboard → Webhooks
   - Add webhook URL: `https://www.samkass.site/api/payment/webhook`
   - Select events: `payment.captured`, `payment.failed`

---

## 📞 Support

If payments still don't work:

1. Check Razorpay Dashboard → Payments → Logs
2. Check browser console for JavaScript errors
3. Check backend logs for Python errors
4. Verify your Razorpay account is activated for live payments

**Razorpay Support:** https://razorpay.com/support/

---

## ✅ Quick Test Commands

```bash
# 1. Test backend
cd backend
python test_razorpay_backend.py

# 2. Start backend
python app.py

# 3. Open test page
# Visit: http://127.0.0.1:5500/test_razorpay.html

# 4. Click "Test Monthly Plan - ₹270"
# 5. Complete payment with real card
# 6. Check if subscription activates
```

---

**Last Updated:** 2024
**Status:** ✅ Ready for Live Payments
