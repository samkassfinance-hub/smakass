# How to Restart Backend - Step by Step

## ⚠️ Important
The HTTP 405 error is happening because **the Flask backend hasn't been restarted** to load the new WhatsApp routes.

## Solution: Restart Backend

### On Windows (PowerShell/CMD):

**Step 1: Stop Current Backend**
```bash
# If Flask is running, press Ctrl+C to stop it
```

**Step 2: Restart Backend**
```bash
cd kaasflow/backend
python app.py
```

You should see output like:
```
 * Serving Flask app 'app'
 * Running on http://127.0.0.1:5000
 * Whatsapp routes registered
 * Notification scheduler started
```

### On macOS/Linux:

**Step 1: Stop Current Backend**
```bash
# Press Ctrl+C if Flask is running
```

**Step 2: Restart Backend**
```bash
cd kaasflow/backend
python3 app.py
```

## Verification

After restarting, you should see in the terminal:
```
✅ Supabase client initialized successfully
✅ Notification scheduler started
✅ WhatsApp reminder scheduler started
```

If you see errors, the backend didn't start properly.

## Test the Endpoints

After restart, open a new terminal and run:
```bash
cd kaasflow/backend
python test_whatsapp_endpoint.py
```

You should see:
```
✅ Found 7 WhatsApp routes:
   - /api/whatsapp/setup
   - /api/whatsapp/qr
   - /api/whatsapp/status
   ...
```

## Refresh App in Browser

**After backend restarts:**
1. Go to browser
2. Press **Ctrl+Shift+R** (hard refresh)
3. Go to Settings
4. Click "Connect WhatsApp"
5. Should now work (or show better error message)

## If Still Getting 405

Check these:
1. **Is backend running?**
   - Look for "Running on http://127.0.0.1:5000" in terminal

2. **Did you hard refresh?**
   - Press Ctrl+Shift+R (not just Ctrl+R)

3. **Are there errors in backend console?**
   - Check terminal where Flask is running

4. **Wrong port?**
   - Make sure it's running on port 5000
   - Not 3000 (that's frontend) or 8080 (that's WhatsApp API)

## Common Issues

### Backend won't start
```bash
# Check if port 5000 is in use
# Windows:
netstat -ano | findstr :5000

# Mac/Linux:
lsof -i :5000
```

If port is in use, either:
1. Kill the process: `taskkill /PID <PID> /F` (Windows)
2. Or use a different port

### ImportError for whatsapp module
```
ImportError: cannot import name 'whatsapp_bp'
```
- Check that `kaasflow/backend/routes/whatsapp.py` exists
- Check that `from routes.whatsapp import whatsapp_bp` is in app.py

### Database connection error
```
Warning: Failed to initialize Supabase client
```
- Check `.env` file has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
- These are configured, so should work

## Next: Browser Testing

Once backend is running, try in browser:
1. **Check Console** (F12 → Console)
   - No import errors
   - No "Cannot GET /api/whatsapp/setup"

2. **Check Network** (F12 → Network)
   - Click "Connect WhatsApp"
   - Look at the API call
   - Should show status 200 or 401 or 400
   - NOT 405

3. **Check Response**
   - Should be JSON
   - Either `{"success": true/false, "error": "..."}`
   - OR proper QR code data

## Success Indicators ✅

- [ ] Backend running on port 5000
- [ ] No errors in backend terminal
- [ ] Browser hard refresh done
- [ ] Network tab shows 200/400/401 (not 405)
- [ ] Response is valid JSON
- [ ] WhatsApp section loads without red error

---

**Do this now and report back if you still see 405!**
