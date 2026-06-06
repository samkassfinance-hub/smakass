# SamKass - Interactive Loan Due Push Notifications Setup

## Overview

This system sends push notifications to financiers when client EMI payments are due. Financiers can respond **directly from the notification** without opening the app, using 3 action buttons:

- ✅ **PAID** - Marks EMI as fully paid
- ❌ **UNPAID** - Marks EMI as unpaid/skipped
- 💰 **PARTLY PAID** - Opens minimal page to enter partial amount

## Architecture

### Components

1. **notification_scheduler.py** - APScheduler cron job (runs daily at 8 AM IST)
2. **routes/push.py** - Flask Blueprint with `/api/push/subscribe` and `/api/notify-action`
3. **sw.js** - Service Worker with push event handlers
4. **push-notifications.js** - Frontend subscription manager
5. **notify-partial.html** - Minimal partial payment page
6. **Supabase** - Stores push subscriptions and loan data

### Flow

```
1. Daily at 8 AM IST
   └─> notification_scheduler.py checks for due loans
       └─> Sends push notification with 3 action buttons

2. User clicks notification button
   └─> Service Worker (sw.js) intercepts
       ├─> PAID: POST to /api/notify-action → Update loan
       ├─> UNPAID: POST to /api/notify-action → Log only
       └─> PARTLY PAID: Open /notify-partial.html → Enter amount → POST

3. Backend updates loan data
   └─> Payment recorded, next_due_date updated
       └─> App data refreshed automatically
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd kaasflow/backend
pip install -r requirements.txt
```

New packages:
- `pywebpush>=1.14.0` - Web push protocol
- `apscheduler>=3.10.4` - Scheduled jobs
- `pytz>=2024.1` - Timezone handling

### 2. Generate VAPID Keys

```bash
cd kaasflow/backend
python generate_vapid_keys.py
```

This will output:
```
VAPID_PUBLIC_KEY=BLxxx...
VAPID_PRIVATE_KEY=yyy...
VAPID_CLAIM_EMAIL=mailto:samkassfinance@gmail.com
```

### 3. Update .env File

Add to `kaasflow/backend/.env`:

```env
VAPID_PUBLIC_KEY=BLxxx...
VAPID_PRIVATE_KEY=yyy...
VAPID_CLAIM_EMAIL=mailto:samkassfinance@gmail.com
```

### 4. Update Frontend JavaScript

Edit `kaasflow/frontend/push-notifications.js`:

```javascript
const VAPID_PUBLIC_KEY = 'BLxxx...'; // Replace with your public key
```

### 5. Create Supabase Table

Run the SQL in `kaasflow/backend/supabase_push_subscriptions.sql` in your Supabase SQL editor:

```sql
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    subscription_json JSONB NOT NULL,
    endpoint TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. Start Backend Server

```bash
cd kaasflow/backend
python app.py
```

The scheduler will start automatically and run daily at 8:00 AM IST.

### 7. Test Notifications

#### Option A: Manual Test

```python
from notification_scheduler import check_and_send_due_notifications
check_and_send_due_notifications()
```

#### Option B: Create Test Loan

1. Create a loan with `next_due_date` = today
2. Wait for notification (or run manual test)
3. Click notification action button
4. Verify payment recorded in database

## API Endpoints

### POST `/api/push/subscribe`

Subscribe user to push notifications.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription created"
}
```

### POST `/api/push/unsubscribe`

Unsubscribe from push notifications.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/..."
}
```

### POST `/api/notify-action`

Handle payment action from notification.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body:**
```json
{
  "loan_id": "loan-123",
  "action": "paid",  // or "unpaid" or "partly_paid"
  "amount": 2000.00
}
```

**Response (PAID):**
```json
{
  "success": true,
  "message": "Payment marked as PAID",
  "amount": 2000.00,
  "next_due_date": "2025-02-15"
}
```

**Response (PARTLY PAID):**
```json
{
  "success": true,
  "message": "Partial payment recorded",
  "amount": 500.00,
  "remaining_for_this_emi": 1500.00,
  "total_remaining": 18500.00
}
```

## Notification Payload Structure

```json
{
  "title": "EMI Due — Ravi Kumar",
  "body": "₹2000 due on 2025-01-15. How was the collection?",
  "icon": "https://samkass.site/logo.png",
  "badge": "https://samkass.site/logo.png",
  "requireInteraction": true,
  "actions": [
    {
      "action": "paid",
      "title": "✅ PAID"
    },
    {
      "action": "unpaid",
      "title": "❌ UNPAID"
    },
    {
      "action": "partly_paid",
      "title": "💰 PARTLY PAID"
    }
  ],
  "data": {
    "loan_id": "loan-123",
    "client_id": "client-456",
    "client_name": "Ravi Kumar",
    "amount": 2000.00,
    "due_date": "2025-01-15"
  }
}
```

## Scheduler Configuration

The scheduler runs daily at **8:00 AM IST** (Asia/Kolkata timezone).

To change the schedule, edit `notification_scheduler.py`:

```python
scheduler.add_job(
    check_and_send_due_notifications,
    trigger=CronTrigger(hour=8, minute=0, timezone=IST),  # Change time here
    id='due_loan_notifications'
)
```

## Browser Support

Push notifications are supported in:
- ✅ Chrome 42+
- ✅ Firefox 44+
- ✅ Edge 17+
- ✅ Opera 29+
- ✅ Samsung Internet 4+
- ❌ Safari (iOS) - Not supported
- ✅ Safari (macOS 16.4+) - Limited support

## Security Notes

1. **VAPID Keys**: Keep `VAPID_PRIVATE_KEY` secret - never commit to Git
2. **JWT Authentication**: All notification actions require valid JWT token
3. **User Isolation**: Each user only sees their own loans
4. **HTTPS Required**: Push notifications only work over HTTPS
5. **Service Worker**: Must be served from root domain

## Troubleshooting

### Notifications Not Appearing

1. Check browser console for errors
2. Verify VAPID keys are correct
3. Ensure HTTPS is enabled
4. Check notification permission: `Notification.permission`
5. Verify service worker is registered: `navigator.serviceWorker.controller`

### Scheduler Not Running

1. Check backend logs for errors
2. Verify timezone is set correctly
3. Ensure APScheduler is installed
4. Check if running in Vercel (scheduler disabled)

### Payment Actions Failing

1. Check JWT token is valid
2. Verify loan_id exists in database
3. Check network tab for API errors
4. Ensure user has permission for loan

## Production Deployment

### Vercel

The scheduler cannot run on Vercel (serverless). Use an external cron service:

1. Deploy to a server (EC2, DigitalOcean, etc.)
2. Run scheduler as a background process
3. Or use external cron (Render Cron Jobs, Railway, etc.)

### Server Deployment

```bash
# Install dependencies
pip install -r requirements.txt

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Scheduler runs automatically
```

### Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

## Support

For issues or questions:
- Email: samkassfinance@gmail.com
- WhatsApp: +91 7904987242
- GitHub: https://github.com/mohaneni/samkass

## License

Proprietary - SamKass Finance Manager
