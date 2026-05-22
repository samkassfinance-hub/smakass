/**
 * KaasFlow — Supabase Cloud Sync Service (Frontend)
 * ===================================================
 * Talks to the Flask backend (/api/sync/*) which in turn
 * talks to Supabase using the secure service-role key.
 *
 * Usage (called from app.js):
 *   KFSync.backup()   → push all local data to cloud
 *   KFSync.restore()  → pull cloud data back + merge into localStorage
 *   KFSync.status()   → check if backend+Supabase are reachable
 */

(function (global) {
  'use strict';

  // ─── Supabase Connection ──────────────────────────────────────
  const SUPABASE_URL = 'https://eahyuwpejwbqzzolajzr.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhaHl1d3BlandicXp6b2xhanpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwOTIyNDQsImV4cCI6MjA5NDY2ODI0NH0.S98_O8nYZoiVj9-xq153R8VorNhehy8m46FoYIjUzvY';

  let supabaseInstance = null;
  function getSupabase() {
    if (supabaseInstance) return supabaseInstance;
    if (window.supabase) {
      supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabaseInstance;
  }

  const API_BASE = '/api/sync';
  const LAST_SYNC_KEY = 'kf_last_sync';

  // ─── Helper: Get Current User ────────────────────────────────
  function _getUserId() {
    const session = JSON.parse(localStorage.getItem('kf_session') || '{}');
    return (session.user && session.user.email) ? session.user.email : 'local_user';
  }

  // ─── Public API ──────────────────────────────────────────────

  /**
   * Push all localStorage data to Supabase via backend.
   * Returns { success, errors }
   */
  async function backup(silent = false) {
    if (window._kfRestoring) return { success: false, errors: ['Restore in progress'] };
    const db = getSupabase();
    if (!db) return { success: false, errors: ['Supabase SDK not loaded from CDN'] };

    const userId = _getUserId();
    const payload = {
      clients:  JSON.parse(localStorage.getItem('kf_clients')  || '[]').map(x => ({
        id: x.id,
        user_id: userId,
        name: x.name,
        phone: x.phone,
        address: x.address,
        idnum: x.idNum,
        occupation: x.occupation,
        createdat: x.createdAt
      })),
      loans:    JSON.parse(localStorage.getItem('kf_loans')    || '[]').map(x => ({
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
        id: x.id, user_id: userId, loanid: x.loanId, amount: x.amount, date: x.date, note: x.note, createdat: x.createdAt
      })),
      settings: JSON.parse(localStorage.getItem('kf_settings') || '{}'),
    };

    let errors = [];
    try {
      // 1. Sync structured data to explicit tables so the user can see them in the Supabase Table Editor
      if (payload.clients.length > 0) {
        const { error: err1 } = await db.from('kf_clients').upsert(payload.clients);
        if (err1) console.error('Failed to sync kf_clients to table:', err1);
      }
      if (payload.loans.length > 0) {
        const { error: err2 } = await db.from('kf_loans').upsert(payload.loans);
        if (err2) console.error('Failed to sync kf_loans to table:', err2);
      }
      
      // Note: We skip kf_payments for explicit upsert because the table might not exist, 
      // but the data is safely stored in kf_settings below.

      // 2. Store ALL data inside kf_settings (as the master JSON backup)
      const { error } = await db.from('kf_settings').upsert({ user_id: userId, data: payload });
      if (error) errors.push('Sync Error: ' + error.message);

      if (errors.length === 0) {
        localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
        if (!silent) _toast('☁️ Backup saved to Supabase!', 'success');
        return { success: true };
      } else {
        if (!silent) _toast(`⚠️ Backup partial — errors occurred`, 'warning');
        console.error('Supabase Sync Errors:', errors);
        return { success: false, errors };
      }
    } catch (e) {
      if (!silent) _toast('❌ Backup failed — check connection', 'error');
      return { success: false, errors: [String(e)] };
    }
  }

  /**
   * Pull cloud data from Supabase and merge into localStorage.
   * Cloud data WINS for any record that exists on both sides.
   * Returns the pulled data object.
   */
  async function restore() {
    window._kfRestoring = true;
    if (window._kfSyncTimer) clearTimeout(window._kfSyncTimer);
    
    const db = getSupabase();
    if (!db) { window._kfRestoring = false; return null; }
    const userId = _getUserId();

    try {
      const resSettings = await db.from('kf_settings').select('*').eq('user_id', userId).maybeSingle();

      if (resSettings.error) {
        window._kfRestoring = false;
        _toast('❌ Restore failed: Check Supabase configuration', 'error');
        console.error('Supabase Restore Error:', resSettings.error);
        return null;
      }

      const cloudData = resSettings.data ? resSettings.data.data : {};
      
      // Map lowercase columns (from old format) back to camelCase for the frontend, or use them directly if new format
      const rawClients = cloudData.clients || [];
      const clients = rawClients.map(x => ({
        id: x.id, name: x.name, phone: x.phone, address: x.address,
        idNum: x.idnum || x.idNum, occupation: x.occupation, createdAt: x.createdat || x.createdAt
      }));

      const rawLoans = cloudData.loans || [];
      const loans = rawLoans.map(x => ({
        id: x.id, clientId: x.clientid || x.clientId, principal: x.principal,
        interestRate: x.interestrate || x.interestRate, interestType: x.interesttype || x.interestType,
        duration: x.duration, type: x.type, startDate: x.startdate || x.startDate, status: x.status,
        createdAt: x.createdat || x.createdAt
      }));

      const rawPayments = cloudData.payments || [];
      const payments = rawPayments.map(x => ({
        id: x.id, loanId: x.loanid || x.loanId, amount: x.amount, date: x.date, note: x.note,
        createdAt: x.createdat || x.createdAt
      }));

      const settings = cloudData.settings || {};

      // Merge strategy: cloud records override local by id
      const merge = (localKey, cloudArr, idKey = 'id') => {
        const local = JSON.parse(localStorage.getItem(localKey) || '[]');
        const map   = {};
        local.forEach(r => { map[r[idKey]] = r; });
        cloudArr.forEach(r => { map[r[idKey]] = r; }); // cloud wins
        localStorage.setItem(localKey, JSON.stringify(Object.values(map)));
      };

      merge('kf_clients',  clients);
      merge('kf_loans',    loans);
      merge('kf_payments', payments);

      // Settings: merge object keys (cloud wins)
      if (settings && Object.keys(settings).length > 0) {
        const localSettings = JSON.parse(localStorage.getItem('kf_settings') || '{}');
        localStorage.setItem('kf_settings', JSON.stringify({ ...localSettings, ...settings }));
      }

      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      _toast('☁️ Data restored from Supabase!', 'success');

      // Track this login session automatically
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
   * Check if the backend + Supabase are reachable.
   */
  async function status() {
    const db = getSupabase();
    if (!db) return { supabase_configured: false };
    try {
      const { error } = await db.from('kf_clients').select('id').limit(1);
      return { supabase_configured: !error };
    } catch {
      return { supabase_configured: false };
    }
  }

  /**
   * Track user login in a separate Supabase table.
   * Uses sessionStorage to ensure we only count 1 login per browser session.
   */
  async function trackLogin() {
    const db = getSupabase();
    if (!db) return;
    const userId = _getUserId();
    if (userId === 'local_user') return;

    // Only track once per active browser session to prevent spam on page refresh
    if (sessionStorage.getItem('kf_login_tracked')) return;

    try {
      const { error } = await db.from('kf_login_logs').insert([{
        user_id: userId,
        user_agent: navigator.userAgent
      }]);

      if (!error) sessionStorage.setItem('kf_login_tracked', 'true');
    } catch (e) {}
  }

  /**
   * Return a formatted string of the last sync time.
   */
  function lastSyncLabel() {
    const ts = localStorage.getItem(LAST_SYNC_KEY);
    if (!ts) return 'Never synced';
    const d = new Date(ts);
    return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  }

  // ─── Auto-backup on page close ───────────────────────────────
  window.addEventListener('beforeunload', () => {
    // Auto-backup is disabled for direct Supabase integration (app.js auto-saves frequently)
  });

  // ─── Tiny toast helper (works before app.js showToast is ready) ─
  function _toast(msg, type = 'info') {
    if (typeof showToast === 'function') {
      showToast(msg, type);
    } else {
      console.info('[KFSync]', msg);
    }
  }

  // ─── Expose globally ─────────────────────────────────────────
  global.KFSync = { backup, restore, status, lastSyncLabel, trackLogin };

})(window);
