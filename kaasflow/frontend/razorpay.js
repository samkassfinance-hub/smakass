// Razorpay Payment Integration (Frontend Only)
const RazorpayPayment = {
  keyId: 'rzp_live_SsSGY7EWJN9CYZ', // Hardcoded Live Key per user request
  
  async init() {
    // No backend to fetch from
  },

  async createOrder(amount, planType) {
    // Since we are frontend-only, we skip creating a formal Razorpay Order
    // and just return the amount so the checkout can use it.
    return { amount: amount, currency: 'INR', planType: planType };
  },

  async verifyPayment(paymentData) {
    // Frontend-only verification (trusting the successful callback)
    const planMap = {
      'monthly': 30,
      '3months': 90,
      'yearly': 365
    };
    
    const days = planMap[paymentData.plan_type] || 30;
    const now = new Date();
    const expiry = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    // Save subscription locally
    const subData = {
      plan_type: paymentData.plan_type,
      status: 'active',
      valid_until: expiry.toISOString(),
      updated_at: now.toISOString()
    };
    
    const s = JSON.parse(localStorage.getItem('kf_settings') || '{}');
    s.subscription = subData;
    localStorage.setItem('kf_settings', JSON.stringify(s));
    
    // Sync to Supabase immediately so it's not lost
    if (window.KFSync) {
      await KFSync.backup(true);
    }
    
    return { success: true, plan_activated: true, subscription: subData, message: "Payment successful" };
  },

  async checkSubscriptionStatus() {
    const s = JSON.parse(localStorage.getItem('kf_settings') || '{}');
    if (s.subscription) {
      return { success: true, subscription: s.subscription };
    }
    return { success: false };
  },

  openCheckout(orderData, options = {}) {
    const rzpOptions = {
      key: this.keyId,
      amount: orderData.amount, // Amount must be in paise (e.g. 50000 for ₹500)
      currency: orderData.currency,
      name: options.name || 'SamKass Finance',
      description: options.description || 'Pro Subscription',
      handler: async (response) => {
        // Without order_id, response only has razorpay_payment_id
        const verification = await this.verifyPayment({
          razorpay_payment_id: response.razorpay_payment_id,
          plan_type: options.planType
        });
        
        if (verification.success && verification.plan_activated) {
          options.onSuccess?.({
            ...response,
            subscription: verification.subscription,
            message: verification.message
          });
        } else if (verification.success) {
          options.onSuccess?.(response);
        } else {
          options.onError?.({ error: 'Payment verification failed' });
        }
      },
      prefill: options.prefill || {},
      theme: { color: options.themeColor || '#3399cc' }
    };

    const rzp = new Razorpay(rzpOptions);
    rzp.on('payment.failed', (response) => {
      options.onError?.(response);
    });
    rzp.open();
  },

  async initiatePayment(amount, options = {}) {
    try {
      const orderResponse = await this.createOrder(amount, options.planType);
      if (orderResponse.success) {
        this.openCheckout(orderResponse.order, options);
      } else {
        options.onError?.({ error: orderResponse.error });
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
