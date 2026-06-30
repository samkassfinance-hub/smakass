# Subscription System - Architecture Diagrams

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SAMKASS SUBSCRIPTION SYSTEM                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐
│     BROWSER (FRONTEND)           │
│                                  │
│  subscription-enforcement.js     │
│  ├─ Check status on load         │
│  ├─ Validate before adding       │
│  ├─ Show blocking modal          │
│  └─ 5-min periodic checks        │
└────────────────┬─────────────────┘
                 │
                 │ HTTPS / CORS
                 │
         ┌───────▼────────┐
         │  API ENDPOINTS │
         │  /api/sub/*    │
         └───────┬────────┘
                 │
┌────────────────▼────────────────────┐
│   BACKEND (Flask/Python)            │
│                                     │
│  subscription_routes.py             │
│  ├─ /status                         │
│  ├─ /check-client-limit             │
│  ├─ /verify-payment                 │
│  ├─ /validate-access                │
│  ├─ /current-plan                   │
│  └─ /plans                          │
│                                     │
│  subscription_manager.py            │
│  ├─ Get subscription (DB query)     │
│  ├─ Check expiry (UTC comparison)   │
│  ├─ Create subscription             │
│  ├─ Validate client limit           │
│  └─ Calculate expiry time           │
└────────────────┬────────────────────┘
                 │
                 │ SQL
                 │
    ┌────────────▼──────────────┐
    │  DATABASE (Supabase)      │
    │                           │
    │  subscriptions table      │
    │  ├─ email (PK)            │
    │  ├─ plan_type             │
    │  ├─ start_time (UTC)      │
    │  ├─ expiry_time (UTC)     │
    │  ├─ is_expired (boolean)  │
    │  └─ payment_id            │
    │                           │
    │  payment_history table    │
    │  ├─ email (FK)            │
    │  ├─ plan_type             │
    │  ├─ payment_date          │
    │  ├─ amount_paid           │
    │  └─ status                │
    └───────────────────────────┘
```

---

## 2. User Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        USER SUBSCRIPTION LIFECYCLE                           │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   NEW USER   │
                              └──────┬───────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │  SIGNUP → AUTO FREE TIER        │
                    │  (subscription_manager creates  │
                    │   default free plan)            │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │  FREE TIER ACTIVE               │
                    │  ├─ 20 client limit             │
                    │  ├─ Core features               │
                    │  ├─ No expiry                   │
                    │  └─ Shows "Upgrade" on 21st     │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │  USER CLICKS "UPGRADE"          │
                    │  (Opens plan selection modal)   │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │  RAZORPAY PAYMENT FLOW          │
                    │  ├─ Select plan                 │
                    │  ├─ Complete payment            │
                    │  ├─ Razorpay verifies           │
                    │  └─ Callback fires              │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │  PAYMENT VERIFICATION           │
                    │  ├─ Frontend calls              │
                    │    /verify-payment              │
                    │  ├─ Backend verifies signature  │
                    │  ├─ Creates subscription        │
                    │    (expiry = now + duration)    │
                    │  └─ Returns success             │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │  PAID TIER ACTIVE               │
                    │  ├─ Unlimited clients           │
                    │  ├─ All features                │
                    │  ├─ Valid for N days/months     │
                    │  ├─ Show plan badge             │
                    │  └─ Periodic expiry check       │
                    │     (5 min intervals)           │
                    └────────────────┬────────────────┘
                                     │
                                     │ Days pass...
                                     │ Expiry time reaches
                                     │
                    ┌────────────────▼────────────────┐
                    │  SUBSCRIPTION EXPIRES           │
                    │  (server_time >= expiry_time)   │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │  BLOCKING MODAL APPEARS         │
                    │  ├─ Full screen (z-index 9999) │
                    │  ├─ No close button             │
                    │  ├─ No ESC dismissal            │
                    │  ├─ Shows 4 plan options        │
                    │  ├─ "Continue with Free Plan"   │
                    │  └─ "Choose Plan" buttons       │
                    └────────────────┬────────────────┘
                        ┌────────────┴────────────┐
                        │                         │
          ┌─────────────▼──────────────┐ ┌────────▼────────────┐
          │  CHOOSE "FREE PLAN"        │ │  RENEW SUBSCRIPTION │
          │  ├─ Modal closes           │ │  ├─ Razorpay flow   │
          │  ├─ Revert to free tier    │ │  ├─ Verify payment  │
          │  ├─ Max 20 clients         │ │  ├─ Create new sub  │
          │  └─ Limited features       │ │  └─ Modal closes    │
          └───────────────────────────┘ └────────┬─────────────┘
                                                  │
                                    ┌─────────────▼────────────┐
                                    │ PAID TIER REACTIVATED    │
                                    │ (Back to active state)   │
                                    └──────────────────────────┘
```

---

## 3. Payment Verification Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PAYMENT VERIFICATION SEQUENCE                        │
└─────────────────────────────────────────────────────────────────────────────┘

User                Frontend              Razorpay            Backend        Database
 │                    │                      │                  │              │
 │─ Click "Pay" ─────▶│                      │                  │              │
 │                    │─ Open checkout ─────▶│                  │              │
 │                    │◀─ Checkout UI ───────│                  │              │
 │                    │                      │                  │              │
 │─ Enter card ──────▶│                      │                  │              │
 │                    │─ Process payment ───▶│                  │              │
 │                    │◀─ Success callback ──│                  │              │
 │                    │  (razorpay_payment_id)                  │              │
 │                    │                      │                  │              │
 │                    │─ Call /verify-payment ─────────────────▶│              │
 │                    │  { email, plan_type,                    │              │
 │                    │    razorpay_payment_id,                 │              │
 │                    │    razorpay_order_id,                   │              │
 │                    │    razorpay_signature,                  │              │
 │                    │    amount_paid }                        │              │
 │                    │                      │                  │              │
 │                    │                      │  Verify signature│              │
 │                    │                      │  ├─ Valid ✓      │              │
 │                    │                      │  └─ Amount OK ✓  │              │
 │                    │                      │                  │              │
 │                    │                      │                  ├─ INSERT ────▶│
 │                    │                      │                  │ subscription │
 │                    │                      │                  │ {            │
 │                    │                      │                  │  email,      │
 │                    │                      │                  │  plan_type,  │
 │                    │                      │                  │  start: NOW, │
 │                    │                      │                  │  expiry:     │
 │                    │                      │                  │   NOW+dur    │
 │                    │                      │                  │ }            │
 │                    │                      │                  │              │
 │                    │◀─ { success: true, ──────────────────◀──│              │
 │                    │     expiry_time }                        │              │
 │                    │                      │                  │              │
 │                    ├─ Dismiss modal       │                  │              │
 │                    ├─ Refresh UI          │                  │              │
 │                    ├─ Show badge          │                  │              │
 │◀─ "✓ Activated" ───│                      │                  │              │
 │                    │                      │                  │              │
```

---

## 4. Expiry Check Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXPIRY CHECK SEQUENCE                               │
└─────────────────────────────────────────────────────────────────────────────┘

Frontend              Backend                    Database
   │                    │                           │
   ├─ Periodic check ──▶│                           │
   │ (every 5 min)      │                           │
   │ GET /status        │                           │
   │                    ├─ Query subscription ─────▶│
   │                    │ WHERE email = user        │
   │                    │◀─ { expiry_time: "2025-02-14T15:45:00Z" }
   │                    │                           │
   │                    ├─ Compare times            │
   │                    │ NOW >= "2025-02-14T15:45:00Z" ?
   │                    │                           │
   │ ┌──────────────────────────────────┐           │
   │ │      CHECK RESULT                │           │
   │ └──────────────────────────────────┘           │
   │         ┌──────────────┴─────────────┐         │
   │         │                            │         │
   │    VALID ✓              ┌────────────▼──────────┐
   │    NOT EXPIRED           │  EXPIRED ✗            │
   │                          │                       │
   │◀─ {is_expired: false} ───┤                       │
   │   {plan: "monthly"}      │◀─ {is_expired: true} ─
   │   {expiry: "2025-02-14"} │    {plan: "monthly"}   
   │                          │    {expiry: "..."} 
   │    ├─ Show badge         │
   │    ├─ Enable features    │    ├─ Hide badge
   │    └─ Allow operations   │    ├─ Disable features
   │                          │    ├─ SHOW BLOCKING MODAL
   │                          │    │  ┌──────────────────┐
   │                          │    │  │ Your subscription│
   │                          │    │  │ has expired      │
   │                          │    │  │                  │
   │                          │    │  │ [Plan 1] [Plan 2]│
   │                          │    │  │ [Plan 3] [Plan 4]│
   │                          │    │  │                  │
   │                          │    │  │ [Upgrade] [Free] │
   │                          │    │  └──────────────────┘
   │                          │    │
   │                          │    └─ Block all access
   │                          │       until payment
```

---

## 5. Client Limit Enforcement

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CLIENT LIMIT ENFORCEMENT FLOW                           │
└─────────────────────────────────────────────────────────────────────────────┘

USER TRIES TO ADD CLIENT:

Frontend                Backend              Database
   │                       │                    │
   ├─ Show form           │                    │
   ├─ Collect data        │                    │
   ├─ Click "Add"         │                    │
   │                      │                    │
   ├─ validateClientAddition()                │
   │   POST /check-limit  │                    │
   │   { email }          │                    │
   │                      ├─ Get subscription─▶│
   │                      │◀─ {plan: "free",   │
   │                      │    is_expired: f}  │
   │                      │                    │
   │                      ├─ Count clients ───▶│
   │                      │◀─ count: 20        │
   │                      │                    │
   │                      ├─ Compare:          │
   │                      │ if free_plan:      │
   │                      │   limit = 20       │
   │                      │ else if paid:      │
   │                      │   limit = ∞        │
   │                      │                    │
   │                      ├─ Check:            │
   │                      │ if count >= limit? │
   │                      │                    │
   │ ┌──────────────────────────────────┐     │
   │ │      DECISION                    │     │
   │ └──────────────────────────────────┘     │
   │         ┌──────────────┴────────────┐    │
   │         │                           │    │
   │ CAN ADD ✓      ┌────────────────────▼──┐ 
   │                 │   BLOCKED ✗           │
   │◀─ {can_add: 1}──┤                      │
   │                 │◀─ {can_add: 0}        
   │  ├─ Enable       │    {limit: 20}
   │  │ form          │    {reason: "..."}
   │  ├─ Submit       │
   │  └─ POST         │    ├─ Show modal
   │     /clients/    │    │  "Limit Reached"
   │     add          │    ├─ Show upgrade
   │                  │    │  plans
   │                  │    └─ Block action
   │       ┌─────────┐│
   │       │ Backend ├┤    (if user tries to
   │       │ adds    ││    call API directly)
   │       │ client  ││
   │       └────┬────┘│    POST /clients/add
   │            │     │    ├─ Server checks:
   │            ▼     │    │  limit = 20
   │         Added ✓  │    │  count = 20
   │                  │    │  can_add = false
   │                  │    ├─ Returns 400
   │                  │    │  {error: "Limit"}
   │                  │    └─ Blocks action
   │                  │
   │ CLIENT #21 BLOCKED ✗
```

---

## 6. Database Schema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUBSCRIPTIONS TABLE                                  │
└─────────────────────────────────────────────────────────────────────────────┘

PK: id
UK: email (UNIQUE - one subscription per user)

┌──────────────────────────────────────────────────────────┐
│ Column              │ Type          │ Example             │
├──────────────────────────────────────────────────────────┤
│ id                  │ BIGINT PK     │ 123                 │
│ email               │ TEXT UK       │ user@example.com    │
│ plan_type           │ TEXT          │ 'monthly'           │
│ plan_name           │ TEXT          │ 'Monthly'           │
│ start_time          │ TIMESTAMP UTC │ 2025-01-15T10:30Z   │
│ expiry_time         │ TIMESTAMP UTC │ 2025-02-14T10:30Z   │
│ status              │ TEXT          │ 'active'            │
│ payment_id          │ TEXT          │ 'pay_xyz'           │
│ razorpay_order_id   │ TEXT          │ 'order_abc'         │
│ razorpay_signature  │ TEXT          │ 'sig_def'           │
│ amount_paid         │ DECIMAL       │ 270.00              │
│ created_at          │ TIMESTAMP UTC │ 2025-01-15T10:30Z   │
│ updated_at          │ TIMESTAMP UTC │ 2025-01-15T10:30Z   │
└──────────────────────────────────────────────────────────┘

INDEXES:
  - idx_subscriptions_email (email)
  - idx_subscriptions_expiry_time (expiry_time)
  - idx_subscriptions_status (status)
  - idx_subscriptions_plan_type (plan_type)

TRIGGER:
  - update_subscription_status() 
    Automatically sets status='expired' if expiry_time <= now()


┌─────────────────────────────────────────────────────────────────────────────┐
│                       PAYMENT_HISTORY TABLE (Audit Log)                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Column              │ Type          │ Example             │
├──────────────────────────────────────────────────────────┤
│ id                  │ BIGINT PK     │ 456                 │
│ email               │ TEXT          │ user@example.com    │
│ subscription_id     │ BIGINT FK     │ 123                 │
│ plan_type           │ TEXT          │ 'monthly'           │
│ amount_paid         │ DECIMAL       │ 270.00              │
│ payment_id          │ TEXT          │ 'pay_xyz'           │
│ razorpay_order_id   │ TEXT          │ 'order_abc'         │
│ razorpay_signature  │ TEXT          │ 'sig_def'           │
│ status              │ TEXT          │ 'success'           │
│ payment_date        │ TIMESTAMP UTC │ 2025-01-15T10:30Z   │
│ created_at          │ TIMESTAMP UTC │ 2025-01-15T10:30Z   │
└──────────────────────────────────────────────────────────┘

INDEXES:
  - idx_payment_history_email (email)
  - idx_payment_history_payment_date (payment_date)
  - idx_payment_history_subscription_id (subscription_id)
```

---

## 7. Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ERROR HANDLING SCENARIOS                              │
└─────────────────────────────────────────────────────────────────────────────┘

SCENARIO 1: User has no email
  Request: GET /api/subscription/status (no X-User-Email header)
  Response: 400 { error: "User email required" }
  Frontend: Show error toast

SCENARIO 2: Subscription expired
  Request: POST /api/clients/add
  Server: subscription['is_expired'] = true
  Response: 403 { error: "Subscription expired", expiry_time: "..." }
  Frontend: Show blocking modal

SCENARIO 3: Client limit reached
  Request: POST /api/clients/add (client_count = 20, free plan)
  Server: can_add = false (20 >= 20)
  Response: 400 { error: "Limit reached", limit: 20, current: 20 }
  Frontend: Show upgrade prompt

SCENARIO 4: Payment verification failed
  Request: POST /api/subscription/verify-payment
  Server: Signature invalid OR database error
  Response: 400 { error: "Failed to create subscription" }
  Frontend: Show error toast, retry payment

SCENARIO 5: Database connection lost
  Request: GET /api/subscription/status
  Server: Database error
  Response: 500 { error: "Database connection failed" }
  Frontend: Show error, retry after 5 seconds

SCENARIO 6: Clock synchronization issue
  Frontend sends: client_time
  Backend uses: datetime.utcnow() (server UTC time)
  Result: Server time is authoritative, client time ignored
  Impact: No clock manipulation possible
```

---

## 8. Security Boundaries

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TRUST BOUNDARIES                                    │
└─────────────────────────────────────────────────────────────────────────────┘

OUTSIDE BOUNDARY (UNTRUSTED):
┌─────────────────────────────────────────────────────────┐
│ Browser / Client Machine                                │
│                                                         │
│  localStorage (user can edit)                          │
│  ├─ kf_subscription (IGNORED by server)                │
│  ├─ kf_settings (IGNORED for sub status)               │
│  └─ kf_token (JWT, verified server-side)               │
│                                                         │
│  JavaScript (user can disable)                         │
│  ├─ subscription-enforcement.js (UI only)              │
│  └─ API calls (validated server-side)                  │
│                                                         │
│  Browser DevTools (user can modify)                    │
│  ├─ Network requests (signed on server)                │
│  ├─ Application data (re-fetched from server)          │
│  └─ Console execution (only changes client state)      │
│                                                         │
│  System Clock (user can adjust)                        │
│  └─ NOT USED - server uses UTC only                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
           ▲                                   ▼
           │         HTTPS / Signed          │
           │          (Can't modify)         │
           │                                 │
┌─────────┐│       ┌────────────────────┐    │
│  CLIENT ││──────▶│  SERVER (Trusted)  │◀───┘
│         ││       │                    │
│(Always  ││       │ ├─ Verify signature│
│Untrusted││       │ ├─ Check UTC time  │
│)        ││       │ ├─ Validate limits │
│         ││       │ └─ Auth user       │
└─────────┘│       │                    │
           │       │ AUTHORITATIVE      │
           │       │ DECISION MAKER     │
           │       └────────┬───────────┘
           │                │
           │         ┌──────▼────────┐
           │         │  DATABASE     │
           │         │  (Immutable)  │
           │         │               │
           │         │  Single source│
           │         │  of truth     │
           │         │               │
           │         │  RLS enabled  │
           │         └───────────────┘
           │
  User cannot:
  ├─ Fake subscription status
  ├─ Bypass client limits
  ├─ Manipulate expiry time
  ├─ Call API without auth
  ├─ Change another user's data
  └─ Bypass any server checks
```

---

## 9. Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DEPLOYMENT PIPELINE                                    │
└─────────────────────────────────────────────────────────────────────────────┘

LOCAL DEVELOPMENT
│
├─ Copy files to correct locations
├─ Update app.py & index.html
├─ Run database migrations locally
├─ Start backend & frontend
├─ Test all scenarios
└─ Verify no console errors
│
▼

STAGING DEPLOYMENT
│
├─ Push to staging branch
├─ Vercel deploys backend
├─ Vercel deploys frontend
├─ Run SUBSCRIPTION_SCHEMA.sql (if first time)
├─ Test payment flow (real Razorpay sandbox)
├─ Test expiry blocking
├─ Test client limits
└─ Security testing
│
▼

PRODUCTION DEPLOYMENT
│
├─ Code review
├─ Merge to main
├─ Vercel auto-deploys backend
├─ Vercel auto-deploys frontend
├─ Database already migrated (from staging)
├─ Verify endpoints respond
├─ Test with real payment (or use Razorpay sandbox)
├─ Monitor for errors (24 hours)
├─ Monitor for false positives
└─ Announce to users
│
▼

POST-DEPLOYMENT
│
├─ Monitor subscription endpoints (API metrics)
├─ Track payment success rate
├─ Watch for error spikes
├─ Review database performance
├─ Track user adoption
└─ Measure revenue
```

---

These diagrams provide a visual overview of the entire subscription system architecture and workflows.
