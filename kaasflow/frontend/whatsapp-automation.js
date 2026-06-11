// WhatsApp Automation Integration - Direct WhatsApp Web (no backend needed)
const WhatsAppAutomation = {
  config: {},
  connected: false,
  phoneNumber: null,

  async init() {
    console.log('🔧 Initializing WhatsApp Automation...');
    try {
      this.loadSavedConfig();
      this.setupEventListeners();
      this.updateUI();
      console.log('✅ WhatsApp Automation initialized');
    } catch (e) {
      console.error('❌ WhatsApp initialization error:', e);
    }
  },

  // Load saved config from localStorage
  loadSavedConfig() {
    try {
      const saved = localStorage.getItem('wa_automation_config');
      if (saved) {
        const config = JSON.parse(saved);
        this.connected = config.connected || false;
        this.phoneNumber = config.phoneNumber || null;
        this.config = config;
        console.log('✅ WhatsApp config loaded from localStorage:', config);
      }
    } catch (e) {
      console.warn('⚠️ Could not load WhatsApp config:', e.message);
    }
  },

  // Save config to localStorage
  saveConfig() {
    try {
      const config = {
        connected: this.connected,
        phoneNumber: this.phoneNumber,
        connectedAt: this.config.connectedAt || new Date().toISOString(),
        dueTodayEnabled: this.config.dueTodayEnabled ?? true,
        dueTomorrowEnabled: this.config.dueTomorrowEnabled ?? true,
        overdueEnabled: this.config.overdueEnabled ?? true
      };
      localStorage.setItem('wa_automation_config', JSON.stringify(config));
      this.config = config;
      console.log('✅ WhatsApp config saved');
    } catch (e) {
      console.error('❌ Error saving config:', e);
    }
  },

  setupEventListeners() {
    // Connect button
    const connectBtn = document.getElementById('btn-wa-connect');
    if (connectBtn) {
      // Remove old listeners by cloning
      const newBtn = connectBtn.cloneNode(true);
      connectBtn.parentNode.replaceChild(newBtn, connectBtn);
      newBtn.addEventListener('click', () => this.connectWhatsApp());
    }

    // Disconnect button
    const disconnectBtn = document.getElementById('btn-wa-disconnect');
    if (disconnectBtn) {
      const newBtn = disconnectBtn.cloneNode(true);
      disconnectBtn.parentNode.replaceChild(newBtn, disconnectBtn);
      newBtn.addEventListener('click', () => this.disconnect());
    }

    // Test message button
    const testBtn = document.getElementById('btn-wa-test');
    if (testBtn) {
      const newBtn = testBtn.cloneNode(true);
      testBtn.parentNode.replaceChild(newBtn, testBtn);
      newBtn.addEventListener('click', () => this.sendTest());
    }

    // Reminder toggle listeners
    const dueTodayCb = document.getElementById('wa-due-today');
    const dueTomorrowCb = document.getElementById('wa-due-tomorrow');
    const overdueCb = document.getElementById('wa-overdue');

    if (dueTodayCb) {
      dueTodayCb.checked = this.config.dueTodayEnabled ?? true;
      dueTodayCb.addEventListener('change', () => {
        this.config.dueTodayEnabled = dueTodayCb.checked;
        this.saveConfig();
      });
    }
    if (dueTomorrowCb) {
      dueTomorrowCb.checked = this.config.dueTomorrowEnabled ?? true;
      dueTomorrowCb.addEventListener('change', () => {
        this.config.dueTomorrowEnabled = dueTomorrowCb.checked;
        this.saveConfig();
      });
    }
    if (overdueCb) {
      overdueCb.checked = this.config.overdueEnabled ?? true;
      overdueCb.addEventListener('change', () => {
        this.config.overdueEnabled = overdueCb.checked;
        this.saveConfig();
      });
    }
  },

  // Format phone number for WhatsApp (add country code if missing)
  formatPhone(phone) {
    if (!phone) return '';
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    // Remove leading + if present
    if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
    // If it starts with 0, replace with 91 (India)
    if (cleaned.startsWith('0')) cleaned = '91' + cleaned.substring(1);
    // If it's 10 digits (Indian number without country code), add 91
    if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
      cleaned = '91' + cleaned;
    }
    return cleaned;
  },

  async connectWhatsApp() {
    try {
      const phoneInput = document.getElementById('wa-phone-input');
      const phone = phoneInput?.value?.trim();

      if (!phone) {
        if (typeof showToast === 'function') {
          showToast('Please enter your WhatsApp number', 'error');
        } else {
          alert('Please enter your WhatsApp number');
        }
        return;
      }

      // Validate phone number (at least 10 digits)
      const digitsOnly = phone.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        if (typeof showToast === 'function') {
          showToast('Please enter a valid phone number (at least 10 digits)', 'error');
        } else {
          alert('Please enter a valid phone number (at least 10 digits)');
        }
        return;
      }

      console.log('📱 Connecting WhatsApp for:', phone);

      // Format and save the phone number
      this.phoneNumber = this.formatPhone(phone);
      this.connected = true;
      this.config.connectedAt = new Date().toISOString();
      this.saveConfig();

      // Update UI to show connected state
      this.updateUI();

      if (typeof showToast === 'function') {
        showToast('✅ WhatsApp connected successfully! You can now send reminders.', 'success');
      } else {
        alert('WhatsApp connected successfully! You can now send reminders directly.');
      }

      console.log('✅ WhatsApp connected with number:', this.phoneNumber);

    } catch (e) {
      console.error('❌ Connect error:', e);
      if (typeof showToast === 'function') {
        showToast('Error: ' + e.message, 'error');
      } else {
        alert('Error: ' + e.message);
      }
    }
  },

  disconnect() {
    if (!confirm('Disconnect WhatsApp? You will need to reconnect later.')) {
      return;
    }

    this.connected = false;
    this.phoneNumber = null;
    localStorage.removeItem('wa_automation_config');
    this.config = {};
    this.updateUI();

    if (typeof showToast === 'function') {
      showToast('WhatsApp disconnected', 'info');
    } else {
      alert('WhatsApp disconnected');
    }
    console.log('✅ WhatsApp disconnected');
  },

  sendTest() {
    try {
      if (!this.connected || !this.phoneNumber) {
        if (typeof showToast === 'function') {
          showToast('WhatsApp is not connected. Please connect first.', 'error');
        } else {
          alert('WhatsApp is not connected');
        }
        return;
      }

      const testMessage = '✅ Hello from SamKass! Your WhatsApp automation is working perfectly. You will now receive payment reminders through WhatsApp.';

      // Open WhatsApp web link with pre-filled message
      const url = `https://wa.me/${this.phoneNumber}?text=${encodeURIComponent(testMessage)}`;
      window.open(url, '_blank');

      if (typeof showToast === 'function') {
        showToast('📱 WhatsApp opened with test message! Send it to confirm.', 'success');
      }

      console.log('✅ Test message opened for:', this.phoneNumber);
    } catch (e) {
      console.error('❌ Test error:', e);
      if (typeof showToast === 'function') {
        showToast('Error: ' + e.message, 'error');
      } else {
        alert('Error: ' + e.message);
      }
    }
  },

  updateUI() {
    const connectBtn = document.getElementById('btn-wa-connect');
    const disconnectBtn = document.getElementById('btn-wa-disconnect');
    const testBtn = document.getElementById('btn-wa-test');
    const statusBadge = document.getElementById('wa-status-badge');
    const reminderSettings = document.getElementById('wa-reminder-settings');
    const phoneInput = document.getElementById('wa-phone-input');

    if (this.connected) {
      connectBtn?.classList.add('d-none');
      disconnectBtn?.classList.remove('d-none');
      testBtn?.classList.remove('d-none');
      reminderSettings?.classList.remove('d-none');

      if (statusBadge) {
        statusBadge.innerHTML = '<span class="badge" style="background: rgba(37, 211, 102, 0.15); color: #25D366; border: 1px solid rgba(37, 211, 102, 0.3); padding: 8px 16px; border-radius: 20px; font-weight: 600;"><i class="fa-solid fa-circle-check me-1"></i> Connected</span>';
      }

      // Show saved phone number in input
      if (phoneInput && this.phoneNumber) {
        // Show the original format if possible, otherwise the stored number
        if (!phoneInput.value) {
          phoneInput.value = this.phoneNumber;
        }
      }

      console.log('✅ UI updated: WhatsApp connected');
    } else {
      connectBtn?.classList.remove('d-none');
      disconnectBtn?.classList.add('d-none');
      testBtn?.classList.add('d-none');
      reminderSettings?.classList.add('d-none');

      if (statusBadge) {
        statusBadge.innerHTML = '<span class="badge" style="background: rgba(153, 153, 153, 0.15); color: #999; border: 1px solid rgba(153, 153, 153, 0.3); padding: 8px 16px; border-radius: 20px; font-weight: 600;"><i class="fa-solid fa-circle me-1"></i> Not Connected</span>';
      }
      console.log('⭕ UI updated: WhatsApp disconnected');
    }
  },

  // Send a reminder for a specific loan - opens WhatsApp with pre-filled message
  sendReminder(loanId) {
    try {
      if (!this.connected) {
        if (typeof showToast === 'function') {
          showToast('WhatsApp is not connected. Please connect first in Settings.', 'error');
        } else {
          alert('WhatsApp is not connected. Please connect first.');
        }
        return;
      }

      // Get loan and client info from the Store
      const loan = typeof Store !== 'undefined' ? Store.loans().find(l => l.id === loanId) : null;
      if (!loan) {
        if (typeof showToast === 'function') {
          showToast('Loan not found', 'error');
        } else {
          alert('Loan not found');
        }
        return;
      }

      const client = typeof Store !== 'undefined' ? Store.clients().find(c => c.id === loan.clientId) : null;
      if (!client || !client.phone) {
        if (typeof showToast === 'function') {
          showToast('Client phone number not available', 'error');
        } else {
          alert('Client phone number not available');
        }
        return;
      }

      // Build reminder message
      const stats = typeof calcLoanStats === 'function' ? calcLoanStats(loan) : null;
      const fmtCurFn = typeof fmtCur === 'function' ? fmtCur : (n) => '₹' + Number(n).toLocaleString('en-IN');

      let message;
      if (stats && stats.isOverdue) {
        message = `Dear ${client.name},\n\nThis is a reminder that your EMI payment of ${fmtCurFn(stats.emi)} is overdue by ${stats.daysOverdue} day(s).\n\nPlease make the payment at the earliest to avoid any penalties.\n\nThank you,\nSamKass Finance`;
      } else if (stats) {
        message = `Dear ${client.name},\n\nThis is a friendly reminder that your EMI payment of ${fmtCurFn(stats.emi)} is due.\n\nPlease ensure timely payment.\n\nThank you,\nSamKass Finance`;
      } else {
        message = `Dear ${client.name},\n\nThis is a reminder about your loan payment.\n\nPlease contact us for details.\n\nThank you,\nSamKass Finance`;
      }

      // Format client phone for WhatsApp
      const clientPhone = this.formatPhone(client.phone);

      // Open WhatsApp with pre-filled message
      const url = `https://wa.me/${clientPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');

      if (typeof showToast === 'function') {
        showToast(`📱 WhatsApp opened to send reminder to ${client.name}`, 'success');
      }

      console.log('✅ Reminder opened for:', client.name, clientPhone);

    } catch (e) {
      console.error('❌ Send reminder error:', e);
      if (typeof showToast === 'function') {
        showToast('Error: ' + e.message, 'error');
      } else {
        alert('Error: ' + e.message);
      }
    }
  },

  // Load config (called from renderSettings in app.js)
  async loadConfig() {
    this.loadSavedConfig();
    this.setupEventListeners();
    this.updateUI();
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => WhatsAppAutomation.init(), 100);
  });
} else {
  setTimeout(() => WhatsAppAutomation.init(), 100);
}

// Also listen for page changes (SPA navigation)
document.addEventListener('pageChanged', () => {
  setTimeout(() => {
    if (WhatsAppAutomation) {
      WhatsAppAutomation.setupEventListeners();
      WhatsAppAutomation.updateUI();
    }
  }, 50);
});
