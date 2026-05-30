// Razorpay Payment Integration
const RazorpayPayment = {
  keyId: 'rzp_live_SuharfZYrJBbHj', // Your live Razorpay Key ID
  keySecret: 'FsmmZywk4NGiI1PxIS4UWb0e', // Your live Razorpay Key Secret (keep secure!)
  
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
    const userIdentifier = this.getUserIdentifier();
    const userPhone = this.getUserPhone();
    const userEmail = this.getUserEmail();
    
    const rzpOptions = {
      key: this.keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'KaasFlow',
      description: options.description || `${options.planType} Plan`,
      order_id: orderData.id,
      handler: async function (response) {
        if (typeof showToast === 'function') {
          showToast('Verifying payment...', 'info');
        }
        
        try {
          const verification = await self.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan_type: options.planType,
            user_identifier: userIdentifier, // Link payment to specific user
            user_phone: userPhone,
            user_email: userEmail
          });
          
          if (verification.success && verification.plan_activated) {
            options.onSuccess?.({
              razorpay_payment_id: response.razorpay_payment_id,
              subscription: verification.subscription,
              message: verification.message,
              user_identifier: userIdentifier // Pass user identifier to success handler
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
        color: '#7ed321' // Green theme matching your app
      },
      modal: {
        ondismiss: function () {
          if (typeof showToast === 'function') {
            showToast('Payment cancelled', 'info');
          }
          options.onError?.({ error: 'Payment checkout closed' });
        }
      }
    };

    if (window.Razorpay) {
      try {
        const rzp = new window.Razorpay(rzpOptions);
        rzp.open();
      } catch (error) {
        console.error('Razorpay error:', error);
        if (typeof showToast === 'function') {
          showToast('Failed to open payment gateway. Please try again.', 'error');
        }
        options.onError?.({ error: 'Failed to open Razorpay checkout' });
      }
    } else {
      if (typeof showToast === 'function') {
        showToast('Payment gateway not loaded. Please refresh the page.', 'error');
      }
      options.onError?.({ error: 'Razorpay SDK not loaded' });
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
      'monthly': { amount: 27000, name: 'Monthly Plan' }, // ₹270 in paise
      'quarterly': { amount: 85000, name: 'Quarterly Plan' }, // ₹850 in paise
      'yearly': { amount: 199900, name: 'Yearly Plan' } // ₹1,999 in paise
    };
    
    const plan = plans[planType];
    if (!plan) {
      options.onError?.({ error: 'Invalid plan type' });
      return;
    }
    
    // Get user details for prefill
    const settings = JSON.parse(localStorage.getItem('kf_settings') || '{}');
    const userPhone = this.getUserPhone();
    const userEmail = this.getUserEmail();
    
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

