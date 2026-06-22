# 🔧 Supabase Table Setup - Quick Fix Guide

## 🚨 Problem

When trying to view data in the Supabase table editor, you see:
```
Could not find the table 'public.users' in the schema cache
```

**Reason:** The required tables (users, subscriptions, app_backups, audit_logs) don't exist yet.

## ✅ Solution - 2 Steps

### Step 1: Copy SQL Script

```bash
kaasflow/backend/SUPABASE_SETUP.sql
```

This file contains all the SQL needed to create the tables.

### Step 2: Run in Supabase Dashboard

1. **Open Supabase SQL Editor:**
   - Go to: https://app.supabase.com/project/puhovplmbaldrisxqssy/editor
   - Click: "New Query"

2. **Copy-Paste the SQL:**
   - Open: `kaasflow/backend/SUPABASE_SETUP.sql`
   - Copy entire content
   - Paste into Supabase SQL editor

3. **Execute:**
   - Click: "Run" button
   - Wait for completion (2-3 seconds)

4. **Verify:**
   - Go to: "Table Editor" tab
   - You should now see:
     - ✅ users
     - ✅ subscriptions
     - ✅ app_backups
     - ✅ audit_logs

## 📊 What Gets Created

### Tables
- **users** - User accounts with authentication info
- **subscriptions** - Subscription plans and limits
- **app_backups** - Cloud-synced app data
- **audit_logs** - User action tracking

### Indexes
- idx_users_email
- idx_subscriptions_user_id
- idx_app_backups_user_email
- idx_audit_logs_user_id

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies allow backend to validate access

## 🧪 Test After Setup

```bash
cd kaasflow/backend
python3 test_supabase_connection.py
```

**Expected output:**
```
✅ ALL TESTS PASSED!
```

## 📋 SQL Script Contents

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables:
--   1. users
--   2. subscriptions
--   3. app_backups
--   4. audit_logs

-- Create indexes for performance

-- Enable Row Level Security (RLS)

-- Create RLS policies
```

## 🔄 Full Process

```
1. Open Supabase SQL Editor
   ↓
2. Copy SUPABASE_SETUP.sql content
   ↓
3. Paste into SQL editor
   ↓
4. Click "Run"
   ↓
5. Tables created ✅
   ↓
6. Go to Table Editor
   ↓
7. See all 4 tables with data ✅
```

## ⚡ Quick Copy-Paste

If you prefer, here's the essential SQL (shorter version):

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    plan_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE app_backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(255) NOT NULL UNIQUE,
    clients_json JSONB,
    loans_json JSONB,
    payments_json JSONB,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100),
    created_at TIMESTAMP DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

## 📞 Troubleshooting

### Still seeing error?

1. **Check dashboard:**
   - Go to: https://app.supabase.com/project/puhovplmbaldrisxqssy/editor
   - Look for tables in left sidebar

2. **If tables don't appear:**
   - Refresh page (F5)
   - Close and reopen SQL editor

3. **If SQL fails:**
   - Check for typos
   - Use the full SUPABASE_SETUP.sql file
   - Run one table at a time if needed

### Connection still failing?

```bash
# Test connection
python3 test_supabase_connection.py

# Check .env credentials
grep SUPABASE .env

# Verify Supabase project is active
```

## ✅ Completion Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Copied SUPABASE_SETUP.sql content
- [ ] Pasted into SQL editor
- [ ] Clicked "Run"
- [ ] SQL executed successfully
- [ ] Went to Table Editor
- [ ] See users table
- [ ] See subscriptions table
- [ ] See app_backups table
- [ ] See audit_logs table
- [ ] Ran test_supabase_connection.py
- [ ] Test shows "ALL TESTS PASSED"

## 🎉 Done!

Your Supabase tables are now ready to use. You can:
- ✅ Insert test data in Table Editor
- ✅ View data in dashboard
- ✅ Test backend sync operations
- ✅ Deploy to production

---

**File:** kaasflow/backend/SUPABASE_SETUP.sql  
**Status:** Ready to use ✅  
**Time to complete:** ~2 minutes
