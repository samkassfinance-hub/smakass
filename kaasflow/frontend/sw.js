/* ============================================================
   KaasFlow — Service Worker (sw.js)
   Handles notification action buttons:
     ✅  "paid"    → tells the app to record a full EMI payment
     ⏳  "pending" → dismisses, app marks as pending in its state
   ============================================================ */
'use strict';

/* ── Install & Activate (cache-first for offline, optional) ── */
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', e  => e.waitUntil(clients.claim()));

/* ── Notification Click ──────────────────────────────────── */
self.addEventListener('notificationclick', e => {
  const notification = e.notification;
  const action       = e.action;            // 'paid' | 'unpaid' | 'partly_paid' | '' (body tap)
  const data         = notification.data || {};

  notification.close();

  // Get auth token from client
  const getAuthToken = async () => {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (allClients.length > 0) {
      // Request token from client
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.token);
        };
        allClients[0].postMessage({ type: 'GET_AUTH_TOKEN' }, [messageChannel.port2]);
      });
    }
    return null;
  };

  const handlePaymentAction = async (actionType, amount = null) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        console.error('❌ No auth token available');
        return;
      }

      const payload = {
        loan_id: data.loan_id,
        action: actionType,
        amount: amount || data.amount
      };

      const response = await fetch('/api/notify-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Payment action processed:', result);
        
        // Notify all clients to refresh data
        const allClients = await clients.matchAll({ type: 'window' });
        allClients.forEach(client => {
          client.postMessage({
            type: 'PAYMENT_ACTION_SUCCESS',
            action: actionType,
            data: result
          });
        });
      } else {
        console.error('❌ Payment action failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Error handling payment action:', error);
    }
  };

  if (action === 'paid') {
    // ✅ User clicked PAID button
    e.waitUntil(handlePaymentAction('paid'));
  } 
  else if (action === 'unpaid') {
    // ❌ User clicked UNPAID button
    e.waitUntil(handlePaymentAction('unpaid', 0));
  } 
  else if (action === 'partly_paid') {
    // 💰 User clicked PARTLY PAID button - open partial payment page
    e.waitUntil(
      clients.openWindow(
        `/notify-partial.html?loan_id=${data.loan_id}&client_name=${encodeURIComponent(data.client_name)}&amount=${data.amount}`
      )
    );
  } 
  else {
    // User tapped notification body - open app to collection page
    e.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(wins => {
        if (wins.length > 0) {
          wins[0].focus();
          wins[0].postMessage({ type: 'NOTIF_OPEN_COLLECTION' });
        } else {
          return clients.openWindow('/?page=collection');
        }
      })
    );
  }
});

/* ── Future: Server Push Support ────────────────────────── */
self.addEventListener('push', e => {
  if (!e.data) return;
  const payload = e.data.json();
  e.waitUntil(
    self.registration.showNotification(payload.title || 'KaasFlow', {
      body:    payload.body  || '',
      icon:    payload.icon  || '/favicon.ico',
      badge:   payload.badge || '/favicon.ico',
      data:    payload.data  || {},
      actions: payload.actions || [],
      requireInteraction: payload.requireInteraction || false,
    })
  );
});
