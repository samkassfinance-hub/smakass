/**
 * KaasFlow Subscription System - STRICT FREE LIMIT
 * Free: 20 clients max (BLOCKED after 20)
 * Paid: Monthly/Quarterly/Yearly subscriptions for unlimited clients
 */

(function() {
  'use strict';

  // ─── YOUR RAZORPAY KEY ID (replace with your actual key) ─────
  const RAZORPAY_KEY = 'rzp_live_SuharfZYrJBbHj'; // Your live Razorpay Key ID

  const PLANS = {
    FREE: {
      id: 'free',
      name: 'Free Plan',
      price: 0,
      clientLimit: 20,
      duration: null,
      features: {
        clients: 20,
        loans: true,
        basicReports: true,
        collection: false,
        whatsappReminders: false,
        excelExport: false,
        pdfReceipts: false,
        dataBackup: false,
        advancedReports: false
      },
      badge: null
    },
    MONTHLY: {
      id: 'monthly',
      name: 'Monthly Plan',
      price: 270, // ₹270
      clientLimit: Infinity,
      duration: 30,
      features: {
        clients: Infinity,
        loans: true,
        basicReports: true,
        collection: true,
        whatsappReminders: true,
        excelExport: true,
        pdfReceipts: true,
        dataBackup: true,
        advancedReports: true
      },
      badge: 'PRO'
    },
    QUARTERLY: {
      id: 'quarterly',
      name: 'Quarterly Plan',
      price: 850, // ₹850
      clientLimit: Infinity,
      duration: 90,
      features: {
        clients: Infinity,
        loans: true,
        basicReports: true,
        collection: true,
        whatsappReminders: true,
        excelExport: true,
        pdfReceipts: true,
        dataBackup: true,
        advancedReports: true
      },
      badge: 'PRO',
      savings: 'Save ₹60'
    },
    YEARLY: {
      id: 'yearly',
      name: 'Yearly Plan',
      price: 1999, // ₹1,999
      clientLimit: Infinity,
      duration: 365,
      features: {
        clients: Infinity,
        loans: true,
        basicReports: true,
        collection: true,
        whatsappReminders: true,
        excelExport: true,
        pdfReceipts: true,
        dataBackup: true,
        advancedReports: true
      },
      badge: 'PRO',
      savings: 'Save ₹1,241'
    }
  };

  // Subscription Manager
  class SubscriptionManager {
    constructor() {
      this.storageKey = 'kf_subscription';
      this.init();
    }

    init() {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        this.setDefaultPlan();
      }
      this.syncFromSettings();
    }

    syncFromSettings() {
      try {
        const settings = JSON.parse(localStorage.getItem('kf_settings') || '{}');
        const sub = this.getCurrentSubscription();
        if (settings.plan && settings.plan !== 'free' && sub && sub.planId !== settings.plan) {
          const plan = PLANS[settings.plan.toUpperCase()];
          if (plan) {
            const startDate = settings.paymentDate ? new Date(settings.paymentDate) : new Date();
            const expiryDate = new Date(startDate.getTime() + (plan.duration * 24 * 60 * 60 * 1000));
            
            sub.planId = settings.plan;
            sub.startDate = startDate.toISOString();
            sub.expiryDate = expiryDate.toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(sub));
          }
        }
      } catch (e) {
        console.error("Failed to sync subscription from settings:", e);
      }
    }

    setDefaultPlan() {
      const defaultSub = {
        planId: 'free',
        startDate: new Date().toISOString(),
        expiryDate: null,
        totalPaid: 0,
        paymentHistory: []
      };
      localStorage.setItem(this.storageKey, JSON.stringify(defaultSub));
    }

    getCurrentSubscription() {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    }

    getCurrentPlan() {
      const sub = this.getCurrentSubscription();
      
      // If subscription expired, return FREE plan
      if (this.isSubscriptionExpired()) {
        return PLANS.FREE;
      }
      
      return PLANS[sub.planId.toUpperCase()] || PLANS.FREE;
    }

    getClientLimit() {
      const plan = this.getCurrentPlan();
      
      // Check if subscription is expired
      if (this.isSubscriptionExpired()) {
        return 20; // Revert to free limit if expired
      }
      
      return plan.clientLimit;
    }

    isSubscriptionExpired() {
      const sub = this.getCurrentSubscription();
      if (!sub.expiryDate) return false;
      
      const now = new Date();
      const expiry = new Date(sub.expiryDate);
      return now > expiry;
    }

    canAddClient(currentClientCount) {
      const limit = this.getClientLimit();
      const plan = this.getCurrentPlan();
      
      // STRICT: Free plan cannot exceed 20 clients
      if (plan.id === 'free' && currentClientCount >= 20) {
        return false;
      }
      
      // Check if expired
      if (this.isSubscriptionExpired() && currentClientCount >= 20) {
        return false;
      }
      
      return currentClientCount < limit;
    }

    hasFeature(featureName) {
      const plan = this.getCurrentPlan();
      
      // If expired, only basic features
      if (this.isSubscriptionExpired()) {
        return PLANS.FREE.features[featureName] === true;
      }
      
      return plan.features[featureName] === true;
    }

    upgradeToPlan(planId) {
      const sub = this.getCurrentSubscription();
      const plan = PLANS[planId.toUpperCase()];
      
      if (!plan || plan.id === 'free') {
        return { success: false, error: 'Invalid plan' };
      }
      
      const payment = {
        date: new Date().toISOString(),
        amount: plan.price,
        planId: plan.id,
        planName: plan.name,
        type: 'subscription'
      };

      // Calculate expiry date
      const startDate = new Date();
      const expiryDate = new Date(startDate);
      expiryDate.setDate(expiryDate.getDate() + plan.duration);

      sub.planId = plan.id;
      sub.startDate = startDate.toISOString();
      sub.expiryDate = expiryDate.toISOString();
      sub.totalPaid += plan.price;
      sub.paymentHistory.push(payment);

      localStorage.setItem(this.storageKey, JSON.stringify(sub));
      return { 
        success: true, 
        cost: plan.price, 
        planName: plan.name,
        expiryDate: expiryDate.toISOString()
      };
    }

    getStats() {
      const sub = this.getCurrentSubscription();
      const plan = this.getCurrentPlan();
      const isExpired = this.isSubscriptionExpired();
      
      return {
        planName: isExpired ? 'Free Plan (Expired)' : plan.name,
        planBadge: isExpired ? null : plan.badge,
        clientLimit: this.getClientLimit(),
        totalPaid: sub.totalPaid,
        startDate: sub.startDate,
        expiryDate: sub.expiryDate,
        isExpired: isExpired,
        daysRemaining: this.getDaysRemaining(),
        paymentHistory: sub.paymentHistory
      };
    }

    getDaysRemaining() {
      const sub = this.getCurrentSubscription();
      if (!sub.expiryDate) return null;
      
      const now = new Date();
      const expiry = new Date(sub.expiryDate);
      const diff = expiry - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      
      return days > 0 ? days : 0;
    }
  }

  // UI Manager
  class SubscriptionUI {
    constructor(manager) {
      this.manager = manager;
      this.upgradeModal = null;
      this.paymentModal = null;
    }

    init() {
      this.updateUpgradeModal();
      this.createPaymentModal();
      this.updateHeaderBadge();
      this.attachEventListeners();
      this.checkExpiry();
    }

    updateUpgradeModal() {
      // Update the existing upgrade modal with new plans
      const modalBody = document.querySelector('#upgradeModal .modal-body');
      if (!modalBody) return;
      
      const currentPlan = this.manager.getCurrentPlan();
      
      modalBody.innerHTML = `
        <p class="text-center text-muted-kf mb-3">Choose a plan to unlock unlimited clients & all features</p>
        <div class="plan-cards-wrapper">
          ${this.renderPlanCard(PLANS.MONTHLY, currentPlan.id === 'monthly')}
          ${this.renderPlanCard(PLANS.QUARTERLY, currentPlan.id === 'quarterly')}
          ${this.renderPlanCard(PLANS.YEARLY, currentPlan.id === 'yearly')}
        </div>
        <p class="text-center text-muted-kf mt-3" style="font-size:0.75rem;">
          Free plan: up to 20 clients only. Upgrade to add unlimited clients.
        </p>
      `;
    }

    renderPlanCard(plan, isCurrent) {
      const isRecommended = plan.id === 'yearly';
      const perDayPrice = (plan.price / plan.duration).toFixed(1);
      
      return `
        <div class="plan-card ${isRecommended ? 'plan-card-featured' : ''} ${isCurrent ? 'plan-card-current' : ''}">
          ${isRecommended ? '<div class="plan-badge-top">⭐ Best Value</div>' : ''}
          ${isCurrent ? '<div class="plan-badge-current">✓ Current Plan</div>' : ''}
          <div class="plan-label">${plan.name}</div>
          <div class="plan-price">₹${plan.price}<span>/${plan.duration} days</span></div>
          <div class="plan-per-day" style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 4px;">₹${perDayPrice}/day</div>
          ${plan.savings ? `<div class="plan-saving-badge">${plan.savings}</div>` : ''}
          <ul class="plan-features">
            <li><i class="fa-solid fa-check"></i> Unlimited clients</li>
            <li><i class="fa-solid fa-check"></i> All features unlocked</li>
            <li><i class="fa-solid fa-check"></i> Collection mode</li>
            <li><i class="fa-solid fa-check"></i> WhatsApp reminders</li>
            <li><i class="fa-solid fa-check"></i> Excel & PDF export</li>
            <li><i class="fa-solid fa-check"></i> Cloud backup</li>
          </ul>
          <button type="button" 
                  class="btn-plan-choose ${isRecommended ? 'btn-plan-choose-featured' : ''}" 
                  onclick="window.KFSubscription.selectPlan('${plan.id}')"
                  ${isCurrent ? 'disabled' : ''}>
            ${isCurrent ? '✓ Current Plan' : `Pay ₹${plan.price}`}
          </button>
        </div>
      `;
    }

    createPaymentModal() {
      // Razorpay handles its own UI – we don't need a custom modal
      // Keep a minimal confirmation modal for post-payment verification
    }

    attachEventListeners() {
      // Event listeners added dynamically via openRazorpay
    }

    /** Open Razorpay checkout for a given plan - ROBUST VERSION */
    openRazorpay(planId) {
      const plan = PLANS[planId.toUpperCase()];
      if (!plan) return;

      // Get current user's phone/email for account isolation
      const settings = JSON.parse(localStorage.getItem('kf_settings') || '{}');
      const userPhone = settings.phone || '';
      const userEmail = window.RazorpayPayment?.getUserEmail() || '';
      const userIdentifier = userPhone || userEmail || 'unknown';

      // Close upgrade modal
      const upgradeModalEl = document.getElementById('upgradeModal');
      if (upgradeModalEl) {
        const upgradeModalInst = bootstrap.Modal.getInstance(upgradeModalEl);
        if (upgradeModalInst) upgradeModalInst.hide();
      }

      // Use the robust payForPlan method which has 3 fallback strategies:
      // 1. Pre-loaded order (instant)
      // 2. Backend order creation (async)
      // 3. Direct Razorpay checkout without order_id
      window.RazorpayPayment.payForPlan(planId, {
        prefill: {
          name: settings.financierName || 'User',
          email: userEmail,
          contact: userPhone
        },

        onSuccess: (response) => {
          // Calculate expiry date
          const durationDays = plan.duration || 30;
          const startDate = new Date();
          const expiryDate = new Date(startDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));

          // IMPORTANT: Store subscription linked to current user's phone/email
          const subscriptionKey = `kf_subscription_${userIdentifier}`;
          
          // 1. Update user-specific subscription in localStorage
          const sub = JSON.parse(localStorage.getItem(subscriptionKey) || JSON.stringify({
            planId: 'free',
            startDate: new Date().toISOString(),
            expiryDate: null,
            totalPaid: 0,
            paymentHistory: [],
            userIdentifier: userIdentifier,
            userPhone: userPhone,
            userEmail: userEmail
          }));
          
          sub.planId = plan.id;
          sub.startDate = startDate.toISOString();
          sub.expiryDate = expiryDate.toISOString();
          sub.totalPaid += plan.price;
          sub.userIdentifier = userIdentifier;
          sub.userPhone = userPhone;
          sub.userEmail = userEmail;
          sub.paymentHistory.push({
            date: startDate.toISOString(),
            amount: plan.price,
            planId: plan.id,
            planName: plan.name,
            type: 'subscription',
            txnId: response.razorpay_payment_id
          });
          localStorage.setItem(subscriptionKey, JSON.stringify(sub));
          
          // Also update the generic key for backward compatibility
          localStorage.setItem(this.manager.storageKey, JSON.stringify(sub));

          // 2. Update kf_settings for current user
          settings.plan = planId;
          settings.planExpiry = expiryDate.getTime();
          settings.paymentDate = startDate.toISOString();
          settings.userIdentifier = userIdentifier; // Link settings to user
          if (!settings.planPayments) {
            settings.planPayments = [];
          }
          settings.planPayments.push({
            date: startDate.toISOString().split('T')[0],
            plan: planId,
            amount: plan.price,
            txnId: response.razorpay_payment_id,
            userIdentifier: userIdentifier
          });
          localStorage.setItem('kf_settings', JSON.stringify(settings));

          // 3. Show success Toast and screen
          if (typeof showToast === 'function') {
            showToast(`✅ Payment successful! ${plan.name} activated for ${userPhone || userEmail}`, 'success');
          }
          this.showSuccessScreen({
            planName: plan.name,
            cost: plan.price,
            expiryDate: expiryDate.toISOString()
          });

          this.updateHeaderBadge();
          this.updateUpgradeModal();
          
          if (window.KFSync) {
            window.KFSync.backup(true);
          }
          
          // Refresh access controls
          if (typeof checkAccessControl === 'function') {
            checkAccessControl();
          }
          if (window.KF && window.KF.refreshCurrentPage) {
            window.KF.refreshCurrentPage();
          }
          
          // Reload page to reflect changes
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        onError: (err) => {
          console.error('Payment error:', err);
          if (typeof showToast === 'function') {
            showToast(err.error || 'Payment failed or was cancelled.', 'error');
          }
        }
      });
    }


    updateHeaderBadge() {
      const stats = this.manager.getStats();
      const headerLeft = document.querySelector('.header-left');
      if (!headerLeft) return;
      
      const existingBadge = headerLeft.querySelector('.plan-badge');
      if (existingBadge) existingBadge.remove();
      
      if (stats.planBadge && !stats.isExpired) {
        const badge = document.createElement('span');
        badge.className = 'plan-badge';
        badge.textContent = stats.planBadge;
        headerLeft.appendChild(badge);
      }
    }

    checkExpiry() {
      const stats = this.manager.getStats();
      
      if (stats.isExpired) {
        this.showToast('warning', 'Your subscription has expired. Upgrade to continue adding clients.');
      } else if (stats.daysRemaining && stats.daysRemaining <= 7) {
        this.showToast('info', `Your subscription expires in ${stats.daysRemaining} days`);
      }
    }

    showUpgradePrompt(currentClientCount) {
      const plan = this.manager.getCurrentPlan();
      
      if (plan.id === 'free' && currentClientCount >= 20) {
        this.showUpgradeModal();
      } else if (this.manager.isSubscriptionExpired()) {
        this.showUpgradeModal();
      }
    }

    showUpgradeModal() {
      this.updateUpgradeModal();
      const modal = new bootstrap.Modal(document.getElementById('upgradeModal'));
      modal.show();
    }

    showPaymentModal(planId) {
      const plan = PLANS[planId.toUpperCase()];
      if (!plan) return;

      const settings = JSON.parse(localStorage.getItem('kf_settings') || '{}');
      const backupUpi = settings.backupUpi || ''; // User's custom backup VPA
      
      // If no backup UPI is configured, go straight to Razorpay
      if (!backupUpi) {
        this.openRazorpay(planId);
        return;
      }

      // Close upgrade modal first
      const upgradeModalEl = document.getElementById('upgradeModal');
      if (upgradeModalEl) {
        const inst = bootstrap.Modal.getInstance(upgradeModalEl);
        if (inst) inst.hide();
      }

      let payModalEl = document.getElementById('paymentOptionsModal');
      if (payModalEl) payModalEl.remove();

      payModalEl = document.createElement('div');
      payModalEl.id = 'paymentOptionsModal';
      payModalEl.className = 'modal fade';
      payModalEl.setAttribute('tabindex', '-1');
      payModalEl.setAttribute('aria-hidden', 'true');
      
      payModalEl.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content kf-modal-content" style="background:var(--kf-card); border:1px solid var(--kf-card-border); border-radius:18px;">
            <div class="modal-header kf-modal-header" style="border-bottom:1px solid var(--kf-divider);">
              <h5 class="modal-title"><i class="fa-solid fa-credit-card me-2 text-primary-kf"></i>Select Payment Method</h5>
              <button type="button" class="btn-close kf-btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4 text-center">
              <p class="text-muted-kf mb-4" style="color:var(--kf-text-muted)">You are purchasing the <strong>${plan.name}</strong> for <strong>₹${plan.price}</strong>.</p>
              
              <!-- Option 1: Razorpay -->
              <button class="btn-kf-primary w-100 mb-3 py-3 d-flex align-items-center justify-content-center gap-2" id="btn-pay-razorpay" style="font-size: 1.05rem; min-height:48px; border-radius:var(--radius-sm); font-weight:700;">
                <i class="fa-solid fa-bolt"></i> Pay with Razorpay (Cards/UPI)
              </button>
              
              <div class="divider my-3 text-muted-kf" style="display: flex; align-items: center; text-align: center;">
                <span style="flex: 1; border-bottom: 1px solid var(--color-border-muted); margin-right: 10px;"></span>
                <span style="font-size: 0.8rem; font-weight: 600; color:var(--kf-text-muted)">OR</span>
                <span style="flex: 1; border-bottom: 1px solid var(--color-border-muted); margin-left: 10px;"></span>
              </div>
              
              <!-- Option 2: Direct UPI QR Code -->
              <button class="btn-kf-outline w-100 py-3 d-flex align-items-center justify-content-center gap-2" id="btn-pay-direct-upi" style="font-size: 1.05rem; min-height:48px; border-radius:var(--radius-sm); font-weight:700; border: 1px solid var(--color-primary); color:var(--color-primary); background:transparent;">
                <i class="fa-solid fa-qrcode"></i> Pay via Direct UPI QR / GPay
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(payModalEl);
      const modal = new bootstrap.Modal(payModalEl);
      modal.show();

      payModalEl.querySelector('#btn-pay-razorpay').addEventListener('click', () => {
        modal.hide();
        this.openRazorpay(planId);
      });

      payModalEl.querySelector('#btn-pay-direct-upi').addEventListener('click', () => {
        modal.hide();
        this.showDirectUpiModal(planId, backupUpi);
      });
    }

    showDirectUpiModal(planId, backupUpi) {
      const plan = PLANS[planId.toUpperCase()];
      if (!plan) return;

      const upiUrl = `upi://pay?pa=${encodeURIComponent(backupUpi)}&pn=SamKass&am=${plan.price}&cu=INR`;
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}`;

      let directModalEl = document.getElementById('directUpiModal');
      if (directModalEl) directModalEl.remove();

      directModalEl = document.createElement('div');
      directModalEl.id = 'directUpiModal';
      directModalEl.className = 'modal fade';
      directModalEl.setAttribute('tabindex', '-1');
      directModalEl.setAttribute('aria-hidden', 'true');

      directModalEl.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content kf-modal-content" style="background:var(--kf-card); border:1px solid var(--kf-card-border); border-radius:18px;">
            <div class="modal-header kf-modal-header" style="border-bottom:1px solid var(--kf-divider);">
              <h5 class="modal-title"><i class="fa-solid fa-qrcode me-2 text-primary-kf"></i>Scan to Pay via UPI</h5>
              <button type="button" class="btn-close kf-btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4 text-center">
              <p class="text-muted-kf mb-3" style="color:var(--kf-text-muted)">Scan this QR code using Google Pay, PhonePe, Paytm, or any UPI app to pay <strong>₹${plan.price}</strong>.</p>
              
              <!-- QR Code Image -->
              <div class="my-3 p-3 d-inline-block" style="background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <img src="${qrImageUrl}" alt="UPI QR Code" style="width: 220px; height: 220px; display: block;">
              </div>
              
              <div class="mt-3 mb-4">
                <div class="small text-muted-kf" style="color:var(--kf-text-muted)">UPI ID:</div>
                <strong style="font-family: monospace; font-size: 1.05rem; word-break: break-all; color:var(--kf-text)">${backupUpi}</strong>
              </div>
              
              <button class="btn-kf-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2" id="btn-confirm-direct-payment" style="min-height:48px; border-radius:var(--radius-sm); font-weight:700;">
                <i class="fa-solid fa-circle-check"></i> I Have Completed Payment
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(directModalEl);
      const modal = new bootstrap.Modal(directModalEl);
      modal.show();

      directModalEl.querySelector('#btn-confirm-direct-payment').addEventListener('click', async () => {
        modal.hide();
        if (typeof showToast === 'function') {
          showToast('Activating subscription...', 'info');
        }
        
        // Directly activate the plan in local storage and settings for backup VPA payments
        const durationDays = plan.duration || 30;
        const startDate = new Date();
        const expiryDate = new Date(startDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));

        // 1. Update subscription manager state
        const sub = this.manager.getCurrentSubscription() || {
          planId: 'free',
          startDate: new Date().toISOString(),
          expiryDate: null,
          totalPaid: 0,
          paymentHistory: []
        };
        
        sub.planId = plan.id;
        sub.startDate = startDate.toISOString();
        sub.expiryDate = expiryDate.toISOString();
        sub.totalPaid += plan.price;
        sub.paymentHistory.push({
          date: startDate.toISOString(),
          amount: plan.price,
          planId: plan.id,
          planName: plan.name,
          type: 'subscription_direct',
          txnId: 'DIRECT_UPI_' + Date.now()
        });
        localStorage.setItem(this.manager.storageKey, JSON.stringify(sub));

        // 2. Update kf_settings
        const settings = JSON.parse(localStorage.getItem('kf_settings') || '{}');
        settings.plan = plan.id;
        settings.paymentDate = startDate.toISOString();
        if (!settings.planPayments) {
          settings.planPayments = [];
        }
        settings.planPayments.push({
          date: startDate.toISOString().split('T')[0],
          plan: plan.id,
          amount: plan.price,
          txnId: 'DIRECT_UPI_' + Date.now()
        });
        localStorage.setItem('kf_settings', JSON.stringify(settings));

        // 3. Inform backend of manual/direct upgrade
        const sessionToken = window.RazorpayPayment.getSessionToken();
        const email = window.RazorpayPayment.getUserEmail();
        
        try {
          const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://127.0.0.1:5000/api'
            : window.location.origin + '/api';
            
          const headers = { 'Content-Type': 'application/json' };
          if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;
          if (email) headers['X-User-Email'] = email;
          
          await fetch(`${apiBase}/payment/verify`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              razorpay_order_id: 'direct_order_' + Date.now(),
              razorpay_payment_id: 'direct_pay_' + Date.now(),
              razorpay_signature: 'direct_sig_valid',
              plan_type: plan.id,
              email: email
            })
          });
        } catch (e) {
          console.warn("Failed to notify backend of backup payment:", e);
        }

        if (typeof showToast === 'function') {
          showToast('✅ Payment confirmed! ' + plan.name + ' activated.', 'success');
        }
        
        this.showSuccessScreen({
          planName: plan.name,
          cost: plan.price,
          expiryDate: expiryDate.toISOString()
        });

        this.updateHeaderBadge();
        this.updateUpgradeModal();
        
        if (window.KFSync) {
          setTimeout(() => KFSync.backup(true), 1500);
        }
      });
    }

    processPayment() {
      // Legacy – kept for compatibility, actual payment now handled via Razorpay
      if (typeof showToast === 'function') {
        showToast('Please use Razorpay or Direct UPI to complete payment.', 'info');
      }
    }

    showSuccessScreen(result) {
      const expiryDate = new Date(result.expiryDate);
      const formattedDate = expiryDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      const modalHTML = `
        <div class="modal fade" id="successModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content kf-modal-content">
              <div class="modal-body text-center" style="padding: 2rem;">
                <div class="success-icon">
                  <i class="fa-solid fa-circle-check"></i>
                </div>
                <h3 class="success-title">Payment Successful!</h3>
                <p class="success-message">
                  Welcome to ${result.planName}! You can now add unlimited clients.
                </p>
                <div class="success-details">
                  <div class="success-detail-row">
                    <span>Amount Paid</span>
                    <strong>₹${result.cost}</strong>
                  </div>
                  <div class="success-detail-row">
                    <span>Plan</span>
                    <strong>${result.planName}</strong>
                  </div>
                  <div class="success-detail-row">
                    <span>Valid Until</span>
                    <strong>${formattedDate}</strong>
                  </div>
                </div>
                <button type="button" class="btn-kf-primary w-100 mt-3" data-bs-dismiss="modal">
                  <i class="fa-solid fa-check me-2"></i>Start Adding Clients
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      const existing = document.getElementById('successModal');
      if (existing) existing.remove();
      
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      const modal = new bootstrap.Modal(document.getElementById('successModal'));
      modal.show();
      
      this.showToast('success', 'Subscription activated successfully!');
    }

    showLockedFeatureTooltip(featureName) {
      this.showToast('info', `🔒 Upgrade to Pro to unlock ${featureName}`);
    }

    showToast(type, message) {
      if (window.KF && window.KF.showToast) {
        window.KF.showToast(type, message);
      } else {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const icons = {
          success: 'fa-circle-check',
          error: 'fa-circle-xmark',
          info: 'fa-circle-info',
          warning: 'fa-triangle-exclamation'
        };
        
        const toast = document.createElement('div');
        toast.className = `kf-toast ${type}`;
        toast.innerHTML = `
          <i class="fa-solid ${icons[type]}"></i>
          <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
          toast.remove();
        }, 4000);
      }
    }

    renderPlanInfo() {
      const stats = this.manager.getStats();
      const plan = this.manager.getCurrentPlan();
      
      return `
        <div class="kf-card">
          <div class="plan-info-header">
            <div class="plan-info-icon">
              <i class="fa-solid fa-crown"></i>
            </div>
            <div>
              <div class="plan-info-name">${stats.planName}</div>
              ${stats.planBadge ? `<span class="badge-kf badge-active">${stats.planBadge}</span>` : ''}
              ${stats.isExpired ? '<span class="badge-kf badge-overdue">Expired</span>' : ''}
            </div>
          </div>
          
          <div class="plan-info-stats">
            <div class="plan-stat">
              <div class="plan-stat-label">Client Limit</div>
              <div class="plan-stat-value">${stats.clientLimit === Infinity ? 'Unlimited' : stats.clientLimit}</div>
            </div>
            ${stats.expiryDate ? `
              <div class="plan-stat">
                <div class="plan-stat-label">${stats.isExpired ? 'Expired' : 'Days Left'}</div>
                <div class="plan-stat-value ${stats.isExpired ? 'text-danger-kf' : ''}">${stats.daysRemaining || 0}</div>
              </div>
            ` : ''}
            ${stats.totalPaid > 0 ? `
              <div class="plan-stat">
                <div class="plan-stat-label">Total Spent</div>
                <div class="plan-stat-value">₹${stats.totalPaid}</div>
              </div>
            ` : ''}
          </div>
          
          ${plan.id === 'free' || stats.isExpired ? `
            <button type="button" class="btn-kf-primary w-100 mt-3" onclick="window.KFSubscription.ui.showUpgradeModal()">
              <i class="fa-solid fa-arrow-up me-2"></i>Upgrade Plan
            </button>
          ` : `
            <div class="alert alert-success mt-3" style="font-size:0.875rem;margin-bottom:0;">
              <i class="fa-solid fa-check-circle me-2"></i>
              Active subscription - Add unlimited clients!
            </div>
          `}
        </div>
        
        ${stats.paymentHistory.length > 0 ? `
          <div class="kf-card mt-3">
            <h6 class="section-title">
              <i class="fa-solid fa-receipt"></i>
              Payment History
            </h6>
            ${stats.paymentHistory.slice(-5).reverse().map(payment => `
              <div class="payment-history-row">
                <div>
                  <div class="payment-history-desc">${payment.planName}</div>
                  <div class="payment-history-date">
                    ${new Date(payment.date).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <div class="payment-history-amount">
                  <div>₹${payment.amount}</div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      `;
    }
  }

  // Initialize
  const manager = new SubscriptionManager();
  const ui = new SubscriptionUI(manager);
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ui.init());
  } else {
    ui.init();
  }

  // Expose globally
  window.KFSubscription = {
    manager,
    ui,
    PLANS,
    
    canAddClient: (count) => manager.canAddClient(count),
    hasFeature: (feature) => manager.hasFeature(feature),
    showUpgradePrompt: (count) => ui.showUpgradePrompt(count),
    getClientLimit: () => manager.getClientLimit(),
    getCurrentPlan: () => manager.getCurrentPlan(),
    renderPlanInfo: () => ui.renderPlanInfo(),
    selectPlan: (planId) => ui.showPaymentModal(planId),
    syncFromSettings: () => manager.syncFromSettings()
  };

})();
