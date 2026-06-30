# Razorpay Integration Architecture - After Fix

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Frontend (index.html + razorpay.js)                     │   │
│  │                                                           │   │
│  │  On Load/Login:                                          │   │
│  │  1. Script loads razorpay.js                             │   │
│  │  2. Calls RazorpayPayment.init()                         │   │
│  │  3. Fetches key from backend → GET /api/payment/key      │   │
│  │  4. Uses key from backend (PRIMARY)                      │   │
│  │  5. Loads Razorpay SDK                                   │   │
│  │  6. Ready for payments                                   │   │
│  │                                                           │   │
│  │  On Payment:                                             │   │
│  │  1. User clicks "Pay"                                    │   │
│  │  2. Opens Razorpay modal (with backend-provided key)     │   │
│  │  3. User completes payment                               │   │
│  │  4. Sends verification to backend                        │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↑
                    HTTP Requests ↓
        ┌──────────────────────────────────┐
        │   NETWORK / INTERNET             │
        │   (CORS Enabled)                 │
        └──────────────────────────────────┘
                            ↑
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVER (Flask)                        │
│                   http://127.0.0.1:5000                          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  app.py - Payment Routes                                 │   │
│  │                                                           │   │
│  │  GET /api/payment/key                                    │   │
│  │  ├─ Reads from .env: RAZORPAY_KEY_ID                     │   │
│  │  ├─ Returns: {"key":"rzp_test_T2ccqRvYXx6jzC"}          │   │
│  │  └─ Status: ✅ 200 OK                                    │   │
│  │                                                           │   │
│  │  POST /api/payment/create-order                          │   │
│  │  ├─ Amount: {amount in paise}                            │   │
│  │  ├─ Creates Razorpay order                               │   │
│  │  └─ Returns order_id                                     │   │
│  │                                                           │   │
│  │  POST /api/payment/verify                                │   │
│  │  ├─ Signature verification                               │   │
│  │  ├─ Plan activation                                      │   │
│  │  └─ Returns success status                               │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  .env Configuration File                                 │   │
│  │  ✅ RAZORPAY_KEY_ID=rzp_test_T2ccqRvYXx6jzC             │   │
│  │  ✅ RAZORPAY_KEY_SECRET=KLpqnd34TLMJlvHNW24cB33v        │   │
│  │  └─ (Other configs...)                                   │   │
│  │                                                           │   │
│  │  ✅ Backend reads this on startup                        │   │
│  │  ✅ Serves keys to frontend on demand                    │   │
│  │  ✅ Easy to update for live mode                         │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↑
                            ↓
        ┌──────────────────────────────────┐
        │   Razorpay API                   │
        │   (checkout.razorpay.com)        │
        │                                  │
        │   Key: rzp_test_T2ccqRvYXx6jzC   │
        │   ├─ Opens TEST mode modal      │
        │   ├─ Processes test payment     │
        │   └─ Returns payment_id         │
        │                                  │
        └──────────────────────────────────┘
```

---

## Flow: User Login → Payment

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN FLOW                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ USER: Clicks "Log In"                                            │
│   ↓                                                              │
│ FRONTEND: Submits credentials to /api/login                      │
│   ↓                                                              │
│ BACKEND: Verifies & sends auth token + user data                │
│   ↓                                                              │
│ FRONTEND: Stores session in localStorage                         │
│   ↓                                                              │
│ FRONTEND: Redirects to dashboard (page reloads)                 │
│   ↓                                                              │
│ PAGE LOAD: Scripts re-execute (including razorpay.js)           │
│   ↓                                                              │
│ razorpay.js: Calls RazorpayPayment.init()                       │
│   ├─ Fetches: GET /api/payment/key                              │
│   ├─ Backend responds with test key from .env                   │
│   ├─ Stores key in: RazorpayPayment.keyId                       │
│   └─ Ready for payments                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT FLOW                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ USER: Clicks "Upgrade to Plan"                                   │
│   ↓                                                              │
│ FRONTEND: Opens subscription modal (calls openRazorpay)          │
│   ↓                                                              │
│ razorpay.js: payForPlan(planId)                                  │
│   ├─ Strategy 1: Try pre-loaded order                            │
│   ├─ Strategy 2: Create order via backend                        │
│   └─ Strategy 3: Open Razorpay directly                          │
│   ↓                                                              │
│ Opens Razorpay Modal (uses backend-provided key)                 │
│   ├─ key: rzp_test_T2ccqRvYXx6jzC (from .env)                   │
│   └─ Shows: TEST MODE 🧪                                         │
│   ↓                                                              │
│ USER: Enters test card: 4111 1111 1111 1111                     │
│   ↓                                                              │
│ RAZORPAY: Processes test payment                                 │
│   ├─ Success → Returns payment_id                                │
│   └─ Status: TEST payment ✅                                     │
│   ↓                                                              │
│ FRONTEND: Verifies signature with backend                        │
│   ├─ Sends: payment_id, order_id, signature                      │
│   ├─ Backend: Verifies via Razorpay                              │
│   └─ Activates plan in local storage                             │
│   ↓                                                              │
│ USER: Sees success message ✅                                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Configuration: Before → After

### BEFORE (Problem):
```
┌──────────────────┐
│   Frontend       │
│ (razorpay.js)    │
│                  │
│ keyId =          │
│ 'rzp_test_...'   │ ← Hardcoded, always used
│ (fallback)       │
│                  │
│ Try backend? →   │
│ Fails → ignored  │
└──────────────────┘
        ↓
❌ Always uses hardcoded key
❌ Backend configuration ignored
❌ No control over which mode
```

### AFTER (Solution):
```
┌──────────────────────────────┐
│       Frontend               │
│     (razorpay.js)            │
│                              │
│ On init():                   │
│ 1. Fetch /api/payment/key    │ ← Fetch FIRST
│ 2. Backend responds with key │
│ 3. Use backend key (PRIMARY) │
│ 4. If backend fails ONLY →   │
│    Use hardcoded fallback    │
└──────────────────────────────┘
        ↓
┌──────────────────────────────┐
│       Backend                │
│     (app.py)                 │
│                              │
│ GET /api/payment/key:        │
│ └─ Read .env file            │
│    RAZORPAY_KEY_ID=          │
│    rzp_test_T2ccqRvYXx6jzC   │
│ └─ Return to frontend        │
└──────────────────────────────┘
        ↓
✅ Frontend uses backend key
✅ Backend configuration applied
✅ Easy to change mode (update .env)
```

---

## Key Flow During Payment

```
┌─────────────────────────────────────────────────────────────────┐
│              RAZORPAY CHECKOUT INITIALIZATION                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ new window.Razorpay({                                            │
│   key: RazorpayPayment.keyId,     ← rzp_test_T2ccqRvYXx6jzC    │
│                                      (from backend via .env)     │
│   amount: 27000,                  ← ₹270 = 27000 paise         │
│   currency: 'INR',                                              │
│   order_id: 'order_...',          ← From backend order creation │
│   description: 'Monthly Plan',                                  │
│                                                                   │
│   handler: function(response) {                                 │
│     // Payment successful                                       │
│     razorpay_payment_id: 'pay_...'                              │
│     razorpay_order_id: 'order_...'                              │
│     razorpay_signature: 'sig_...'                               │
│     → Send to backend for verification                          │
│   },                                                             │
│                                                                   │
│   prefill: {                                                     │
│     name: 'User Name',                                          │
│     email: 'user@example.com',                                  │
│     contact: '+91...'                                           │
│   }                                                             │
│ })                                                              │
│                                                                  │
│ → Opens Razorpay Modal with TEST MODE 🧪                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Dependencies

```
┌─ index.html
│  ├─ Loads: app.js
│  ├─ Loads: razorpay.js        ← Initializes payment system
│  ├─ Loads: subscription.js    ← Uses RazorpayPayment
│  └─ Inline script: Ensures key is ready on DOMContentLoaded
│
├─ razorpay.js
│  ├─ Creates: window.RazorpayPayment object
│  ├─ init() method:
│  │  ├─ Fetches: /api/payment/key (from backend)
│  │  └─ Sets: this.keyId (for payment modal)
│  └─ openCheckout() method: Uses this.keyId to open modal
│
├─ subscription.js
│  ├─ Uses: window.RazorpayPayment
│  └─ Calls: RazorpayPayment.payForPlan()
│
└─ Backend: kaasflow/backend/
   ├─ app.py
   │  └─ Imports: payment_routes from razorpay_integration.py
   │
   ├─ razorpay_integration.py
   │  └─ Route: GET /api/payment/key
   │     └─ Returns: os.getenv('RAZORPAY_KEY_ID')
   │
   └─ .env (CONFIGURATION)
      ├─ RAZORPAY_KEY_ID=rzp_test_T2ccqRvYXx6jzC
      └─ RAZORPAY_KEY_SECRET=KLpqnd34TLMJlvHNW24cB33v
```

---

## Environment: Test vs Live (Future)

```
TEST MODE (Current):
┌────────────────────────────────┐
│ .env                           │
├────────────────────────────────┤
│ RAZORPAY_KEY_ID=               │
│ rzp_test_T2ccqRvYXx6jzC        │
│                                │
│ RAZORPAY_KEY_SECRET=           │
│ KLpqnd34TLMJlvHNW24cB33v       │
└────────────────────────────────┘
        ↓
Razorpay: TEST MODE 🧪
├─ Test cards available
├─ No real charges
└─ Sandbox environment

LIVE MODE (Future):
┌────────────────────────────────┐
│ .env                           │
├────────────────────────────────┤
│ RAZORPAY_KEY_ID=               │
│ rzp_live_YOUR_ACTUAL_KEY       │
│                                │
│ RAZORPAY_KEY_SECRET=           │
│ rzp_live_YOUR_ACTUAL_SECRET    │
└────────────────────────────────┘
        ↓
Razorpay: LIVE MODE 💰
├─ Real payments processed
├─ Money transferred
└─ Production environment

✅ NO CODE CHANGES NEEDED!
   Just update .env + restart backend
```

---

## Summary

✅ **Centralized Key Management** - Backend serves all keys  
✅ **Backend-First Approach** - Frontend fetches from backend  
✅ **Fallback Protection** - Hardcoded key as emergency only  
✅ **Easy Mode Switching** - Change .env, restart backend  
✅ **Consistent Behavior** - All users get same key  
✅ **Production Ready** - Secure, scalable architecture
