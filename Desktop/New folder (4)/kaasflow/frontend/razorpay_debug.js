// Razorpay Payment Integration - DEBUG VERSION
const RazorpayPayment = {
  keyId: 'rzp_live_SuharfZYrJBbHj',
  keySecret: 'FsmmZywk4NGiI1PxIS4UWb0e',
  
  async init() {
    console.log('🔧 RazorpayPayment.init() called');
    console.log('🔑 Key ID:', this.keyId);
    console.log('📦 Razorpay SDK loaded:', typeof window.Razorpay !== 'undefined');
    
    try {
      const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://127.0.0.1:5000/api'
        : window.location.origin + '/api';
      
      console.log('🌐 API Base:', apiBase);
        
      const res = await fetch(`${apiBase}/payment/key`);
      const data = await res.json();
      console.log('✅ Backend key response:', data);
      
      if (data.key) {
        this.keyId = data.key;
        console.log('🔄 Updated Key ID from backend:', this.keyId);
      }
    } catch (e) {
      console.warn("⚠️ Failed to load Razorpay Key from backend:", e);
      console.log('📌 Using hardcoded key:', this.keyId);
    }
  },

  getSessionToken() {
    try {
      const session = JSON.parse(localStorage.getItem('kf_session') || '{}');
      console.log('🎫 Session token:', session.token ? 'Found' : 'Not found');
      return session.token || null;
    } catch {
      return null;
    }
  },

  getUserEmail() {
    try {
      const session = JSON.parse(localStorage.getItem('kf_session') || '{}');
      console.log('📧 User email:', session.user?.email || 'Not found');
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
      console.log('📤 Request body:', { amount, plan_type: planType, email });

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
      console.log('✅ Verification response:', data);
      
      return data;
    } catch (e) {
      console.error('❌ Verify payment error:', e);
      return { success: false, error: e.message };
    }
  },

  openCheckout(orderData, options = {}) {
    console.log('💳 Opening Razorpay checkout...');
    console.log('📦 Order data:', orderData);
    console.log('⚙️ Options:', options);
    console.log('🔍 window.Razorpay exists:', typeof window.Razorpay !== 'undefined');
    
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
          console.log('⚠️ Payment modal dismissed');
          if (typeof showToast === 'function') {
            showToast('Payment cancelled', 'info');
          }
          options.onError?.({ error: 'Payment checkout closed' });
        }
      }
    };

    console.log('🎯 Razorpay options:', rzpOptions);

    if (window.Razorpay) {
      try {
        console.log('🚀 Creating Razorpay instance...');
        const rzp = new window.Razorpay(rzpOptions);
        console.log('✅ Razorpay instance created');
        console.log('🔓 Opening checkout...');
        rzp.open();
        console.log('✅ Checkout opened');
      } catch (error) {
        console.error('❌ Razorpay error:', error);
        if (typeof showToast === 'function') {
          showToast('Failed to open payment gateway. Please try again.', 'error');
        }
        options.onError?.({ error: 'Failed to open Razorpay checkout' });
      }
    } else {
      console.error('❌ window.Razorpay is not defined!');
      if (typeof showToast === 'function') {
        showToast('Payment gateway not loaded. Please refresh the page.', 'error');
      }
      options.onError?.({ error: 'Razorpay SDK not loaded' });
    }
  },

  async initiatePayment(amount, options = {}) {
    console.log('🎬 Initiating payment:', { amount, options });
    
    try {
      const orderResponse = await this.createOrder(amount, options.planType);
      
      if (orderResponse.success && orderResponse.order) {
        console.log('✅ Order created, opening checkout...');
        this.openCheckout(orderResponse.order, options);
      } else {
        console.error('❌ Order creation failed:', orderResponse.error);
        options.onError?.({ error: orderResponse.error || 'Order creation failed' });
      }
    } catch (error) {
      console.error('❌ Initiate payment error:', error);
      options.onError?.({ error: error.message });
    }
  },

  async payForPlan(planType, options = {}) {
    console.log('💰 payForPlan called:', planType);
    
    const plans = {
      'monthly':   { amount: 270,  name: 'Monthly Plan' },
      'quarterly': { amount: 850,  name: 'Quarterly Plan' },
      'yearly':    { amount: 1999, name: 'Yearly Plan' }
    };
    
    const plan = plans[planType];
    if (!plan) {
      console.error('❌ Invalid plan type:', planType);
      options.onError?.({ error: 'Invalid plan type' });
      return;
    }
    
    console.log('📋 Plan details:', plan);
    
    const settings = JSON.parse(localStorage.getItem('kf_settings') || '{}');
    const userPhone = this.getUserPhone();
    const userEmail = this.getUserEmail();
    
    console.log('👤 User details:', { userPhone, userEmail, financierName: settings.financierName });
    
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

console.log('🔧 razorpay_debug.js loaded');
console.log('📦 RazorpayPayment object:', RazorpayPayment);
window.RazorpayPayment = RazorpayPayment;
