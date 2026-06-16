# Subscription System - Quick Reference

## TL;DR

- **Free tier**: 20 clients max, permanent
- **Paid tiers**: ₹8 (1-day), ₹270 (monthly), ₹850 (quarterly), ₹1,999 (yearly) → unlimited clients
- **Expiry**: Exact UTC time, checked on every page load
- **Block**: Full-screen inescapable modal on expiry
- **Enforcement**: Server validates all access requests

---

## Quick Integration (5 minutes)

### Backend

1. Copy `subscription_manager.py` to `kaasflow/backend/`
2. Copy `subscription_routes.py` to `kaasflow/backend/routes/`
3. Add to `app.py`:
   ```python
   from routes.subscription_routes import subscription_bp
   app.register_blueprint(subscription_bp, url_prefix='/api')
   ```
4. Run `SUBSCRIPTION_SCHEMA.sql` in Supabase

### Frontend

1. Copy `subscription-enforcement.js` to `kaasflow/frontend/`
2. Add to `index.html`:
   ```html
   <script src="./subscription-enforcement.js"></script>
   ```
3. Call in `app.js`:
   ```javascript
   window.SubscriptionEnforcement.initialize();
   ```
4. Before adding client:
   ```javascript
   const canAdd = await window.SubscriptionEnforcement.validateClientAddition();
   if (!canAdd) return;
   ```

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/subscription/status` | GET | Get full subscription status |
| `/api/subscription/check-client-limit` | POST | Can user add client? |
| `/api/subscription/verify-payment` | POST | Create subscription after payment |
| `/api/subscription/current-plan` | GET | Get current plan name & expiry |
| `/api/subscription/validate-access` | POST | Does user have premium access? |
| `/api/subscription/plans` | GET | Get all available plans |

---

## Database Schema

### subscriptions table

```sql
email              TEXT UNIQUE     -- User identifier
plan_type          TEXT            -- 'free', 'oneday', 'monthly', 'quarterly', 'yearly'
plan_name          TEXT            -- Human-readable name
start_time         TIMESTAMP UTC   -- When subscription started
expiry_time        TIMESTAMP UTC   -- When subscription expires
status             TEXT            -- 'active', 'expired', 'cancelled'
payment_id         TEXT            -- Razorpay payment ID
razorpay_order_id  TEXT            -- Razorpay order ID
razorpay_signature TEXT            -- Razorpay signature
amount_paid        DECIMAL         -- Amount in INR
```

---

## Subscription Plans

| Plan | Price | Duration | Clients | Expiry Calc |
|------|-------|----------|---------|-------------|
| Free | ₹0 | ∞ | 20 | Never expires |
| 1-Day | ₹8 | 24h | ∞ | Now + 24h (exactly) |
| Monthly | ₹270 | 30d | ∞ | Now + 30d |
| Quarterly | ₹850 | 90d | ∞ | Now + 90d |
| Yearly | ₹1,999 | 365d | ∞ | Now + 365d |

---

## Frontend API

### Initialize
```javascript
window.SubscriptionEnforcement.initialize();
// Fetches subscription, checks expiry, sets up 5-min checks
```

### Validate Status
```javascript
await window.SubscriptionEnforcement.validateSubscriptionStatus();
// Checks subscription, shows blocking modal if expired
```

### Validate Client Addition
```javascript
const canAdd = await window.SubscriptionEnforcement.validateClientAddition();
if (canAdd) { /* add client */ }
```

### Get Current Subscription
```javascript
const sub = window.SubscriptionEnforcement.getCurrentSubscription();
// Returns: {
//   subscription: { plan_type, is_expired, expiry_time, ... },
//   client_count, can_add_client, limit_info, ...
// }
```

### Get User Email
```javascript
const email = window.SubscriptionEnforcement.getUserEmail();
```

---

## Backend Usage

### Check Subscription

```python
from subscription_manager import subscription_manager

subscription = subscription_manager.get_user_subscription('user@example.com')
# Returns: {
#   plan_type, plan_name, expiry_time, is_expired, ...
# }

if subscription['is_expired']:
    # Block access
    pass
```

### Check Client Limit

```python
can_add, info = subscription_manager.check_client_limit(
    'user@example.com',
    current_client_count=15
)

if not can_add:
    return {'error': f'Limit: {info["limit"]}'}, 400
```

### Create Subscription (After Payment)

```python
success, result = subscription_manager.create_subscription(
    user_email='user@example.com',
    plan_type='monthly',
    payment_id='pay_xxx',
    razorpay_order_id='order_xxx',
    razorpay_signature='sig_xxx',
    amount_paid=270,
    start_time=datetime.utcnow()  # Exact payment time
)
```

### Get Subscription Status

```python
status = subscription_manager.get_subscription_status('user@example.com')
# Returns complete status with client count, limit, days remaining, etc.
```

---

## Common Checks

### "Is subscription expired?"
```python
is_expired = subscription['is_expired']
```

### "Can user add more clients?"
```python
can_add, info = subscription_manager.check_client_limit(email, client_count)
if not can_add:
    return error
```

### "Get client limit"
```python
sub = subscription_manager.get_user_subscription(email)
limit = 20 if sub['plan_type'] == 'free' else float('inf')
```

### "Days remaining?"
```javascript
const status = window.SubscriptionEnforcement.getCurrentSubscription();
const daysLeft = status.days_remaining;
```

---

## Security Rules

✅ **Never trust client**: Always verify subscription on server  
✅ **Always use UTC**: No local time, no clock manipulation  
✅ **One source of truth**: Server database is the only reference  
✅ **Hard blocks**: Expiry modal cannot be dismissed  
✅ **API validation**: All routes check subscription before responding  

---

## Testing

### Test Free Tier Limit
```bash
# Add 20 clients - should work
POST /api/clients/add (20 times)

# Add 21st - should fail
POST /api/clients/add
# Returns: 400 { error: "Client limit reached: 20" }
```

### Test Expiry Block
```bash
# Set plan to expire 1 second ago
UPDATE subscriptions 
SET expiry_time = now() - interval '1 second'
WHERE email = 'test@user.com';

# Check status
GET /api/subscription/status?email=test@user.com
# Returns: { subscription: { is_expired: true }, ... }

# Frontend should show blocking modal
```

### Test Payment Flow
```bash
# 1. User completes Razorpay payment
# 2. Frontend calls verify-payment endpoint
POST /api/subscription/verify-payment
Body: {
  email, plan_type, razorpay_payment_id,
  razorpay_order_id, razorpay_signature, amount_paid
}

# 3. Subscription created in database
SELECT * FROM subscriptions WHERE email = 'user@example.com'

# 4. Frontend gets updated subscription status
GET /api/subscription/status?email=user@example.com
# Returns: { subscription: { is_expired: false, plan_type: 'monthly' }, ... }
```

---

## Debugging

### Check subscription in database
```sql
SELECT * FROM subscriptions WHERE email = 'user@example.com';
```

### Check if subscription is expired
```sql
SELECT 
  email, 
  plan_type, 
  expiry_time,
  expiry_time <= now() as is_expired
FROM subscriptions 
WHERE email = 'user@example.com';
```

### Check payment history
```sql
SELECT * FROM payment_history WHERE email = 'user@example.com';
```

### Browser console
```javascript
console.log(window.SubscriptionEnforcement.getCurrentSubscription());
// See current subscription state
```

---

## Deployment

```bash
# 1. Backend
git push origin main
# Vercel auto-deploys

# 2. Database
# Run SUBSCRIPTION_SCHEMA.sql in Supabase SQL Editor

# 3. Frontend
git push origin main
# Vercel auto-deploys

# 4. Test
# Open app, verify subscription enforcement works
```

---

## Troubleshooting

| Problem | Check |
|---------|-------|
| Blocking modal not showing | Is `subscription-enforcement.js` loaded? Is server returning `is_expired: true`? |
| Client limit not working | Is backend validating in `/api/clients/add`? |
| Payment not creating subscription | Is `/api/subscription/verify-payment` being called? Check server logs. |
| Wrong expiry time | Is backend using `datetime.utcnow()`? Is database in UTC? |
| User can dismiss modal | Check modal has no close button. Check ESC is prevented. |

---

## Files Reference

| File | Purpose | Location |
|------|---------|----------|
| `subscription_manager.py` | Core logic | `kaasflow/backend/` |
| `subscription_routes.py` | API endpoints | `kaasflow/backend/routes/` |
| `SUBSCRIPTION_SCHEMA.sql` | Database setup | `kaasflow/backend/` |
| `subscription-enforcement.js` | Client-side enforcement | `kaasflow/frontend/` |
| `SUBSCRIPTION_ENFORCEMENT_GUIDE.md` | Full documentation | Root |
| `SUBSCRIPTION_MIGRATION_GUIDE.md` | Migration instructions | Root |

---

## Support

For issues:
1. Check console logs (browser & backend)
2. Run SQL query to verify database state
3. Test endpoint with Postman
4. Check `.env` has correct Supabase credentials
5. Review `SUBSCRIPTION_ENFORCEMENT_GUIDE.md` troubleshooting section
