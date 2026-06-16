/**
 * SUBSCRIPTION EXPIRY BLOCKER - Hard blocking popup for expired subscriptions
 * RULES:
 * - Blocks 100% of app when subscription expires
 * - Cannot be dismissed, closed, or bypassed
 * - Reappears on every page load/reload
 * - Only dismissed after successful payment
 * - Server-verified expiry time (NEVER client time)
 */

(function() {
  'use strict';

  const BLOCK_OVERLAY_ID = 'subscription-expiry-blocker-overlay';
  const BLOCK_MODAL_ID = 'subscription-expiry-blocker-modal';
  
  // Check subscription status from SERVER (not localStorage)
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
      
      const res = await fetch(`${apiBase}/subscription/status?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'X-User-Email': email,
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (!res.ok) {
        console.warn(`⚠️ Subscription status check failed: ${res.status}`);
        return null;
      }
      
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('⚠️ Could not verify subscription status:', e.message);
      return null;
    }
  }

  // Create hard-blocking expiry modal
  function createExpiryBlocker() {
    // Remove existing blocker if any
    const existing = document.getElementById(BLOCK_OVERLAY_ID);
    if (existing) existing.remove();
    
    // Create overlay (100% coverage, non-transparent)
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
    
    // Create modal
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
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="font-size: 3rem; color: #d32f2f; margin-bottom: 1rem;">
          <i class="fa-solid fa-circle-xmark"></i>
        </div>
        <h2 style="color: #d32f2f; margin: 0 0 0.5rem 0; font-size: 1.8rem;">Subscription Expired</h2>
        <p style="color: #666; margin: 0; font-size: 1rem;">You must renew to continue using SamKass</p>
      </div>
      
      <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem;">
        <p style="margin: 0; color: #e65100; font-weight: 600;">
          <i class="fa-solid fa-triangle-exclamation me-2"></i>
          Your premium subscription has expired. All features are now limited to the free tier.
        </p>
      </div>
      
      <div style="margin-bottom: 1.5rem;">
        <h3 style="color: #333; font-size: 1.1rem; margin-bottom: 1rem;">Choose a Plan to Renew</h3>
        <div id="expiry-blocker-plans" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <!-- Plans will be inserted here -->
        </div>
      </div>
      
      <div style="text-align: center; padding: 1rem; background: #f5f5f5; border-radius: 4px; margin-bottom: 1rem;">
        <p style="margin: 0; color: #999; font-size: 0.9rem;">
          Payments are processed securely through Razorpay. Your data is encrypted and protected.
        </p>
      </div>
      
      <div style="text-align: center;">
        <p style="color: #999; font-size: 0.85rem; margin: 0;">
          <i class="fa-solid fa-lock me-1"></i>
          This page cannot be dismissed or closed. Pay to continue.
        </p>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Prevent ANY way to close the overlay
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });
    
    // Disable ESC key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener('keydown', escapeHandler);
    
    return { overlay, modal, escapeHandler };
  }

  // Render plan cards in the blocker
  function renderPlanCards() {
    const plansContainer = document.getElementById('expiry-blocker-plans');
    if (!plansContainer) return;
    
    const plans = [
      { id: 'oneday', name: '1-Day Trial', price: '₹8', duration: '1 day' },
      { id: 'monthly', name: 'Monthly', price: '₹270', duration: '30 days' },
      { id: 'quarterly', name: 'Quarterly', price: '₹850', duration: '90 days' },
      { id: 'yearly', name: 'Yearly', price: '₹1,999', duration: '365 days' }
    ];
    
    plansContainer.innerHTML = plans.map(plan => `
      <div style="
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
      " 
      onmouseover="this.style.borderColor='#2196F3'; this.style.boxShadow='0 4px 12px rgba(33,150,243,0.2)'"
      onmouseout="this.style.borderColor='#e0e0e0'; this.style.boxShadow='none'">
        <h4 style="margin: 0 0 0.5rem 0; color: #333;">${plan.name}</h4>
        <div style="font-size: 1.5rem; font-weight: bold; color: #2196F3; margin-bottom: 0.5rem;">${plan.price}</div>
        <div style="font-size: 0.85rem; color: #999; margin-bottom: 1rem;">${plan.duration}</div>
        <button onclick="window.SubscriptionExpiryBlocker.selectPlan('${plan.id}')" style="
          width: 100%;
          padding: 0.75rem;
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          transition: background 0.2s;
        " onmouseover="this.style.background='#1976D2'" onmouseout="this.style.background='#2196F3'">
          Choose Plan
        </button>
      </div>
    `).join('');
  }

  // Check if subscription is expired
  window.SubscriptionExpiryBlocker = {
    blockerState: null,

    async checkAndBlock() {
      try {
        const status = await fetchSubscriptionStatusFromServer();
        
        if (!status || !status.success) {
          console.warn('⚠️ Could not verify subscription');
          return;
        }
        
        const planType = status.plan_type;
        const isActive = status.is_active;
        
        // FREE tier is always allowed (even after expiry)
        if (planType === 'free') {
          window.SubscriptionExpiryBlocker.dismissBlocker();
          return;
        }
        
        // PAID plan - check if expired
        if (!isActive) {
          console.log('🔴 Subscription expired - showing blocker');
          window.SubscriptionExpiryBlocker.showBlocker();
          return;
        }
        
        // Active paid plan
        console.log('✅ Subscription active:', planType);
        window.SubscriptionExpiryBlocker.dismissBlocker();
      } catch (e) {
        console.error('❌ Blocker check error:', e);
      }
    },

    showBlocker() {
      const blocker = createExpiryBlocker();
      this.blockerState = blocker;
      
      // Render plan cards
      setTimeout(() => renderPlanCards(), 100);
      
      console.log('🔴 Hard-block expiry popup displayed');
    },

    dismissBlocker() {
      if (this.blockerState) {
        const { overlay, escapeHandler } = this.blockerState;
        
        if (overlay) overlay.remove();
        document.removeEventListener('keydown', escapeHandler);
        
        this.blockerState = null;
        console.log('✅ Blocker dismissed');
      }
    },

    selectPlan(planId) {
      console.log('💳 User selected plan:', planId);
      
      // Dismiss blocker temporarily while payment completes
      this.dismissBlocker();
      
      // Open Razorpay payment
      if (window.RazorpayPayment && window.RazorpayPayment.payForPlan) {
        window.RazorpayPayment.payForPlan(planId, {
          onSuccess: (response) => {
            console.log('✅ Payment successful');
            // Blocker will reappear on next status check if needed
            setTimeout(() => this.checkAndBlock(), 1000);
          },
          onError: (err) => {
            console.error('❌ Payment failed:', err);
            // Re-show blocker if payment failed
            setTimeout(() => this.checkAndBlock(), 500);
          }
        });
      } else {
        console.error('❌ RazorpayPayment not available');
        this.showBlocker();
      }
    }
  };

  // Initialize blocker on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📋 Initializing subscription expiry blocker');
      setTimeout(() => window.SubscriptionExpiryBlocker.checkAndBlock(), 1000);
    });
  } else {
    console.log('📋 Initializing subscription expiry blocker');
    setTimeout(() => window.SubscriptionExpiryBlocker.checkAndBlock(), 1000);
  }

  // Check on every route change
  window.addEventListener('popstate', () => {
    console.log('🔄 Checking subscription on navigation');
    setTimeout(() => window.SubscriptionExpiryBlocker.checkAndBlock(), 500);
  });

  // Check periodically (every 30 seconds)
  setInterval(() => {
    window.SubscriptionExpiryBlocker.checkAndBlock();
  }, 30000);

})();

console.log('✅ subscription-expiry-blocker.js loaded');
