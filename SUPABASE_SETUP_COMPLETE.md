# ✅ Supabase Primary Database Setup Guide

## 🎯 Overview

Your **PRIMARY Supabase** is already configured with the correct API keys! Now you just need to create the tables in Supabase to store clients, loans, and payments data.

---

## 🔑 Your Supabase Configuration (Already Set)

```
URL: https://eahyuwpejwbqzzolajzr.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ Already configured in `kaasflow/backend/.env`

---

## 📋 Step-by-Step Setup

### Step 1: Login to Supabase Dashboard

Go to: **https://supabase.com/dashboard**

Login and select your project: **eahyuwpejwbqzzolajzr**

---

### Step 2: Open SQL Editor

1. In the left sidebar, click **"SQL Editor"**
2. Click **"New Query"**

---

### Step 3: Copy & Run This SQL

Copy the entire SQL below and paste it into the SQL editor, then click **"Run"**:

```sql
-- KaasFlow Primary Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS kf_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    financier_name TEXT,
    business_name TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Settings Table
CREATE TABLE IF NOT EXISTS kf_settings (
    user_id TEXT PRIMARY KEY REFERENCES kf_users(id) ON DELETE CASCADE,
    financier_name TEXT,
    business_name TEXT,
    theme TEXT DEFAULT 'dark',
    lang TEXT DEFAULT 'en',
    extra_clients INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Clients Table
CREATE TABLE IF NOT EXISTS kf_clients (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES kf_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    id_num TEXT,
    occupation TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_kf_clients_user_id ON kf_clients(user_id);

-- 4. Loans Table
CREATE TABLE IF NOT EXISTS kf_loans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES kf_users(id) ON DELETE CASCADE,
    client_id TEXT NOT NULL REFERENCES kf_clients(id) ON DELETE CASCADE,
    principal NUMERIC(15, 2) NOT NULL DEFAULT 0,
    interest_rate NUMERIC(5, 2) DEFAULT 0,
    duration INTEGER DEFAULT 0,
    type TEXT DEFAULT 'monthly',
    start_date DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_kf_loans_user_id ON kf_loans(user_id);
CREATE INDEX IF NOT EXISTS idx_kf_loans_client_id ON kf_loans(client_id);
CREATE INDEX IF NOT EXISTS idx_kf_loans_status ON kf_loans(status);

-- 5. Payments Table
CREATE TABLE IF NOT EXISTS kf_payments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES kf_users(id) ON DELETE CASCADE,
    loan_id TEXT NOT NULL REFERENCES kf_loans(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_kf_payments_user_id ON kf_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_kf_payments_loan_id ON kf_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_kf_payments_date ON kf_payments(date);

-- Success message
SELECT 'KaasFlow tables created successfully!' AS message;
```

---

### Step 4: Enable Row Level Security (RLS)

For security, enable RLS on all tables. Run this SQL:

```sql
-- Enable Row Level Security
ALTER TABLE kf_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kf_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE kf_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE kf_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE kf_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (backend has full access)
CREATE POLICY "Service role has full access to users"
    ON kf_users FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to settings"
    ON kf_settings FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to clients"
    ON kf_clients FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to loans"
    ON kf_loans FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role has full access to payments"
    ON kf_payments FOR ALL
    USING (true)
    WITH CHECK (true);

-- Success message
SELECT 'Row Level Security configured successfully!' AS message;
```

---

### Step 5: Verify Tables Created

In Supabase dashboard:
1. Go to **"Table Editor"** in left sidebar
2. You should see these tables:
   - ✅ `kf_users`
   - ✅ `kf_settings`
   - ✅ `kf_clients`
   - ✅ `kf_loans`
   - ✅ `kf_payments`

---

## 🔄 How Auto-Sync Works

Once tables are created, your app automatically syncs data:

### When Data Is Saved:
```
User adds/edits Client/Loan/Payment
    ↓
Saved to localStorage (instant)
    ↓
Auto-synced to Supabase (2 seconds later)
    ↓
✅ Data in cloud!
```

### When User Logs In:
```
User logs in
    ↓
App checks Supabase
    ↓
Pulls latest data
    ↓
Merges with localStorage
    ↓
✅ Data synced!
```

---

## 🧪 Test the Sync

### Method 1: Check Backend Status
Open in browser:
```
http://localhost:5000/api/sync/status
```

Or for production:
```
https://www.samkass.site/api/sync/status
```

**Expected response:**
```json
{
  "supabase_configured": true,
  "supabase_url": "https://eahyuwpejwbqzzolajzr.supabase.co"
}
```

### Method 2: Test in App
1. Login to your app
2. Add a client
3. Wait 2-3 seconds
4. Go to Supabase dashboard → Table Editor → `kf_clients`
5. ✅ Your client should be there!

---

## 📊 Data Flow Architecture

```
┌─────────────────────────────────────┐
│         User's Browser              │
│  (localStorage + UI)                │
└──────────────┬──────────────────────┘
               │
               │ Auto-sync every 2 sec
               ↓
┌─────────────────────────────────────┐
│      Flask Backend (Port 5000)      │
│  POST /api/sync/backup              │
│  GET  /api/sync/restore             │
└──────────────┬──────────────────────┘
               │
               │ Service Role Key
               ↓
┌─────────────────────────────────────┐
│   Supabase (Cloud Database)         │
│  Tables:                            │
│    - kf_users                       │
│    - kf_clients                     │
│    - kf_loans                       │
│    - kf_payments                    │
│    - kf_settings                    │
└─────────────────────────────────────┘
```

---

## ⚙️ Configuration Files (Already Set)

### Backend `.env` ✅
```env
SUPABASE_URL=https://eahyuwpejwbqzzolajzr.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### Frontend `supabase_sync.js` ✅
- Auto-syncs every 2 seconds
- Calls `/api/sync/backup` endpoint
- Merges cloud data on login

### Backend `supabase_db.py` ✅
- Handles all database operations
- Uses service role key for full access
- Maps data between frontend and database

---

## 🐛 Troubleshooting

### Issue: "Failed to sync"
**Check:**
1. Backend is running (`http://localhost:5000`)
2. Tables exist in Supabase
3. RLS policies are set

### Issue: "No data in Supabase"
**Solution:**
1. Add a client in your app
2. Wait 2-3 seconds
3. Check browser console for sync success
4. Check Supabase table editor

### Issue: "Service role key error"
**Check:**
1. `.env` file has correct `SUPABASE_SERVICE_ROLE_KEY`
2. Restart backend after .env changes
3. Key matches the one from Supabase dashboard

---

## ✅ Checklist

- [ ] Ran SQL in Supabase SQL Editor (tables)
- [ ] Ran RLS SQL in Supabase (security policies)
- [ ] Verified tables exist in Table Editor
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5500
- [ ] Added test client in app
- [ ] Verified client appears in Supabase
- [ ] Sync working automatically

---

## 🎉 Summary

**Your Primary Supabase is configured!**

Once you run the SQL scripts in Supabase dashboard:
- ✅ All clients automatically sync
- ✅ All loans automatically sync
- ✅ All payments automatically sync
- ✅ Settings automatically sync
- ✅ Data persists across devices
- ✅ No manual sync needed!

**Just create the tables and it works!** 🚀
