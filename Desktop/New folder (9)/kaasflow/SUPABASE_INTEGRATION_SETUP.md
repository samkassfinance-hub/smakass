# Supabase Integration Setup Guide

This guide walks you through setting up and using Supabase for KaasFlow.

## 📋 Overview

Supabase provides:
- **Authentication**: User management and JWT tokens
- **Database**: PostgreSQL database for persistent storage
- **Real-time Sync**: Cloud backup and restore functionality
- **Audit Logs**: Track user actions for compliance

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd kaasflow/backend
pip install -r requirements.txt
```

The `supabase` package (v2.4.0+) is already in `requirements.txt`.

### 2. Verify Environment Variables

Check that `kaasflow/backend/.env` has:

```env
SUPABASE_URL=https://puhovplmbaldrisxqssy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ Your credentials are already configured!

### 3. Test Connection

```bash
python3 test_supabase_connection.py
```

Expected output:
```
✅ ALL TESTS PASSED!
```

### 4. Set Up Database Tables

Run the SQL commands from the migration guide:

```bash
python3 supabase_migrations.py
```

This prints SQL to run in your Supabase dashboard:
1. Go to https://app.supabase.com/project/puhovplmbaldrisxqssy/editor
2. Click "New Query"
3. Copy and run the SQL from the output

## 📦 Backend Usage

### Service Layer

Use the `SupabaseService` for all database operations:

```python
from supabase_client import supabase_service

# Get user by email
user = supabase_service.get_user_by_email('user@example.com')

# Create user
new_user = supabase_service.create_user({
    'email': 'new@example.com',
    'name': 'John Doe',
    'phone': '+1234567890'
})

# Update user
supabase_service.update_user(user_id, {'name': 'Jane Doe'})

# Backup app data
backup_data = {
    'clients': [...],
    'loans': [...],
    'payments': [...],
    'settings': {...}
}
supabase_service.save_backup('user@example.com', backup_data)

# Restore app data
backup = supabase_service.get_backup('user@example.com')
```

### API Routes

The backend exposes these sync endpoints:

```
GET  /api/sync/status       - Check if Supabase is configured
POST /api/sync/backup       - Backup app data
GET  /api/sync/restore      - Restore app data
```

Example request:
```javascript
// Backup data
fetch('http://localhost:5000/api/sync/backup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'X-User-Email': 'user@example.com'
  },
  body: JSON.stringify({
    clients: [],
    loans: [],
    payments: [],
    settings: {}
  })
})
```

## 💻 Frontend Usage

### Include Supabase Script

Add to `kaasflow/frontend/index.html`:

```html
<script src="supabase.js"></script>
```

### Automatic Backup

Supabase automatically backs up data every 5 minutes. To customize:

```javascript
// Change backup interval (in milliseconds)
supabaseIntegration.BACKUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

// Stop auto-backup
supabaseIntegration.stopAutoBackup();

// Start auto-backup
supabaseIntegration.startAutoBackup();
```

### Manual Operations

```javascript
// Backup data now
await supabaseIntegration.manualBackup();

// Restore from cloud
await supabaseIntegration.manualRestore();

// Check connection
const status = await supabaseIntegration.checkConnectionStatus();
```

### UI Integration

Add sync buttons to your interface:

```html
<button onclick="manualSyncNow()">
  📤 Sync to Cloud
</button>

<button onclick="restoreFromCloud()">
  📥 Restore from Cloud
</button>
```

## 🗄️ Database Tables

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  provider VARCHAR(50),
  provider_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  last_login TIMESTAMP
);
```

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  start_date TIMESTAMP DEFAULT now(),
  end_date TIMESTAMP,
  renewal_date TIMESTAMP,
  client_limit INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### App Backups Table

```sql
CREATE TABLE app_backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email VARCHAR(255) NOT NULL UNIQUE,
  clients_json JSONB DEFAULT '[]',
  loans_json JSONB DEFAULT '[]',
  payments_json JSONB DEFAULT '[]',
  settings_json JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### Audit Logs Table

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id VARCHAR(255),
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

## 🔐 Security & Row Level Security (RLS)

### Enable RLS

Run in Supabase SQL editor:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

### Create Policies

```sql
-- Users can see their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own backups
CREATE POLICY "Users can view own backups"
  ON app_backups FOR SELECT
  USING (true);  -- Backend validates user_email
```

## 📊 Monitoring

### Check Sync Status

```bash
curl http://localhost:5000/api/sync/status
```

### View Audit Logs

```python
from supabase_client import supabase_service

logs = supabase_service.query_table('audit_logs', {'user_id': user_id})
```

## 🛠️ Troubleshooting

### Connection Issues

```bash
# Test connection
python3 test_supabase_connection.py

# Check environment
python3 -c "import os; from dotenv import load_dotenv; load_dotenv(); print('SUPABASE_URL:', os.environ.get('SUPABASE_URL'))"
```

### Missing Tables

If tables don't exist:
1. Go to Supabase dashboard → SQL Editor
2. Run the SQL from `supabase_migrations.py`
3. Create indexes for performance

### Auth Issues

Ensure you're sending auth tokens:

```python
headers = {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'X-User-Email': 'user@example.com'
}
```

### Slow Backups

Add indexes to `app_backups` table:

```sql
CREATE INDEX idx_app_backups_email ON app_backups(user_email);
```

## 📝 API Reference

### Backend Service

```python
from supabase_client import supabase_service

# User operations
supabase_service.get_user(user_id)
supabase_service.get_user_by_email(email)
supabase_service.create_user(data)
supabase_service.update_user(user_id, updates)

# Backup operations
supabase_service.save_backup(user_email, backup_data)
supabase_service.get_backup(user_email)

# Subscription operations
supabase_service.get_subscription(user_id)
supabase_service.create_subscription(data)
supabase_service.update_subscription(subscription_id, updates)

# Generic operations
supabase_service.query_table(table_name, filters)
supabase_service.insert_record(table_name, data)
supabase_service.update_record(table_name, record_id, updates)
supabase_service.delete_record(table_name, record_id)
```

### Frontend Integration

```javascript
supabaseIntegration.checkConnectionStatus()
supabaseIntegration.backupData()
supabaseIntegration.restoreData()
supabaseIntegration.startAutoBackup()
supabaseIntegration.stopAutoBackup()
supabaseIntegration.manualBackup()
supabaseIntegration.manualRestore()
```

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Python Client Library](https://supabase.com/docs/reference/python/introduction)
- [SQL Editor Guide](https://supabase.com/docs/guides/database/sql-editor)
- [Authentication](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## ✅ Setup Checklist

- [x] Install `supabase` package
- [ ] Verify `.env` credentials
- [ ] Run `test_supabase_connection.py`
- [ ] Run migration SQL in dashboard
- [ ] Enable RLS on tables
- [ ] Create RLS policies
- [ ] Include `supabase.js` in frontend
- [ ] Test backup/restore flow
- [ ] Monitor sync operations

## 🎯 Next Steps

1. **Test the integration**: Run the test script and verify all tables exist
2. **Deploy to production**: Update `.env` with production credentials
3. **Monitor usage**: Check Supabase dashboard for data and usage metrics
4. **Scale backups**: Add more workers if backup volume increases
5. **Enable notifications**: Send users updates on sync status

---

For questions or issues, check the Supabase documentation or contact support.
