/* ============================================================
   SamKass Service Worker - Handle Notifications with 3 Actions
   ✅ Paid | ❌ Unpaid | 💰 Partly Paid
   ============================================================ */
'use strict';

const CACHE_NAME = 'samkass-v1';
const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
  console.log('✅ Service Worker activated - Starting notification checks');
  // Start periodic notification checks
  startPeriodicCheck();
});

// Periodic background sync for checking due loans
function startPeriodicCheck() {
  setInterval(async () => {
    console.log('🔔 SW: Periodic check for due loans...');
    await checkAndNotifyDueLoans();
  }, CHECK_INTERVAL);
}

async function checkAndNotifyDueLoans() {
  try {
    // Get all window clients to access localStorage
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    
    if (allClients.length === 0) {
      console.log('⚠️ SW: No clients found to check data');
      return;
    }
    
    // Request data from client
    const channel = new MessageChannel();
    
    const dataPromise = new Promise((resolve) => {
      channel.port1.onmessage = (e) => {
        resolve(e.data);
      };
      
      setTimeout(() => resolve(null), 5000); // Timeout after 5 seconds
    });
    
    allClients[0].postMessage({ type: 'GET_DUE_LOANS_DATA' }, [channel.port2]);
    
    const dueLoans = await dataPromise;
    
    if (!dueLoans || dueLoans.length === 0) {
      console.log('✅ SW: No due loans found');
      return;
    }
    
    console.log(`🔔 SW: Found ${dueLoans.length} due loans`);
    
    // Show notifications
    for (const item of dueLoans) {
      await self.registration.showNotification(
        `🔔 EMI Due — ${item.clientName}`,
        {
          body: `₹${item.emiAmount.toFixed(2)} is due. Tap here for Partial Payment.`,
          icon: '/logo.png',
          badge: '/logo.png',
          requireInteraction: true,
          tag: `loan-due-${item.loanId}`,
          data: {
            loan_id: item.loanId,
            client_id: item.clientId,
            client_name: item.clientName,
            amount: item.emiAmount
          },
          actions: [
            { action: 'paid', title: '✅ Paid', icon: '/logo.png' },
            { action: 'unpaid', title: '❌ Unpaid', icon: '/logo.png' }
          ]
        }
      );
      
      console.log(`✅ SW: Notification sent for ${item.clientName}`);
    }
    
  } catch (error) {
    console.error('❌ SW: Error checking due loans:', error);
  }
}

/* Notification Click Handler */
self.addEventListener('notificationclick', e => {
  const notification = e.notification;
  const action = e.action;
  const data = notification.data || {};

  console.log('🔔 SW: Notification clicked - action:', action, 'data:', data);

  notification.close();

  // FIRST: Always open/focus the app window
  e.waitUntil(
    (async () => {
      // Handle button actions
      if (action === 'paid') {
        await handlePaymentAction('paid', data);
      } else if (action === 'unpaid') {
        await handlePaymentAction('unpaid', data);
      } else if (action === 'partly_paid') {
        // Open/focus window first for partly_paid
        const allWindows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
        
        if (allWindows.length > 0) {
          console.log('🔔 SW: Found existing window, focusing it');
          await allWindows[0].focus();
        } else {
          console.log('🔔 SW: No window found, opening new one');
          await clients.openWindow('/');
        }
        
        // Wait for window to be ready
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        await handlePaymentAction('partly_paid', data);
      } else {
        // No action = body clicked = Partial Payment
        console.log('🔔 SW: Body clicked - Partial Payment');
        
        // Open/focus window for partial payment
        const allWindows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
        
        if (allWindows.length > 0) {
          console.log('🔔 SW: Found existing window, focusing it');
          await allWindows[0].focus();
        } else {
          console.log('🔔 SW: No window found, opening new one');
          await clients.openWindow('/');
        }
        
        // Wait for window to be ready
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        await handlePaymentAction('partly_paid', data);
      }
    })()
  );
});

async function handlePaymentAction(actionType, data) {
  try {
    console.log(`🔔 SW: ${actionType} button clicked for loan ${data.loan_id}`);

    // Get all clients (should exist now since we opened/focused in click handler)
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    console.log(`📨 SW: Found ${allClients.length} client windows`);

    if (allClients.length === 0) {
      console.error('❌ SW: No app windows found even after opening');
      await self.registration.showNotification('⚠️ Failed to Open App', {
        body: 'Please manually open SamKass app to record payment',
        icon: '/logo.png',
        tag: 'app-open-failed',
        requireInteraction: false
      });
      return;
    }

    let amount = data.amount || 0;

    // For partly paid, ask user for amount via app
    if (actionType === 'partly_paid') {
      console.log('💰 SW: Prompting user for partial amount...');
      amount = await promptForAmount(data);
      if (!amount || amount <= 0) {
        console.log('⚠️ SW: Partial payment cancelled by user');
        notifyClients('INFO', 'Partial payment cancelled');
        return;
      }
      console.log(`💰 SW: User entered partial amount: ₹${amount}`);
    }

    console.log(`📤 SW: Sending ${actionType} action directly to app for update`);

    // DIRECT UPDATE: Send to app immediately for localStorage update
    allClients.forEach((client, index) => {
      console.log(`📨 SW: Sending PAYMENT_RECORDED to client ${index + 1}`);
      client.postMessage({
        type: 'PAYMENT_RECORDED',
        action: actionType,
        loan_id: data.loan_id,
        client_name: data.client_name,
        amount: amount,
        result: { success: true, direct_update: true }
      });
    });

    console.log('✅ SW: Payment action sent to app for immediate update');

    // Show appropriate success notification based on action
    let notifTitle = '';
    let notifBody = '';
    
    if (actionType === 'paid') {
      notifTitle = '✅ Marked as PAID';
      notifBody = `₹${amount} paid by ${data.client_name}. Next due date updated.`;
    } else if (actionType === 'unpaid') {
      notifTitle = '❌ Marked as UNPAID';
      notifBody = `${data.client_name} - ₹${amount} EMI recorded as unpaid for this cycle.`;
    } else if (actionType === 'partly_paid') {
      notifTitle = '💰 Partial Payment Recorded';
      notifBody = `${data.client_name} paid ₹${amount}. Remaining balance updated.`;
    }
    
    await self.registration.showNotification(notifTitle, {
      body: notifBody,
      icon: '/logo.png',
      tag: 'payment-success',
      requireInteraction: false
    });

    console.log('✅ SW: Success notification shown');

  } catch (error) {
    console.error('❌ SW Error in handlePaymentAction:', error);
    console.error('❌ SW Error stack:', error.stack);
    notifyClients('ERROR', `Failed: ${error.message}`);
    
    // Show error notification
    try {
      await self.registration.showNotification('❌ Payment Failed', {
        body: `Failed to record ${actionType} for ${data.client_name}. Error: ${error.message}`,
        icon: '/logo.png',
        tag: 'payment-error',
        requireInteraction: false
      });
    } catch (notifError) {
      console.error('❌ SW: Failed to show error notification:', notifError);
    }
  }
}

async function getTokenFromApp() {
  try {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    console.log(`🔐 SW: Found ${allClients.length} clients for token request`);
    
    if (allClients.length === 0) {
      console.error('🔐 SW: No clients found to request token from');
      return null;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.error('🔐 SW: Token request timed out after 5 seconds');
        resolve(null);
      }, 5000);
      
      const channel = new MessageChannel();

      channel.port1.onmessage = (e) => {
        clearTimeout(timeout);
        console.log('🔐 SW: Token received from app:', e.data.token ? '✅ Yes' : '❌ No');
        resolve(e.data.token);
      };

      console.log('🔐 SW: Sending GET_TOKEN_FOR_SW request to client');
      allClients[0].postMessage({ type: 'GET_TOKEN_FOR_SW' }, [channel.port2]);
    });
  } catch (error) {
    console.error('❌ SW: Error in getTokenFromApp:', error);
    return null;
  }
}

async function promptForAmount(data) {
  try {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    console.log(`💰 SW: Found ${allClients.length} clients for amount prompt`);
    
    if (allClients.length === 0) {
      console.error('💰 SW: No clients found to prompt for amount');
      return 0;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.error('💰 SW: Amount prompt timed out after 15 seconds');
        resolve(0);
      }, 15000);
      
      const channel = new MessageChannel();

      channel.port1.onmessage = (e) => {
        clearTimeout(timeout);
        console.log('💰 SW: Amount received from app:', e.data.amount);
        resolve(e.data.amount);
      };

      console.log('💰 SW: Sending PROMPT_PARTIAL_AMOUNT request to client');
      allClients[0].postMessage({
        type: 'PROMPT_PARTIAL_AMOUNT',
        emi_amount: data.amount
      }, [channel.port2]);
    });
  } catch (error) {
    console.error('❌ SW: Error in promptForAmount:', error);
    return 0;
  }
}

function notifyClients(type, message) {
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(allClients => {
    console.log(`📢 SW: Broadcasting ${type} message to ${allClients.length} clients`);
    allClients.forEach((client, index) => {
      console.log(`📢 SW: Sending to client ${index + 1}:`, message);
      client.postMessage({ type, message });
    });
  }).catch(error => {
    console.error('❌ SW: Error in notifyClients:', error);
  });
}

function getActionLabel(action) {
  const labels = {
    'paid': 'PAID',
    'unpaid': 'UNPAID',
    'partly_paid': 'PARTIAL PAID'
  };
  return labels[action] || action;
}

/* Push Notification Handler */
self.addEventListener('push', e => {
  if (!e.data) return;

  const payload = e.data.json();

  const options = {
    body: payload.body || '',
    icon: '/logo.png',
    badge: '/logo.png',
    requireInteraction: true,
    data: payload.data || {},
    actions: [
      { action: 'paid', title: '✅ Paid', icon: '/logo.png' },
      { action: 'unpaid', title: '❌ Unpaid', icon: '/logo.png' }
    ]
  };

  e.waitUntil(
    self.registration.showNotification(payload.title || 'EMI Due', options)
  );
});
