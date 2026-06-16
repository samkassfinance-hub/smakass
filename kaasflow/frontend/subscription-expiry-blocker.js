/**
 * SUBSCRIPTION EXPIRY BLOCKER - Hard blocking popup for expired subscriptions
 * RULES:
 * - Shows ONLY when subscription is EXPIRED (not when active)
 * - Cannot be dismissed until payment is made
 * - Server-verified expiry time (NEVER client time)
 * - Has close button for testing purposes
 */

(function() {
  'use strict';

  const BLOCK_OVERLAY_ID = 'subscription-expiry-blocker-overlay';
  const BLOCK_MODAL_ID = 'subscription-expiry-blocker-modal';
  
  // Check subscription status from SERVER
  async function fetchSubscriptionStatusFromServer() {
    try {
      const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://127.0.0.1:5000/api'
        : window.location.origin + '/api';
      
      const email = window.RazorpayPayment?.getUserEmail?.() || 
                   (JSON.parse(localStorage.getItem('kf_session') || '{}').user?.email);
      
      if (!email) {
        console.warn('⚠️ No email found for subscription check');
        return null;
      }
      
      console.log('🔍 Fetching subscription status from server for:', email);
      
      const res = await fetch(`${apiBase}/subscription/status?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'X-User-Email': email,
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (!res.ok) {
        console.warn(`⚠️ Subscription check failed: ${res.status}`);
        return null;
      }
      
      const data = await res.json();
      console.log('📊 Server subscription status:', { 
        plan_type: data.plan_type, 
        is_active: data.is_active, 
        days_remaining: data.days_remaining 
      });
      return data;
    } catch (e) {
      console.warn('⚠️ Could not fetch subscription:', e.message);
      return null;
    }
  }

  // Create expiry blocker modal
  function createExpiryBlocker() {
    const existing = document.getElementById(BLOCK_OVERLAY_ID);
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.id = BLOCK_OVERLAY_ID;
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
    `;
    
    const modal = document.createElement('div');
    modal.id = BLOCK_MODAL_ID;
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 2rem;
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      position: relative;
      z-index: 100000;
    `;
    
    modal.innerHTML = `
      <button id="blocker-close-btn" type="button" style="
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        width: 32px;
        height: 32px;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        color: #666;
        transition: all 0.2s;
      " title="Close (Testing)">
        ✕
      </button>

      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="font-size: 3rem; color: #d32f2f; margin-bottom: 1rem;">
          <i class="fa-solid fa-circle-xmark"></i>
        </div>
        <h2 style="color: #d32f2f; margin: 0 0 0.5rem 0; font-size: 1.8rem;">Subscription Expired</h2>
        <p style="color: #666; margin: 0; font-size: 1rem;">You must renew to continue using unlimited clients</p>
      </div>
      
      <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem;">
        <p style="margin: 0; color: #e65100; font-weight: 600;">
          <i class="fa-solid fa-triangle-exclamation me-2"></i>
          Your premium subscription has expired. Revert to 20-client free tier.
        </p>
      </div>
      
      <div style="margin-bottom: 1.5rem;">
        <h3 style="color: #333; font-size: 1.1rem; margin-bottom: 1rem;">Renew Your Plan</h3>
        <div id="expiry-blocker-plans" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;"></div>
      </div>
      
      <div style="text-align: center; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
        <p style="margin: 0; color: #999; font-size: 0.9rem;">
          <i class="fa-solid fa-lock me-1"></i>
          Secure payment via Razorpay
        </p>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Close button handler (for testing)
    const closeBtn = modal.querySelector('#blocker-close-btn');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('🔧 [TEST] Close button clicked');
      window.SubscriptionExpiryBlocker.dismissBlocker();
    });
    
    // Prevent clicking outside to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    
    const escapeHandler = (e) => {
      if (e.key === 'Escape') e.preventDefault();
    };
    document.addEventListener('keydown', escapeHandler);
    
    return { overlay, escapeHandler };
  }

  function renderPlanCards() {
    const container = document.getElementById('expiry-blocker-plans');
    if (!container) return;
    
    const plans = [
      { id: 'oneday', name: '1-Day', price: '₹8', days: '1' },
      { id: 'monthly', name: 'Monthly', price: '₹270', days: '30' },
      { id: 'quarterly', name: 'Quarterly', price: '₹850', days: '90' },
      { id: 'yearly', name: 'Yearly', price: '₹1,999', days: '365' }
    ];
    
    container.innerHTML = plans.map(p => `
      <div style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 1rem; text-align: center;">
        <h4 style="margin: 0 0 0.5rem 0; color: #333;">${p.name}</h4>
        <div style="font-size: 1.4rem; font-weight: bold; color: #2196F3; margin-bottom: 0.5rem;">${p.price}</div>
        <small style="color: #999;">${p.days} days</small>
        <button onclick="window.SubscriptionExpiryBlocker.selectPlan('${p.id}')" style="
          width: 100%;
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
        ">Choose</button>
      </div>
    `).join('');
  }

  window.SubscriptionExpiryBlocker = {
    blockerState: null,

    async checkAndBlock() {
      try {
        const status = await fetchSubscriptionStatusFromServer();
        
        if (!status) {
          console.log('⚠️ Could not verify status - dismissing blocker');
          this.dismissBlocker();
          return;
        }
        
        const planType = status.plan_type;
        const isActive = status.is_active;
        const daysRemaining = status.days_remaining;
        
        console.log(`📊 Status Check: plan=${planType}, active=${isActive}, days=${daysRemaining}`);
        
        // FREE tier - never show blocker
        if (planType === 'free') {
          console.log('✅ FREE plan - dismissing blocker');
          this.dismissBlocker();
          return;
        }
        
        // PAID plan that is ACTIVE - dismiss blocker (ALLOW ACCESS)
        if (isActive && planType !== 'free') {
          console.log(`✅ PAID ${planType} ACTIVE (${daysRemaining} days) - ALLOW ACCESS - dismissing blocker`);
          this.dismissBlocker();
          return;
        }
        
        // PAID plan that is EXPIRED - show blocker (BLOCK ACCESS)
        if (!isActive && planType !== 'free') {
          console.log(`🔴 PAID ${planType} EXPIRED - BLOCKING ACCESS - showing blocker`);
          this.showBlocker();
          return;
        }
        
        this.dismissBlocker();
      } catch (e) {
        console.error('❌ Check error:', e);
        this.dismissBlocker();
      }
    },

    showBlocker() {
      this.blockerState = createExpiryBlocker();
      setTimeout(() => renderPlanCards(), 100);
      console.log('🔴 Blocker shown');
    },

    dismissBlocker() {
      if (this.blockerState) {
        const { overlay, escapeHandler } = this.blockerState;
        if (overlay) overlay.remove();
        document.removeEventListener('keydown', escapeHandler);
        this.blockerState = null;
        console.log('✅ Blocker dismissed - access allowed');
      }
    },

    selectPlan(planId) {
      console.log('💳 Selecting plan:', planId);
      this.dismissBlocker();
      
      if (window.RazorpayPayment?.payForPlan) {
        window.RazorpayPayment.payForPlan(planId, {
          onSuccess: () => {
            console.log('✅ Payment success - checking status');
            setTimeout(() => this.checkAndBlock(), 1500);
          },
          onError: (err) => {
            console.error('❌ Payment error:', err);
            setTimeout(() => this.checkAndBlock(), 500);
          }
        });
      }
    }
  };

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📋 Blocker: checking status...');
      setTimeout(() => window.SubscriptionExpiryBlocker.checkAndBlock(), 1000);
    });
  } else {
    console.log('📋 Blocker: checking status...');
    setTimeout(() => window.SubscriptionExpiryBlocker.checkAndBlock(), 1000);
  }

  // Check on navigation
  window.addEventListener('popstate', () => {
    console.log('🔄 Blocker: checking after navigation');
    setTimeout(() => window.SubscriptionExpiryBlocker.checkAndBlock(), 500);
  });

  // Check periodically
  setInterval(() => {
    window.SubscriptionExpiryBlocker.checkAndBlock();
  }, 30000);

})();

console.log('✅ subscription-expiry-blocker.js loaded');
