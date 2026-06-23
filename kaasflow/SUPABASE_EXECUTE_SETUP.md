# Supabase Database Setup Guide

## ✅ Status: READY TO EXECUTE

Your Supabase instance is **fully connected** and ready for table creation.

**Project Details:**
- URL: https://puhovplmbaldrisxqssy.supabase.co
- Project ID: puhovplmbaldrisxqssy
- Status: ✅ Connection verified and working

---

## 📋 Quick Setup (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://app.supabase.com/project/puhovplmbaldrisxqssy
2. Click on the **SQL Editor** tab (left sidebar)
3. Click **"New query"** button

### Step 2: Copy and Paste SQL

Copy the entire contents of:
```
kaasflow/backend/SUPABASE_SETUP.sql
```

Paste into the SQL Editor window.

### Step 3: Execute

Click the **"Run"** button (or press `Ctrl+Enter`)

**Expected output:**
```
Success! Your SQL was executed.
```

### Step 4: Verify Tables Created

Still in SQL Editor, run:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

You should see these tables:
- ✅ users
- ✅ app_backups
- ✅ subscriptions
- ✅ kf_payments
- ✅ audit_log
- ✅ magic_links
- ✅ email_logs
- ✅ whatsapp_messages

---

## 🔍 What Gets Created

### 1. **Users Table**
Stores user account information
- Email, name, phone
- Subscription status
- Login tracking

### 2. **App Backups Table**
Stores user's app data (clients, loans, payments, settings)
- Syncs every 5 minutes
- Per-user backup isolation

### 3. **Subscriptions Table**
Tracks user plans and subscription status
- Plan type (free, pro, etc.)
- Client/Loan/Payment limits
- Renewal dates

### 4. **Payments Table** (kf_payments)
Razorpay payment history
- Order IDs, amounts
- Payment status
- Transaction metadata

### 5. **Additional Tables**
- audit_log - Event tracking
- magic_links - Passwordless login
- email_logs - Email delivery tracking
- whatsapp_messages - WhatsApp reminders

---

## 🔐 Security Features Included

✅ **Row Level Security (RLS)** - Users can only access their own data
✅ **Indexes** - Optimized queries for fast lookups
✅ **Triggers** - Automatic timestamp updates
✅ **UUID** - Unique identifiers for all records
✅ **Foreign Keys** - Data integrity constraints

---

## ✅ Verification Steps

After execution, verify everything works:

### 1. Check Backend Connection
```bash
cd kaasflow/backend
python3 test_supabase_connection.py
```

Expected output:
```
✅ Supabase client created successfully
✅ Connection successful - can query 'users' table
✅ SupabaseManager initialized successfully
✅ All basic connection tests passed!
```

### 2. Check Sync Endpoints

Start backend:
```bash
python3 kaasflow/backend/app.py
```

Test endpoints:
```bash
# Check if Supabase is configured
curl http://localhost:5000/api/sync/status

# Check environment
curl http://localhost:5000/api/debug-env
```

### 3. Test Data Backup

In your app:
1. Add some clients/loans
2. Click manual sync or wait 5 minutes
3. Check Supabase dashboard - data should appear

---

## 🐛 Troubleshooting

### Error: "Table already exists"
**Solution:** Tables already created successfully. Run verification SQL to check.

### Error: "duplicate key value"
**Solution:** You already have test data. Delete and re-run, or just verify using app.

### Error: "permission denied"
**Solution:** Make sure you're using the **Service Role Key** (check .env file)

### Tables don't appear
1. Refresh the Supabase page
2. Check Tables section in left sidebar
3. Verify no SQL errors occurred

---

## 📊 Database Architecture

```
Users
  ├── Subscriptions (user_id)
  ├── App Backups (user_email)
  ├── Payments (user_id)
  ├── Audit Log (user_email)
  └── Magic Links (email)

Additional Tables:
  ├── Email Logs
  └── WhatsApp Messages
```

---

## 🚀 What Happens After Setup

1. **Frontend syncs data** every 5 minutes to app_backups table
2. **Backend receives sync requests** at `/api/sync/backup`
3. **Data persists** across browser sessions
4. **Users can restore** data from cloud using `/api/sync/restore`

---

## 📝 Next Steps

1. ✅ Execute the SQL script (this guide)
2. ✅ Run verification tests
3. ✅ Start the backend server
4. ✅ Test sync operations in the app
5. ✅ Monitor Supabase dashboard

---

## 💡 Tips

- **Backup your data** before making schema changes
- **Use Supabase Dashboard** to browse and manage data
- **Check logs** in audit_log table for debugging
- **Monitor email_logs** to verify email delivery
- **Test WhatsApp** with your phone number

---

## 📞 Support

If you encounter issues:

1. Check Supabase Status: https://status.supabase.com
2. Review Error Messages: They're usually very descriptive
3. Check `.env` file: All credentials must match
4. Verify API Keys: Use the right key for the operation

---

**Everything is ready! Execute the SQL now.** ✨
