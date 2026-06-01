/**
 * KaasFlow — Supabase Cloud Sync Service (Frontend)
 * ===================================================
 * Talks to the Flask backend (/api/sync/*) which in turn
 * talks to Supabase using the secure service-role key.
 *
 * Usage (called from app.js):
 *   KFSync.backup()   → push all local data to cloud via backend
 *   KFSync.restore()  → pull cloud data back + merge into localStorage
 *   KFSync.status()   → check if backend+Supabase are reachable via health endpoint
 */

(function (global) {
  'use strict';

  const API_BASE = '/api/sync';
  const LAST_SYNC_KEY = 'kf_last_sync';

  // ─── Helper: Get Current User ────────────────────────────────
  function _getUserId() {
    const session = JSON.parse(localStorage.getItem('kf_session') || '{}');
    return (session.user && session.user.email) ? session.user.email : 'local_user';
  }

  // ─── Public API ──────────────────────────────────────────────

  /**
   * Push all localStorage data to the backend which stores it in Supabase.
   * Returns { success, errors }
   */
async function backup(silent = false) {
  if (window._kfRestoring) return { success: false, errors: ['Restore in progress'] };
  const userId = _getUserId();
  const payload = {
    clients: JSON.parse(localStorage.getItem('kf_clients')  || '[]').map(x => ({
      id: x.id,
      user_id: userId,
      name: x.name,
      phone: x.phone,
      address: x.address,
      idnum: x.idNum,
      occupation: x.occupation,
      createdat: x.createdAt
    })),
    loans: JSON.parse(localStorage.getItem('kf_loans') || '[]').map(x => ({
      id: x.id,
      user_id: userId,
      clientid: x.clientId,
      principal: x.principal,
      interestrate: x.interestRate,
      interesttype: x.interestType,
      duration: x.duration || 0,
      type: x.type,
      startdate: x.startDate,
      status: x.status,
      createdat: x.createdAt
    })),
    payments: JSON.parse(localStorage.getItem('kf_payments') || '[]').map(x => ({
      id: x.id,
      user_id: userId,
      loanid: x.loanId,
      amount: x.amount,
      date: x.date,
      note: x.note,
      createdat: x.createdAt
    })),
    settings: JSON.parse(localStorage.getItem('kf_settings') || '{}')
  };
  try {
    const response = await AuthManager.fetchWithAuth(`${API_BASE}/backup`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (result.success) {
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      if (!silent) _toast('☁️ Backup saved to Supabase via backend!', 'success');
      return { success: true };
    } else {
      const errors = result.errors || ['Unknown error'];
      if (!silent) _toast(`⚠️ Backup failed — ${errors.join(', ')}`, 'warning');
      return { success: false, errors };
    }
  } catch (e) {
    if (!silent) _toast('❌ Backup failed — check connection', 'error');
    return { success: false, errors: [String(e)] };
  }
}
    
  /**
   * Pull cloud data from the backend and merge into localStorage.
   * Returns the pulled data object.
   */
async function restore() {
  window._kfRestoring = true;
  if (window._kfSyncTimer) clearTimeout(window._kfSyncTimer);
  try {
    const response = await AuthManager.fetchWithAuth(`${API_BASE}/restore`, { method: 'GET' });
    const result = await response.json();
    if (!response.ok || !result.success) {
      window._kfRestoring = false;
      _toast('❌ Restore failed: ' + (result.error || 'unknown error'), 'error');
      console.error('Restore error:', result);
      return null;
    }
    const cloudData = result.data || {};

    // Map lowercase columns (from old format) back to camelCase for the frontend, or use them directly if new format
    const rawClients = cloudData.clients || [];
    const clients = rawClients.map(x => ({
      id: x.id,
      name: x.name,
      phone: x.phone,
      address: x.address,
      idNum: x.idnum || x.idNum,
      occupation: x.occupation,
      createdAt: x.createdat || x.createdAt
    }));

    const rawLoans = cloudData.loans || [];
    const loans = rawLoans.map(x => ({
      id: x.id,
      clientId: x.clientid || x.clientId,
      principal: x.principal,
      interestRate: x.interestrate || x.interestRate,
      interestType: x.interesttype || x.interestType,
      duration: x.duration,
      type: x.type,
      startDate: x.startdate || x.startDate,
      status: x.status,
      createdAt: x.createdat || x.createdAt
    }));

    const rawPayments = cloudData.payments || [];
    const payments = rawPayments.map(x => ({
      id: x.id,
      loanId: x.loanid || x.loanId,
      amount: x.amount,
      date: x.date,
      note: x.note,
      createdAt: x.createdat || x.createdAt
    }));

    const settings = cloudData.settings || {};

    // Merge strategy: cloud records override local by id
    const merge = (localKey, cloudArr, idKey = 'id') => {
      const local = JSON.parse(localStorage.getItem(localKey) || '[]');
      const map = {};
      local.forEach(r => { map[r[idKey]] = r; });
      cloudArr.forEach(r => { map[r[idKey]] = r; }); // cloud wins
      localStorage.setItem(localKey, JSON.stringify(Object.values(map)));
    };

    merge('kf_clients', clients);
    merge('kf_loans', loans);
    merge('kf_payments', payments);

    // Settings: merge object keys (cloud wins)
    if (settings && Object.keys(settings).length > 0) {
      const localSettings = JSON.parse(localStorage.getItem('kf_settings') || '{}');
      localStorage.setItem('kf_settings', JSON.stringify({ ...localSettings, ...settings }));
    }

    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    _toast('☁️ Data restored from Supabase!', 'success');
    trackLogin();
    window._kfRestoring = false;
    return { clients, loans, payments, settings };
  } catch (e) {
    window._kfRestoring = false;
    _toast('❌ Restore failed — check connection', 'error');
    return null;
  }
}



  /**
   * Check if the backend + Supabase are reachable via health endpoint.
   */
  async function status() {
    try {
      const response = await AuthManager.fetchWithAuth(`${API_BASE}/status`, { method: 'GET' });
      const result = await response.json();
      return result;
    } catch (e) {
      return { supabase_configured: false };
    }
  }

  // ─── Tiny toast helper (works before app.js showToast is ready) ─
  function _toast(msg, type = 'info') {
    if (typeof showToast === 'function') {
      showToast(msg, type);
    } else {
      console.info('[KFSync]', msg);
    }
  }

  // ─── Last sync label helper ─────────────────────────────────
  function lastSyncLabel() {
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    if (!lastSync) return 'Never synced';
    const date = new Date(lastSync);
    return `Last sync: ${date.toLocaleString()}`;
  }

  // ─── Track login helper ─────────────────────────────────────
  function trackLogin() {
    // Placeholder for login tracking if needed
    console.log('[KFSync] User session tracked');
  }

  // ─── Expose globally ─────────────────────────────────────────
  global.KFSync = { backup, restore, status, lastSyncLabel, trackLogin };

})(window);
