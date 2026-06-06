/**
 * SamKass Frontend Configuration
 */

// VAPID Public Key for Push Notifications
// This is safe to expose in frontend - it's the PUBLIC key
const VAPID_PUBLIC_KEY = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEi5yfifMhVfk4LfepI5vxQfUtmhQX2rEunJzRKgneLn6hdRpF5aueJ8sFC-HVCCelvxqHWYyFry8_p9WIdUI89Q';

// Export for use in other modules
window.SamKassConfig = {
  VAPID_PUBLIC_KEY: VAPID_PUBLIC_KEY
};

console.log('✅ SamKass config loaded');