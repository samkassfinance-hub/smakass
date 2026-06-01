# 📊 Forgot PIN OTP Flow - Complete Diagram

## 🎯 User Journey Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER OPENS APP                           │
│                         ↓                                    │
│                  Already Logged In?                          │
│                         ↓                                    │
│                  PIN Lock Screen                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  👤 USER CLICKS: "Forgot PIN?" Button                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  📋 STEP 1: SEND OTP                                        │
│  ┌───────────────────────────────────────┐                 │
│  │ Email: user@example.com (auto-filled) │                 │
│  │ [Send OTP] Button                      │                 │
│  └───────────────────────────────────────┘                 │
│                                                              │
│  Frontend JS sends:                                         │
│  POST /api/forgot-pin/send-otp                             │
│  { "email": "user@example.com" }                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  🖥️  BACKEND PROCESSING                                     │
│                                                              │
│  1. Receives email                                          │
│  2. Generates 6-digit OTP (e.g., 583921)                   │
│  3. Stores OTP in memory with 10-min expiry               │
│  4. Calls Resend API to send email                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  📧 RESEND API                                              │
│                                                              │
│  POST https://api.resend.com/emails                        │
│  Headers:                                                   │
│    Authorization: Bearer re_xxx...                         │
│  Body:                                                      │
│    {                                                        │
│      "from": "SamKass <welcome@samkass.site>",            │
│      "to": ["user@example.com"],                          │
│      "subject": "Reset your KaasFlow Security PIN 🔒",     │
│      "html": "<div>...OTP: 583921...</div>"               │
│    }                                                        │
│                                                              │
│  Response: 200 OK                                           │
│  { "id": "email-id-xxx" }                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  📬 USER'S EMAIL INBOX                                      │
│                                                              │
│  ┌─────────────────────────────────────────┐               │
│  │ From: SamKass <welcome@samkass.site>   │               │
│  │ Subject: Reset your KaasFlow Security  │               │
│  │          PIN 🔒                         │               │
│  │                                         │               │
│  │ Your OTP code is:                      │               │
│  │                                         │               │
│  │    ┌──────────────┐                    │               │
│  │    │   583921     │                    │               │
│  │    └──────────────┘                    │               │
│  │                                         │               │
│  │ Expires in 10 minutes.                 │               │
│  └─────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                          ↓
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  ✅ FRONTEND: Success Toast                                 │
│  "OTP sent successfully to your email."                    │
│                                                              │
│  Modal automatically shows STEP 2                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  📋 STEP 2: VERIFY OTP                                      │
│  ┌───────────────────────────────────────┐                 │
│  │ Enter 6-digit OTP:                     │                 │
│  │ [ 5 ] [ 8 ] [ 3 ] [ 9 ] [ 2 ] [ 1 ]  │                 │
│  │                                         │                 │
│  │ [Verify OTP] Button                    │                 │
│  └───────────────────────────────────────┘                 │
│                                                              │
│  Frontend JS sends:                                         │
│  POST /api/forgot-pin/verify-otp                           │
│  { "email": "user@example.com", "otp": "583921" }         │
└─────────────────────────────────────────────────────────────┘
                          ↓
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  🖥️  BACKEND VERIFICATION                                   │
│                                                              │
│  1. Retrieves stored OTP for email                         │
│  2. Checks if OTP expired (> 10 mins)                      │
│  3. Compares: stored "583921" == user "583921"            │
│  4. ✅ Match! Returns success                               │
│  5. Deletes OTP from memory                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  ✅ FRONTEND: Success Toast                                 │
│  "OTP verified successfully"                               │
│                                                              │
│  Modal automatically shows STEP 3                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  📋 STEP 3: SET NEW PIN                                     │
│  ┌───────────────────────────────────────┐                 │
│  │ Create your new 4-digit PIN:          │                 │
│  │ [ 1 ] [ 2 ] [ 3 ] [ 4 ]              │                 │
│  │                                         │                 │
│  │ [Save New PIN] Button                  │                 │
│  └───────────────────────────────────────┘                 │
│                                                              │
│  Frontend JS:                                               │
│  1. Saves PIN to localStorage                              │
│  2. Sends to backend:                                       │
│     POST /api/set-pin                                       │
│     { "email": "user@example.com", "pin": "1234" }        │
└─────────────────────────────────────────────────────────────┘
                          ↓
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  🖥️  BACKEND: SAVE PIN                                      │
│                                                              │
│  1. UPDATE pro_users                                        │
│     SET app_pin = '1234'                                    │
│     WHERE email = 'user@example.com'                       │
│  2. Returns success                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  ✅ FRONTEND: Success!                                      │
│                                                              │
│  1. Shows toast: "🔒 PIN reset successfully!"              │
│  2. Closes modal                                            │
│  3. Automatically logs user into app                        │
│  4. Shows main app screen                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   🎉 COMPLETE!                              │
│         User is now using the app with new PIN             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Features

| Feature | Implementation |
|---------|----------------|
| OTP Generation | 6-digit random (100000-999999) |
| OTP Storage | In-memory dictionary (not database) |
| OTP Expiration | 10 minutes |
| OTP Validation | Exact string match |
| OTP Cleanup | Auto-deleted after verification or expiry |
| Email Delivery | Via Resend API with verified domain |
| Rate Limiting | Applied to auth endpoints |
| PIN Storage | Stored in SQLite database per user |

---

## 📡 API Endpoints Reference

### 1. Send OTP
```
POST /api/forgot-pin/send-otp
Content-Type: application/json

Request:
{
  "email": "user@example.com"
}

Response (Success):
{
  "success": true,
  "message": "OTP sent to your email"
}

Response (Dev Mode - email failed):
{
  "success": true,
  "message": "Email service not configured...",
  "otp": "583921"  // Shows OTP in dev mode
}

Response (Error):
{
  "success": false,
  "error": "Failed to send OTP email. Please try again later."
}
```

### 2. Verify OTP
```
POST /api/forgot-pin/verify-otp
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "otp": "583921"
}

Response (Success):
{
  "success": true,
  "message": "OTP verified successfully"
}

Response (Error):
{
  "error": "Invalid OTP"
}
OR
{
  "error": "OTP has expired"
}
OR
{
  "error": "No OTP request found for this email"
}
```

### 3. Set New PIN
```
POST /api/set-pin
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "pin": "1234"
}

Response (Success):
{
  "success": true
}

Response (Error):
{
  "error": "Failed to save PIN"
}
```

---

## 🌐 Resend API Integration

### Email Payload Structure
```javascript
{
  "from": "SamKass <welcome@samkass.site>",  // Must be verified domain
  "to": ["user@example.com"],
  "subject": "Reset your KaasFlow Security PIN 🔒",
  "html": "<div style='...'> HTML email template </div>"
}
```

### Required Headers
```javascript
{
  "Authorization": "Bearer re_DxueLnyr_JpRSratcdi8f7xvvriXdwQtF",
  "Content-Type": "application/json"
}
```

### Response
```javascript
// Success (200 or 201)
{
  "id": "email-unique-id"
}

// Error (403 Forbidden - domain not verified)
{
  "message": "Domain not verified"
}

// Error (401 Unauthorized - invalid API key)
{
  "message": "Invalid API key"
}
```

---

## 🧪 Testing Checklist

| Step | Test | Expected Result |
|------|------|-----------------|
| 1 | Run `python test_resend_otp.py` (option 1) | ✅ Email sent via Resend |
| 2 | Check email inbox | ✅ Received OTP email |
| 3 | Start backend: `python kaasflow/backend/app.py` | ✅ Server running on port 5000 |
| 4 | Run test script (option 2) | ✅ Backend endpoint works |
| 5 | Start frontend: `python kaasflow/frontend/app.py` | ✅ Server running on port 5500 |
| 6 | Open http://127.0.0.1:5500 | ✅ App loads |
| 7 | Click "Forgot PIN?" | ✅ Modal opens, email auto-filled |
| 8 | Click "Send OTP" | ✅ Toast: "OTP sent successfully" |
| 9 | Check email | ✅ Received OTP |
| 10 | Enter OTP | ✅ 6 input boxes |
| 11 | Click "Verify OTP" | ✅ Toast: "OTP verified successfully" |
| 12 | Enter new PIN (4 digits) | ✅ 4 input boxes |
| 13 | Click "Save New PIN" | ✅ Toast: "🔒 PIN reset successfully!" |
| 14 | Check app state | ✅ Logged into main app |

---

## 🚨 Error Scenarios

### Scenario 1: Domain Not Verified
```
User clicks "Send OTP"
  ↓
Backend calls Resend API
  ↓
Resend returns 403 Forbidden
  ↓
User sees: "Failed to send OTP"
  ↓
Solution: Verify domain in Resend dashboard
```

### Scenario 2: Invalid OTP
```
User enters wrong OTP (e.g., 111111)
  ↓
Backend compares: stored "583921" != user "111111"
  ↓
Returns error: "Invalid OTP"
  ↓
User sees: "Invalid OTP"
  ↓
Solution: Check email for correct OTP
```

### Scenario 3: Expired OTP
```
User waits > 10 minutes
  ↓
Clicks "Verify OTP"
  ↓
Backend checks expiry: now > expires_at
  ↓
Returns error: "OTP has expired"
  ↓
User sees: "OTP has expired"
  ↓
Solution: Click "Send OTP" again
```

---

## 📊 Database Schema

### `pro_users` Table
```sql
CREATE TABLE pro_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    google_id TEXT UNIQUE,
    full_name TEXT,
    profile_pic TEXT,
    app_pin TEXT,  -- ← Stores 4-digit PIN
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### OTP Storage (In-Memory)
```python
pin_reset_otps = {
    "user@example.com": {
        "otp": "583921",
        "expires_at": datetime(2026, 6, 1, 14, 30, 0)
    }
}
```

---

## 🎯 Summary

**Your OTP flow is complete!** The diagram shows:
1. ✅ User journey from "Forgot PIN?" to success
2. ✅ Frontend → Backend → Resend → Email flow
3. ✅ All 3 steps: Send OTP → Verify OTP → Set PIN
4. ✅ Security features and error handling
5. ✅ API endpoint reference
6. ✅ Testing checklist

**Next step:** Verify domain in Resend and test! 🚀
