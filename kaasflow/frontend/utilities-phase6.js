/**
 * KaasFlow - Phase 6: Business Logic Enhancements
 * Issues 33-37: Interest validation, partial payments, late fees, reminders, multi-currency
 */

'use strict';

// ── ISSUE 33: Interest Rate Validation ──────────────────────────────────────

// Enhanced Validator for interest rates (already in app.js, but adding stricter rules)
const InterestRateValidator = {
  MIN_RATE: 0.1,
  MAX_RATE: 50,
  
  // Validate interest rate with business rules
  validate(rate, loanType = 'monthly') {
    const num = parseFloat(rate);
    
    if (isNaN(num)) {
      return { valid: false, error: 'Interest rate must be a number' };
    }
    
    if (num < this.MIN_RATE) {
      return { valid: false, error: `Interest rate must be at least ${this.MIN_RATE}%` };
    }
    
    if (num > this.MAX_RATE) {
      return { valid: false, error: `Interest rate cannot exceed ${this.MAX_RATE}%` };
    }
    
    // Warn about unusually high rates
    if (num > 36) {
      return { 
        valid: true, 
        warning: `${num}% is very high. Please verify.`,
        value: num 
      };
    }
    
    // Warn about unusually low rates
    if (num < 1) {
      return { 
        valid: true, 
        warning: `${num}% is very low. Please verify.`,
        value: num 
      };
    }
    
    return { valid: true, value: num };
  },
  
  // Show warning modal for high rates
  async confirmHighRate(rate) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content kf-card">
            <div class="modal-header bg-warning bg-opacity-10">
              <h5 class="modal-title">
                <i class="fa-solid fa-triangle-exclamation text-warning me-2"></i>
                High Interest Rate Warning
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>You entered an interest rate of <strong>${rate}%</strong></p>
              <p>This is unusually high. Please verify:</p>
              <ul>
                <li>Is this the correct annual rate?</li>
                <li>Are you confusing monthly vs annual rate?</li>
                <li>Does this comply with local lending laws?</li>
              </ul>
              <div class="alert alert-info">
                <i class="fa-solid fa-info-circle me-2"></i>
                Many jurisdictions have maximum interest rate limits (usury laws).
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-kf-outline" data-bs-dismiss="modal">Go Back</button>
              <button type="button" class="btn-kf-warning" id="btn-confirm-rate">
                Use ${rate}% Anyway
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      const bsModal = new bootstrap.Modal(modal);
      
      document.getElementById('btn-confirm-rate').addEventListener('click', () => {
        AuditLogger.log('high_interest_confirmed', `User confirmed ${rate}% interest rate`);
        bsModal.hide();
        modal.remove();
        resolve(true);
      });
      
      modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
        resolve(false);
      });
      
      bsModal.show();
    });
  }
};

// ── ISSUE 34: Partial Payment Support ───────────────────────────────────────

const PartialPaymentManager = {
  // Calculate if payment is partial
  isPartialPayment(paidAmount, emiAmount) {
    return paidAmount < emiAmount;
  },
  
  // Get payment completion percentage
  getPaymentPercentage(paidAmount, emiAmount) {
    if (emiAmount === 0) return 100;
    return Math.min(100, (paidAmount / emiAmount) * 100);
  },
  
  // Show payment status badge
  getPaymentBadge(paidAmount, emiAmount) {
    if (paidAmount >= emiAmount) {
      return '<span class="badge bg-success">Full Payment</span>';
    } else if (paidAmount > 0) {
      const percent = this.getPaymentPercentage(paidAmount, emiAmount);
      return `<span class="badge bg-warning">Partial (${percent.toFixed(0)}%)</span>`;
    } else {
      return '<span class="badge bg-danger">Unpaid</span>';
    }
  },
  
  // Calculate remaining amount for partial payment
  getRemainingAmount(loan, payments) {
    const stats = calcLoanStats(loan); // Use existing function
    const totalExpected = stats.totalPayable;
    const totalPaid = payments
      .filter(p => p.loanId === loan.id)
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    
    return Math.max(0, totalExpected - totalPaid);
  },
  
  // Show partial payment indicator in UI
  renderPartialPaymentIndicator(payment, emiAmount) {
    const paidAmount = parseFloat(payment.amount || 0);
    const isPartial = this.isPartialPayment(paidAmount, emiAmount);
    
    if (!isPartial) return '';
    
    const remaining = emiAmount - paidAmount;
    const percent = this.getPaymentPercentage(paidAmount, emiAmount);
    
    return `
      <div class="partial-payment-indicator mt-2">
        <div class="progress" style="height:5px;">
          <div class="progress-bar bg-warning" role="progressbar" 
               style="width:${percent}%" aria-valuenow="${percent}" 
               aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <small class="text-muted">
          ${fmtCur(paidAmount)} of ${fmtCur(emiAmount)} paid 
          <span class="text-danger">(${fmtCur(remaining)} remaining)</span>
        </small>
      </div>
    `;
  },
  
  // Calculate next EMI considering partial payments
  getNextEMIAmount(loan, payments) {
    const stats = calcLoanStats(loan);
    const lastPayment = payments
      .filter(p => p.loanId === loan.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    
    if (!lastPayment) return stats.emi;
    
    const lastPaidAmount = parseFloat(lastPayment.amount || 0);
    
    // If last payment was partial, remaining amount is added to next EMI
    if (this.isPartialPayment(lastPaidAmount, stats.emi)) {
      const remaining = stats.emi - lastPaidAmount;
      return stats.emi + remaining;
    }
    
    return stats.emi;
  }
};

// ── ISSUE 35: Late Fee Calculation ──────────────────────────────────────────

const LateFeeCalculator = {
  SETTINGS_KEY: 'kf_late_fee_settings',
  
  // Get late fee settings
  getSettings() {
    const saved = localStorage.getItem(this.SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    
    return {
      enabled: false,
      type: 'fixed', // 'fixed' or 'percent'
      fixedAmount: 100, // Fixed fee per day
      percentRate: 0.5, // Percentage per day
      gracePeriod: 3, // Days before late fee starts
      maxLateFee: 5000 // Maximum total late fee
    };
  },
  
  // Save settings
  saveSettings(settings) {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    AuditLogger.log('late_fee_settings', 'Updated late fee configuration');
  },
  
  // Calculate late fee for a loan
  calculateLateFee(loan, daysOverdue) {
    const settings = this.getSettings();
    
    if (!settings.enabled) return 0;
    if (daysOverdue <= settings.gracePeriod) return 0;
    
    const effectiveDays = daysOverdue - settings.gracePeriod;
    let lateFee = 0;
    
    if (settings.type === 'fixed') {
      lateFee = effectiveDays * settings.fixedAmount;
    } else if (settings.type === 'percent') {
      const emiAmount = loan.emi || 0;
      lateFee = emiAmount * (settings.percentRate / 100) * effectiveDays;
    }
    
    // Apply maximum cap
    return Math.min(lateFee, settings.maxLateFee);
  },
  
  // Show late fee settings modal
  showSettingsModal() {
    const settings = this.getSettings();
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content kf-card">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa-solid fa-money-bill-wave me-2"></i>Late Fee Settings
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="late-fee-enabled" ${settings.enabled ? 'checked' : ''}>
              <label class="form-check-label" for="late-fee-enabled">
                Enable Late Fees
              </label>
            </div>
            
            <div id="late-fee-config" style="display:${settings.enabled ? 'block' : 'none'}">
              <div class="mb-3">
                <label class="form-label">Fee Type</label>
                <select class="form-select" id="late-fee-type">
                  <option value="fixed" ${settings.type === 'fixed' ? 'selected' : ''}>Fixed Amount per Day</option>
                  <option value="percent" ${settings.type === 'percent' ? 'selected' : ''}>Percentage of EMI per Day</option>
                </select>
              </div>
              
              <div class="mb-3" id="fixed-amount-group" style="display:${settings.type === 'fixed' ? 'block' : 'none'}">
                <label class="form-label">Fixed Amount (₹ per day)</label>
                <input type="number" class="form-control" id="late-fee-fixed" value="${settings.fixedAmount}" min="0" step="10">
              </div>
              
              <div class="mb-3" id="percent-rate-group" style="display:${settings.type === 'percent' ? 'block' : 'none'}">
                <label class="form-label">Percentage Rate (% per day)</label>
                <input type="number" class="form-control" id="late-fee-percent" value="${settings.percentRate}" min="0" max="5" step="0.1">
                <small class="text-muted">Applied to EMI amount</small>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Grace Period (days)</label>
                <input type="number" class="form-control" id="late-fee-grace" value="${settings.gracePeriod}" min="0" max="30">
                <small class="text-muted">No late fee charged during grace period</small>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Maximum Late Fee (₹)</label>
                <input type="number" class="form-control" id="late-fee-max" value="${settings.maxLateFee}" min="0" step="100">
                <small class="text-muted">Cap on total late fee per loan</small>
              </div>
              
              <div class="alert alert-info">
                <i class="fa-solid fa-calculator me-2"></i>
                <strong>Example:</strong> <span id="late-fee-example">Configure settings to see example</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-kf-outline" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn-kf-primary" id="btn-save-late-fee">Save Settings</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    
    // Toggle config visibility
    document.getElementById('late-fee-enabled').addEventListener('change', (e) => {
      document.getElementById('late-fee-config').style.display = e.target.checked ? 'block' : 'none';
    });
    
    // Toggle fee type inputs
    document.getElementById('late-fee-type').addEventListener('change', (e) => {
      const isFixed = e.target.value === 'fixed';
      document.getElementById('fixed-amount-group').style.display = isFixed ? 'block' : 'none';
      document.getElementById('percent-rate-group').style.display = isFixed ? 'none' : 'block';
      updateExample();
    });
    
    // Update example calculation
    function updateExample() {
      const type = document.getElementById('late-fee-type').value;
      const fixed = parseFloat(document.getElementById('late-fee-fixed').value);
      const percent = parseFloat(document.getElementById('late-fee-percent').value);
      const grace = parseInt(document.getElementById('late-fee-grace').value);
      
      const days = 10;
      const emi = 5000;
      let fee = 0;
      
      if (type === 'fixed') {
        fee = (days - grace) * fixed;
      } else {
        fee = emi * (percent / 100) * (days - grace);
      }
      
      document.getElementById('late-fee-example').textContent = 
        `${days} days overdue on ₹${emi} EMI = ₹${Math.round(fee)} late fee`;
    }
    
    // Add listeners for example update
    ['late-fee-fixed', 'late-fee-percent', 'late-fee-grace'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', updateExample);
    });
    
    updateExample();
    
    // Save settings
    document.getElementById('btn-save-late-fee').addEventListener('click', () => {
      const newSettings = {
        enabled: document.getElementById('late-fee-enabled').checked,
        type: document.getElementById('late-fee-type').value,
        fixedAmount: parseFloat(document.getElementById('late-fee-fixed').value),
        percentRate: parseFloat(document.getElementById('late-fee-percent').value),
        gracePeriod: parseInt(document.getElementById('late-fee-grace').value),
        maxLateFee: parseFloat(document.getElementById('late-fee-max').value)
      };
      
      this.saveSettings(newSettings);
      showToast('Late fee settings saved', 'success');
      bsModal.hide();
      modal.remove();
    });
    
    bsModal.show();
  },
  
  // Add late fee to loan stats display
  addLateFeeToStats(loan, stats) {
    if (stats.daysOverdue > 0) {
      const lateFee = this.calculateLateFee(loan, stats.daysOverdue);
      if (lateFee > 0) {
        stats.lateFee = lateFee;
        stats.totalWithLateFee = stats.remaining + lateFee;
      }
    }
    return stats;
  }
};

// ── ISSUE 36: Payment Reminders Automation ──────────────────────────────────

const ReminderAutomation = {
  SETTINGS_KEY: 'kf_reminder_settings',
  
  // Get reminder settings
  getSettings() {
    const saved = localStorage.getItem(this.SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    
    return {
      enabled: false,
      timing: 'morning', // 'morning' or 'evening'
      daysBefore: 1, // Days before due date
      includeOverdue: true,
      includeUpcoming: true,
      autoSend: false // Manual only by default
    };
  },
  
  // Save settings
  saveSettings(settings) {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    AuditLogger.log('reminder_settings', 'Updated reminder configuration');
  },
  
  // Get loans that need reminders
  getLoansNeedingReminders() {
    const settings = this.getSettings();
    if (!settings.enabled) return [];
    
    const loans = Store.loans().filter(l => l.status === 'active');
    const today = new Date();
    const needReminders = [];
    
    loans.forEach(loan => {
      const stats = calcLoanStats(loan);
      
      // Overdue loans
      if (settings.includeOverdue && stats.isOverdue) {
        needReminders.push({ loan, reason: 'overdue', daysOverdue: stats.daysOverdue });
      }
      
      // Upcoming due
      if (settings.includeUpcoming && stats.nextDueDate) {
        const dueDate = new Date(stats.nextDueDate);
        const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= settings.daysBefore && daysDiff >= 0) {
          needReminders.push({ loan, reason: 'upcoming', daysUntilDue: daysDiff });
        }
      }
    });
    
    return needReminders;
  },
  
  // Show reminder settings modal
  showSettingsModal() {
    const settings = this.getSettings();
    const needReminders = this.getLoansNeedingReminders();
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content kf-card">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa-solid fa-bell me-2"></i>Payment Reminder Settings
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="reminder-enabled" ${settings.enabled ? 'checked' : ''}>
              <label class="form-check-label" for="reminder-enabled">
                Enable Payment Reminders
              </label>
            </div>
            
            <div id="reminder-config" style="display:${settings.enabled ? 'block' : 'none'}">
              <div class="mb-3">
                <label class="form-label">Send Reminders</label>
                <select class="form-select" id="reminder-timing">
                  <option value="morning" ${settings.timing === 'morning' ? 'selected' : ''}>Morning (9 AM)</option>
                  <option value="evening" ${settings.timing === 'evening' ? 'selected' : ''}>Evening (6 PM)</option>
                </select>
              </div>
              
              <div class="mb-3">
                <label class="form-label">Days Before Due Date</label>
                <input type="number" class="form-control" id="reminder-days" value="${settings.daysBefore}" min="0" max="7">
                <small class="text-muted">Send reminder this many days before payment due</small>
              </div>
              
              <div class="form-check mb-2">
                <input class="form-check-input" type="checkbox" id="reminder-overdue" ${settings.includeOverdue ? 'checked' : ''}>
                <label class="form-check-label" for="reminder-overdue">
                  Include overdue payments
                </label>
              </div>
              
              <div class="form-check mb-3">
                <input class="form-check-input" type="checkbox" id="reminder-upcoming" ${settings.includeUpcoming ? 'checked' : ''}>
                <label class="form-check-label" for="reminder-upcoming">
                  Include upcoming payments
                </label>
              </div>
              
              <div class="alert alert-warning">
                <i class="fa-solid fa-mobile-screen-button me-2"></i>
                Reminders are sent via WhatsApp. You'll need to click "Send" for each client.
              </div>
              
              <div class="alert alert-info">
                <i class="fa-solid fa-chart-simple me-2"></i>
                <strong>Currently:</strong> ${needReminders.length} loan(s) need reminders
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-kf-outline" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn-kf-warning" id="btn-send-reminders-now">
              Send ${needReminders.length} Reminders Now
            </button>
            <button type="button" class="btn-kf-primary" id="btn-save-reminders">Save Settings</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    
    // Toggle config visibility
    document.getElementById('reminder-enabled').addEventListener('change', (e) => {
      document.getElementById('reminder-config').style.display = e.target.checked ? 'block' : 'none';
    });
    
    // Send reminders now
    document.getElementById('btn-send-reminders-now').addEventListener('click', () => {
      this.sendBulkReminders(needReminders);
      bsModal.hide();
      modal.remove();
    });
    
    // Save settings
    document.getElementById('btn-save-reminders').addEventListener('click', () => {
      const newSettings = {
        enabled: document.getElementById('reminder-enabled').checked,
        timing: document.getElementById('reminder-timing').value,
        daysBefore: parseInt(document.getElementById('reminder-days').value),
        includeOverdue: document.getElementById('reminder-overdue').checked,
        includeUpcoming: document.getElementById('reminder-upcoming').checked,
        autoSend: false
      };
      
      this.saveSettings(newSettings);
      showToast('Reminder settings saved', 'success');
      bsModal.hide();
      modal.remove();
    });
    
    bsModal.show();
  },
  
  // Send bulk reminders
  sendBulkReminders(reminders) {
    let sent = 0;
    
    reminders.forEach(({ loan, reason }, idx) => {
      setTimeout(() => {
        const client = Store.clients().find(c => c.id === loan.clientId);
        if (client) {
          // Use existing sendReminder function
          if (typeof sendReminder === 'function') {
            sendReminder(loan.id);
            sent++;
          }
        }
      }, idx * 1000); // Stagger by 1 second
    });
    
    showToast(`Sending ${reminders.length} reminder(s)...`, 'info');
    AuditLogger.log('bulk_reminders', `Sent ${reminders.length} payment reminders`);
  }
};

// ── ISSUE 37: Multi-Currency Support ────────────────────────────────────────

const MultiCurrency = {
  SETTINGS_KEY: 'kf_currency_settings',
  
  // Supported currencies
  CURRENCIES: {
    INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
    EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
    GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
    AED: { symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
    SAR: { symbol: 'ر.س', name: 'Saudi Riyal', locale: 'ar-SA' }
  },
  
  // Get current currency
  getCurrency() {
    const saved = localStorage.getItem(this.SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return { code: 'INR', symbol: '₹', locale: 'en-IN' };
  },
  
  // Set currency
  setCurrency(code) {
    const currency = this.CURRENCIES[code];
    if (!currency) return false;
    
    const settings = {
      code: code,
      symbol: currency.symbol,
      locale: currency.locale,
      name: currency.name
    };
    
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    AuditLogger.log('currency_change', `Changed currency to ${code}`);
    return true;
  },
  
  // Format amount with current currency
  format(amount) {
    const currency = this.getCurrency();
    const num = parseFloat(amount || 0);
    
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  },
  
  // Show currency selector modal
  showCurrencySelector() {
    const current = this.getCurrency();
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content kf-card">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa-solid fa-coins me-2"></i>Select Currency
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted-kf">Choose your preferred currency for displaying amounts.</p>
            
            <div class="list-group">
              ${Object.entries(this.CURRENCIES).map(([code, currency]) => `
                <button type="button" class="list-group-item list-group-item-action ${current.code === code ? 'active' : ''}" 
                        data-currency="${code}">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>${currency.symbol} ${code}</strong>
                      <br>
                      <small>${currency.name}</small>
                    </div>
                    <span class="fs-4">${currency.symbol}</span>
                  </div>
                </button>
              `).join('')}
            </div>
            
            <div class="alert alert-warning mt-3">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              This only changes display format. Exchange rates are not applied.
            </div>
            
            <div class="alert alert-info">
              <i class="fa-solid fa-eye me-2"></i>
              <strong>Preview:</strong> <span id="currency-preview">10,000</span>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-kf-outline" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn-kf-primary" id="btn-save-currency">Save Currency</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    
    let selectedCode = current.code;
    
    // Handle currency selection
    modal.querySelectorAll('[data-currency]').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('[data-currency]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCode = btn.dataset.currency;
        
        // Update preview
        const tempSettings = this.CURRENCIES[selectedCode];
        const preview = new Intl.NumberFormat(tempSettings.locale, {
          style: 'currency',
          currency: selectedCode,
          minimumFractionDigits: 0
        }).format(10000);
        document.getElementById('currency-preview').textContent = preview;
      });
    });
    
    // Save currency
    document.getElementById('btn-save-currency').addEventListener('click', () => {
      this.setCurrency(selectedCode);
      showToast(`Currency changed to ${selectedCode}`, 'success');
      
      // Suggest page reload
      if (confirm('Currency changed. Reload page to see changes?')) {
        window.location.reload();
      }
      
      bsModal.hide();
      modal.remove();
    });
    
    bsModal.show();
  }
};

// ── Integration Helpers ──────────────────────────────────────────────────────

// Override global fmtCur to use MultiCurrency
if (typeof window !== 'undefined') {
  window.fmtCurOriginal = window.fmtCur;
  window.fmtCur = function(amount) {
    return MultiCurrency.format(amount);
  };
}

console.log('✅ Phase 6 Business Logic utilities loaded');

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    InterestRateValidator, 
    PartialPaymentManager, 
    LateFeeCalculator, 
    ReminderAutomation, 
    MultiCurrency 
  };
}
