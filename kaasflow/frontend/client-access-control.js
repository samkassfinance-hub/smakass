/**
 * Client Access Control - Ensures limit is enforced
 * After payment, clients become unlimited based on subscription
 * When subscription expires, limit reverts to 20 clients
 */

(function() {
  'use strict';

  // Check client limit before allowing add action
  window.enforceClientLimit = function() {
    const currentClientCount = (window.Store && window.Store.clients) ? window.Store.clients().length : 0;
    
    // Get subscription status
    let canAddMore = true;
    if (window.KFSubscription && window.KFSubscription.manager) {
      canAddMore = window.KFSubscription.manager.canAddClient(currentClientCount);
    }

    // If limit reached and user has free plan, show blocking modal
    if (!canAddMore) {
      console.warn(`⚠️ Client limit enforced: ${currentClientCount} clients. Showing upgrade modal.`);
      
      if (window.KFSubscription && window.KFSubscription.ui) {
        window.KFSubscription.ui.showUpgradePrompt(currentClientCount);
      }
      return false;
    }

    return true;
  };

  // Monitor subscription status and refresh UI when plan changes
  window.onSubscriptionChange = function() {
    console.log('📋 Subscription status updated');
    
    // Update canAddClient function calls
    if (typeof renderClients === 'function' && document.getElementById('clients-list')) {
      console.log('🔄 Refreshing clients view...');
      navigateTo('clients');
    }

    // Update plan banner
    if (typeof updatePlanBanner === 'function') {
      updatePlanBanner();
    }

    // Refresh current page if needed
    if (window.KF && window.KF.refreshCurrentPage) {
      window.KF.refreshCurrentPage();
    }
  };

  // Override openClientModal to enforce limit
  const originalOpenClientModal = window.openClientModal;
  window.openClientModal = function(id = null) {
    // If editing existing client, allow
    if (id) return originalOpenClientModal(id);

    // If adding new client, check limit
    if (!window.enforceClientLimit()) {
      return false;
    }

    return originalOpenClientModal(id);
  };

  // Monitor for payment completion and refresh
  window.addEventListener('storage', (e) => {
    if (e.key === 'kf_subscription' || e.key === 'kf_settings') {
      console.log('💾 Subscription data changed, refreshing...');
      window.onSubscriptionChange();
    }
  });

  // Validate on app initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        if (window.Store && window.Store.clients) {
          const count = window.Store.clients().length;
          console.log(`✅ Access control initialized: ${count} clients`);
        }
      }, 500);
    });
  }

})();

window.clientAccessControlLoaded = true;
console.log('✅ client-access-control.js loaded');
