/**
 * Quick deployment verification script
 * Run this in browser console on your live site: https://samkass.site
 */

console.log('🔔 SamKass Notification System - Deployment Verification');
console.log('='.repeat(60));

// Test 1: Check VAPID Configuration
console.log('\n📋 1. Checking VAPID Configuration...');
const expectedVapidKey = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEi5yfifMhVfk4LfepI5vxQfUtmhQX2rEunJzRKgneLn6hdRpF5aueJ8sFC-HVCCelvxqHWYyFry8_p9WIdUI89Q';

if (window.SamKassConfig?.VAPID_PUBLIC_KEY === expectedVapidKey) {
    console.log('✅ VAPID public key correctly configured');
} else if (window.SamKassConfig?.VAPID_PUBLIC_KEY) {
    console.log('⚠️ VAPID key found but different from expected:');
    console.log('   Expected:', expectedVapidKey.substring(0, 50) + '...');
    console.log('   Found:', window.SamKassConfig.VAPID_PUBLIC_KEY.substring(0, 50) + '...');
} else {
    console.log('❌ VAPID public key not found');
    console.log('   Check if config.js is properly deployed');
}

// Test 2: Check Browser Support
console.log('\n🌐 2. Checking Browser Support...');
const hasNotifications = 'Notification' in window;
const hasServiceWorker = 'serviceWorker' in navigator;
const hasPushManager = 'PushManager' in window;

console.log(`   Notifications: ${hasNotifications ? '✅' : '❌'}`);
console.log(`   Service Worker: ${hasServiceWorker ? '✅' : '❌'}`);
console.log(`   Push Manager: ${hasPushManager ? '✅' : '❌'}`);

if (hasNotifications && hasServiceWorker && hasPushManager) {
    console.log('✅ Browser fully supports push notifications');
} else {
    console.log('❌ Browser missing required features for push notifications');
}

// Test 3: Check Environment
console.log('\n🔒 3. Checking Environment...');
console.log(`   Protocol: ${window.location.protocol} ${window.location.protocol === 'https:' ? '✅' : '❌'}`);
console.log(`   Host: ${window.location.host}`);
console.log(`   Secure Context: ${window.isSecureContext ? '✅' : '❌'}`);

// Test 4: Check Service Worker
console.log('\n⚙️ 4. Checking Service Worker...');
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
            console.log('✅ Service Worker registered');
            console.log(`   Scope: ${registration.scope}`);
            console.log(`   State: ${registration.active?.state || 'unknown'}`);
        } else {
            console.log('⚠️ Service Worker not registered');
            console.log('   Attempting registration...');
            
            navigator.serviceWorker.register('/sw.js').then(reg => {
                console.log('✅ Service Worker registered successfully');
            }).catch(error => {
                console.log('❌ Service Worker registration failed:', error.message);
            });
        }
    });
} else {
    console.log('❌ Service Worker not supported');
}

// Test 5: Check App Integration
console.log('\n🔗 5. Checking App Integration...');
const integrations = {
    'SamKassConfig': !!window.SamKassConfig,
    'PushNotifications': !!window.PushNotifications,
    'SimpleNotifications': !!window.SimpleNotifications,
    'Store': !!window.Store,
    'testNotificationNow': typeof window.testNotificationNow === 'function'
};

Object.entries(integrations).forEach(([name, available]) => {
    console.log(`   ${name}: ${available ? '✅' : '⚠️'}`);
});

// Test 6: Check Permission Status
console.log('\n🔔 6. Checking Permission Status...');
if ('Notification' in window) {
    const permission = Notification.permission;
    console.log(`   Current permission: ${permission}`);
    
    switch (permission) {
        case 'granted':
            console.log('✅ Notifications are allowed');
            break;
        case 'denied':
            console.log('❌ Notifications are blocked');
            console.log('   User must manually enable in browser settings');
            break;
        case 'default':
            console.log('⚠️ Permission not requested yet');
            console.log('   Will be requested after login');
            break;
    }
} else {
    console.log('❌ Notifications not supported');
}

// Test 7: Quick Notification Test
console.log('\n🧪 7. Quick Tests Available...');
console.log('   Run these commands to test:');
console.log('   - testNotificationNow()           // Test simple notification');
console.log('   - debugNotificationEnv()          // Environment debug');
console.log('   - window.SimpleNotifications.testNow()  // App notification test');

// Final Summary
console.log('\n📊 Summary:');
const allGood = hasNotifications && hasServiceWorker && hasPushManager && 
                window.isSecureContext && window.SamKassConfig?.VAPID_PUBLIC_KEY;

if (allGood) {
    console.log('✅ Notification system appears to be properly deployed!');
    console.log('💡 Next steps:');
    console.log('   1. Login to your app');
    console.log('   2. Allow notifications when prompted');
    console.log('   3. Test with: testNotificationNow()');
} else {
    console.log('❌ Issues detected with notification system');
    console.log('💡 Troubleshooting:');
    console.log('   1. Check if config.js is deployed with correct VAPID key');
    console.log('   2. Verify sw.js is accessible');
    console.log('   3. Visit /debug-notifications.html for detailed diagnostics');
}

console.log('\n🔧 Diagnostic Tools:');
console.log('   - /test-notifications.html     // Basic test page');
console.log('   - /debug-notifications.html    // Comprehensive diagnostics');
console.log('\n' + '='.repeat(60));