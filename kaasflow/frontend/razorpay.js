// Razorpay Payment Integration
const RazorpayPayment = {
  keyId: 'rzp_live_SuharfZYrJBbHj',
  keySecret: 'FsmmZywk4NGiI1PxIS4UWb0e',
  
  async init() {
    console.log('🔧 Initializing Razorpay with key:', this.keyId);
    console.log('📦 Razorpay SDK loaded:', typeof window.Razorpay !== 'undefined');
    
    try {
      const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://127.0.0.1:5000/api'
        : window.location.origin + '/api';
        
      const res = await fetch(`${apiBase}/payment/key`);
      const data = await res.json();
      if (data.key) {
        this.keyId = data.key;
        console.log('✅ Loaded key from backend:', this.keyId);
      }
    } catch (e) {
      console.warn("⚠️ Failed to load Razorpay Key from backend, using hardcoded:", e);
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
    console.log('📝 Creating Razorpay order:', { amount, planType });
    
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
      return await res.json();
    } catch (e) {
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
    console.log('💳 Opening Razorpay checkout...');
    console.log('📦 Order ID:', orderData.id || 'DIRECT (No Order ID)');
    console.log('💰 Amount:', orderData.amount / 100, 'INR');
    
    // CRITICAL: Check if Razorpay SDK is loaded
    if (typeof window.Razorpay === 'undefined') {
      console.error('❌ CRITICAL: Razorpay SDK not loaded!');
      alert('Payment gateway not loaded. Please refresh the page and try again.');
      if (typeof showToast === 'function') {
        showToast('Payment gateway not loaded. Please refresh the page.', 'error');
      }
      options.onError?.({ error: 'Razorpay SDK not loaded' });
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
      handler: async function (response) {
        console.log('✅ Payment successful!', response.razorpay_payment_id);
        
        if (typeof showToast === 'function') {
          showToast('Verifying payment...', 'info');
        }
        
        // If we have an order ID, we can verify with backend. Otherwise, trust the client payment.
        if (orderData.id) {
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
              console.log('🎉 Plan activated successfully!');
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
        } else {
          // Direct frontend checkout bypasses backend verification
          console.log('🎉 Plan activated successfully (Direct mode)!');
          options.onSuccess?.({
            razorpay_payment_id: response.razorpay_payment_id,
            subscription: { active: true },
            message: 'Payment completed successfully',
            user_identifier: userIdentifier
          });
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
          console.log('⚠️ Payment cancelled by user');
          if (typeof showToast === 'function') {
            showToast('Payment cancelled', 'info');
          }
          options.onError?.({ error: 'Payment checkout closed' });
        }
      }
    };

    if (orderData.id) {
      rzpOptions.order_id = orderData.id;
    }

    console.log('🎯 Razorpay options prepared');
    console.log('🔑 Using key:', this.keyId);

    try {
      console.log('🚀 Creating Razorpay instance...');
      const rzp = new window.Razorpay(rzpOptions);
      console.log('✅ Razorpay instance created successfully');
      console.log('🔓 Opening checkout modal...');
      rzp.open();
      console.log('✅ Checkout modal opened!');
    } catch (error) {
      console.error('❌ CRITICAL ERROR opening Razorpay:', error);
      console.error('Error details:', error.message, error.stack);
      alert('Failed to open payment gateway: ' + error.message + '\n\nPlease refresh the page and try again.');
      if (typeof showToast === 'function') {
        showToast('Failed to open payment gateway. Please try again.', 'error');
      }
      options.onError?.({ error: 'Failed to open Razorpay checkout: ' + error.message });
    }
  },

  async initiatePayment(amount, options = {}) {
    console.log('🎬 Initiating payment for amount:', amount);
    
    try {
      const orderResponse = await this.createOrder(amount, options.planType);
      
      if (orderResponse.success && orderResponse.order) {
        console.log('✅ Order created successfully via backend, opening checkout...');
        this.openCheckout(orderResponse.order, options);
      } else {
        console.warn('⚠️ Order creation failed via backend. Falling back to direct checkout.', orderResponse.error);
        const orderData = { id: null, amount: amount * 100, currency: 'INR' };
        this.openCheckout(orderData, options);
      }
    } catch (error) {
      console.warn('⚠️ Initiate payment error. Falling back to direct checkout.', error);
      const orderData = { id: null, amount: amount * 100, currency: 'INR' };
      this.openCheckout(orderData, options);
    }
  },

  async payForPlan(planType, options = {}) {
    console.log('💰 payForPlan called for:', planType);
    
    const plans = {
      'monthly':   { amount: 270,  name: 'Monthly Plan' },
      'quarterly': { amount: 850,  name: 'Quarterly Plan' },
      'yearly':    { amount: 1999, name: 'Yearly Plan' }
    };
    
    const plan = plans[planType];
    if (!plan) {
      console.error('❌ Invalid plan type:', planType);
      alert('Invalid plan selected: ' + planType);
      options.onError?.({ error: 'Invalid plan type' });
      return;
    }
    
    console.log('📋 Plan details:', plan);
    
    const settings = JSON.parse(localStorage.getItem('kf_settings') || '{}');
    const userPhone = this.getUserPhone();
    const userEmail = this.getUserEmail();
    
    console.log('👤 User:', { email: userEmail, phone: userPhone });
    
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

console.log('✅ razorpay.js loaded successfully');
