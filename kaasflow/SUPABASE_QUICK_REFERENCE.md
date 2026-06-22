# Supabase Quick Reference

## 🚀 Quick Start (5 minutes)

### 1. Test Connection
```bash
cd kaasflow/backend
python3 test_supabase_connection.py
```

### 2. Set Up Tables (Dashboard)
- Open: https://app.supabase.com/project/puhovplmbaldrisxqssy/editor
- Run SQL from: `python3 supabase_migrations.py`
- Takes ~2 minutes

### 3. Enable RLS (Dashboard)
- Go to: https://app.supabase.com/project/puhovplmbaldrisxqssy/auth
- Enable RLS on: users, subscriptions, app_backups, audit_logs

### 4. Test Backend
```bash
# Start backend
python3 app.py

# In another terminal, test sync endpoint
curl -X GET http://localhost:5000/api/sync/status
```

### 5. Add Frontend Script
- Add `<script src="supabase.js"></script>` to `index.html`
- Automatic backups start immediately

---

## 💡 Common Tasks

### Backup User Data
```python
from supabase_client import supabase_service

backup_data = {
    'clients': [...],
    'loans': [...],
    'payments': [...],
    'settings': {...}
}

supabase_service.save_backup('user@example.com', backup_data)
```

### Restore User Data
```python
backup = supabase_service.get_backup('user@example.com')
print(backup)  # {'clients': [...], 'loans': [...], ...}
```

### Check Sync Status
```javascript
const status = await supabaseIntegration.checkConnectionStatus();
console.log(status.supabase_configured);  // true/false
```

### Manual Sync
```javascript
// Backup now
await supabaseIntegration.manualBackup();

// Restore from cloud
await supabaseIntegration.manualRestore();
```

---

## 📊 Database Info

**Project**: puhovplmbaldrisxqssy  
**URL**: https://puhovplmbaldrisxqssy.supabase.co  
**Dashboard**: https://app.supabase.com/project/puhovplmbaldrisxqssy

### Tables
- `users` - User accounts
- `subscriptions` - Subscription plans
- `app_backups` - Cloud backups
- `audit_logs` - User actions

---

## 🔧 API Endpoints

```
GET  /api/sync/status   → Check if Supabase is ready
POST /api/sync/backup   → Save data to cloud
GET  /api/sync/restore  → Get data from cloud
```

---

## 📱 Frontend Integration

```html
<!-- Add to index.html -->
<script src="supabase.js"></script>

<!-- Add buttons -->
<button onclick="manualSyncNow()">Sync to Cloud</button>
<button onclick="restoreFromCloud()">Restore from Cloud</button>

<script>
  // Auto-sync every 5 minutes (default)
  // Auto-restore on login
  // Listen for errors via notifications
</script>
```

---

## ⚡ Performance

- **Backup Interval**: 5 minutes (configurable)
- **Max Backup Size**: 1GB per user (Supabase limit)
- **Sync Timeout**: 30 seconds
- **Auto-retry**: Yes, on network error

---

## 🔐 Security Checklist

- [x] Service Role Key in `.env` (kept secret)
- [x] Anon Key for frontend (public OK)
- [x] JWT tokens for auth (request headers)
- [x] RLS policies enabled on all tables
- [x] User email validation on backend

---

## ❓ FAQ

**Q: Where are my backups stored?**  
A: In Supabase `app_backups` table, one row per user email.

**Q: How often does data sync?**  
A: Every 5 minutes automatically, or manually on-demand.

**Q: Can I restore old backups?**  
A: Currently keeps latest. Add versioning via `created_at` field.

**Q: What if sync fails?**  
A: Retries automatically. Check logs in browser console.

**Q: Is my data encrypted?**  
A: Yes, Supabase encrypts data in transit (HTTPS) and at rest.

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection failed | Run `test_supabase_connection.py` |
| Tables not found | Run migration SQL in dashboard |
| Sync not working | Check browser console for errors |
| Auth fails | Verify JWT token in request header |
| Slow backups | Add index on `user_email` column |

---

## 📞 Support

- Test script: `python3 test_supabase_connection.py`
- Logs: Browser console (frontend) / Terminal (backend)
- Dashboard: https://app.supabase.com/project/puhovplmbaldrisxqssy

---

## 📈 Next Steps

1. ✅ Test connection
2. ✅ Create tables
3. ✅ Enable RLS
4. 🔄 Run pilot test with real data
5. 📊 Monitor usage in dashboard
6. 🚀 Deploy to production
