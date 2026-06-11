// WhatsApp Automation Integration
const WhatsAppAutomation = {
  config: {},
  connected: false,
  instanceName: null,
  
  async init() {
    console.log('🔧 Initializing WhatsApp Automation...');
    try {
      await this.loadConfig();
      this.setupEventListeners();
      console.log('✅ WhatsApp Automation initialized');
    } catch (e) {
      console.error('❌ WhatsApp initialization error:', e);
    }
  },

  getApiBase() {
    return (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://127.0.0.1:5000/api'
      : window.location.origin + '/api';
  },

  getAuthHeaders() {
    const token = localStorage.getItem('sessionToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  },

  async loadConfig() {
    try {
      const apiBase = this.getApiBase();
      const res = await fetch(`${apiBase}/whatsapp/reminders/config`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(5000)
      });

      if (!res.ok) {
        console.warn('⚠️ Failed to load WhatsApp config:', res.statusText);
        return;
      }

      const data = await res.json();
      if (data.success && data.config) {
        this.config = data.config;
        this.connected = data.config.is_connected || false;
        this.instanceName = data.config.instance_name;
        this.updateUI();
        console.log('✅ WhatsApp config loaded:', this.config);
      }
    } catch (e) {
      console.warn('⚠️ Could not load WhatsApp config:', e.message);
    }
  },

  setupEventListeners() {
    // Connect button
    const connectBtn = document.getElementById('btn-wa-connect');
    if (connectBtn) {
      connectBtn.addEventListener('click', () => this.setupWhatsApp());
    }

    // Disconnect button
    const disconnectBtn = document.getElementById('btn-wa-disconnect');
    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => this.disconnect());
    }

    // Test message button
    const testBtn = document.getElementById('btn-wa-test');
    if (testBtn) {
      testBtn.addEventListener('click', () => this.sendTest());
    }

    // Reminder checkboxes
    const checkboxes = document.querySelectorAll('[data-reminder-type]');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => this.updateReminders());
    });
  },

  async setupWhatsApp() {
    try {
      const phoneInput = document.getElementById('wa-phone-input');
      const phone = phoneInput?.value?.trim();

      if (!phone) {
        alert('Please enter your WhatsApp number');
        return;
      }

      console.log('📱 Setting up WhatsApp instance...');
      const apiBase = this.getApiBase();
      
      const res = await fetch(`${apiBase}/whatsapp/setup`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ phone })
      });

      const data = await res.json();
      if (data.success) {
        console.log('✅ WhatsApp instance created:', data.instance_name);
        this.instanceName = data.instance_name;
        
        // Show QR code
        await this.showQRCode();
        
        // Check connection status periodically
        this.checkConnectionStatus();
      } else {
        alert('Failed to setup WhatsApp: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      console.error('❌ Setup error:', e);
      alert('Error: ' + e.message);
    }
  },

  async showQRCode() {
    try {
      const apiBase = this.getApiBase();
      const res = await fetch(`${apiBase}/whatsapp/qr`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(5000)
      });

      const data = await res.json();
      if (data.success && data.qr) {
        // Create modal with QR code
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
          <div class="modal-content" style="max-width: 400px;">
            <h3>Scan QR Code to Connect WhatsApp</h3>
            <img src="data:image/png;base64,${data.qr}" style="width: 100%; margin: 20px 0;" />
            <p style="text-align: center; color: #666;">Use your phone camera or WhatsApp app to scan this code</p>
            <button class="btn-kf-primary w-100" onclick="this.parentElement.parentElement.remove()">Close</button>
          </div>
        `;
        document.body.appendChild(modal);
        console.log('📱 QR code displayed');
      }
    } catch (e) {
      console.error('Error getting QR code:', e);
    }
  },

  async checkConnectionStatus(attempts = 0) {
    try {
      const apiBase = this.getApiBase();
      const res = await fetch(`${apiBase}/whatsapp/status`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        signal: AbortSignal.timeout(5000)
      });

      const data = await res.json();
      if (data.success) {
        this.connected = data.connected;
        
        if (this.connected) {
          console.log('✅ WhatsApp connected!');
          this.updateUI();
          
          // Save config with phone number
          const phoneInput = document.getElementById('wa-phone-input');
          const phone = phoneInput?.value?.trim();
          if (phone) {
            await this.updateReminders();
          }
        } else if (attempts < 12) {
          // Check again after 5 seconds (max 1 minute)
          setTimeout(() => this.checkConnectionStatus(attempts + 1), 5000);
          console.log(`⏳ Checking connection... (${attempts + 1})`);
        }
      }
    } catch (e) {
      console.warn('⚠️ Connection check failed:', e.message);
      if (attempts < 3) {
        setTimeout(() => this.checkConnectionStatus(attempts + 1), 5000);
      }
    }
  },

  async disconnect() {
    if (!confirm('Disconnect WhatsApp? You will need to reconnect later.')) {
      return;
    }

    try {
      const apiBase = this.getApiBase();
      const res = await fetch(`${apiBase}/whatsapp/disconnect`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      const data = await res.json();
      if (data.success) {
        this.connected = false;
        this.updateUI();
        console.log('✅ WhatsApp disconnected');
        alert('WhatsApp disconnected');
      }
    } catch (e) {
      console.error('❌ Disconnect error:', e);
      alert('Error: ' + e.message);
    }
  },

  async sendTest() {
    try {
      if (!this.connected) {
        alert('WhatsApp is not connected');
        return;
      }

      const phoneInput = document.getElementById('wa-phone-input');
      const phone = phoneInput?.value?.trim();

      if (!phone) {
        alert('Please enter a phone number');
        return;
      }

      console.log('📨 Sending test message to:', phone);
      const apiBase = this.getApiBase();
      
      const res = await fetch(`${apiBase}/whatsapp/test`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ phone })
      });

      const data = await res.json();
      if (data.success) {
        console.log('✅ Test message sent');
        alert('Test message sent successfully!');
      } else {
        alert('Failed to send test message: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      console.error('❌ Test error:', e);
      alert('Error: ' + e.message);
    }
  },

  async updateReminders() {
    try {
      const dueToday = document.getElementById('reminder-due-today')?.checked ?? true;
      const dueTomorrow = document.getElementById('reminder-due-tomorrow')?.checked ?? true;
      const overdue = document.getElementById('reminder-overdue')?.checked ?? true;
      const phoneInput = document.getElementById('wa-phone-input');
      const phone = phoneInput?.value?.trim();

      if (!phone) {
        console.warn('⚠️ Phone number not set');
        return;
      }

      const apiBase = this.getApiBase();
      const res = await fetch(`${apiBase}/whatsapp/reminders/config`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          due_today: dueToday,
          due_tomorrow: dueTomorrow,
          overdue: overdue,
          phone: phone
        })
      });

      const data = await res.json();
      if (data.success) {
        console.log('✅ Reminder settings updated');
      }
    } catch (e) {
      console.error('❌ Update error:', e);
    }
  },

  updateUI() {
    const connectBtn = document.getElementById('btn-wa-connect');
    const disconnectBtn = document.getElementById('btn-wa-disconnect');
    const testBtn = document.getElementById('btn-wa-test');
    const statusDiv = document.getElementById('wa-status');
    
    if (this.connected) {
      connectBtn?.classList.add('d-none');
      disconnectBtn?.classList.remove('d-none');
      testBtn?.classList.remove('d-none');
      
      if (statusDiv) {
        statusDiv.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #25D366;"></i> Connected';
      }
      console.log('✅ UI updated: WhatsApp connected');
    } else {
      connectBtn?.classList.remove('d-none');
      disconnectBtn?.classList.add('d-none');
      testBtn?.classList.add('d-none');
      
      if (statusDiv) {
        statusDiv.innerHTML = '<i class="fa-solid fa-circle" style="color: #999;"></i> Not Connected';
      }
      console.log('⭕ UI updated: WhatsApp disconnected');
    }
  },

  async sendReminder(loanId) {
    try {
      if (!this.connected) {
        alert('WhatsApp is not connected. Please connect first.');
        return;
      }

      const loan = Store.loans().find(l => l.id === loanId);
      if (!loan) {
        alert('Loan not found');
        return;
      }

      const client = Store.clients().find(c => c.id === loan.clientId);
      if (!client || !client.phone) {
        alert('Client phone number not available');
        return;
      }

      const apiBase = this.getApiBase();
      const res = await fetch(`${apiBase}/whatsapp/test`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ phone: client.phone })
      });

      const data = await res.json();
      if (data.success) {
        console.log('✅ Reminder sent to:', client.phone);
        alert(`Reminder sent to ${client.name}`);
      } else {
        alert('Failed to send reminder: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      console.error('❌ Send reminder error:', e);
      alert('Error: ' + e.message);
    }
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => WhatsAppAutomation.init());
} else {
  WhatsAppAutomation.init();
}
