# 🔧 SamKass Notification System - Local Testing Guide

## **Prerequisites**
- ✅ VAPID keys are configured in `kaasflow/backend/.env`
- ✅ Python dependencies installed
- ✅ Browser that supports notifications (Chrome, Firefox, Edge)

## **Step 1: Start Backend Server**

**Option A: Simple Backend (Recommended for testing)**
```bash
cd kaasflow/backend
python app_simple.py
```

**Option B: Full Backend (if dependencies work)**
```bash
cd kaasflow/backend
python app.py
```

**Expected Output:**
```
🚀 Starting SamKass backend server on port 5000
📋 VAPID Keys: ✅ Configured
* Running on http://127.0.0.1:5000
```

Keep this terminal window open!

## **Step 2: Verify Backend Configuration**

Open a new terminal and test:
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{"status": "ok", "message": "SamKass backend is running!"}
```

Test VAPID configuration:
```bash
curl http://localhost:5000/api/test-notification-config
```

**Expected Response:**
```json
{
  "vapid_configured": true,
  "vapid_public_key": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEi5yfifMhVf...",
  "vapid_claim_email": "mailto:samkassfinance@gmail.com",
  "notification_system": "ready"
}
```

## **Step 3: Start Frontend Server**

Open a new terminal:
```bash
cd kaasflow/frontend

# Option A: Using Python
python -m http.server 8080

# Option B: Using Node.js (if installed)
npx serve -p 8080

# Option C: Using PHP (if installed)
php -S localhost:8080
```

**Expected Output:**
```
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

## **Step 4: Test Notification System in Browser**

### **4A: Basic Browser Test**

1. Open browser and go to: `http://localhost:8080`
2. Open Developer Tools (F12)
3. Go to Console tab
4. Run test commands:

```javascript
// Test 1: Check VAPID Configuration
console.log('VAPID Key:', window.SamKassConfig?.VAPID_PUBLIC_KEY);

// Test 2: Check Browser Support
console.log('Notifications supported:', 'Notification' in window);
console.log('Service Worker supported:', 'serviceWorker' in navigator);
console.log('Push Manager supported:', 'PushManager' in window);

// Test 3: Check Permission Status
console.log('Permission:', Notification.permission);
```

### **4B: Permission & Simple Notification Test**

In browser console:
```javascript
// Request permission
Notification.requestPermission().then(permission => {
    console.log('Permission result:', permission);
    
    if (permission === 'granted') {
        // Test simple notification
        new Notification('🔔 SamKass Test', {
            body: 'Local notification test successful!',
            icon: '/logo.png',
            requireInteraction: true
        });
    }
});
```

### **4C: Service Worker Test**

In browser console:
```javascript
// Register service worker
navigator.serviceWorker.register('/sw.js').then(registration => {
    console.log('✅ Service Worker registered:', registration);
}).catch(error => {
    console.log('❌ Service Worker failed:', error);
});
```

### **4D: Push Subscription Test**

In browser console:
```javascript
// Test push subscription
async function testPushSubscription() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const vapidKey = window.SamKassConfig?.VAPID_PUBLIC_KEY;
        
        if (!vapidKey) {
            console.log('❌ VAPID key not found');
            return;
        }
        
        // Convert VAPID key
        function urlBase64ToUint8Array(base64String) {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
                .replace(/-/g, '+')
                .replace(/_/g, '/');
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        }
        
        const applicationServerKey = urlBase64ToUint8Array(vapidKey);
        
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey
        });
        
        console.log('✅ Push subscription successful!');
        console.log('Subscription:', subscription);
        
        return subscription;
        
    } catch (error) {
        console.log('❌ Push subscription failed:', error);
    }
}

// Run the test
testPushSubscription();
```

## **Step 5: Test Comprehensive Diagnostics**

Visit: `http://localhost:8080/debug-notifications.html`

This page will automatically test:
- ✅ Browser support
- ✅ VAPID configuration  
- ✅ Service Worker registration
- ✅ Permission status
- ✅ Push subscription
- ✅ Simple notifications

**All checks should show green ✅**

## **Step 6: Test App Integration (if main app works)**

1. Visit: `http://localhost:8080` (main app)
2. Try to login (use existing credentials or create test account)
3. After login, check console for:
   ```
   ✅ Push Notifications Manager loaded
   🔔 [NOTIF] ========== INITIALIZING NOTIFICATIONS ==========
   ✅ [NOTIF] Initialization successful
   ```

4. Test app notification functions:
```javascript
// Test app-specific notifications
window.testNotificationNow();
window.SimpleNotifications.testNow();
window.debugNotificationEnv();
```

## **Step 7: Test Manual Notification Commands**

In browser console:
```javascript
// Test 1: Simple notification
if (Notification.permission === 'granted') {
    new Notification('📱 Manual Test', {
        body: 'This is a manual test notification',
        requireInteraction: true
    });
}

// Test 2: Check notification objects
console.log('SimpleNotifications:', window.SimpleNotifications);
console.log('PushNotifications:', window.PushNotifications);

// Test 3: App notification check
if (window.SimpleNotifications) {
    window.SimpleNotifications.checkOverdue();
}
```

## **🔍 Expected Results**

### ✅ **Everything Working:**
- Backend server starts without errors
- VAPID keys are loaded
- Browser supports all notification features
- Permission is granted
- Service Worker registers successfully
- Push subscription works
- Simple notifications show
- Console shows no errors

### ❌ **Common Issues & Solutions:**

**Issue: "VAPID key not found"**
- Solution: Check `config.js` has correct VAPID key
- Run: `console.log(window.SamKassConfig)`

**Issue: "Service Worker registration failed"**
- Solution: Check `sw.js` exists and is accessible
- Visit: `http://localhost:8080/sw.js` directly

**Issue: "Permission denied"**
- Solution: Reset browser permissions
- Chrome: Settings > Privacy > Site Settings > Notifications

**Issue: "Push subscription failed"**  
- Solution: Check HTTPS (use `https://localhost` if needed)
- Some browsers require secure context

## **🧪 Final Verification Tests**

Run these in sequence:

```javascript
// 1. Environment check
console.log('URL:', location.href);
console.log('Protocol:', location.protocol);
console.log('VAPID:', window.SamKassConfig?.VAPID_PUBLIC_KEY?.substring(0,20) + '...');

// 2. Feature check
const features = {
    notifications: 'Notification' in window,
    serviceWorker: 'serviceWorker' in navigator,
    pushManager: 'PushManager' in window
};
console.log('Features:', features);

// 3. Permission check
console.log('Permission:', Notification.permission);

// 4. Test notification
if (Notification.permission === 'granted') {
    new Notification('🎉 SamKass Ready!', {
        body: 'All notification tests passed! System is ready for deployment.',
        requireInteraction: true
    });
}
```

## **🚀 Ready for GitHub?**

If all tests pass:
1. ✅ VAPID keys work
2. ✅ Browser supports notifications  
3. ✅ Service Worker registers
4. ✅ Push subscriptions work
5. ✅ Simple notifications show

**Then you're ready to push to GitHub and deploy!**

## **📝 Testing Checklist**

- [ ] Backend starts successfully
- [ ] VAPID keys are configured
- [ ] Frontend serves files
- [ ] Browser supports notifications
- [ ] Permission can be granted
- [ ] Service Worker registers
- [ ] Push subscription works
- [ ] Simple notifications show
- [ ] No console errors
- [ ] App integration works (if applicable)

**If all items are checked ✅, your notification system is ready!**