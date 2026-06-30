# Supabase Migration Checklist

## Pre-Migration
- [ ] Backup existing database (export all data)
- [ ] Note down current SUPABASE_URL and SERVICE_ROLE_KEY
- [ ] Test current backend is working

## New Supabase Setup
- [ ] Create new Supabase project at supabase.com
- [ ] Wait for project initialization (2-3 min)
- [ ] Copy Project URL from Settings → API
- [ ] Copy Service Role Key from Settings → API

## Backend Configuration
- [ ] Update `kaasflow/backend/.env`:
  - [ ] `SUPABASE_URL=https://[new-project-id].supabase.co`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY=[new-service-role-key]`
  - [ ] `SUPABASE_SERVICE_KEY=[same-as-above]`

## Database Schema
- [ ] Go to Supabase SQL Editor
- [ ] Create new query
- [ ] Paste schema from SUPABASE_SETUP_GUIDE.md Step 4
- [ ] Run query
- [ ] Verify all 5 tables created (kf_users, kf_settings, kf_clients, kf_loans, kf_payments)

## Testing
- [ ] Run connection test:
  ```bash
  cd kaasflow/backend
  python test_supabase_connection.py
  ```
- [ ] Expected: "✓ Connection successful!"

## Data Migration (if needed)
- [ ] Option 1: Manual sync
  - [ ] Export data from old Supabase
  - [ ] Import to new Supabase
- [ ] Option 2: Automatic sync
  - [ ] Restart backend (new .env loaded)
  - [ ] Users re-authenticate
  - [ ] Data syncs automatically

## Production Deployment
- [ ] Add environment variables to Vercel (or your hosting platform)
- [ ] Redeploy backend
- [ ] Test login and data sync
- [ ] Monitor logs for errors

## Verification
- [ ] Frontend loads without errors
- [ ] Login works
- [ ] Can create clients
- [ ] Can create loans
- [ ] Can record payments
- [ ] Data persists after refresh
- [ ] Data visible in Supabase dashboard

## Cleanup (Optional)
- [ ] Delete old Supabase project (if not needed)
- [ ] Remove old .env.backup
- [ ] Archive old credentials file

---

**Timeline**: ~30 minutes total
**Downtime**: None (old Supabase works until migration complete)
