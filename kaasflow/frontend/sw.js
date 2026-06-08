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
  const loans = data.loans || [];

  console.log('🔔 SW: Notification clicked - action:', action);

  notification.close();

  // Handle button actions
  if (action === 'paid' || action === 'unpaid') {
    // Call backend API directly - no localStorage
    e.waitUntil(
      fetch('https://samkass.site/api/cron/notify-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loans: loans,
          action: action
        }),
        keepalive: true
      })
      .then(res => res.json())
      .then(result => {
        console.log(`✅ SW: ${action} action saved:`, result);
        
        // Show success notification
        return self.registration.showNotification(
          action === 'paid' ? '✅ Marked as PAID' : '❌ Marked as UNPAID',
          {
            body: `${loans.length} EMI(s) updated successfully`,
            icon: '/logo.png',
            tag: 'payment-success',
            requireInteraction: false
          }
        );
      })
      .catch(err => {
        console.error('❌ SW: Action failed:', err);
        return self.registration.showNotification(
          '❌ Action Failed',
          {
            body: 'Could not update payment. Please open the app.',
            icon: '/logo.png',
            tag: 'payment-error'
          }
        );
      })
    );
  } else if (!action) {
    // Notification body clicked - open app for partial payment
    const firstLoan = loans[0];
    if (firstLoan) {
      e.waitUntil(
        clients.openWindow(
          'https://samkass.site/notify-partial.html?loan_id=' +
          firstLoan.loan_id + '&amount=' + firstLoan.amount +
          '&name=' + encodeURIComponent(firstLoan.client_name)
        )
      );
    } else {
      e.waitUntil(clients.openWindow('https://samkass.site'));
    }
  }
});


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
