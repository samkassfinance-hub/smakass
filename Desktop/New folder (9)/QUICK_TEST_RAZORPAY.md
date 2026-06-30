# Quick Test: Razorpay Test Mode Fix

## 🚀 Quick Start

### 1. Make sure backend is running
```bash
cd kaasflow/backend
python app.py
# You should see: Running on http://127.0.0.1:5000
```

### 2. Test the key endpoint
Open your browser and visit:
```
http://127.0.0.1:5000/api/payment/key
```

You should see:
```json
{"key":"rzp_test_T2ccqRvYXx6jzC"}
```

✅ If you see this, the backend is correctly configured!

### 3. Test the full payment flow

1. Open frontend in browser: `http://localhost:5500/`
2. Open **Developer Tools** → **Console** tab
3. **Log out** if you're logged in
4. **Log back in**
5. In the console, you should see:
   ```
   📡 Fetching key from backend: http://127.0.0.1:5000/api/payment/key
   ✅ Razorpay key loaded from backend: rzp_test_T2ccqRvYXx6jzC...
   ```

✅ If you see these messages, the fix is working!

### 4. Make a test payment

1. Go to **Subscription/Payment** section
2. Click upgrade or pay button
3. Razorpay modal should open
4. Look for **"TEST"** indicator on the modal (shows it's in test mode)
5. Use test card: `4111 1111 1111 1111` with any future date and CVV

✅ Payment should go through in test mode!

### 5. Test consistency - repeat login 3 times

1. Log out
2. Log back in
3. Check console for key message
4. **Repeat 2-3 times**
5. Every time should show the same test key from backend

✅ If same key appears every time, the fix is working for both new and old users!

## 🔍 Debugging

**Problem**: Console shows `Using hardcoded test key (backend not responding)`

**Solution**: 
- Make sure backend is actually running (`python app.py`)
- Check if `.env` file exists in `kaasflow/backend/.env`
- Check backend is on port 5000

**Problem**: Console shows `❌ Failed to fetch key from backend`

**Solution**:
- Check CORS settings in backend (should allow your frontend URL)
- Verify backend is responding to `/api/payment/key`

**Problem**: Payment gateway opens in LIVE mode instead of TEST

**Solution**:
- Check `.env` file contains `rzp_test_T2ccqRvYXx6jzC`
- Restart backend after editing `.env`
- Clear browser cache and local storage

## ✅ Verification Complete

If all steps pass, you have successfully fixed the Razorpay test mode issue:
- ✅ Backend serves Razorpay key from `.env`
- ✅ Frontend fetches key from backend on every load
- ✅ Payment gateway opens consistently in test mode
- ✅ Works for both new and old users
- ✅ No more accidental resets to different modes
