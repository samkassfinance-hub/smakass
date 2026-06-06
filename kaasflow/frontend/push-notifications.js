/**
 * SamKass Push Notifications
 * Handles browser push notification subscription and management
 */

// VAPID public key from config
const VAPID_PUBLIC_KEY = window.SamKassConfig?.VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY_HERE';

class PushNotificationManager {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.isSubscribed = false;
    this.subscription = null;
  }

  // Initialize push notifications after login
  async initAfterLogin() {
    if (!this.isSupported) {
      console.warn('⚠️ Push notifications not supported in this browser');
      return false;
    }

    try {
      // Register service worker if not already registered
      const registration = await this.ensureServiceWorker();
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        console.log('✅ Already subscribed to push notifications');
        this.subscription = existingSubscription;
        this.isSubscribed = true;
        return true;
      }

      // Request notification permission
      const permission = await this.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('⚠️ Notification permission denied');
        return false;
      }

      // Subscribe to push notifications
      await this.subscribeToPush(registration);
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize push notifications:', error);
      return false;
    }
  }

  // Ensure service worker is registered
  async ensureServiceWorker() {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      return await navigator.serviceWorker.register('/sw.js');
    }
    
    return registration;
  }

  // Request notification permission
  async requestPermission() {
    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    // Request permission
    return await Notification.requestPermission();
  }

  // Subscribe to push notifications
  async subscribeToPush(registration) {
    try {
      // Convert VAPID key to Uint8Array
      const applicationServerKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      console.log('✅ Successfully subscribed to push notifications');
      this.subscription = subscription;
      this.isSubscribed = true;

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;

    } catch (error) {
      console.error('❌ Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  // Send subscription to server
  async sendSubscriptionToServer(subscription) {
    try {
      // Get token from kf_session
      const session = JSON.parse(localStorage.getItem('kf_session') || '{}');
      const token = session.token;
      
      if (!token) {
        throw new Error('No auth token found');
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

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save subscription');
      }

      console.log('✅ Subscription saved to server:', result);
      return result;

    } catch (error) {
      console.error('❌ Failed to save subscription to server:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    if (!this.subscription) {
      return false;
    }

    try {
      // Unsubscribe from browser
      await this.subscription.unsubscribe();
      
      // Notify server
      const session = JSON.parse(localStorage.getItem('kf_session') || '{}');
      const token = session.token;
      
      if (token) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            endpoint: this.subscription.endpoint
          })
        });
      }

      this.subscription = null;
      this.isSubscribed = false;
      
      console.log('✅ Unsubscribed from push notifications');
      return true;

    } catch (error) {
      console.error('❌ Failed to unsubscribe:', error);
      return false;
    }
  }

  // Convert VAPID key from base64 to Uint8Array
  urlBase64ToUint8Array(base64String) {
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

  // Check if push notifications are supported and enabled
  getStatus() {
    return {
      supported: this.isSupported,
      permission: Notification.permission,
      subscribed: this.isSubscribed,
      subscription: this.subscription
    };
  }
}

// Create global instance
window.PushNotifications = new PushNotificationManager();

// Auto-initialize after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  // Listen for auth token messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    const msg = event.data;
    console.log('📨 PushManager: Message from SW:', msg.type);
    
    if (msg.type === 'GET_TOKEN_FOR_SW' || msg.type === 'GET_AUTH_TOKEN') {
      // SW requesting token
      const session = JSON.parse(localStorage.getItem('kf_session') || '{}');
      const token = session.token;
      console.log('📤 PushManager: Sending token to SW');
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ token });
      }
    }
  });
});

console.log('✅ Push Notifications Manager loaded');