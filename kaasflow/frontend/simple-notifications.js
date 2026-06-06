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
      
      console.log(`🔔 Showing notification with 3 action buttons for ${client.name}`);
      
      // Use Service Worker for notifications with action buttons
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          const notificationOptions = {
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
            },
            actions: [
              {
                action: 'paid',
                title: '✅ Paid',
                icon: '/logo.png'
              },
              {
                action: 'unpaid',
                title: '❌ Unpaid',
                icon: '/logo.png'
              },
              {
                action: 'partly_paid',
                title: '💰 Partial',
                icon: '/logo.png'
              }
            ]
          };

          registration.showNotification(title, notificationOptions);
          console.log(`✅ Service Worker notification displayed for ${client.name} (₹${emiAmount}) with 3 action buttons`);
        }).catch(error => {
          console.error('❌ Service Worker notification failed:', error);
          // Fallback to simple notification without action buttons
          const notification = new Notification(title, {
            body: `${body}\n\nOpen app to record payment status`,
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

          notification.onclick = function(event) {
            event.preventDefault();
            window.focus();
            if (window.navigateTo) {
              window.navigateTo('collection');
            }
            notification.close();
          };
        });
      } else {
        // Fallback for browsers without Service Worker
        const notification = new Notification(title, {
          body: `${body}\n\nOpen app to record payment status`,
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

        notification.onclick = function(event) {
          event.preventDefault();
          window.focus();
          if (window.navigateTo) {
            window.navigateTo('collection');
          }
          notification.close();
        };

        console.log(`✅ Simple notification displayed for ${client.name} (₹${emiAmount})`);
      }

      return true;
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

  // TEST: Force show a notification immediately with action buttons
  async function testNotificationNow() {
    console.log('🧪 [TEST] Force showing test notification with 3 action buttons...');
    
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.error('❌ [TEST] Permission denied');
        return false;
      }
    }

    try {
      console.log('🧪 [TEST] Showing notification with 3 action buttons');

      // Use Service Worker for action buttons
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready || await navigator.serviceWorker.register('/sw.js');
        
        const notificationOptions = {
          body: 'Test notification with 3 action buttons - click the buttons to test!',
          icon: '/logo.png',
          requireInteraction: true,
          tag: 'test-notification-with-actions',
          data: {
            test: true,
            loan_id: 'test-123',
            client_name: 'Test Client',
            amount: 5000
          },
          actions: [
            {
              action: 'paid',
              title: '✅ Paid',
              icon: '/logo.png'
            },
            {
              action: 'unpaid', 
              title: '❌ Unpaid',
              icon: '/logo.png'
            },
            {
              action: 'partly_paid',
              title: '💰 Partial',
              icon: '/logo.png'
            }
          ]
        };

        await registration.showNotification('🔔 SamKass Test (3 Buttons)', notificationOptions);
        console.log('✅ [TEST] Service Worker notification shown with 3 action buttons');
        return true;
      } else {
        // Fallback to simple notification
        const testNotification = new Notification('🔔 SamKass Test Notification', {
          body: 'Service Worker not available - no action buttons',
          icon: '/logo.png',
          requireInteraction: true,
          tag: 'test-notification'
        });

        testNotification.onclick = () => {
          window.focus();
          testNotification.close();
        };

        console.log('⚠️ [TEST] Simple notification shown (no action buttons - Service Worker not available)');
        return true;
      }
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

  // Add global console helper with action buttons
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

    try {
      // Use Service Worker for action buttons
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready || await navigator.serviceWorker.register('/sw.js');
        
        const actions = [
          {
            action: 'paid',
            title: '✅ Paid',
            icon: '/logo.png'
          },
          {
            action: 'unpaid',
            title: '❌ Unpaid', 
            icon: '/logo.png'
          },
          {
            action: 'partly_paid',
            title: '💰 Partial',
            icon: '/logo.png'
          }
        ];

        await registration.showNotification('🔔 Manual Test from Console', {
          body: 'This notification has 3 action buttons! Click them to test.',
          icon: '/logo.png',
          requireInteraction: true,
          tag: 'manual-console-test',
          actions: actions,
          data: {
            test: true,
            loan_id: 'console-test-123',
            client_name: 'Console Test Client',
            amount: 1000
          }
        });

        console.log('✅ Manual Service Worker notification sent with 3 action buttons');
      } else {
        // Fallback
        const testNotif = new Notification('🔔 Manual Test from Console', {
          body: 'This notification was triggered from browser console! (No action buttons - Service Worker not available)',
          icon: '/logo.png',
          requireInteraction: true,
          tag: 'manual-console-test'
        });

        testNotif.onclick = () => {
          window.focus();
          testNotif.close();
        };

        console.log('⚠️ Manual simple notification sent (no action buttons)');
      }
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  };

  // Add environment debug function
  window.debugNotificationEnv = () => {
    console.log('\n🔍 ========== NOTIFICATION ENVIRONMENT DEBUG ==========');
    console.log('🌐 User Agent:', navigator.userAgent);
    console.log('📍 Location:', window.location.href);
    console.log('🔒 Protocol:', window.location.protocol);
    console.log('🏠 Origin:', window.location.origin);
    console.log('📱 Notification support:', 'Notification' in window);
    
    if ('Notification' in window) {
      console.log('📋 Permission:', Notification.permission);
      console.log('🔧 Max actions:', Notification.maxActions || 'Unknown (browsers typically support 2-3)');
    }
    
    console.log('🖥️ Platform:', navigator.platform);
    console.log('📶 Online:', navigator.onLine);
    console.log('🔐 Secure context:', window.isSecureContext);
    
    // Service worker info
    if ('serviceWorker' in navigator) {
      console.log('⚙️ Service Worker supported:', true);
      navigator.serviceWorker.getRegistrations().then(regs => {
        console.log('📝 SW Registrations:', regs.length);
        if (regs.length > 0) {
          console.log('📋 SW Scope:', regs[0].scope);
          console.log('📋 SW State:', regs[0].active ? 'Active' : 'Inactive');
        }
      });
    } else {
      console.log('⚙️ Service Worker supported:', false);
    }
    
    console.log('🔍 =================================================\n');
  };

  console.log('💡 TIP: Type "testNotificationNow()" in console to test notifications anytime');
  console.log('💡 TIP: Type "debugNotificationEnv()" to check your browser environment');

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
