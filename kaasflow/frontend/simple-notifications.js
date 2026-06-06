/**
 * SamKass - Simple Browser Notifications (No Push - Local Only)
 * Shows notifications when app is open and loans are overdue
 */

(function() {
  'use strict';

  // Request notification permission
  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('❌ Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Notification permission already granted');
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      console.log('📱 Notification permission:', permission);
      return permission === 'granted';
    }

    console.warn('❌ Notification permission denied');
    return false;
  }

  // Show notification for overdue loan
  function showLoanDueNotification(loan, client, emiAmount) {
    if (Notification.permission !== 'granted') {
      console.warn('⚠️ Cannot show notification - permission not granted');
      return null;
    }

    const title = `EMI Due — ${client.name}`;
    const body = `₹${emiAmount} is overdue. How was the collection?`;
    
    const notification = new Notification(title, {
      body: body,
      icon: '/logo.png',
      badge: '/logo.png',
      requireInteraction: true,
      tag: `loan-due-${loan.id}`,
      data: {
        loan_id: loan.id,
        client_id: client.id,
        client_name: client.name,
        amount: emiAmount
      }
    });

    // Handle notification click
    notification.onclick = function(event) {
      event.preventDefault();
      window.focus();
      
      // Navigate to collection page
      if (window.navigateTo) {
        window.navigateTo('collection');
      }
      
      notification.close();
    };

    console.log(`✅ Notification shown for ${client.name}`);
    return notification;
  }

  // Check for overdue loans and show notifications
  async function checkAndNotifyOverdueLoans() {
    try {
      if (!window.Store) {
        console.warn('⚠️ Store not initialized yet');
        return;
      }

      const loans = window.Store.loans();
      const clients = window.Store.clients();
      const payments = window.Store.payments();

      if (!loans || !clients) {
        console.warn('⚠️ No loan data available');
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      let notificationCount = 0;

      // Find overdue or due today loans
      loans.forEach(loan => {
        if (loan.status !== 'active') return;

        const client = clients.find(c => c.id === loan.clientId);
        if (!client) return;

        // Calculate loan stats
        const stats = window.calcLoanStats ? window.calcLoanStats(loan) : null;
        
        if (!stats || !stats.nextDueDate) return;

        // Check if overdue or due today
        const dueDate = stats.nextDueDate;
        const isDueOrOverdue = dueDate <= today;

        if (isDueOrOverdue && stats.remaining > 0) {
          // Show notification
          const emiAmount = stats.emi || 0;
          setTimeout(() => {
            showLoanDueNotification(loan, client, emiAmount);
          }, notificationCount * 1000); // Stagger notifications by 1 second
          
          notificationCount++;
        }
      });

      if (notificationCount > 0) {
        console.log(`✅ Showed ${notificationCount} overdue loan notifications`);
      } else {
        console.log('✅ No overdue loans found');
      }

    } catch (error) {
      console.error('❌ Error checking overdue loans:', error);
    }
  }

  // Initialize notifications
  async function initNotifications() {
    console.log('🔔 Initializing simple notifications...');

    // Request permission
    const hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
      console.warn('⚠️ Notification permission not granted');
      return;
    }

    // Check for overdue loans when app loads
    setTimeout(() => {
      checkAndNotifyOverdueLoans();
    }, 3000);

    // Check every 30 minutes while app is open
    setInterval(() => {
      checkAndNotifyOverdueLoans();
    }, 30 * 60 * 1000);

    console.log('✅ Notifications initialized');
  }

  // Expose globally
  window.SimpleNotifications = {
    init: initNotifications,
    checkOverdue: checkAndNotifyOverdueLoans,
    showNotification: showLoanDueNotification,
    requestPermission: requestNotificationPermission
  };

  // Auto-initialize when Store is ready
  function waitForStore() {
    if (window.Store && window.calcLoanStats) {
      initNotifications();
    } else {
      setTimeout(waitForStore, 500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForStore);
  } else {
    waitForStore();
  }

})();
