# Supabase Integration Files Guide

This guide explains each Supabase file and how to use them.

## 📁 Backend Files

### 1. `supabase_client.py` - Core Client
**Purpose**: Centralized Supabase client management  
**Key Classes**: `SupabaseManager`, `SupabaseService`

**Usage:**
```python
from supabase_client import supabase_service

# Get user
user = supabase_service.get_user_by_email('user@example.com')

# Save backup
supabase_service.save_backup('user@example.com', backup_data)

# Query custom table
results = supabase_service.query_table('users', {'is_active': True})
```

**Methods:**
- User operations: `get_user()`, `get_user_by_email()`, `create_user()`, `update_user()`
- Backup: `save_backup()`, `get_backup()`
- Subscriptions: `get_subscription()`, `create_subscription()`, `update_subscription()`
- Generic: `query_table()`, `insert_record()`, `update_record()`, `delete_record()`

---

### 2. `supabase_migrations.py` - Database Schema
**Purpose**: Database table definitions and setup guide  
**Functions**: `create_*_table()`, `setup_rls_policies()`, `print_setup_guide()`

**Usage:**
```bash
# View SQL to run in dashboard
python3 supabase_migrations.py

# Create all tables and indexes
# (Copy SQL from output and run in Supabase SQL Editor)
```

**Output:**
- Table schemas (users, subscriptions, app_backups, audit_logs)
- Index definitions
- RLS policy templates
- Full setup guide

**When to Use:**
- First-time setup: Run once to see schema
- Add new tables: Add function and re-run
- Document schema: Reference for updates

---

### 3. `test_supabase_connection.py` - Connection Test
**Purpose**: Verify Supabase is configured and accessible  
**Functions**: `test_connection()`, `check_tables()`, `test_sample_query()`

**Usage:**
```bash
# Run full test suite
python3 test_supabase_connection.py

# Expected output on success
✅ ALL TESTS PASSED!
```

**Checks:**
- ✓ Environment variables loaded
- ✓ Client initialized
- ✓ Database accessible
- ✓ All required tables exist
- ✓ Can execute queries
- ✓ Connection info valid

**When to Use:**
- After setup
- Before deployment
- Troubleshooting connection issues
- CI/CD pipeline

---

### 4. `supabase_auth_integration.py` - Authentication
**Purpose**: User registration, login, password management  
**Key Class**: `AuthIntegration`

**Usage:**
```python
from supabase_auth_integration import AuthIntegration

# Register
success, response = AuthIntegration.register(
    email='user@example.com',
    password='secure_password',
    name='John Doe',
    phone='+1234567890'
)

# Login
success, response = AuthIntegration.login(
    email='user@example.com',
    password='secure_password'
)

# Update profile
success, response = AuthIntegration.update_profile(
    user_id='uuid',
    updates={'name': 'Jane Doe'}
)

# Change password
success, response = AuthIntegration.change_password(
    user_id='uuid',
    old_password='current_password',
    new_password='new_password'
)
```

**Features:**
- Password hashing with PBKDF2
- JWT token generation
- Last login tracking
- Profile management
- Password reset

**Flask Integration:**
```python
from supabase_auth_integration import setup_auth_routes

setup_auth_routes(app, url_prefix='/api/auth')
# Adds: /register, /login, /profile, /change-password
```

---

### 5. Updated `app.py` - Main Application
**Changes Made:**
- Imports: Added `supabase_client` module
- Client: Uses `SupabaseManager` singleton
- Routes: Sync endpoints use `supabase_service`

**New Sync Endpoints:**
```
GET  /api/sync/status  → Check Supabase status
POST /api/sync/backup  → Save app data
GET  /api/sync/restore → Load app data
```

**Usage:**
```python
# Already integrated, no changes needed
python3 app.py
```

---

## 🌐 Frontend Files

### 1. `supabase.js` - Frontend Integration
**Purpose**: Automatic cloud backup and restore  
**Key Class**: `SupabaseIntegration`

**Features:**
- Auto-backup every 5 minutes
- Manual backup/restore
- Error handling with notifications
- Auth header management
- Connection status check

**Usage:**
```javascript
// Auto-initialized on page load
supabaseIntegration

// Manual backup
await supabaseIntegration.manualBackup();

// Manual restore
await supabaseIntegration.manualRestore();

// Check status
const status = await supabaseIntegration.checkConnectionStatus();

// Custom interval
supabaseIntegration.BACKUP_INTERVAL = 10 * 60 * 1000; // 10 min

// Start/stop
supabaseIntegration.startAutoBackup();
supabaseIntegration.stopAutoBackup();
```

**HTML Integration:**
```html
<script src="supabase.js"></script>

<button onclick="manualSyncNow()">Sync Now</button>
<button onclick="restoreFromCloud()">Restore</button>
```

**Configuration:**
```javascript
// Change backup interval (milliseconds)
supabaseIntegration.BACKUP_INTERVAL = 5 * 60 * 1000;

// Change API base URL
supabaseIntegration.API_BASE = 'https://api.example.com';
```

---

## 📚 Documentation Files

### 1. `SUPABASE_INTEGRATION_SETUP.md` - Complete Setup Guide
**Contents:**
- Quick start (5 minutes)
- Backend setup instructions
- Frontend integration
- Database schema details
- Security & RLS configuration
- API reference
- Troubleshooting guide

**Use**: Reference during setup

---

### 2. `SUPABASE_QUICK_REFERENCE.md` - Cheat Sheet
**Contents:**
- Quick start (5 minutes)
- Common tasks
- Database info
- API endpoints
- Frontend integration
- FAQ
- Troubleshooting table

**Use**: Daily reference

---

### 3. `SUPABASE_IMPLEMENTATION_CHECKLIST.md` - Step-by-Step
**Contents:**
- Setup phase checklist
- Next steps (action items)
- Verification phase
- Testing scenarios
- Production checklist
- Monitoring tasks

**Use**: Track implementation progress

---

### 4. `SUPABASE_FILES_GUIDE.md` - This File
**Contents**: Description of each file and how to use it

**Use**: Navigate the codebase

---

## 🔄 File Dependencies

```
app.py
├── supabase_client.py
│   └── SupabaseManager (singleton)
│       └── supabase_service (global instance)
├── supabase_auth_integration.py
│   └── AuthIntegration (uses supabase_service)
└── auth/routes.py (uses sync endpoints)

index.html
└── supabase.js
    └── SupabaseIntegration (frontend auto-backup)
```

---

## 🚀 Typical Workflow

### Development
```bash
1. Edit code
2. python3 test_supabase_connection.py  # Verify connection
3. python3 app.py                        # Run backend
4. Open index.html in browser
5. Test backup/restore manually
6. Check data in Supabase dashboard
```

### Deployment
```bash
1. Update .env with production credentials
2. python3 test_supabase_connection.py  # Verify connection
3. Run migrations if tables missing
4. Deploy backend
5. Deploy frontend
6. Monitor sync operations
```

### Troubleshooting
```bash
1. python3 test_supabase_connection.py  # Check connection
2. Check .env credentials
3. Review browser console logs
4. Check Supabase dashboard for errors
5. Review audit logs in database
```

---

## 📊 File Sizes & Performance

| File | Size | Purpose |
|------|------|---------|
| supabase_client.py | ~8 KB | Core service |
| supabase_migrations.py | ~12 KB | Setup guide |
| test_supabase_connection.py | ~7 KB | Testing |
| supabase_auth_integration.py | ~15 KB | Auth |
| supabase.js | ~8 KB | Frontend |

---

## 🔒 Security Notes

**What to Keep Secret:**
- `SUPABASE_SERVICE_ROLE_KEY` - In backend `.env` only
- `SUPABASE_URL` - Can be public
- `SUPABASE_ANON_KEY` - Can be public

**What's Public:**
- `supabase.js` - Frontend code
- Database schema - Inferred from API
- User IDs - Anonymous

**Best Practices:**
- Never commit `.env` to Git
- Use `.env.example` for template
- Rotate keys regularly
- Enable RLS on all tables
- Validate input on backend

---

## 💡 Usage Examples

### Example 1: Get User Data
```python
# Backend
from supabase_client import supabase_service

user = supabase_service.get_user_by_email('user@example.com')
print(user)
# {'id': 'uuid', 'email': '...', 'name': '...', ...}
```

### Example 2: Backup App State
```python
# Backend
backup = {
    'clients': [...],
    'loans': [...],
    'payments': [...],
    'settings': {}
}

supabase_service.save_backup('user@example.com', backup)
```

### Example 3: Frontend Auto-Sync
```javascript
// Frontend - automatically runs every 5 minutes
// No action needed, just include supabase.js
<script src="supabase.js"></script>
```

### Example 4: Manual Restore
```javascript
// User clicks restore button
if (await supabaseIntegration.manualRestore()) {
    location.reload();  // Refresh page with restored data
}
```

---

## ⚡ Performance Tips

### Backend
- Use indexes on frequently queried columns
- Batch operations when possible
- Close connections properly
- Monitor query performance

### Frontend
- Debounce backup triggers
- Compress large backups
- Cache backup status
- Show loading state

### Database
- Create indexes (done in migrations.py)
- Enable RLS (security + performance)
- Archive old audit logs
- Monitor table sizes

---

## 📖 Related Documentation

- [Setup Guide](./SUPABASE_INTEGRATION_SETUP.md)
- [Quick Reference](./SUPABASE_QUICK_REFERENCE.md)
- [Implementation Checklist](./SUPABASE_IMPLEMENTATION_CHECKLIST.md)
- [Supabase Official Docs](https://supabase.com/docs)

---

## ❓ FAQ

**Q: Can I use this without Supabase?**  
A: Yes, the sync endpoints will just fail gracefully. App works offline.

**Q: How much data can I backup?**  
A: Supabase allows up to 1GB per project. Most backups are <10MB.

**Q: Can I backup other data formats?**  
A: Yes, modify `SupabaseService.save_backup()` to handle your data.

**Q: Is automatic backup required?**  
A: No, you can disable it and use manual backup only.

**Q: Where's my backup stored?**  
A: In the `app_backups` table, one row per user email.

---

**Last Updated**: June 2026  
**Created by**: Kiro AI Assistant  
**Status**: Production Ready ✅
