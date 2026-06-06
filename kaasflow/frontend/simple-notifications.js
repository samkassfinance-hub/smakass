/**
 * SamKass - Simple Browser Notifications (No Push - Local Only)
 * Shows notifications when app is open and loans are overdue
 */

(function() {
  'use strict';

  let isInitialized = false;
  let hasPermission = false;

  // Request notification permission
  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('❌ Notifications not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Notification permission already granted');
      hasPermission = true;
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('❌ Notification permission previously denied by user');
      hasPermission = false;
      return false;
    }

    // Permission is 'default' - ask user
    try {
      const permission = await Notification.requestPermission();
      console.log('📱 Notification permission result:', permission);
      hasPermission = permission === 'granted';
      return hasPermission;
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      hasPermission = false;
      return false;
    }
  }

  // Show notification for overdue loan
  function showLoanDueNotification(loan, client, emiAmount) {
    if (Notification.permission !== 'granted') {
      console.warn('⚠️ Cannot show notification - permission not granted');
      return null;
    }

    try {
      const title = `🔔 EMI Due — ${client.name}`;
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

      console.log(`✅ Notification displayed for ${client.name} (₹${emiAmount})`);
      return notification;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      return null;
    }
  }

  // Calculate EMI for a loan
  function calculateEMI(loan) {
    try {
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
    } catch (error) {
      console.error('❌ Error calculating EMI:', error);
      return 0;
    }
  }

  // Check for overdue loans and show notifications
  async function checkAndNotifyOverdueLoans() {
    try {
      console.log('🔍 [NOTIF] Checking for overdue loans...');
      
      // Check if app is ready
      if (!window.Store) {
        console.warn('⚠️ [NOTIF] Store not available yet - app may not be initialized');
        return { found: 0, shown: 0, error: 'Store not ready' };
      }

      // Check permission
      if (Notification.permission !== 'granted') {
        console.warn('⚠️ [NOTIF] Notification permission not granted');
        return { found: 0, shown: 0, error: 'Permission not granted' };
      }

      // Get data
      const loans = window.Store.loans();
      const clients = window.Store.clients();

      console.log(`📊 [NOTIF] Data loaded: ${loans.length} loans, ${clients.length} clients`);

      if (!loans || !clients) {
        console.warn('⚠️ [NOTIF] Store methods returned null/undefined');
        return { found: 0, shown: 0, error: 'Invalid store data' };
      }

      if (loans.length === 0 || clients.length === 0) {
        console.log('ℹ️ [NOTIF] No data to check (loans or clients empty)');
        return { found: 0, shown: 0, error: 'No data' };
      }

      const today = new Date().toISOString().split('T')[0];
      let foundCount = 0;
      let shownCount = 0;

      // Find overdue or due today loans
      loans.forEach((loan, index) => {
        try {
          // Skip inactive/completed loans
          if (loan.status !== 'active') {
            return;
          }

          // Find client
          const client = clients.find(c => c.id === loan.clientId);
          if (!client) {
            console.warn(`⚠️ [NOTIF] Loan ${loan.id}: Client not found`);
            return;
          }

          // Check due date - try multiple field names
          let dueDate = loan.nextDueDate || loan.next_due_date;
          
          // FALLBACK: If no due date field, try to calculate it
          if (!dueDate && loan.startDate) {
            // Simple fallback: assume first payment is due 1 month after start date
            try {
              const startDate = new Date(loan.startDate);
              startDate.setMonth(startDate.getMonth() + 1);
              dueDate = startDate.toISOString().split('T')[0];
              console.log(`📅 [NOTIF] Loan ${loan.id}: Calculated due date = ${dueDate}`);
            } catch (e) {
              console.warn(`⚠️ [NOTIF] Loan ${loan.id}: Could not calculate due date`);
              return;
            }
          }
          
          if (!dueDate) {
            console.warn(`⚠️ [NOTIF] Loan ${loan.id}: No due date available`);
            return;
          }

          // Check if due or overdue (TODAY or in the PAST)
          const isDueOrOverdue = dueDate <= today;

          if (isDueOrOverdue) {
            foundCount++;
            console.log(`✅ [NOTIF] Loan ${loan.id}: OVERDUE - Due: ${dueDate}, Today: ${today}, Client: ${client.name}`);
            
            // Calculate EMI
            const emiAmount = calculateEMI(loan);
            console.log(`💰 [NOTIF] Loan ${loan.id}: Calculated EMI = ₹${emiAmount}`);
            
            // Show notification after staggered delay
            setTimeout(() => {
              const result = showLoanDueNotification(loan, client, emiAmount);
              if (result) shownCount++;
            }, foundCount * 800); // 0.8 second delay between notifications
          } else {
            console.log(`⏳ [NOTIF] Loan ${loan.id}: Not yet due (Due: ${dueDate}, Today: ${today})`);
          }
        } catch (error) {
          console.error(`❌ [NOTIF] Error processing loan ${index}:`, error);
        }
      });

      console.log(`📋 [NOTIF] Summary - Found: ${foundCount}, Shown: ${shownCount}`);
      return { found: foundCount, shown: shownCount, error: null };

    } catch (error) {
      console.error('❌ [NOTIF] Fatal error in checkAndNotifyOverdueLoans:', error);
      return { found: 0, shown: 0, error: error.message };
    }
  }

  // Initialize notifications
  async function initNotifications() {
    console.log('🔔 [NOTIF] ========== INITIALIZING NOTIFICATIONS ==========');
    
    if (isInitialized) {
      console.log('ℹ️ [NOTIF] Already initialized');
      return;
    }

    // Check browser support
    if (!('Notification' in window)) {
      console.error('❌ [NOTIF] Browser does not support notifications');
      return;
    }

    console.log('📱 [NOTIF] Browser supports notifications');

    // Request permission
    hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
      console.warn('⚠️ [NOTIF] User did not grant notification permission');
      return;
    }

    isInitialized = true;
    console.log('✅ [NOTIF] Initialization successful');
    console.log('🔔 [NOTIF] ================================================\n');

    // Check for overdue loans when app loads (3 second delay for data to load)
    console.log('⏳ [NOTIF] Scheduling initial check in 3 seconds...');
    setTimeout(() => {
      console.log('🔔 [NOTIF] Running INITIAL overdue check...');
      checkAndNotifyOverdueLoans();
    }, 3000);

    // Check every 30 minutes while app is open
    setInterval(() => {
      console.log('🔔 [NOTIF] Running PERIODIC overdue check (30min interval)...');
      checkAndNotifyOverdueLoans();
    }, 30 * 60 * 1000);

    console.log('📅 [NOTIF] Next periodic check in 30 minutes');
  }

  // TEST: Force show a notification immediately
  async function testNotificationNow() {
    console.log('🧪 [TEST] Force showing test notification...');
    
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.error('❌ [TEST] Permission denied');
        return false;
      }
    }

    try {
      const testNotification = new Notification('🔔 SamKass Test Notification', {
        body: 'If you see this, notifications are working!',
        icon: '/logo.png',
        requireInteraction: true,
        tag: 'test-notification'
      });

      testNotification.onclick = () => {
        window.focus();
        testNotification.close();
      };

      console.log('✅ [TEST] Test notification shown successfully');
      return true;
    } catch (error) {
      console.error('❌ [TEST] Failed to show notification:', error);
      return false;
    }
  }

  // Expose globally for manual testing
  window.SimpleNotifications = {
    init: initNotifications,
    checkOverdue: checkAndNotifyOverdueLoans,
    showNotification: showLoanDueNotification,
    requestPermission: requestNotificationPermission,
    isInitialized: () => isInitialized,
    hasPermission: () => hasPermission,
    testNow: testNotificationNow
  };

  console.log('✅ [NOTIF] SimpleNotifications exposed to window');

  // Add global console helper
  window.testNotificationNow = async () => {
    console.log('🧪 Manual notification test from console...');
    
    if (!('Notification' in window)) {
      console.error('❌ Notifications not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.error('❌ Permission denied');
        return;
      }
    }

    const testNotif = new Notification('🔔 Manual Test from Console', {
      body: 'This notification was triggered from browser console!',
      icon: '/logo.png',
      requireInteraction: true,
      tag: 'manual-console-test'
    });

    testNotif.onclick = () => {
      window.focus();
      testNotif.close();
    };

    console.log('✅ Manual test notification sent');
  };

  console.log('💡 TIP: Type "testNotificationNow()" in console to test notifications anytime');

  // Wait for Store to be available, then initialize
  // Store is available immediately, but we need to wait for user to be logged in
  function waitForStore() {
    if (!window.Store) {
      console.log('⏳ [NOTIF] Waiting for Store to be available...');
      setTimeout(waitForStore, 1000);
      return;
    }

    console.log('✅ [NOTIF] Store found, but not checking login status');
    console.log('✅ [NOTIF] Initializing notifications immediately');
    initNotifications();
  }

  // Start waiting for Store - SIMPLIFIED TO NOT WAIT FOR LOGIN
  if (document.readyState === 'loading') {
    console.log('📄 [NOTIF] DOM still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
      console.log('📄 [NOTIF] DOMContentLoaded fired, checking for Store...');
      setTimeout(waitForStore, 500);
    });
  } else {
    console.log('📄 [NOTIF] DOM already ready, checking for Store...');
    setTimeout(waitForStore, 500);
  }

})();
