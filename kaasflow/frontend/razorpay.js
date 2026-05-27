// Razorpay Payment Integration
const RazorpayPayment = {
  keyId: 'rzp_live_SuharfZYrJBbHj', // Fallback to provided live key
  
  async init() {
    try {
      const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://127.0.0.1:5000/api'
        : window.location.origin + '/api';
        
      const res = await fetch(`${apiBase}/payment/key`);
      const data = await res.json();
      if (data.key) {
        this.keyId = data.key;
      }
    } catch (e) {
      console.warn("Failed to load Razorpay Key from backend, using default:", e);
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

  async createOrder(amount, planType) {
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
      return await res.json();
    } catch (e) {
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
    const self = this;
    const rzpOptions = {
      key: this.keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'KaasFlow',
      description: options.description || `${options.planType} Plan`,
      order_id: orderData.id,
      handler: async function (response) {
        if (typeof showToast === 'function') {
          showToast('Verifying payment signature...', 'info');
        }
        
        try {
          const verification = await self.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan_type: options.planType
          });
          
          if (verification.success && verification.plan_activated) {
            options.onSuccess?.({
              razorpay_payment_id: response.razorpay_payment_id,
              subscription: verification.subscription,
              message: verification.message
            });
          } else {
            options.onError?.({ error: verification.error || 'Payment verification failed' });
          }
        } catch (e) {
          options.onError?.({ error: e.message });
        }
      },
      prefill: {
        name: options.prefill?.name || '',
        email: options.prefill?.email || '',
        contact: options.prefill?.contact || ''
      },
      theme: {
        color: '#10b981'
      },
      modal: {
        ondismiss: function () {
          options.onError?.({ error: 'Payment checkout closed' });
        }
      }
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();
    } else {
      options.onError?.({ error: 'Razorpay SDK failed to load.' });
    }
  },

  async initiatePayment(amount, options = {}) {
    try {
      const orderResponse = await this.createOrder(amount, options.planType);
      if (orderResponse.success && orderResponse.order) {
        this.openCheckout(orderResponse.order, options);
      } else {
        options.onError?.({ error: orderResponse.error || 'Order creation failed' });
      }
    } catch (error) {
      options.onError?.({ error: error.message });
    }
  },

  // Plan-specific payment methods
  async payForPlan(planType, options = {}) {
    const plans = {
      'monthly': { amount: 199, name: 'Monthly Plan' },
      'quarterly': { amount: 589, name: 'Quarterly Plan' },
      'yearly': { amount: 2370, name: 'Yearly Plan' }
    };
    
    const plan = plans[planType];
    if (!plan) {
      options.onError?.({ error: 'Invalid plan type' });
      return;
    }
    
    await this.initiatePayment(plan.amount, {
      ...options,
      planType: planType,
      description: plan.name
    });
  }
};

