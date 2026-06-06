/**
 * SamKass - Push Notification Subscription Handler
 * Handles browser push notification permission and subscription
 */

(function() {
  'use strict';

  const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_HERE'; // Will be set from environment

  // Convert base64 VAPID key to Uint8Array
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Check if push notifications are supported
  function isPushSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Get current push subscription
  async function getCurrentSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  // Subscribe to push notifications
  async function subscribeToPush() {
    try {
      if (!isPushSupported()) {
        console.warn('❌ Push notifications not supported');
        return null;
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.log('❌ Notification permission denied');
        return null;
      }

      console.log('✅ Notification permission granted');

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Subscribe to push notifications
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        console.log('✅ Successfully subscribed to push notifications');
      } else {
        console.log('✅ Already subscribed to push notifications');
      }

      // Send subscription to server
      await sendSubscriptionToServer(subscription);

      return subscription;

    } catch (error) {
      console.error('❌ Error subscribing to push:', error);
      return null;
    }
  }

  // Send subscription to backend
  async function sendSubscriptionToServer(subscription) {
    try {
      const token = localStorage.getItem('kf_session_token') || sessionStorage.getItem('kf_session_token');

      if (!token) {
        console.warn('⚠️ No auth token found');
        return;
      }

      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Subscription saved to server:', result.message);
      } else {
        console.error('❌ Failed to save subscription:', result.error);
      }

    } catch (error) {
      console.error('❌ Error sending subscription to server:', error);
    }
  }

  // Unsubscribe from push notifications
  async function unsubscribeFromPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        console.log('✅ Successfully unsubscribed from push notifications');

        // Notify server
        const token = localStorage.getItem('kf_session_token') || sessionStorage.getItem('kf_session_token');
        if (token) {
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              endpoint: subscription.endpoint
            })
          });
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Error unsubscribing:', error);
      return false;
    }
  }

  // Initialize push notifications on login
  function initPushNotifications() {
    if (!isPushSupported()) {
      console.warn('⚠️ Push notifications not supported in this browser');
      return;
    }

    // Check if already subscribed
    getCurrentSubscription().then(subscription => {
      if (!subscription) {
        // Not subscribed - ask user after a short delay
        setTimeout(() => {
          // Only ask if user is logged in
          const token = localStorage.getItem('kf_session_token') || sessionStorage.getItem('kf_session_token');
          if (token) {
            subscribeToPush();
          }
        }, 3000); // Wait 3 seconds after login
      } else {
        console.log('✅ Already subscribed to push notifications');
        // Re-send subscription to server in case it was lost
        sendSubscriptionToServer(subscription);
      }
    });
  }

  // Handle messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'GET_AUTH_TOKEN') {
      // Service worker needs auth token
      const token = localStorage.getItem('kf_session_token') || sessionStorage.getItem('kf_session_token');
      event.ports[0].postMessage({ token });
    } else if (event.data.type === 'PAYMENT_ACTION_SUCCESS') {
      // Payment action was successful - refresh data
      console.log('✅ Payment action completed:', event.data.action);
      
      // Trigger data reload if app is open
      if (window.Store && window.navigateTo) {
        window.Store.loadAll();
        window.navigateTo('collection'); // Navigate to collection page
      }
    } else if (event.data.type === 'NOTIF_OPEN_COLLECTION') {
      // Notification tapped - open collection page
      if (window.navigateTo) {
        window.navigateTo('collection');
      }
    }
  });

  // Expose functions globally
  window.PushNotifications = {
    subscribe: subscribeToPush,
    unsubscribe: unsubscribeFromPush,
    isSupported: isPushSupported,
    getCurrentSubscription: getCurrentSubscription,
    init: initPushNotifications
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPushNotifications);
  } else {
    initPushNotifications();
  }

})();
