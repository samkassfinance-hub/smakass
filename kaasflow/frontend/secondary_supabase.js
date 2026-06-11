/**
 * KaasFlow — Secondary Supabase Connection & Sync Service
 * =======================================================
 * Manages the optional secondary user-provided Supabase project.
 * Automatically mirrors clients, loans, and payments to it.
 */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'kf_secondary_supabase_creds';
  let secondaryClient = null;
  let connectionStatus = 'not_connected';

  // Obfuscate credentials stored in localStorage
  function encrypt(text) {
    if (!text) return '';
    try {
      return btoa(unescape(encodeURIComponent(text.split('').reverse().join(''))));
    } catch (e) {
      return btoa(text);
    }
  }

  function decrypt(encoded) {
    if (!encoded) return '';
    try {
      const decoded = decodeURIComponent(escape(atob(encoded)));
      return decoded.split('').reverse().join('');
    } catch (e) {
      try {
        return atob(encoded);
      } catch (err) {
        return '';
      }
    }
  }

  // Validate URL structure before allowing connection
  function isValidUrl(urlString) {
    try {
      const url = new URL(urlString);
      return url.protocol === 'https:' && (
        url.hostname.endsWith('.supabase.co') ||
        url.hostname.endsWith('.supabase.in') ||
        url.hostname.includes('supabase')
      );
    } catch (e) {
      return false;
    }
  }

  // Deterministic String-to-UUID helper to resolve type mismatch with Postgres uuid columns
  function stringToUUID(str) {
    if (!str) return '00000000-0000-0000-0000-000000000000';
    
    // If it's already a valid UUID, return it
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(str)) {
      return str.toLowerCase();
    }
    
    // Hash the string deterministically to generate a valid version 4 UUID shape
    let h1 = 0x811c9dc5;
    let h2 = 0xc9dc5811;
    let h3 = 0x5811c9dc;
    let h4 = 0x11c9dc58;
    
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      h1 = (h1 ^ charCode) * 16777619;
      h2 = (h2 ^ (charCode + i)) * 16777619;
      h3 = (h3 ^ (charCode * (i + 1))) * 16777619;
      h4 = (h4 ^ (charCode - i)) * 16777619;
    }
    
    const hex = (val) => (val >>> 0).toString(16).padStart(8, '0');
    const rawHex = hex(h1) + hex(h2) + hex(h3) + hex(h4);
    
    const part1 = rawHex.substring(0, 8);
    const part2 = rawHex.substring(8, 12);
    const part3 = '4' + rawHex.substring(13, 16);
    const variant = (parseInt(rawHex.substring(16, 17), 16) & 0x3 | 0x8).toString(16);
    const part4 = variant + rawHex.substring(17, 20);
    const part5 = rawHex.substring(20, 32);
    
    return `${part1}-${part2}-${part3}-${part4}-${part5}`;
  }

  // Map Client data for secondary Supabase matching table schema
  function mapClient(c) {
    return {
      id: stringToUUID(c.id),
      name: c.name || '',
      phone: c.phone || '',
      address: c.address || '',
      occupation: c.occupation || c.occ || '',
      created_at: c.createdAt || c.created_at || new Date().toISOString()
    };
  }

  // Map Loan data for secondary Supabase matching table schema
  function mapLoan(l, payments, clientName) {
    const loanPayments = payments.filter(p => p.loanId === l.id);
    const paid = loanPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const principal = Number(l.principal) || Number(l.amount) || 0;
    
    // Calculated EMI or default EMI
    let emi = Number(l.emi) || 0;
    if (!emi && typeof calcLoanStats === 'function') {
      emi = calcLoanStats(l).emi;
    }
    const remaining = Math.max(0, principal - paid);

    return {
      id: stringToUUID(l.id),
      client: clientName,
      principal: principal,
      emi: emi,
      paid: paid,
      remaining: remaining,
      status: l.status || 'active',
      created_at: l.createdAt || l.created_at || new Date().toISOString()
    };
  }

  // Map Payment data for secondary Supabase matching table schema
  function mapPayment(p, clientName) {
    return {
      id: stringToUUID(p.id),
      date: p.date || new Date().toISOString().split('T')[0],
      client: clientName,
      amount: Number(p.amount) || 0,
      mode: p.mode || 'Cash',
      note: p.note || '',
      created_at: p.createdAt || p.created_at || new Date().toISOString()
    };
  }

  // Expose the public api
  const SecondarySupabase = {
    encrypt,
    decrypt,
    isValidUrl,

    hasCredentials: function () {
      return localStorage.getItem(STORAGE_KEY) !== null;
    },

    getCredentials: function () {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      try {
        const creds = JSON.parse(decrypt(raw));
        return {
          url: decrypt(creds.u),
          anonKey: decrypt(creds.k)
        };
      } catch (e) {
        return null;
      }
    },

    saveCredentials: function (url, anonKey) {
      const creds = {
        u: encrypt(url),
        k: encrypt(anonKey)
      };
      localStorage.setItem(STORAGE_KEY, encrypt(JSON.stringify(creds)));
    },

    clearCredentials: function () {
      localStorage.removeItem(STORAGE_KEY);
      secondaryClient = null;
      connectionStatus = 'not_connected';
    },

    getClient: function () {
      if (secondaryClient) return secondaryClient;
      const creds = this.getCredentials();
      if (creds && window.supabase) {
        try {
          secondaryClient = window.supabase.createClient(creds.url, creds.anonKey, {
            auth: { persistSession: false, autoRefreshToken: false }
          });
          connectionStatus = 'connected';
        } catch (e) {
          console.error('[SecondarySupabase] Failed to init client:', e);
          connectionStatus = 'invalid';
        }
      }
      return secondaryClient;
    },

    getStatus: function () {
      if (!this.hasCredentials()) return 'not_connected';
      return connectionStatus;
    },

    setStatus: function (status) {
      connectionStatus = status;
    },

    // Test a temporary client
    testConnection: async function (url, anonKey) {
      if (!isValidUrl(url)) {
        return { success: false, error: 'Invalid Project URL structure' };
      }
      if (!anonKey || anonKey.length < 20) {
        return { success: false, error: 'Invalid Anon Key structure' };
      }
      if (!window.supabase) {
        return { success: false, error: 'Supabase SDK not loaded' };
      }

      try {
        const client = window.supabase.createClient(url, anonKey, {
          auth: { persistSession: false, autoRefreshToken: false }
        });
        
        // Attempt a read on the clients table.
        // PostgREST return code checking handles auth errors correctly.
        const { error } = await client.from('clients').select('id').limit(1);
        if (error) {
          // If relation does not exist, the connection works, but the table schema is missing.
          if (error.message.includes('does not exist') || error.message.includes('relation')) {
            return { success: true, warning: 'Schema missing' };
          }
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    },

    // Check if required tables exist
    checkTables: async function () {
      const client = this.getClient();
      if (!client) return { clients: false, loans: false, payments: false };
      
      const tables = ['clients', 'loans', 'payments'];
      const results = {};
      for (const t of tables) {
        try {
          const { error } = await client.from(t).select('id').limit(1);
          results[t] = !error || !error.message.includes('does not exist');
        } catch (e) {
          results[t] = false;
        }
      }
      return results;
    },

    // Sync a single client
    syncClient: async function (client) {
      const db = this.getClient();
      if (!db) return;
      try {
        const row = mapClient(client);
        const { error } = await db.from('clients').upsert(row);
        if (error) console.error('[SecondarySupabase] Client sync error:', error);
      } catch (e) {
        console.error('[SecondarySupabase] Client sync exception:', e);
      }
    },

    // Sync a single loan
    syncLoan: async function (loan, allPayments, clientName) {
      const db = this.getClient();
      if (!db) return;
      try {
        const row = mapLoan(loan, allPayments, clientName);
        const { error } = await db.from('loans').upsert(row);
        if (error) console.error('[SecondarySupabase] Loan sync error:', error);
      } catch (e) {
        console.error('[SecondarySupabase] Loan sync exception:', e);
      }
    },

    // Sync a single payment
    syncPayment: async function (payment, clientName) {
      const db = this.getClient();
      if (!db) return;
      try {
        const row = mapPayment(payment, clientName);
        const { error } = await db.from('payments').upsert(row);
        if (error) console.error('[SecondarySupabase] Payment sync error:', error);
      } catch (e) {
        console.error('[SecondarySupabase] Payment sync exception:', e);
      }
    },

    // Bulk sync all data
    syncAll: async function (clients, loans, payments) {
      const db = this.getClient();
      if (!db) return { success: false, error: 'Not connected' };

      this.setStatus('syncing');
      try {
        // 1. Sync Clients
        if (clients.length > 0) {
          const rows = clients.map(mapClient);
          const { error } = await db.from('clients').upsert(rows);
          if (error) throw error;
        }

        // Build client map
        const clientMap = {};
        clients.forEach(c => { clientMap[c.id] = c.name; });

        // 2. Sync Loans
        if (loans.length > 0) {
          const rows = loans.map(l => mapLoan(l, payments, clientMap[l.clientId] || 'Unknown'));
          const { error } = await db.from('loans').upsert(rows);
          if (error) throw error;
        }

        // 3. Sync Payments
        if (payments.length > 0) {
          const loanMap = {};
          loans.forEach(l => { loanMap[l.id] = l.clientId; });
          const rows = payments.map(p => {
            const clientId = loanMap[p.loanId] || '';
            const clientName = clientMap[clientId] || 'Unknown';
            return mapPayment(p, clientName);
          });
          const { error } = await db.from('payments').upsert(rows);
          if (error) throw error;
        }

        this.setStatus('connected');
        return { success: true };
      } catch (e) {
        console.error('[SecondarySupabase] Bulk sync failed:', e);
        this.setStatus('failed');
        return { success: false, error: String(e) };
      }
    }
  };

  // Initialize client if credentials exist
  if (SecondarySupabase.hasCredentials()) {
    SecondarySupabase.getClient();
  }

  // Expose to window
  global.SecondarySupabase = SecondarySupabase;

})(window);
