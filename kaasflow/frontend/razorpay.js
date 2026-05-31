// Razorpay Payment Integration - INSTANT POPUP FIX
const RazorpayPayment = {
  keyId: 'rzp_live_SuharfZYrJBbHj',
  keySecret: 'FsmmZywk4NGiI1PxIS4UWb0e',
  sdkLoaded: false,
  preloadedOrders: {}, // Store pre-created orders for instant popup
  
  // Wait for Razorpay SDK to load
  async waitForSDK(maxAttempts = 20) {
    for (let i = 0; i < maxAttempts; i++) {
      if (typeof window.Razorpay !== 'undefined') {
        this.sdkLoaded = true;
        console.log('✅ Razorpay SDK ready');
        return true;
      }
      console.log(`⏳ Waiting for Razorpay SDK... (${i + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    console.error('❌ Razorpay SDK failed to load after', maxAttempts, 'attempts');
    return false;
  },
  
  async init() {
    console.log('🔧 Initializing RazorpayPayment...');
    
    // Wait for SDK to load
    const loaded = await this.waitForSDK();
    if (!loaded) {
      console.error('❌ Cannot initialize - Razorpay SDK not loaded');
      alert('Payment gateway failed to load. Please check your internet connection and refresh the page.');
      return;
    }
    
    console.log('🔑 Using Key ID:', this.keyId);
    
    try {
      const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://127.0.0.1:5000/api'
        : window.location.origin + '/api';
        
      const res = await fetch(`${apiBase}/payment/key`);
      const data = await res.json();
      if (data.key) {
        this.keyId = data.key;
        console.log('✅ Updated key from backend:', this.keyId);
      }
    } catch (e) {
      console.warn("⚠️ Could not fetch key from backend, using hardcoded key:", e);
    }
  },

  // PRE-LOAD ORDERS FOR ALL PLANS (called when upgrade modal opens)
  async preloadOrders() {
    console.log('🔄 Pre-loading orders for all plans...');
    const plans = ['monthly', 'quarterly', 'yearly'];
    const amounts = { monthly: 270, quarterly: 850, yearly: 1999 };
    
    for (const plan of plans) {
      try {
        const orderData = await this.createOrder(amounts[plan], plan);
        if (orderData.success && orderData.order) {
          this.preloadedOrders[plan] = orderData.order;
          console.log(`✅ Pre-loaded order for ${plan}:`, orderData.order.id);
        } else {
          console.warn(`⚠️ Failed to pre-load ${plan}:`, orderData.error);
        }
      } catch (e) {
        console.error(`❌ Error pre-loading ${plan}:`, e);
      }
    }
    console.log('✅ Order pre-loading complete');
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

  getUserPhone() {
    try {
      const settings = JSON.parse(localStorage.getItem('kf_settings') || '{}');
      return settings.phone || null;
    } catch {
      return null;
    }
  },

  getUserIdentifier() {
    const phone = this.getUserPhone();
    const email = this.getUserEmail();
    return phone || email || 'unknown_user';
  },

  async createOrder(amount, planType) {
    console.log('📝 Creating order:', { amount, planType });
    
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

      console.log('🌐 POST', `${apiBase}/payment/create-order`);

      const res = await fetch(`${apiBase}/payment/create-order`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount, plan_type: planType, email })
      });
      
      const data = await res.json();
      console.log('📥 Order response:', data);
      return data;
    } catch (e) {
      console.error('❌ Create order error:', e);
      return { success: false, error: e.message };
    }
  },

  async verifyPayment(paymentData) {
    console.log('🔍 Verifying payment...');
    
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
      console.log('✅ Verification response:', data);
      return data;
    } catch (e) {
      console.error('❌ Verify error:', e);
      return { success: false, error: e.message };
    }
  },

  async openCheckout(orderData, options = {}) {
    console.log('💳 Opening Razorpay checkout...');
    console.log('📦 Order:', orderData.id, '| Amount: ₹' + (orderData.amount / 100));
    
    // Ensure SDK is loaded
    if (!this.sdkLoaded) {
      console.log('⏳ SDK not ready, waiting...');
      const loaded = await this.waitForSDK();
      if (!loaded) {
        const msg = 'Payment gateway not loaded. Please refresh the page and try again.';
        alert(msg);
        if (typeof showToast === 'function') {
          showToast(msg, 'error');
        }
        options.onError?.({ error: 'Razorpay SDK not loaded' });
        return;
      }
    }
    
    // Double-check window.Razorpay exists
    if (typeof window.Razorpay === 'undefined') {
      console.error('❌ CRITICAL: window.Razorpay is undefined!');
      const msg = 'Payment gateway not available. Please refresh the page.';
      alert(msg);
      options.onError?.({ error: 'Razorpay SDK not available' });
      return;
    }
    
    const self = this;
    const userIdentifier = this.getUserIdentifier();
    const userPhone = this.getUserPhone();
    const userEmail = this.getUserEmail();
    
    const rzpOptions = {
      key: this.keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'SamKass',
      description: options.description || `${options.planType} Plan`,
      order_id: orderData.id,
      handler: async function (response) {
        console.log('✅ Payment successful!', response.razorpay_payment_id);
        
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
            console.log('🎉 Plan activated!');
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
          console.error('❌ Handler error:', e);
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
          console.log('⚠️ Payment cancelled');
          if (typeof showToast === 'function') {
            showToast('Payment cancelled', 'info');
          }
          options.onError?.({ error: 'Payment checkout closed' });
        }
      }
    };

    console.log('🎯 Opening Razorpay with key:', this.keyId);

    try {
      console.log('🚀 Creating Razorpay instance...');
      const rzp = new window.Razorpay(rzpOptions);
      console.log('✅ Instance created');
      console.log('🔓 Opening modal...');
      rzp.open();
      console.log('✅ Modal opened successfully!');
    } catch (error) {
      console.error('❌ CRITICAL ERROR:', error);
      console.error('Error stack:', error.stack);
      const msg = 'Failed to open payment: ' + error.message;
      alert(msg);
      if (typeof showToast === 'function') {
        showToast(msg, 'error');
      }
      options.onError?.({ error: msg });
    }
  },

  async initiatePayment(amount, options = {}) {
    console.log('🎬 Initiating payment:', amount);
    
    try {
      const orderResponse = await this.createOrder(amount, options.planType);
      
      if (orderResponse.success && orderResponse.order) {
        console.log('✅ Order created, opening checkout...');
        await this.openCheckout(orderResponse.order, options);
      } else {
        console.error('❌ Order creation failed:', orderResponse.error);
        const msg = 'Failed to create order: ' + (orderResponse.error || 'Unknown error');
        alert(msg);
        options.onError?.({ error: orderResponse.error || 'Order creation failed' });
      }
    } catch (error) {
      console.error('❌ Initiate error:', error);
      alert('Payment failed: ' + error.message);
      options.onError?.({ error: error.message });
    }
  },

  // INSTANT POPUP - Use pre-loaded order (NO ASYNC DELAY)
  payForPlanInstant(planType, options = {}) {
    console.log('💰 payForPlanInstant:', planType);
    
    const plans = {
      'monthly':   { amount: 270,  name: 'Monthly Plan' },
      'quarterly': { amount: 850,  name: 'Quarterly Plan' },
      'yearly':    { amount: 1999, name: 'Yearly Plan' }
    };
    
    const plan = plans[planType];
    if (!plan) {
      console.error('❌ Invalid plan:', planType);
      alert('Invalid plan selected');
      options.onError?.({ error: 'Invalid plan type' });
      return;
    }
    
    // Check if we have a pre-loaded order
    const preloadedOrder = this.preloadedOrders[planType];
    if (!preloadedOrder || !preloadedOrder.id) {
      console.warn('⚠️ No pre-loaded order found, falling back to async flow');
      alert('Payment setup incomplete. Please close and reopen the upgrade modal.');
      // Trigger preload for next time
      this.preloadOrders();
      options.onError?.({ error: 'Order not pre-loaded' });
      return;
    }
    
    console.log('✅ Using pre-loaded order:', preloadedOrder.id);
    console.log('📋 Plan:', plan.name, '| Amount: ₹' + plan.amount);
    
    const settings = JSON.parse(localStorage.getItem('kf_settings') || '{}');
    const userPhone = this.getUserPhone();
    const userEmail = this.getUserEmail();
    
    console.log('👤 User:', userEmail || userPhone || 'unknown');
    
    // Open Razorpay INSTANTLY - NO ASYNC GAP
    this.openCheckout(preloadedOrder, {
      ...options,
      planType: planType,
      description: plan.name,
      prefill: {
        name: settings.financierName || 'User',
        email: userEmail || '',
        contact: userPhone || ''
      }
    });
  },

  // Legacy method for backward compatibility
  async payForPlan(planType, options = {}) {
    console.log('💰 payForPlan (legacy):', planType);
    
    const plans = {
      'monthly':   { amount: 270,  name: 'Monthly Plan' },
      'quarterly': { amount: 850,  name: 'Quarterly Plan' },
      'yearly':    { amount: 1999, name: 'Yearly Plan' }
    };
    
    const plan = plans[planType];
    if (!plan) {
      console.error('❌ Invalid plan:', planType);
      alert('Invalid plan selected');
      options.onError?.({ error: 'Invalid plan type' });
      return;
    }
    
    console.log('📋 Plan:', plan.name, '| Amount: ₹' + plan.amount);
    
    const settings = JSON.parse(localStorage.getItem('kf_settings') || '{}');
    const userPhone = this.getUserPhone();
    const userEmail = this.getUserEmail();
    
    console.log('👤 User:', userEmail || userPhone || 'unknown');
    
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, initializing Razorpay...');
    RazorpayPayment.init();
  });
} else {
  console.log('📄 DOM already loaded, initializing Razorpay...');
  RazorpayPayment.init();
}

console.log('✅ razorpay.js loaded');
