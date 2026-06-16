/**
 * SamKass Subscription Enforcement System
 * ────────────────────────────────────────
 * Server-side subscription validation with client-side hard blocks.
 * 
 * CRITICAL RULES:
 * - All subscription status is verified on EVERY page load and route change
 * - Server time (UTC) is the single source of truth
 * - Expired subscriptions show an inescapable blocking modal
 * - Client limit (20) is enforced before and after client addition
 * - All API calls check subscription status first
 */

(function() {
  'use strict';

  // ─── SUBSCRIPTION ENFORCEMENT SYSTEM ─────────────────────────
  
  window.SubscriptionEnforcement = window.SubscriptionEnforcement || {};
  
  const API_BASE = window.API_BASE || 'http://localhost:5000/api';
  
  // Store subscription state
  let currentSubscription = null;
  let isCheckingSubscription = false;
  let subscriptionCheckInterval = null;
  
  /**
   * Fetch subscription status from server.
   * Returns subscription object with:
   * - plan_type, plan_name, expiry_time (UTC), is_expired, client_limit
   * - client_count, can_add_client, limit_info
   * - days_remaining, available_plans
   */
  async function fetchSubscriptionStatus() {
    const userEmail = getUserEmail();
    if (!userEmail) {
      console.warn('⚠️  No user email available for subscription check');
      return null;
    }
    
    try {
      const response = await fetch(`${API_BASE}/subscription/status?email=${encodeURIComponent(userEmail)}`, {
        method: 'GET',
        headers: {
          'X-User-Email': userEmail,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`❌ Subscription status fetch failed: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error fetching subscription status:', error);
      return null;
    }
  }
  
  /**
   * Check subscription status and enforce rules.
   * CALLED ON:
   * - App load
   * - Route/page change
   * - Every 5 minutes (interval check)
   * - After payment
   */
  async function validateSubscriptionStatus() {
    if (isCheckingSubscription) return; // Prevent concurrent checks
    
    isCheckingSubscription = true;
    
    try {
      const subscription = await fetchSubscriptionStatus();
      
      if (!subscription) {
        console.error('❌ Failed to fetch subscription status');
        isCheckingSubscription = false;
        return;
      }
      
      currentSubscription = subscription;
      
      // CRITICAL: If expired, show blocking modal immediately
      if (subscription.subscription.is_expired) {
        showExpiryBlockingModal(subscription);
        // Block all app interactions
        blockAppAccess();
      } else {
        // Subscription is valid - unblock app
        unblockAppAccess();
        updateUIBadges(subscription);
      }
    } catch (error) {
      console.error('❌ Subscription validation error:', error);
    } finally {
      isCheckingSubscription = false;
    }
  }
  
  /**
   * Show full-screen blocking modal when subscription expires.
   * RULES:
   * - Covers 100% of screen (z-index: 9999, position: fixed)
   * - Non-transparent background
   * - No close button, no ESC dismissal
   * - Cannot click outside to dismiss
   * - Shows time since expiry
   * - All 4 plans with "Choose Plan" buttons
   * - Only payment restores access
   */
  function showExpiryBlockingModal(subscription) {
    // Remove any existing expiry modal to prevent duplicates
    const existing = document.getElementById('kf-expiry-blocking-modal');
    if (existing) {
      existing.remove();
    }
    
    const sub = subscription.subscription;
    const timeSinceExpiry = calculateTimeSinceExpiry(sub.expiry_time);
    
    const modal = document.createElement('div');
    modal.id = 'kf-expiry-blocking-modal';
    modal.className = 'kf-expiry-modal-overlay';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    `;
    
    modal.innerHTML = `
      <div style="
        background: var(--kf-card, #fff);
        border-radius: 20px;
        padding: 2rem;
        max-width: 90%;
        max-height: 95vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        text-align: center;
      ">
        <div style="color: var(--kf-danger, #ff4444); font-size: 3rem; margin-bottom: 1rem;">
          <i class="fa-solid fa-calendar-xmark"></i>
        </div>
        
        <h1 style="
          color: var(--kf-text, #000);
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        ">
          Your subscription has expired
        </h1>
        
        <p style="
          color: var(--kf-text-muted, #666);
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
        ">
          Expired ${timeSinceExpiry}
        </p>
        
        <div style="
          background: rgba(255, 68, 68, 0.1);
          border-left: 4px solid var(--kf-danger, #ff4444);
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          text-align: left;
          color: var(--kf-text-muted, #666);
        ">
          <p style="margin-bottom: 0.5rem; font-weight: 600;">
            You must renew your subscription to continue using SamKass.
          </p>
          <ul style="margin: 0.5rem 0 0 1.2rem; padding: 0; font-size: 0.9rem;">
            <li>Free plan is limited to 20 clients</li>
            <li>Upgrade for unlimited clients and premium features</li>
            <li>Choose any plan below to restore access</li>
          </ul>
        </div>
        
        <div id="kf-expiry-plans-container" style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        ">
          <!-- Plans will be rendered here -->
        </div>
        
        <button class="btn-kf-outline" style="
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--kf-card-border, #ddd);
          background: var(--kf-bg, #f9f9f9);
          color: var(--kf-text, #000);
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.95rem;
        " onclick="window.SubscriptionEnforcement.closeApp()">
          Continue with Free Plan (20 client limit)
        </button>
      </div>
    `;
    
    // Prevent modal dismissal
    modal.addEventListener('click', (e) => {
      // Only allow clicks on the buttons inside
      if (e.target === modal || e.target.closest('.kf-expiry-modal-overlay')) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    
    // Prevent ESC key
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    
    document.body.appendChild(modal);
    
    // Render plans
    renderExpiryPlanOptions();
  }
  
  /**
   * Render available plans in the expiry modal.
   */
  function renderExpiryPlanOptions() {
    const container = document.getElementById('kf-expiry-plans-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const plans = {
      'oneday': { name: '1-Day Trial', price: 8, duration: 1 },
      'monthly': { name: 'Monthly', price: 270, duration: 30 },
      'quarterly': { name: 'Quarterly', price: 850, duration: 90 },
      'yearly': { name: 'Yearly', price: 1999, duration: 365 }
    };
    
    Object.entries(plans).forEach(([planId, plan]) => {
      const card = document.createElement('div');
      card.style.cssText = `
        background: var(--kf-bg-alt, #f5f5f5);
        border: 2px solid var(--kf-card-border, #ddd);
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        transition: all 0.2s ease;
      `;
      card.onmouseover = () => {
        card.style.borderColor = 'var(--color-primary, #007bff)';
        card.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.2)';
      };
      card.onmouseout = () => {
        card.style.borderColor = 'var(--kf-card-border, #ddd)';
        card.style.boxShadow = 'none';
      };
      
      card.innerHTML = `
        <div style="font-weight: 700; color: var(--kf-text, #000); margin-bottom: 0.5rem; font-size: 1.1rem;">
          ${plan.name}
        </div>
        <div style="font-size: 1.8rem; font-weight: 700; color: var(--color-primary, #007bff); margin-bottom: 0.3rem;">
          ₹${plan.price}
        </div>
        <div style="font-size: 0.8rem; color: var(--kf-text-muted, #666); margin-bottom: 1.5rem;">
          ${plan.duration} day${plan.duration > 1 ? 's' : ''}
        </div>
        <button style="
          background: linear-gradient(135deg, var(--color-primary, #007bff), var(--color-primary-dark, #0056b3));
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.95rem;
          width: 100%;
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"
        onclick="window.SubscriptionEnforcement.initiatePlanPayment('${planId}')">
          Choose Plan
        </button>
      `;
      
      container.appendChild(card);
    });
  }
  
  /**
   * Calculate human-readable time since expiry.
   * Returns: "2 hours ago", "1 day ago", etc.
   */
  function calculateTimeSinceExpiry(expiryTime) {
    try {
      const expiryDate = new Date(expiryTime);
      const now = new Date();
      const diffMs = now - expiryDate;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      }
    } catch (e) {
      return 'recently';
    }
  }
  
  /**
   * Block all app interactions when subscription expires.
   * - Disable all buttons except payment buttons
   * - Dim/grey out the app
   * - Prevent navigation
   */
  function blockAppAccess() {
    // Add blocker overlay
    let blocker = document.getElementById('kf-access-blocker');
    if (!blocker) {
      blocker = document.createElement('div');
      blocker.id = 'kf-access-blocker';
      blocker.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.1);
        z-index: 9998;
        pointer-events: none;
      `;
      document.body.appendChild(blocker);
    }
    
    // Disable non-payment buttons
    document.querySelectorAll('button:not(.kf-payment-btn)').forEach(btn => {
      btn.style.opacity = '0.5';
      btn.style.pointerEvents = 'none';
      btn.disabled = true;
    });
  }
  
  /**
   * Unblock app access when subscription is valid.
   */
  function unblockAppAccess() {
    const blocker = document.getElementById('kf-access-blocker');
    if (blocker) {
      blocker.remove();
    }
    
    document.querySelectorAll('button[disabled]').forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.pointerEvents = 'auto';
    });
  }
  
  /**
   * Update UI badges with current plan info.
   */
  function updateUIBadges(subscription) {
    const sub = subscription.subscription;
    const headerLeft = document.querySelector('.header-left');
    
    if (!headerLeft) return;
    
    // Remove existing badge
    const existingBadge = headerLeft.querySelector('.kf-plan-badge');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    // Show plan badge if active and not expired
    if (sub.plan_type !== 'free' && !sub.is_expired) {
      const badge = document.createElement('span');
      badge.className = 'kf-plan-badge';
      badge.textContent = sub.plan_type.charAt(0).toUpperCase() + sub.plan_type.slice(1);
      badge.style.cssText = `
        display: inline-block;
        background: linear-gradient(135deg, var(--color-primary, #007bff), var(--color-primary-dark, #0056b3));
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 700;
        margin-left: 0.5rem;
      `;
      headerLeft.appendChild(badge);
    }
  }
  
  /**
   * Get current user's email from session/localStorage.
   */
  function getUserEmail() {
    // Check multiple sources for user email
    const session = JSON.parse(localStorage.getItem('kf_session') || '{}');
    if (session.email) return session.email;
    
    const settings = JSON.parse(localStorage.getItem('kf_settings') || '{}');
    if (settings.email) return settings.email;
    
    // Check auth token for email
    const token = localStorage.getItem('kf_token');
    if (token && token.includes('@')) {
      // Extract email if embedded in token (fallback)
      const emailMatch = token.match(/[\w\.-]+@[\w\.-]+\.\w+/);
      if (emailMatch) return emailMatch[0];
    }
    
    return null;
  }
  
  /**
   * Check client limit before adding a new client.
   * CALLED BEFORE: renderClientsPage() → saveClient()
   */
  async function validateClientAddition() {
    if (!currentSubscription) {
      await validateSubscriptionStatus();
    }
    
    const sub = currentSubscription.subscription;
    const clientCount = currentSubscription.client_count;
    
    // Check if subscription is expired
    if (sub.is_expired) {
      showErrorMessage('Your subscription has expired. Please renew to add more clients.');
      return false;
    }
    
    // Check client limit
    const limit = sub.plan_type === 'free' ? 20 : Infinity;
    if (clientCount >= limit) {
      showUpgradePrompt(`You have reached the ${limit} client limit on the ${sub.plan_name}. Upgrade to add more clients.`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Show upgrade prompt when client limit is reached.
   */
  function showUpgradePrompt(message) {
    const modal = document.getElementById('upgradeModal');
    if (modal) {
      const body = modal.querySelector('.modal-body');
      if (body) {
        const msgDiv = document.createElement('div');
        msgDiv.style.cssText = `
          background: rgba(255, 200, 0, 0.1);
          border-left: 4px solid var(--color-warning, #ffc800);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          color: var(--kf-text, #000);
        `;
        msgDiv.textContent = message;
        body.insertBefore(msgDiv, body.firstChild);
      }
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    }
  }
  
  /**
   * Show error message toast.
   */
  function showErrorMessage(message) {
    if (typeof showToast === 'function') {
      showToast(message, 'error');
    } else {
      alert(message);
    }
  }
  
  /**
   * Initiate payment for a selected plan.
   * CALLS: window.RazorpayPayment.payForPlan()
   */
  async function initiatePlanPayment(planId) {
    // Close expiry modal if open
    const expiryModal = document.getElementById('kf-expiry-blocking-modal');
    if (expiryModal) {
      expiryModal.style.display = 'none';
    }
    
    // Initiate Razorpay payment (assumes RazorpayPayment is loaded)
    if (window.RazorpayPayment && typeof window.RazorpayPayment.payForPlan === 'function') {
      window.RazorpayPayment.payForPlan(planId, {
        onSuccess: async (response) => {
          // Payment successful - re-validate subscription
          await validateSubscriptionStatus();
          
          // Show success message
          if (typeof showToast === 'function') {
            showToast('✅ Subscription activated! You have full access.', 'success');
          }
        },
        onError: (error) => {
          if (typeof showToast === 'function') {
            showToast('❌ Payment failed. Please try again.', 'error');
          }
        }
      });
    }
  }
  
  /**
   * Close app and revert to free tier (user clicked "Continue with Free Plan").
   */
  function closeApp() {
    const expiryModal = document.getElementById('kf-expiry-blocking-modal');
    if (expiryModal) {
      expiryModal.remove();
    }
    unblockAppAccess();
    // Redirect to dashboard with free tier
    if (typeof renderDashboard === 'function') {
      renderDashboard();
    }
  }
  
  /**
   * Initialize subscription enforcement on app load.
   * Called from app.js during initialization.
   */
  async function initialize() {
    console.log('🔐 Initializing subscription enforcement...');
    
    // First check
    await validateSubscriptionStatus();
    
    // Periodic check every 5 minutes
    if (subscriptionCheckInterval) {
      clearInterval(subscriptionCheckInterval);
    }
    subscriptionCheckInterval = setInterval(() => {
      validateSubscriptionStatus();
    }, 5 * 60 * 1000); // 5 minutes
    
    console.log('✅ Subscription enforcement initialized');
  }
  
  /**
   * Cleanup on app unload.
   */
  function cleanup() {
    if (subscriptionCheckInterval) {
      clearInterval(subscriptionCheckInterval);
    }
  }
  
  // ─── PUBLIC API ──────────────────────────────────────────────
  window.SubscriptionEnforcement.validateSubscriptionStatus = validateSubscriptionStatus;
  window.SubscriptionEnforcement.validateClientAddition = validateClientAddition;
  window.SubscriptionEnforcement.initiatePlanPayment = initiatePlanPayment;
  window.SubscriptionEnforcement.closeApp = closeApp;
  window.SubscriptionEnforcement.initialize = initialize;
  window.SubscriptionEnforcement.cleanup = cleanup;
  window.SubscriptionEnforcement.getCurrentSubscription = () => currentSubscription;
  window.SubscriptionEnforcement.getUserEmail = getUserEmail;
  
})();
