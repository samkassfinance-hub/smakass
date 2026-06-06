/* ============================================================
   SamKass Service Worker - Handle Notifications with 3 Actions
   ✅ Paid | ❌ Unpaid | 💰 Partly Paid
   ============================================================ */
'use strict';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

/* Notification Click Handler */
self.addEventListener('notificationclick', e => {
  const notification = e.notification;
  const action = e.action;
  const data = notification.data || {};

  console.log('🔔 SW: Notification clicked - action:', action, 'data:', data);

  notification.close();

  // If no action (user clicked notification body), open app
  if (!action) {
    console.log('🔔 SW: No action - opening app');
    e.waitUntil(
      clients.openWindow('/').catch(err => {
        console.error('❌ SW: Error opening window:', err);
      })
    );
    return;
  }

  if (action === 'paid') {
    e.waitUntil(handlePaymentAction('paid', data));
  } else if (action === 'unpaid') {
    e.waitUntil(handlePaymentAction('unpaid', data));
  } else if (action === 'partly_paid') {
    e.waitUntil(handlePaymentAction('partly_paid', data));
  }
});

async function handlePaymentAction(actionType, data) {
  try {
    console.log(`🔔 SW: ${actionType} button clicked for loan ${data.loan_id}`);

    // Get all clients first
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    console.log(`📨 SW: Found ${allClients.length} client windows`);

    if (allClients.length === 0) {
      console.error('❌ SW: No app windows open - opening new window');
      await self.registration.showNotification('⚠️ Open SamKass App', {
        body: 'Please open the app to record payment actions',
        icon: '/logo.png',
        tag: 'app-required',
        requireInteraction: false
      });
      await clients.openWindow('/');
      return;
    }

    // Get token from app
    const token = await getTokenFromApp();

    if (!token) {
      console.error('❌ SW: No auth token - user may not be logged in');
      notifyClients('ERROR', 'Please login to record payment');
      await self.registration.showNotification('⚠️ Login Required', {
        body: 'Please login to record payment actions',
        icon: '/logo.png',
        tag: 'login-required',
        requireInteraction: false
      });
      return;
    }

    console.log('✅ SW: Token received from app');

    let amount = data.amount || 0;

    // For partly paid, ask user for amount
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

    console.log(`📤 SW: Sending ${actionType} action with amount ₹${amount} to backend`);

    // Get the app's base URL
    const appUrl = allClients[0].url;
    const baseUrl = new URL(appUrl).origin;
    console.log(`📍 SW: Using base URL: ${baseUrl}`);

    // Send to backend
    const response = await fetch(`${baseUrl}/api/notify-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        loan_id: data.loan_id,
        action: actionType,
        amount: amount
      })
    });

    console.log(`📥 SW: Backend response status: ${response.status}`);

    const result = await response.json();
    console.log('📥 SW: Backend response data:', result);

    if (response.ok) {
      console.log('✅ SW: Payment recorded successfully:', result);

      // Notify all open windows to update their data
      console.log(`📨 SW: Notifying ${allClients.length} client(s) to update data`);
      
      allClients.forEach((client, index) => {
        console.log(`📨 SW: Sending PAYMENT_RECORDED to client ${index + 1}`);
        client.postMessage({
          type: 'PAYMENT_RECORDED',
          action: actionType,
          loan_id: data.loan_id,
          client_name: data.client_name,
          amount: amount,
          result: result
        });
      });

      // Show success notification
      const actionLabel = getActionLabel(actionType);
      await self.registration.showNotification('✅ Payment Recorded', {
        body: `${actionLabel} ₹${amount} - ${data.client_name}`,
        icon: '/logo.png',
        tag: 'payment-success',
        requireInteraction: false
      });

      console.log('✅ SW: Success notification shown');
    } else {
      throw new Error(result.error || 'Failed to record payment');
    }

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
      { action: 'unpaid', title: '❌ Unpaid', icon: '/logo.png' },
      { action: 'partly_paid', title: '💰 Partial', icon: '/logo.png' }
    ]
  };

  e.waitUntil(
    self.registration.showNotification(payload.title || 'EMI Due', options)
  );
});
