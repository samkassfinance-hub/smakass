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

  notification.close();

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

    // Get token from app
    const token = await getTokenFromApp();

    if (!token) {
      console.error('❌ No auth token');
      notifyClients('ERROR', 'Please login to record payment');
      return;
    }

    let amount = data.amount || 0;

    // For partly paid, ask user for amount
    if (actionType === 'partly_paid') {
      amount = await promptForAmount(data);
      if (!amount || amount <= 0) {
        console.log('⚠️ Partial payment cancelled');
        return;
      }
    }

    console.log(`📤 SW: Sending ${actionType} action with amount ₹${amount}`);

    // Send to backend
    const response = await fetch('/api/notify-action', {
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

    const result = await response.json();

    if (response.ok) {
      console.log('✅ SW: Payment recorded successfully');

      // Notify all open windows
      const allClients = await clients.matchAll({ type: 'window' });
      allClients.forEach(client => {
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
      await self.registration.showNotification('✅ Payment Recorded', {
        body: `${getActionLabel(actionType)} ₹${amount} - ${data.client_name}`,
        icon: '/logo.png',
        tag: 'payment-success',
        requireInteraction: false
      });
    } else {
      throw new Error(result.error || 'Failed to record');
    }

  } catch (error) {
    console.error('❌ SW Error:', error);
    notifyClients('ERROR', error.message);
  }
}

async function getTokenFromApp() {
  const clients = await self.clients.matchAll({ type: 'window' });
  if (clients.length === 0) return null;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), 3000);
    const channel = new MessageChannel();

    channel.port1.onmessage = (e) => {
      clearTimeout(timeout);
      resolve(e.data.token);
    };

    clients[0].postMessage({ type: 'GET_TOKEN_FOR_SW' }, [channel.port2]);
  });
}

async function promptForAmount(data) {
  const clients = await self.clients.matchAll({ type: 'window' });
  if (clients.length === 0) return 0;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(0), 10000);
    const channel = new MessageChannel();

    channel.port1.onmessage = (e) => {
      clearTimeout(timeout);
      resolve(e.data.amount);
    };

    clients[0].postMessage({
      type: 'PROMPT_PARTIAL_AMOUNT',
      emi_amount: data.amount
    }, [channel.port2]);
  });
}

function notifyClients(type, message) {
  self.clients.matchAll({ type: 'window' }).then(clients => {
    clients.forEach(client => {
      client.postMessage({ type, message });
    });
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
