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

  // Calculate EMI for a loan
  function calculateEMI(loan) {
    const principal = loan.principal || 0;
    const interestRate = loan.interestRate || 0;
    const interestType = loan.interestType || 'percentage';
    const duration = loan.duration || 0;
    const type = loan.type || 'monthly';

    // Calculate monthly interest
    let monthlyInterest;
    if (interestType === 'fixed') {
      monthlyInterest = interestRate;
    } else {
      monthlyInterest = (principal * interestRate) / 100;
    }

    if (!duration || duration <= 0) {
      return monthlyInterest;
    }

    const totalInterest = monthlyInterest * duration;
    const totalPayable = principal + totalInterest;

    // Calculate installments
    const installments = type === 'weekly' ? duration * 4 : duration;
    const emi = totalPayable / installments;
    
    return Math.round(emi * 100) / 100;
  }

  // Check for overdue loans and show notifications
  async function checkAndNotifyOverdueLoans() {
    try {
      console.log('🔍 Checking overdue loans...');
      
      if (!window.Store) {
        console.error('❌ Store not available');
        return;
      }

      const loans = window.Store.loans();
      const clients = window.Store.clients();

      console.log(`📊 Found ${loans.length} loans and ${clients.length} clients`);

      if (!loans || !clients || loans.length === 0) {
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

        // Check due date
        const dueDate = loan.nextDueDate || loan.next_due_date;
        if (!dueDate) return;

        const isDueOrOverdue = dueDate <= today;

        if (isDueOrOverdue) {
          console.log(`⏰ Loan ${loan.id} for ${client.name} is due/overdue on ${dueDate}`);
          // Calculate EMI
          const emiAmount = calculateEMI(loan);
          
          setTimeout(() => {
            showLoanDueNotification(loan, client, emiAmount);
          }, notificationCount * 1000); // Stagger notifications by 1 second
          
          notificationCount++;
        }
      });

      if (notificationCount > 0) {
        console.log(`✅ Found and queued ${notificationCount} overdue loan notifications`);
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

    console.log('✅ Notification permission granted');

    // Check for overdue loans when app loads
    console.log('⏳ Will check for overdue loans in 3 seconds...');
    setTimeout(() => {
      console.log('🔔 Running initial overdue check...');
      checkAndNotifyOverdueLoans();
    }, 3000);

    // Check every 30 minutes while app is open
    setInterval(() => {
      console.log('🔔 Running periodic overdue check...');
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
    if (window.Store) {
      console.log('✅ Store found, initializing notifications');
      initNotifications();
    } else {
      console.log('⏳ Waiting for Store...');
      setTimeout(waitForStore, 500);
    }
  }

  // Wait for DOM and Store
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📄 DOM loaded, checking Store...');
      setTimeout(waitForStore, 1000);
    });
  } else {
    console.log('📄 DOM already ready, checking Store...');
    setTimeout(waitForStore, 1000);
  }

})();
