# Subscription System - Setup Checklist

Complete this checklist to fully deploy the new subscription enforcement system.

---

## Phase 1: Database Setup (15 min)

### Supabase Configuration

- [ ] Log in to Supabase dashboard
- [ ] Navigate to your project
- [ ] Go to SQL Editor
- [ ] Create new query
- [ ] Copy entire contents of `SUBSCRIPTION_SCHEMA.sql`
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] Verify in Tables section:
  - [ ] `subscriptions` table exists
  - [ ] `payment_history` table exists
  - [ ] Indexes are created
  - [ ] Triggers are created

### Verify Tables

In Supabase SQL Editor, run:

```sql
-- Check subscriptions table
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'subscriptions';

-- Check columns
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'subscriptions';

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE tablename = 'subscriptions';
```

All should return results. If not, re-run `SUBSCRIPTION_SCHEMA.sql`.

---

## Phase 2: Backend Setup (20 min)

### File Placement

- [ ] Copy `kaasflow/backend/subscription_manager.py`
  - Destination: `kaasflow/backend/`
  - Verify: `ls kaasflow/backend/subscription_manager.py`

- [ ] Copy `kaasflow/backend/routes/subscription_routes.py`
  - Destination: `kaasflow/backend/routes/`
  - Verify: `ls kaasflow/backend/routes/subscription_routes.py`

### Update app.py

In `kaasflow/backend/app.py`:

- [ ] Add import:
  ```python
  from routes.subscription_routes import subscription_bp
  ```

- [ ] Register blueprint:
  ```python
  app.register_blueprint(subscription_bp, url_prefix='/api')
  ```

- [ ] Verify file saves without errors:
  ```bash
  python kaasflow/backend/app.py --version
  # Should run without import errors
  ```

### Environment Variables

In `kaasflow/backend/.env`, ensure:

- [ ] `SUPABASE_URL` is set
  ```
  SUPABASE_URL=https://your-project.supabase.co
  ```

- [ ] `SUPABASE_SERVICE_KEY` or `SUPABASE_SERVICE_ROLE_KEY` is set
  ```
  SUPABASE_SERVICE_KEY=your-service-key-here
  ```

- [ ] Test connection:
  ```bash
  cd kaasflow/backend
  python -c "
  import os
  from dotenv import load_dotenv
  load_dotenv()
  from subscription_manager import subscription_manager
  print('✅ SubscriptionManager loaded successfully')
  "
  ```

### Test Backend Endpoints

Start backend:

```bash
cd kaasflow/backend
python app.py
# Server should start on http://localhost:5000
```

Test endpoints (in another terminal):

```bash
# Test 1: Get subscription status (free tier default)
curl -X GET \
  'http://localhost:5000/api/subscription/status?email=test@example.com' \
  -H 'X-User-Email: test@example.com'
# Should return: { subscription: { plan_type: "free", ... }, ... }

# Test 2: Check client limit
curl -X POST http://localhost:5000/api/subscription/check-client-limit \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com"}'
# Should return: { can_add: true, current_count: 0, limit: 20, ... }

# Test 3: Get plans
curl -X GET http://localhost:5000/api/subscription/plans
# Should return all 4 paid plans + features
```

Verify all return 200 OK with proper JSON.

- [ ] `/api/subscription/status` returns correct JSON
- [ ] `/api/subscription/check-client-limit` works
- [ ] `/api/subscription/plans` returns all plans
- [ ] No 404 errors
- [ ] No 500 errors

---

## Phase 3: Frontend Setup (15 min)

### File Placement

- [ ] Copy `kaasflow/frontend/subscription-enforcement.js`
  - Destination: `kaasflow/frontend/`
  - Verify: `ls kaasflow/frontend/subscription-enforcement.js`

### Update index.html

In `kaasflow/frontend/index.html`:

- [ ] Add script tag before `</body>`:
  ```html
  <script src="./subscription-enforcement.js"></script>
  ```

- [ ] Verify required libraries are loaded:
  ```html
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <!-- Bootstrap JS -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  ```

### Update app.js

In `kaasflow/frontend/app.js`:

- [ ] Find main initialization function (e.g., `DOMContentLoaded` event)
- [ ] Add subscription initialization:
  ```javascript
  // After existing initialization code
  if (window.SubscriptionEnforcement) {
    await window.SubscriptionEnforcement.initialize();
    console.log('✅ Subscription enforcement initialized');
  } else {
    console.warn('⚠️  SubscriptionEnforcement not loaded');
  }
  ```

- [ ] Add subscription check before rendering each page:
  ```javascript
  // Before renderDashboard(), renderClientsPage(), etc.
  if (window.SubscriptionEnforcement) {
    await window.SubscriptionEnforcement.validateSubscriptionStatus();
  }
  ```

### Update Client Addition Logic

Find your client-adding function (likely `handleAddClientClick()` or `saveClient()`):

- [ ] Add validation before adding:
  ```javascript
  async function handleAddClientClick() {
    // NEW: Check subscription first
    if (window.SubscriptionEnforcement) {
      const canAdd = await window.SubscriptionEnforcement.validateClientAddition();
      if (!canAdd) {
        return; // Block
      }
    }
    
    // OLD: Continue with existing logic
    // ... show form, collect data, etc. ...
  }
  ```

### Update Razorpay Callback

In your Razorpay integration (likely `razorpay.js` or `subscription.js`):

- [ ] Find success callback handler
- [ ] Add subscription refresh:
  ```javascript
  onSuccess: async (response) => {
    // ... existing success handling ...
    
    // NEW: Refresh subscription from server
    if (window.SubscriptionEnforcement) {
      await window.SubscriptionEnforcement.validateSubscriptionStatus();
    }
    
    showToast('✅ Subscription activated!', 'success');
  }
  ```

### Test Frontend in Browser

Start frontend:

```bash
cd kaasflow/frontend
python -m http.server 5500
# Open http://localhost:5500
```

Check browser console for errors:

- [ ] No JavaScript errors
- [ ] See message: "✅ Subscription enforcement initialized"
- [ ] `window.SubscriptionEnforcement` is defined
- [ ] `window.SubscriptionEnforcement.getCurrentSubscription()` returns object

Test API calls:

- [ ] Open Network tab
- [ ] Refresh page
- [ ] Should see GET `/api/subscription/status`
- [ ] Response should have 200 status
- [ ] Response JSON should be valid

---

## Phase 4: Integration Testing (30 min)

### Test 1: New User (Free Tier)

- [ ] New user signup
- [ ] Verify `/api/subscription/status` returns `plan_type: "free"`
- [ ] Add 15 clients - should succeed
- [ ] Add 20th client - should succeed
- [ ] Try to add 21st client - should show upgrade prompt
- [ ] Modal should have 4 plan options

### Test 2: Client Limit Enforcement

- [ ] Backend: Verify table has 20 clients for user
- [ ] Frontend: Try to add via UI - should fail
- [ ] Backend: Try to add via API directly - should return 400
- [ ] Verify error message mentions client limit

### Test 3: Plan Upgrade (1-Day Plan)

- [ ] Free tier user with 20 clients
- [ ] Click "Choose Plan" for 1-Day
- [ ] Complete Razorpay payment with test card
- [ ] Verify `/api/subscription/status` shows `plan_type: "oneday"`
- [ ] Verify `expiry_time` is approximately now + 24 hours
- [ ] Try to add 21st client - should succeed
- [ ] Add 100+ clients - should all succeed

### Test 4: Subscription Expiry

- [ ] Test plan that expires soon (or use 1-day plan)
- [ ] Wait for expiry time to pass (or manually update database for testing)
- [ ] Refresh page
- [ ] Blocking modal should appear:
  - [ ] No close button
  - [ ] Shows "Your subscription has expired"
  - [ ] Shows 4 plan options
  - [ ] "Continue with Free Plan" button works
  - [ ] ESC key doesn't dismiss
  - [ ] Clicking outside doesn't dismiss

### Test 5: Renewal After Expiry

- [ ] Subscription expired, blocking modal showing
- [ ] Click "Choose Plan" for Monthly
- [ ] Complete Razorpay payment
- [ ] Modal should close automatically
- [ ] Verify access restored
- [ ] Try adding clients - should succeed

### Test 6: Multiple Accounts

- [ ] User 1: Free tier, 20 clients
- [ ] User 2: Paid tier, unlimited clients
- [ ] Switch between accounts
- [ ] Each user should see correct subscription status
- [ ] Client limits should be per-user

### Test 7: Offline to Online

- [ ] User with expired plan
- [ ] Turn off internet
- [ ] App still works with last known status
- [ ] Turn on internet
- [ ] Refresh subscription
- [ ] Blocking modal appears (expiry detected)

---

## Phase 5: Security Testing (20 min)

### Test 1: localStorage Tampering

- [ ] Open browser DevTools → Application
- [ ] Try to edit `kf_subscription` in localStorage
- [ ] Refresh page
- [ ] Frontend should fetch fresh status from server
- [ ] Blocking modal should appear if expired

### Test 2: Direct API Bypass

- [ ] Create expired subscription manually
- [ ] Try to call `/api/clients/add` directly
- [ ] Server should validate subscription
- [ ] Should return 403 if expired or 400 if limit reached

### Test 3: Clock Manipulation

- [ ] System clock is single source of truth on server
- [ ] Frontend cannot fake expiry time
- [ ] Backend always uses `datetime.utcnow()`
- [ ] Subscription check based on server time, not client time

### Test 4: Modal Dismissal

- [ ] Expiry modal showing
- [ ] Try ESC key - should not close
- [ ] Try clicking outside - should not close
- [ ] Try clicking X button - button should not exist
- [ ] Only payment buttons should work

---

## Phase 6: Deployment (30 min)

### Pre-Deployment Checklist

- [ ] All tests passing locally
- [ ] No console errors in browser
- [ ] No server errors in backend logs
- [ ] Database is populated and accessible
- [ ] `.env` credentials are correct

### Backend Deployment (Vercel)

```bash
cd kaasflow/backend
git add -A
git commit -m "Add subscription enforcement system"
git push origin main
# Wait for Vercel deployment
# Verify at https://your-backend.vercel.app/health
```

- [ ] Backend deployed successfully
- [ ] Test endpoints return 200:
  ```bash
  curl https://your-backend.vercel.app/api/subscription/plans
  ```

### Frontend Deployment (Vercel/Netlify/your host)

```bash
cd kaasflow/frontend
git add -A
git commit -m "Add subscription enforcement frontend"
git push origin main
# Wait for deployment
```

- [ ] Frontend deployed successfully
- [ ] Test in production URL:
  ```
  https://your-frontend.vercel.app
  ```

### Production Testing

In production environment:

- [ ] [ ] Test free tier default
- [ ] [ ] Test client limit at 20
- [ ] [ ] Test plan upgrade
- [ ] [ ] Test expiry modal on expired plan
- [ ] [ ] Test renewal after expiry

---

## Phase 7: Documentation & Handoff (15 min)

### Documentation

- [ ] Read `SUBSCRIPTION_ENFORCEMENT_GUIDE.md` - full system docs
- [ ] Read `SUBSCRIPTION_MIGRATION_GUIDE.md` - if migrating from old system
- [ ] Read `SUBSCRIPTION_QUICK_REFERENCE.md` - quick lookup reference
- [ ] Keep these files accessible for team

### Team Knowledge Transfer

- [ ] Brief team on system architecture
- [ ] Show API endpoints available
- [ ] Show how to check subscription status
- [ ] Show how to debug issues
- [ ] Point to documentation

### Monitoring

- [ ] Set up error logging (e.g., Sentry)
- [ ] Monitor `/api/subscription/*` endpoint usage
- [ ] Track expiry modal appearances
- [ ] Monitor payment verification failures
- [ ] Set up alerts for database errors

---

## Post-Deployment Monitoring (1 week)

### Daily Checks

- [ ] No critical errors in logs
- [ ] Subscription status API responding < 500ms
- [ ] Payment verifications completing successfully
- [ ] No blocked users (unless intentional)

### Weekly Checks

- [ ] Review expired subscriptions
- [ ] Review upgrade patterns
- [ ] Review renewal rates
- [ ] Check database performance

### Metrics to Track

- [ ] Total users on free tier vs paid
- [ ] Average plan duration before expiry
- [ ] Plan upgrade patterns (which plans popular)
- [ ] Renewal rate after expiry
- [ ] Payment failure rate

---

## Troubleshooting Quick Links

| Issue | Check |
|-------|-------|
| Subscription endpoints return 404 | Is `subscription_routes.py` imported in `app.py`? |
| "Module not found" error | Are all 3 backend files in correct directories? |
| Blocking modal doesn't appear | Is `subscription-enforcement.js` loaded? Browser console open? |
| Client limit not enforced | Is backend validating in `/api/clients/add`? |
| Payment not processing | Check Razorpay API keys in `.env`. Check payment verification logic. |

---

## Final Sign-Off

- [ ] All tests passing
- [ ] All files deployed
- [ ] Team trained
- [ ] Documentation complete
- [ ] Monitoring set up
- [ ] Ready for production ✅

---

## Rollback Plan (If Needed)

If critical issues occur:

1. Disable frontend enforcement:
   ```javascript
   // Comment out in app.js
   // window.SubscriptionEnforcement.initialize();
   ```

2. Keep server running (subscription data is safe)

3. Revert frontend code
   ```bash
   git revert <commit-hash>
   git push
   ```

4. Keep subscription data intact for recovery

---

## Estimated Timeline

| Phase | Time | Status |
|-------|------|--------|
| 1. Database | 15 min | ⏳ |
| 2. Backend | 20 min | ⏳ |
| 3. Frontend | 15 min | ⏳ |
| 4. Integration Testing | 30 min | ⏳ |
| 5. Security Testing | 20 min | ⏳ |
| 6. Deployment | 30 min | ⏳ |
| 7. Documentation | 15 min | ⏳ |
| **Total** | **2-3 hrs** | ⏳ |

---

## Support

For issues during setup:
1. Check console logs (browser & backend)
2. Review `SUBSCRIPTION_ENFORCEMENT_GUIDE.md`
3. Run SQL queries to verify database state
4. Test endpoints with cURL or Postman

Good luck! 🚀
