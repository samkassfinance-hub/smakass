const WA_API_URL = '/api/whatsapp';

window.WhatsAppAutomation = {
  pollingInterval: null,
  
  async api(endpoint, method = 'GET', body = null) {
    // Try to get token from session storage first, then localStorage
    let token = null;
    try {
      const session = JSON.parse(localStorage.getItem('kf_session'));
      token = session?.token;
    } catch (e) {
      token = localStorage.getItem('token');
    }
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    
    try {
      const res = await fetch(`${WA_API_URL}${endpoint}`, options);
      
      // Handle authentication errors
      if (res.status === 401) {
        showToast('Authentication failed. Please login again.', 'error');
        return { success: false, error: 'Authentication required' };
      }
      
      // Get content type
      const contentType = res.headers.get('content-type');
      let data = {};
      
      // Try to parse based on content type
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          return { success: res.ok, error: `Invalid response format` };
        }
      } else if (res.ok) {
        // If successful but not JSON, return success
        return { success: true };
      } else {
        // If error and not JSON
        try {
          const text = await res.text();
          return { success: false, error: text || `HTTP ${res.status}` };
        } catch (textError) {
          return { success: false, error: `HTTP ${res.status}: ${res.statusText}` };
        }
      }
      
      return data;
    } catch (e) {
      console.error('WhatsApp API Error:', e);
      return { success: false, error: e.message || 'Network error occurred' };
    }
  },

  async loadConfig() {
    try {
      const res = await this.api('/reminders/config');
      if (res && res.success && res.config) {
        const config = res.config;
        const phoneInput = document.getElementById('wa-phone-input');
        const dueToday = document.getElementById('wa-due-today');
        const dueTomorrow = document.getElementById('wa-due-tomorrow');
        const overdue = document.getElementById('wa-overdue');
        
        if (phoneInput) phoneInput.value = config.phone_number || '';
        if (dueToday) dueToday.checked = config.due_today_enabled || false;
        if (dueTomorrow) dueTomorrow.checked = config.due_tomorrow_enabled || false;
        if (overdue) overdue.checked = config.overdue_enabled || false;
        
        this.updateUI(config.is_connected);
      } else {
        this.updateUI(false);
      }
    } catch (e) {
      console.error('Error loading config:', e);
      this.updateUI(false);
    }
  },

  async connect() {
    // Clear previous errors
    const errorDiv = document.getElementById('wa-error-msg');
    if (errorDiv) {
      errorDiv.classList.add('d-none');
    }
    
    this.updateUI('connecting');
    const res = await this.api('/setup', 'POST');
    if (res && res.success) {
      await this.showQRModal();
    } else {
      const errorMsg = res?.error || 'Failed to setup WhatsApp instance. Please check your WhatsApp API configuration.';
      showToast(errorMsg, 'error');
      this.updateUI(false);
      
      // Display error in UI
      if (errorDiv) {
        errorDiv.textContent = errorMsg;
        errorDiv.classList.remove('d-none');
      }
    }
  },

  async showQRModal() {
    const qrImage = document.getElementById('wa-qr-image');
    if (qrImage) {
      qrImage.innerHTML = '<div class="spinner-border text-primary" role="status"></div><div class="mt-2 text-muted-kf">Generating QR...</div>';
    }
    
    const modalEl = document.getElementById('waQRModal');
    if (!modalEl) return;
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
    
    // Fetch QR
    const res = await this.api('/qr');
    if (res && res.success && res.qr && qrImage) {
      qrImage.innerHTML = `<img src="${res.qr}" alt="WhatsApp QR Code" style="max-width: 250px; width: 100%; border-radius: 8px;">`;
      this.startPolling();
    } else {
      if (qrImage) qrImage.innerHTML = '<div class="text-danger">Failed to load QR code. Please try again.</div>';
    }
    
    // Handle modal close
    modalEl.addEventListener('hidden.bs.modal', () => {
      this.stopPolling();
    }, { once: true });
  },

  startPolling() {
    this.stopPolling();
    this.pollingInterval = setInterval(async () => {
      const res = await this.api('/status');
      if (res && res.success && res.connected) {
        this.stopPolling();
        const modalEl = document.getElementById('waQRModal');
        if (modalEl) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        showToast('WhatsApp connected successfully!', 'success');
        this.updateUI(true);
      }
    }, 3000); // Poll every 3 seconds
  },

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  },

  async disconnect() {
    if (!confirm('Are you sure you want to disconnect WhatsApp?')) return;
    
    const res = await this.api('/disconnect', 'POST');
    if (res && res.success) {
      showToast('WhatsApp disconnected', 'success');
      this.updateUI(false);
    } else {
      showToast('Failed to disconnect', 'error');
    }
  },

  async sendTestMessage() {
    const phone = document.getElementById('wa-phone-input').value;
    if (!phone) {
      showToast('Please enter a WhatsApp number first', 'error');
      return;
    }
    
    const btn = document.getElementById('btn-wa-test');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Sending...';
    }
    
    const res = await this.api('/test', 'POST', { phone });
    
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i>Send Test Message';
    }
    
    if (res && res.success) {
      showToast('Test message sent!', 'success');
    } else {
      showToast(res?.error || 'Failed to send test message', 'error');
    }
  },

  async saveConfig() {
    const phone = document.getElementById('wa-phone-input')?.value || '';
    const dueToday = document.getElementById('wa-due-today')?.checked ?? true;
    const dueTomorrow = document.getElementById('wa-due-tomorrow')?.checked ?? true;
    const overdue = document.getElementById('wa-overdue')?.checked ?? true;
    
    await this.api('/reminders/config', 'POST', {
      phone,
      due_today: dueToday,
      due_tomorrow: dueTomorrow,
      overdue: overdue
    });
  },

  updateUI(status) {
    const badge = document.getElementById('wa-status-badge');
    const connectBtn = document.getElementById('btn-wa-connect');
    const disconnectBtn = document.getElementById('btn-wa-disconnect');
    const testBtn = document.getElementById('btn-wa-test');
    const reminderSettings = document.getElementById('wa-reminder-settings');
    const phoneInput = document.getElementById('wa-phone-input');
    
    if (!badge) return;
    
    if (status === 'connecting') {
      badge.innerHTML = '<span class="badge bg-warning text-dark"><i class="fa-solid fa-spinner fa-spin me-1"></i> Connecting...</span>';
      connectBtn.disabled = true;
    } else if (status === true) {
      badge.innerHTML = '<span class="badge bg-success" style="animation: pulse 2s infinite;"><i class="fa-solid fa-check-circle me-1"></i> Connected</span>';
      connectBtn.classList.add('d-none');
      disconnectBtn.classList.remove('d-none');
      testBtn.classList.remove('d-none');
      reminderSettings.classList.remove('d-none');
    } else {
      badge.innerHTML = '<span class="badge bg-secondary"><i class="fa-solid fa-link-slash me-1"></i> Not Connected</span>';
      connectBtn.classList.remove('d-none');
      connectBtn.disabled = false;
      disconnectBtn.classList.add('d-none');
      testBtn.classList.add('d-none');
      reminderSettings.classList.add('d-none');
    }
  },

  initListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('#btn-wa-connect')) {
        this.connect();
      } else if (e.target.closest('#btn-wa-disconnect')) {
        this.disconnect();
      } else if (e.target.closest('#btn-wa-test')) {
        this.sendTestMessage();
      }
    });

    const configInputs = ['wa-phone-input', 'wa-due-today', 'wa-due-tomorrow', 'wa-overdue'];
    configInputs.forEach(id => {
      document.addEventListener('change', (e) => {
        if (e.target.id === id) {
          this.saveConfig().catch(err => console.error('Save config error:', err));
        }
      });
    });
    
    // Load initial config
    this.loadConfig().catch(err => {
      console.warn('Could not load initial config:', err);
      this.updateUI(false);
    });
  }
};

// Initialize listeners on load
document.addEventListener('DOMContentLoaded', () => {
  WhatsAppAutomation.initListeners();
});
