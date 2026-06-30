# Complete Supabase Setup Guide for KaasFlow

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Project name**: `kaasflow-prod` (or your preferred name)
   - **Database password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for initialization (2-3 minutes)

## Step 2: Get Your Credentials

Once your project is ready:

1. Go to **Settings** → **API** (left sidebar)
2. Copy these values:
   - **Project URL**: `https://[project-id].supabase.co`
   - **Service Role Key** (under "Project API keys")
   - **Anon Key** (for frontend, if needed)

Example:
```
SUPABASE_URL=https://abcdefghij.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Update Backend Environment Variables

### In `kaasflow/backend/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Existing configs (keep these)
RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## Step 4: Create Database Schema

In Supabase dashboard:
1. Go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Paste this schema:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS kf_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  financier_name TEXT DEFAULT '',
  business_name TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS kf_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES kf_users(id) ON DELETE CASCADE,
  financier_name TEXT DEFAULT '',
  business_name TEXT DEFAULT '',
  theme TEXT DEFAULT 'dark',
  lang TEXT DEFAULT 'en',
  extra_clients INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create clients table
CREATE TABLE IF NOT EXISTS kf_clients (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES kf_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  id_num TEXT DEFAULT '',
  occupation TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create loans table
CREATE TABLE IF NOT EXISTS kf_loans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES kf_users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES kf_clients(id) ON DELETE CASCADE,
  principal NUMERIC DEFAULT 0,
  interest_rate NUMERIC DEFAULT 0,
  duration INTEGER DEFAULT 0,
  type TEXT DEFAULT 'monthly',
  start_date TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS kf_payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES kf_users(id) ON DELETE CASCADE,
  loan_id TEXT NOT NULL REFERENCES kf_loans(id) ON DELETE CASCADE,
  amount NUMERIC DEFAULT 0,
  date TEXT DEFAULT '',
  note TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_kf_clients_user_id ON kf_clients(user_id);
CREATE INDEX idx_kf_loans_user_id ON kf_loans(user_id);
CREATE INDEX idx_kf_loans_client_id ON kf_loans(client_id);
CREATE INDEX idx_kf_payments_user_id ON kf_payments(user_id);
CREATE INDEX idx_kf_payments_loan_id ON kf_payments(loan_id);
```

4. Click "Run"
5. Verify all tables appear in the left sidebar under "Database"

## Step 5: Configure Row Level Security (RLS) - Optional but Recommended

For added security, enable RLS on tables:

1. Go to **Authentication** → **Policies** (left sidebar)
2. For each table, create policies to ensure users only access their own data:

```sql
-- Enable RLS on all tables
ALTER TABLE kf_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kf_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE kf_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE kf_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE kf_payments ENABLE ROW LEVEL SECURITY;

-- Allow users to read/write only their own data
CREATE POLICY "Users can access own data"
  ON kf_users FOR ALL
  USING (id = auth.uid());
```

## Step 6: Test Connection

Create `kaasflow/backend/test_supabase_connection.py`:

```python
import os
from supabase_db import SupabaseDB

# Test connection
try:
    user = SupabaseDB.get_user_by_email("test@example.com")
    print("✓ Connection successful!")
    print(f"Query result: {user}")
except Exception as e:
    print(f"✗ Connection failed: {e}")
```

Run:
```bash
cd kaasflow/backend
python test_supabase_connection.py
```

Expected output:
```
✓ Connection successful!
Query result: None
```

## Step 7: Frontend Configuration (if using client-side sync)

In `kaasflow/frontend/supabase_client.py` or similar:

```python
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")  # Use anon key for frontend
```

Or in JavaScript (`kaasflow/frontend/supabase_sync.js`):

```javascript
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

## Step 8: Deploy to Production

### For Vercel:

1. Go to your Vercel project settings
2. Add environment variables:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. Redeploy your backend

### For other platforms:
Add the same environment variables in your platform's secrets/env section.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Connection refused` | Check SUPABASE_URL is correct (includes https://) |
| `401 Unauthorized` | Verify SERVICE_ROLE_KEY is correct (not Anon Key) |
| `Foreign key constraint failed` | Ensure parent user exists before inserting related data |
| `No such table` | Run schema SQL script from Step 4 |

## Backup & Migration

To migrate from old Supabase to new:

1. Export old data:
   ```bash
   python kaasflow/backend/test_integration.py
   ```

2. Import to new Supabase:
   - Use the same SQL schema
   - Update `.env` with new credentials
   - Restart backend

## Quick Reference

```bash
# Test backend connection
cd kaasflow/backend
python test_supabase_connection.py

# View logs
tail -f logs/app.log

# Restart backend after .env changes
npm run restart:backend
```

---

**Done!** Your new Supabase instance is ready. Backend will automatically sync all data.
