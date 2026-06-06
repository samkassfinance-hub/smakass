# SamKass - Notification Testing Guide

## Quick Test Steps

### 1. Allow Notifications

When you open the app, you'll see a browser prompt asking for notification permission. Click **"Allow"**.

### 2. Load Test Data

1. Go to **Settings** page
2. Click **"Load Dummy Clients (18)"** button
3. This creates 18 clients with overdue loans (15-45 days overdue)

### 3. Test Notifications

1. Still in **Settings** page
2. Click **"Test Notifications"** button
3. You should see notifications for all overdue loans

## What to Expect

### Notification Appearance

Each notification shows:
- **Title**: "EMI Due — [Client Name]"
- **Body**: "₹[Amount] is overdue. How was the collection?"
- **Icon**: SamKass logo

### Notification Behavior

- Notifications appear **one by one** (1 second apart)
- They **stay visible** until you click them
- Clicking opens the app and navigates to **Collection** page

## Troubleshooting

### No Notifications Appearing?

**Check 1: Permission Status**
```javascript
// Open browser console (F12) and type:
Notification.permission
// Should show: "granted"
```

**Check 2: Browser Support**
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ❌ Safari (iOS): Not supported
- ⚠️ Safari (Mac): Partial support (requires macOS 16.4+)

**Check 3: Browser Settings**
- Chrome: Settings → Privacy and security → Site Settings → Notifications
- Firefox: Settings → Privacy & Security → Permissions → Notifications
- Make sure `samkass.site` (or `localhost`) is allowed

**Check 4: Console Errors**
Open browser console (F12) and look for:
- `✅ Notifications initialized` - Good!
- `❌ Notification permission denied` - Need to allow
- `⚠️ Store not initialized yet` - Wait a few seconds

### Notifications Show But Disappear Immediately?

This is a browser behavior. To keep them visible:
- We use `requireInteraction: true`
- But some browsers still auto-dismiss after 5-10 seconds
- This is normal and expected

### Want to Test Multiple Times?

1. Click "Test Notifications" button again
2. Or reload the page (notifications auto-check on load)
3. Or wait 30 minutes (auto-checks every 30 minutes)

## How It Works

### Simple Browser Notifications (Current Implementation)

```
┌─────────────────────────────────────┐
│ App loads → Wait 3 seconds         │
│           ↓                         │
│ Check for overdue loans            │
│           ↓                         │
│ Show notification for each         │
│           ↓                         │
│ Auto-check every 30 minutes        │
└─────────────────────────────────────┘
```

**Limitations:**
- ⚠️ Only works when app is **open**
- ⚠️ Does not work when app is **closed**
- ✅ No server setup required
- ✅ Works immediately

### Advanced Push Notifications (Future Implementation)

For notifications even when app is closed, you need:
- VAPID keys generation
- Service Worker with push events
- Backend scheduler (runs 24/7)
- Supabase push_subscriptions table

See `PUSH_NOTIFICATIONS_SETUP.md` for full setup.

## Manual Testing Commands

Open browser console (F12) and try:

```javascript
// Check if notifications are working
window.SimpleNotifications.checkOverdue()

// Request permission manually
await window.SimpleNotifications.requestPermission()

// Show a test notification
const testClient = { name: 'Test Client', id: 'test-1' };
const testLoan = { id: 'loan-1', clientId: 'test-1', status: 'active' };
window.SimpleNotifications.showNotification(testLoan, testClient, 5000)
```

## Current Notification Logic

Notifications are shown for loans where:
- `status` = 'active'
- `nextDueDate` ≤ today
- `remaining` > 0 (not fully paid)

## Integration with Dummy Data

The "Load Dummy Clients (18)" button creates:
- 18 clients with random Indian names
- 18 active loans
- Due dates between 15-45 days ago (all overdue)
- No payments made (fully unpaid)

Perfect for testing notifications!

## Notification Frequency

### Auto-Check Schedule
- **On app load**: After 3 seconds
- **While app is open**: Every 30 minutes
- **Manual**: Click "Test Notifications" button anytime

### To Change Frequency

Edit `simple-notifications.js`:

```javascript
// Change from 30 minutes to 10 minutes:
setInterval(() => {
  checkAndNotifyOverdueLoans();
}, 10 * 60 * 1000);  // 10 minutes
```

## Production Recommendations

### For Local Testing (Current)
- ✅ Use simple-notifications.js
- ✅ Works immediately
- ✅ No setup required

### For Production (Recommended)
- 🔄 Implement push-notifications.js
- 🔄 Set up VAPID keys
- 🔄 Run notification_scheduler.py
- 🔄 Works even when app is closed

## Support

Issues? Check:
1. Browser console for errors
2. `Notification.permission` status
3. Browser notification settings
4. Try in incognito mode (fresh permissions)

Contact:
- Email: samkassfinance@gmail.com
- WhatsApp: +91 7904987242
