# 🚀 Quick Start Guide - KaasFlow Payment System

**Status:** ✅ Ready to use  
**Time:** 2 minutes to get started

---

## ⚡ Quick Start (Windows)

### Option 1: Using Batch Scripts (Easiest)

#### Step 1: Start Backend
```
Double-click: START_BACKEND.bat
```

Wait for message: `Running on http://127.0.0.1:5000`

#### Step 2: Start Frontend
```
Double-click: START_FRONTEND.bat
```

Wait for message: `Serving HTTP on 0.0.0.0 port 5500`

#### Step 3: Open Browser
```
http://127.0.0.1:5500
```

#### Step 4: Login & Test Payment
- Login with your credentials
- Go to Dashboard → Upgrade
- Select "1-Day Trial" (₹8)
- Click "Pay with Razorpay"
- Use test card: `4111 1111 1111 1111`
- OTP: `000000`
- ✅ Payment success!

---

## ⚡ Quick Start (macOS/Linux)

### Terminal 1: Start Backend
```bash
cd kaasflow/backend
python3 app.py
```

### Terminal 2: Start Frontend
```bash
cd kaasflow/frontend
python3 -m http.server 5500
```

### Browser
```
http://127.0.0.1:5500
```

---

## 🧪 Test Payment Details

### Test Card
```
Number:  4111 1111 1111 1111
Expiry:  12/25 (any future date)
CVV:     123 (any 3 digits)
OTP:     000000 (always this)
Mode:    🧪 TEST (no real money)
```

### Available Plans
- 1-Day Trial: ₹8
- Monthly: ₹270
- Quarterly: ₹850
- Yearly: ₹1,999

---

## ✅ Verification Checklist

- [ ] Backend running on http://127.0.0.1:5000
- [ ] Frontend running on http://127.0.0.1:5500
- [ ] Logged in to app
- [ ] Can see "Upgrade Now" button
- [ ] Can click "Upgrade" → opens modal
- [ ] Can select plan and click "Pay"
- [ ] Razorpay modal opens
- [ ] Can enter test card details
- [ ] Payment completes → "Success!" message

---

## 🛠️ Troubleshooting

### Backend won't start
```
❌ Error: No module named 'flask'
✅ Solution: pip install -r kaasflow/backend/requirements.txt
```

### Port 5000 already in use
```
❌ Error: Address already in use
✅ Solution: Kill process or use different port
```

### Frontend won't load
```
❌ Error: Connection refused
✅ Solution: Make sure backend is running FIRST
```

### Payment shows "No key passed"
```
❌ Error: Failed to open payment: No key passed
✅ Solution:
   1. Check backend is running
   2. Check .env has RAZORPAY_KEY_ID
   3. Refresh browser page
   4. Try payment again
```

---

## 📁 File Structure

```
kaasflow/
├── backend/
│   ├── app.py                          ← Main Flask app
│   ├── razorpay_integration.py         ← Payment endpoints
│   ├── .env                            ← API credentials
│   └── requirements.txt                ← Python packages
│
└── frontend/
    ├── index.html                      ← Main page
    ├── app.js                          ← App logic
    ├── razorpay.js                     ← Payment handler
    └── subscription.js                 ← Subscription manager
```

---

## 🔧 Manual Start (If Scripts Don't Work)

### Windows Command Prompt

```cmd
REM Terminal 1: Backend
cd kaasflow\backend
python app.py

REM Terminal 2: Frontend (new command prompt)
cd kaasflow\frontend
python -m http.server 5500
```

### Windows PowerShell

```powershell
# Terminal 1: Backend
cd kaasflow/backend
python app.py

# Terminal 2: Frontend (new PowerShell)
cd kaasflow/frontend
python -m http.server 5500
```

### macOS/Linux

```bash
# Terminal 1: Backend
cd kaasflow/backend
python3 app.py

# Terminal 2: Frontend (new terminal)
cd kaasflow/frontend
python3 -m http.server 5500
```

---

## 🔍 How to Check If Working

### Check Backend
```bash
curl http://127.0.0.1:5000/api/payment/key
```

**Should return:**
```json
{"key": "rzp_test_T2ccqRvYXx6jzC"}
```

### Check Frontend
Open browser console (F12) and look for:
```
✅ Razorpay key fetched from backend: rzp_test_T2ccqRvYXx6...
✅ RazorpayPayment initialized
```

---

## 📊 Payment Flow

```
1. Click "Upgrade" 
   ↓
2. Select plan 
   ↓
3. Click "Pay with Razorpay"
   ↓
4. Frontend fetches key from backend
   ↓
5. Razorpay modal opens
   ↓
6. Enter card & OTP
   ↓
7. Payment processes
   ↓
8. Backend verifies & activates
   ↓
9. ✅ Success! Subscription activated
```

---

## 🎯 What Works Now

✅ Client limit enforcement (20 until upgrade)  
✅ Expiry modal blocks app interaction  
✅ Precise subscription duration  
✅ No auto-reload after payment  
✅ PIN preserved when clearing data  
✅ Razorpay payment integration  
✅ Plan activation & subscription  

---

## 🚀 Next Steps

1. **Now:** Start backend & frontend using scripts
2. **Then:** Login and test payment
3. **Verify:** Check browser console for success messages
4. **Ready:** Can now test all features
5. **Push:** Ready for git commit & deployment

---

## 📞 Support

### Common Issues

| Issue | Solution |
|-------|----------|
| "Failed to fetch key" | Restart backend |
| "Port already in use" | Close other apps using port 5000/5500 |
| "Module not found" | Install requirements: `pip install -r requirements.txt` |
| "No key in response" | Check .env has RAZORPAY_KEY_ID |
| "Payment declined" | Use test card: `4111 1111 1111 1111` |

---

**Status:** ✅ Ready to Use  
**Time:** ~2 minutes to setup  
**Last Updated:** June 17, 2026
