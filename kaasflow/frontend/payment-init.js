/**
 * Payment System Bootstrap
 * Ensures Razorpay key is available immediately
 * Load this FIRST, before any other payment scripts
 */

console.log('📄 Loading payment-init.js...');

// Create global payment config
window.PAYMENT_CONFIG = {
  RAZORPAY_KEY: 'rzp_test_T2ccqRvYXx6jzC',
  API_BASE: (function() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:5000/api';
    }
    return window.location.origin + '/api';
  })(),
  isReady: false
};

console.log('✅ Payment config ready:', window.PAYMENT_CONFIG);

// Initialize Razorpay object if needed
if (!window.RazorpayPayment) {
  window.RazorpayPayment = {
    keyId: window.PAYMENT_CONFIG.RAZORPAY_KEY,
    sdkLoaded: false,
    isInitialized: false,
    
    async init() {
      if (this.isInitialized) return;
      console.log('🔧 Initializing RazorpayPayment (bootstrap)...');
      
      // Set key immediately
      this.keyId = window.PAYMENT_CONFIG.RAZORPAY_KEY;
      console.log('✅ Razorpay key set: ' + this.keyId.substring(0, 20) + '...');
      
      // Ensure SDK is loaded
      await this.ensureSDKLoaded();
      this.isInitialized = true;
    },
    
    async ensureSDKLoaded() {
      if (typeof window.Razorpay !== 'undefined') {
        this.sdkLoaded = true;
        console.log('✅ Razorpay SDK already loaded');
        return true;
      }
      
      // Load SDK dynamically
      return new Promise((resolve) => {
        console.log('🔧 Loading Razorpay SDK...');
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          this.sdkLoaded = true;
          console.log('✅ Razorpay SDK loaded successfully');
          resolve(true);
        };
        script.onerror = () => {
          console.error('❌ Failed to load Razorpay SDK');
          resolve(false);
        };
        document.head.appendChild(script);
      });
    },
    
    getApiBase() {
      return window.PAYMENT_CONFIG.API_BASE;
    }
  };
  
  console.log('✅ RazorpayPayment object created with fallback key');
}

// Mark as ready
window.PAYMENT_CONFIG.isReady = true;
console.log('✅ payment-init.js loaded and ready');
