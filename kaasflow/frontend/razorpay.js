// Razorpay Payment Integration - Enhanced with Debug Logging
const RazorpayPayment = {
  keyId: 'rzp_live_SuharfZYrJBbHj', // Your live Razorpay Key ID
  keySecret: 'FsmmZywk4NGiI1PxIS4UWb0e', // Your live Razorpay Key Secret (keep secure!)
  
  async init() {
    console.log('🔧 RazorpayPayment.init() called');
    try {
      const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://127.0.0.1:5000/api'
        : window.location.origin + '/api';
        
      console.log('📡 Fetching Razorpay key from:', `${apiBase}/payment/key`);
      const res = await fetch(`${apiBase}/payment/key`);
      const data = await res.json();
      if (data.key) {
        this.keyId = data.key;
        console.log('✅ Razorpay Key loaded from backend:', this.keyId);
      } else {
        console.warn('⚠️ No key from backend, using hardcoded:', this.keyId);
      }
    } catch (e) {
      console.warn("⚠️ Failed to load Razorpay Key from backend, using default:", e);
      console.log('🔑 Using hardcoded key:', this.keyId);
    }
    
    // Check if Razorpay SDK is loaded
    if (window.Razorpay) {
      console.log('✅ Razorpay SDK loaded successfully');
    } else {
      console.error('❌ Razorpay SDK NOT loaded! Check if <script src="https://checkout.razorpay.com/v1/checkout.js"> is in HTML');
    }
  },

  getSessionToken() {
    try {
      const session = JSON.parse(localStorage.getItem('kf_session') || '{}');
      return session.token || null;
    } catch {
      return null;
    }
  },

  getUserEmail() {
    try {
      const session = JSON.parse(localStorage.getItem('kf_session') || '{}');
      return session.user?.email || null;
    } catch {
      return null;
    }
  },

  // Get current logged-in user's phone number for account isolation
  getUserPhone() {
    try {
      const settings = JSON.parse(localStorage.getItem('kf_settings') || '{}');
      return settings.phone || null;
    } catch {
      return null;
    }
  },

  // Get unique user identifier for account isolation
  getUserIdentifier() {
    const phone = this.getUserPhone();
    const email = this.getUserEmail();
    return phone || email || 'unknown_user';
  },

  async createOrder(amount, planType) {
    console.log('📝 Creating Razorpay order:', { amount, planType });
    try {
      const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://127.0.0.1:5000/api'
        : window.location.origin + '/api';

      const headers = { 'Content-Type': 'application/json' };
      const token = this.getSessionToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 Added Authorization header');
      }
      const email = this.getUserEmail();
      if (email) {
        headers['X-User-Email'] = email;
        console.log('📧 User email:', email);
      }

      const payload = { amount, plan_type: planType, email };
      console.log('📤 Sending to:', `${apiBase}/payment/create-order`);
      console.log('📦 Payload:', payload);

      const res = await fetch(`${apiBase}/payment/create-order`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      console.log('📥 Order response:', data);
      
      if (data.success) {
        console.log('✅ Order created successfully:', data.order.id);
        console.log('💰 Amount:', data.order.amount, 'paise (₹' + (data.order.amount / 100) + ')');
      } else {
        console.error('❌ Order creation failed:', data.error);
      }
      
      return data;
    } catch (e) {
      console.error('❌ Error creating order:', e);
      return { success: false, error: e.message };
    }
  },

  async verifyPayment(paymentData) {
    console.log('🔍 Verifying payment:', paymentData);
    try {
      const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://127.0.0.1:5000/api'
        : window.location.origin + '/api';

      const headers = { 'Content-Type': 'application/json' };
      const token = this.getSessionToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const email = this.getUserEmail();
      if (email) {
        headers['X-User-Email'] = email;
      }

      const res = await fetch(`${apiBase}/payment/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...paymentData, email })
      });
      
      const data = await res.json();
      console.log('📥 Verification response:', data);
      return data;
    } catch (e) {
      console.error('❌ Error verifying payment:', e);
      return { success: false, error: e.message };
    }
  },

  async checkSubscriptionStatus() {
    try {
      const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://127.0.0.1:5000/api'
        : window.location.origin + '/api';

      const headers = {};
      const token = this.getSessionToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const email = this.getUserEmail();
      if (email) {
        headers['X-User-Email'] = email;
      }

      const url = email 
        ? `${apiBase}/subscription/status?email=${encodeURIComponent(email)}`
        : `${apiBase}/subscription/status`;

      const res = await fetch(url, { headers });
      return await res.json();
    } catch (e) {
      return { active: false, error: e.message };
    }
  },

  openCheckout(orderData, options = {}) {
    console.log('💳 Opening Razorpay checkout with order:', orderData);
    console.log('🎯 Options:', options);
    
    const self = this;
    const userIdentifier = this.getUserIdentifier();
    const userPhone = this.getUserPhone();
    const userEmail = this.getUserEmail();
    
    console.log('👤 User info:', { userIdentifier, userPhone, userEmail });
    
    const rzpOptions = {
      key: this.keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'SamKass',
      description: options.description || `${options.planType} Plan`,
      order_id: orderData.id,
      handler: async function (response) {
        console.log('✅ Payment successful!', response);
        if (typeof showToast === 'function') {
          showToast('Verifying payment...', 'info');
        }
        
        try {
          const verification = await self.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan_type: options.planType,
            user_identifier: userIdentifier,
            user_phone: userPhone,
            user_email: userEmail
          });
          
          if (verification.success && verification.plan_activated) {
            console.log('🎉 Payment verified and plan activated!');
            options.onSuccess?.({
              razorpay_payment_id: response.razorpay_payment_id,
              subscription: verification.subscription,
              message: verification.message,
              user_identifier: userIdentifier
            });
          } else {
            console.error('❌ Verification failed:', verification.error);
            options.onError?.({ error: verification.error || 'Payment verification failed' });
          }
        } catch (e) {
          console.error('❌ Error in payment handler:', e);
          options.onError?.({ error: e.message });
        }
      },
      prefill: {
        name: options.prefill?.name || '',
        email: userEmail || options.prefill?.email || '',
        contact: userPhone || options.prefill?.contact || ''
      },
      notes: {
        user_identifier: userIdentifier,
        user_phone: userPhone,
        user_email: userEmail,
        plan_type: options.planType
      },
      theme: {
        color: '#7ed321'
      },
      modal: {
        ondismiss: function () {
          console.log('⚠️ Payment modal dismissed by user');
          if (typeof showToast === 'function') {
            showToast('Payment cancelled', 'info');
          }
          options.onError?.({ error: 'Payment checkout closed' });
        }
      }
    };

    console.log('🔧 Razorpay options:', rzpOptions);

    if (window.Razorpay) {
      console.log('✅ window.Razorpay is available');
      try {
        console.log('🚀 Creating new Razorpay instance...');
        const rzp = new window.Razorpay(rzpOptions);
        console.log('✅ Razorpay instance created');
        console.log('🎬 Opening Razorpay checkout...');
        rzp.open();
        console.log('✅ rzp.open() called successfully');
      } catch (error) {
        console.error('❌ Razorpay error:', error);
        if (typeof showToast === 'function') {
          showToast('Failed to open payment gateway. Please try again.', 'error');
        }
        options.onError?.({ error: 'Failed to open Razorpay checkout: ' + error.message });
      }
    } else {
      console.error('❌ window.Razorpay is NOT available!');
      console.error('💡 Make sure <script src="https://checkout.razorpay.com/v1/checkout.js"> is loaded');
      if (typeof showToast === 'function') {
        showToast('Payment gateway not loaded. Please refresh the page.', 'error');
      }
      options.onError?.({ error: 'Razorpay SDK not loaded' });
    }
  },

  async initiatePayment(amount, options = {}) {
    console.log('🎬 Initiating payment:', { amount, planType: options.planType });
    try {
      const orderResponse = await this.createOrder(amount, options.planType);
      if (orderResponse.success && orderResponse.order) {
        console.log('✅ Order created, opening checkout...');
        this.openCheckout(orderResponse.order, options);
      } else {
        console.error('❌ Order creation failed:', orderResponse.error);
        if (typeof showToast === 'function') {
          showToast('Failed to create order: ' + (orderResponse.error || 'Unknown error'), 'error');
        }
        options.onError?.({ error: orderResponse.error || 'Order creation failed' });
      }
    } catch (error) {
      console.error('❌ Error in initiatePayment:', error);
      if (typeof showToast === 'function') {
        showToast('Payment initiation failed: ' + error.message, 'error');
      }
      options.onError?.({ error: error.message });
    }
  },

  // Plan-specific payment methods
  async payForPlan(planType, options = {}) {
    console.log('💰 payForPlan called:', { planType, options });
    
    const plans = {
      'monthly':   { amount: 270,  name: 'Monthly Plan' },
      'quarterly': { amount: 850,  name: 'Quarterly Plan' },
      'yearly':    { amount: 1999, name: 'Yearly Plan' }
    };
    
    const plan = plans[planType];
    if (!plan) {
      console.error('❌ Invalid plan type:', planType);
      if (typeof showToast === 'function') {
        showToast('Invalid plan selected', 'error');
      }
      options.onError?.({ error: 'Invalid plan type' });
      return;
    }
    
    console.log('📋 Plan details:', plan);
    
    // Get user details for prefill
    const settings = JSON.parse(localStorage.getItem('kf_settings') || '{}');
    const userPhone = this.getUserPhone();
    const userEmail = this.getUserEmail();
    
    console.log('👤 Prefill data:', {
      name: settings.financierName || 'User',
      email: userEmail,
      contact: userPhone
    });
    
    await this.initiatePayment(plan.amount, {
      ...options,
      planType: planType,
      description: plan.name,
      prefill: {
        name: settings.financierName || 'User',
        email: userEmail || '',
        contact: userPhone || ''
      }
    });
  }
};

// Initialize on page load
console.log('🔧 Initializing RazorpayPayment...');
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, calling RazorpayPayment.init()');
    RazorpayPayment.init();
  });
} else {
  console.log('📄 DOM already loaded, calling RazorpayPayment.init()');
  RazorpayPayment.init();
}
