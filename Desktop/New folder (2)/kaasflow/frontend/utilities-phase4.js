/**
 * KaasFlow - Phase 4: UX/Performance Enhancements
 * Issues 19-28: Import validation, multi-language, shortcuts, dark mode, photos, calculators
 */

'use strict';

// ── ISSUE 19: Data Import Validation ────────────────────────────────────────

const ImportValidator = {
  // Validate imported JSON structure
  validateImportData(data) {
    const errors = [];
    const warnings = [];
    
    if (!data) {
      errors.push('No data found in file');
      return { valid: false, errors, warnings, data: null };
    }
    
    // Check data types
    if (data.clients && !Array.isArray(data.clients)) {
      errors.push('Clients must be an array');
    }
    
    if (data.loans && !Array.isArray(data.loans)) {
      errors.push('Loans must be an array');
    }
    
    if (data.payments && !Array.isArray(data.payments)) {
      errors.push('Payments must be an array');
    }
    
    // Validate clients
    if (data.clients) {
      data.clients.forEach((client, idx) => {
        if (!client.id) warnings.push(`Client ${idx + 1}: Missing ID`);
        if (!client.name) errors.push(`Client ${idx + 1}: Missing name`);
        if (client.phone && !Validator.phone(client.phone).valid) {
          warnings.push(`Client ${idx + 1}: Invalid phone format`);
        }
        if (client.email && !Validator.email(client.email).valid) {
          warnings.push(`Client ${idx + 1}: Invalid email format`);
        }
      });
    }
    
    // Validate loans
    if (data.loans) {
      data.loans.forEach((loan, idx) => {
        if (!loan.id) warnings.push(`Loan ${idx + 1}: Missing ID`);
        if (!loan.clientId) errors.push(`Loan ${idx + 1}: Missing client reference`);
        if (!loan.principal) errors.push(`Loan ${idx + 1}: Missing principal amount`);
        if (loan.interest && !Validator.interestRate(loan.interest).valid) {
          warnings.push(`Loan ${idx + 1}: Invalid interest rate`);
        }
      });
    }
    
    // Validate payments
    if (data.payments) {
      data.payments.forEach((payment, idx) => {
        if (!payment.id) warnings.push(`Payment ${idx + 1}: Missing ID`);
        if (!payment.amount) errors.push(`Payment ${idx + 1}: Missing amount`);
        if (!payment.date) warnings.push(`Payment ${idx + 1}: Missing date`);
      });
    }
    
    // Check for orphaned data
    if (data.loans && data.clients) {
      const clientIds = new Set(data.clients.map(c => c.id));
      data.loans.forEach((loan, idx) => {
        if (loan.clientId && !clientIds.has(loan.clientId)) {
          warnings.push(`Loan ${idx + 1}: References non-existent client`);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data: {
        clients: data.clients || [],
        loans: data.loans || [],
        payments: data.payments || [],
        settings: data.settings || {}
      },
      summary: {
        totalClients: (data.clients || []).length,
        totalLoans: (data.loans || []).length,
        totalPayments: (data.payments || []).length
      }
    };
  },
  
  // Show import preview modal
  showImportPreview(validationResult) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      
      const hasErrors = validationResult.errors.length > 0;
      const hasWarnings = validationResult.warnings.length > 0;
      
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content kf-card">
            <div class="modal-header ${hasErrors ? 'bg-danger bg-opacity-10' : 'bg-success bg-opacity-10'}">
              <h5 class="modal-title">
                <i class="fa-solid ${hasErrors ? 'fa-triangle-exclamation text-danger' : 'fa-check-circle text-success'} me-2"></i>
                ${hasErrors ? 'Import Errors Found' : 'Import Preview'}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="alert ${hasErrors ? 'alert-danger' : 'alert-success'} mb-3">
                <strong>Summary:</strong> 
                ${validationResult.summary.totalClients} clients, 
                ${validationResult.summary.totalLoans} loans, 
                ${validationResult.summary.totalPayments} payments
              </div>
              
              ${hasErrors ? `
                <div class="mb-3">
                  <h6 class="text-danger"><i class="fa-solid fa-xmark me-2"></i>Errors (${validationResult.errors.length})</h6>
                  <ul class="small text-danger">
                    ${validationResult.errors.slice(0, 10).map(e => `<li>${e}</li>`).join('')}
                    ${validationResult.errors.length > 10 ? `<li>...and ${validationResult.errors.length - 10} more</li>` : ''}
                  </ul>
                </div>
              ` : ''}
              
              ${hasWarnings ? `
                <div class="mb-3">
                  <h6 class="text-warning"><i class="fa-solid fa-exclamation-triangle me-2"></i>Warnings (${validationResult.warnings.length})</h6>
                  <ul class="small text-muted">
                    ${validationResult.warnings.slice(0, 10).map(w => `<li>${w}</li>`).join('')}
                    ${validationResult.warnings.length > 10 ? `<li>...and ${validationResult.warnings.length - 10} more</li>` : ''}
                  </ul>
                </div>
              ` : ''}
              
              ${!hasErrors && !hasWarnings ? `
                <div class="alert alert-success">
                  <i class="fa-solid fa-check me-2"></i>
                  Data looks good! No issues found.
                </div>
              ` : ''}
              
              <div class="form-check mt-3">
                <input type="checkbox" class="form-check-input" id="import-confirm-merge">
                <label class="form-check-label" for="import-confirm-merge">
                  Merge with existing data (will add new items, skip duplicates)
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-kf-outline" data-bs-dismiss="modal">Cancel</button>
              ${!hasErrors ? `
                <button type="button" class="btn-kf-primary" id="btn-import-confirm">
                  Import ${validationResult.summary.totalClients + validationResult.summary.totalLoans + validationResult.summary.totalPayments} Items
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      const bsModal = new bootstrap.Modal(modal);
      
      if (!hasErrors) {
        document.getElementById('btn-import-confirm').addEventListener('click', () => {
          const mergeMode = document.getElementById('import-confirm-merge').checked;
          bsModal.hide();
          modal.remove();
          resolve({ confirmed: true, mergeMode, data: validationResult.data });
        });
      }
      
      modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
        resolve({ confirmed: false });
      });
      
      bsModal.show();
    });
  },
  
  // Actually import the validated data
  async performImport(data, mergeMode = false) {
    if (mergeMode) {
      // Merge: Add new items, skip duplicates
      const existingClients = Store.clients();
      const existingLoans = Store.loans();
      const existingPayments = Store.payments();
      
      // Add missing clients
      data.clients.forEach(client => {
        if (!existingClients.find(c => c.id === client.id)) {
          existingClients.push(client);
        }
      });
      
      // Add missing loans
      data.loans.forEach(loan => {
        if (!existingLoans.find(l => l.id === loan.id)) {
          existingLoans.push(loan);
        }
      });
      
      // Add missing payments
      data.payments.forEach(payment => {
        if (!existingPayments.find(p => p.id === payment.id)) {
          existingPayments.push(payment);
        }
      });
      
      Store.saveClients(existingClients);
      Store.saveLoans(existingLoans);
      Store.savePayments(existingPayments);
    } else {
      // Replace mode
      Store.saveClients(data.clients);
      Store.saveLoans(data.loans);
      Store.savePayments(data.payments);
    }
    
    // Import settings if present
    if (data.settings) {
      const settings = Store.settings();
      Object.assign(settings, data.settings);
      Store.saveSettings(settings);
    }
    
    // Create auto-backup after import
    BackupManager.createBackup('Import backup');
  }
};

// ── ISSUE 20: Multi-Language Exports ─────────────────────────────────────

const MultiLangExporter = {
  // Get translated content for PDF
  t(key) {
    // Use existing translation function or fallback
    if (typeof t === 'function') {
      return t(key);
    }
    return key;
  },
  
  // Generate client PDF with translations
  generateClientPDF(client, loans, payments) {
    const doc = {
      title: this.t('clientProfile'),
      fields: {
        name: this.t('name') || 'Name',
        phone: this.t('phone') || 'Phone',
        address: this.t('address') || 'Address',
        businessName: this.t('businessName') || 'Business',
        totalLoans: this.t('totalLoans') || 'Total Loans',
        totalPaid: this.t('totalPaid') || 'Total Paid',
        pending: this.t('pending') || 'Pending'
      }
    };
    
    return doc;
  },
  
  // Generate loan PDF with translations
  generateLoanPDF(loan, client) {
    return {
      title: this.t('loanDetails') || 'Loan Details',
      fields: {
        principal: this.t('principal') || 'Principal',
        interest: this.t('interest') || 'Interest Rate',
        emi: this.t('emi') || 'EMI',
        duration: this.t('duration') || 'Duration',
        startDate: this.t('startDate') || 'Start Date',
        status: this.t('status') || 'Status'
      }
    };
  }
};

// ── ISSUE 21: Keyboard Shortcuts ─────────────────────────────────────────

const KeyboardShortcuts = {
  _handlers: {},
  _enabled: true,
  
  init() {
    document.addEventListener('keydown', (e) => this._handleKeydown(e));
  },
  
  _handleKeydown(e) {
    if (!this._enabled) return;
    
    // Ignore if typing in input
    if (e.target.matches('input, textarea, [contenteditable="true"]')) {
      return;
    }
    
    // Ctrl/Cmd + key combinations
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      
      switch (key) {
        case 'n':
          e.preventDefault();
          this._trigger('newClient');
          break;
        case 'l':
          e.preventDefault();
          this._trigger('newLoan');
          break;
        case 's':
          e.preventDefault();
          this._trigger('save');
          break;
        case 'b':
          e.preventDefault();
          this._trigger('backup');
          break;
        case 'f':
          e.preventDefault();
          this._trigger('search');
          break;
      }
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
      const openModal = document.querySelector('.modal.show');
      if (openModal) {
        bootstrap.Modal.getInstance(openModal)?.hide();
      }
    }
    
    // Arrow keys for navigation
    if (e.key === 'ArrowLeft' && e.altKey) {
      this._trigger('prevPage');
    }
    if (e.key === 'ArrowRight' && e.altKey) {
      this._trigger('nextPage');
    }
  },
  
  on(shortcut, callback) {
    this._handlers[shortcut] = callback;
  },
  
  _trigger(shortcut) {
    const handler = this._handlers[shortcut];
    if (handler) {
      handler();
      showToast(`${shortcut} triggered`, 'info');
    }
  },
  
  disable() {
    this._enabled = false;
  },
  
  enable() {
    this._enabled = true;
  },
  
  // Default shortcuts setup
  setupDefaults() {
    this.on('newClient', () => {
      if ($('.modal.show')) return;
      openClientModal();
    });
    
    this.on('newLoan', () => {
      const clients = Store.clients();
      if (clients.length === 0) {
        showToast('Add a client first', 'warning');
        return;
      }
      if ($('.modal.show')) return;
      openLoanModal(clients[0].id);
    });
    
    this.on('backup', () => {
      BackupManager.createBackup('Keyboard shortcut backup');
    });
    
    this.on('search', () => {
      const searchInput = $('#client-search, #loan-search, #payment-search');
      if (searchInput) searchInput.focus();
    });
    
    this.init();
  }
};

// ── ISSUE 23: Client Photo Upload ─────────────────────────────────────────

const PhotoUploader = {
  MAX_SIZE: 500 * 1024, // 500KB
  QUALITY: 0.7, // JPEG quality
  
  // Compress image using Canvas
  async compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Calculate new dimensions (max 300x300)
          let { width, height } = img;
          const maxDim = 300;
          
          if (width > height && width > maxDim) {
            height = (height / width) * maxDim;
            width = maxDim;
          } else if (height > maxDim) {
            width = (width / height) * maxDim;
            height = maxDim;
          }
          
          // Compress using canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG
          const compressed = canvas.toDataURL('image/jpeg', this.QUALITY);
          
          // Check size
          const size = Math.round((compressed.length * 3) / 4);
          if (size > this.MAX_SIZE) {
            reject(new Error('Image too large even after compression'));
            return;
          }
          
          resolve(compressed);
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
  
  // Handle file input change
  async handleFileSelect(input, callback) {
    const file = input.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }
    
    // Validate file size (2MB max original)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image too large. Max 2MB allowed', 'error');
      return;
    }
    
    LoadingUI.show('Processing image...');
    
    try {
      const compressed = await this.compressImage(file);
      showToast('Photo added!', 'success');
      callback(compressed);
    } catch (error) {
      showToast('Failed to process image: ' + error.message, 'error');
    } finally {
      LoadingUI.hide();
    }
  },
  
  // Show photo picker modal
  showPhotoPicker(currentPhoto, onSelect) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content kf-card">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa-solid fa-camera me-2"></i>Add Photo
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center">
            ${currentPhoto ? `
              <div class="mb-3">
                <img src="${currentPhoto}" class="rounded-circle" style="width:120px;height:120px;object-fit:cover;">
              </div>
              <button class="btn-kf-outline btn-sm mb-3" id="btn-remove-photo">
                <i class="fa-solid fa-trash me-1"></i>Remove Photo
              </button>
            ` : ''}
            
            <div class="border rounded p-4" style="border-style:dashed !important;">
              <i class="fa-solid fa-cloud-arrow-up text-muted" style="font-size:2rem;"></i>
              <p class="text-muted-kf mt-2">Click to upload or drag and drop</p>
              <input type="file" id="photo-upload-input" accept="image/*" style="display:none;">
              <button class="btn-kf-primary" onclick="document.getElementById('photo-upload-input').click()">
                Choose Photo
              </button>
              <p class="text-muted-kf fs-xs mt-2">Max 2MB, will be compressed</p>
            </div>
            
            <div id="photo-preview" class="mt-3" style="display:none;">
              <img id="photo-preview-img" class="rounded-circle" style="width:100px;height:100px;object-fit:cover;">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-kf-outline" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn-kf-primary" id="btn-save-photo" disabled>Save Photo</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    
    let selectedPhoto = currentPhoto;
    
    // Handle remove
    modal.querySelector('#btn-remove-photo')?.addEventListener('click', () => {
      selectedPhoto = null;
      document.getElementById('btn-save-photo').disabled = true;
      document.getElementById('photo-preview').style.display = 'none';
    });
    
    // Handle file input
    const fileInput = document.getElementById('photo-upload-input');
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        LoadingUI.show('Processing...');
        selectedPhoto = await this.compressImage(file);
        
        document.getElementById('photo-preview-img').src = selectedPhoto;
        document.getElementById('photo-preview').style.display = 'block';
        document.getElementById('btn-save-photo').disabled = false;
      } catch (error) {
        showToast(error.message, 'error');
      } finally {
        LoadingUI.hide();
      }
    });
    
    // Handle save
    document.getElementById('btn-save-photo').addEventListener('click', () => {
      onSelect(selectedPhoto);
      bsModal.hide();
      modal.remove();
    });
    
    bsModal.show();
  }
};

// ── ISSUE 24: Loan Calculator Enhancement ─────────────────────────────────

const LoanCalculator = {
  // Calculate amortization schedule
  calculateAmortization(principal, annualRate, months, emiType = 'monthly') {
    const results = [];
    let balance = principal;
    const monthlyRate = annualRate / 12 / 100;
    
    // Simple interest calculation
    const interestPerMonth = principal * monthlyRate;
    const totalPayment = parseFloat(principal) + (interestPerMonth * months);
    const emi = totalPayment / months;
    
    for (let i = 1; i <= months; i++) {
      const interest = balance * monthlyRate;
      const principalPaid = emi - interest;
      balance = Math.max(0, balance - principalPaid);
      
      results.push({
        month: i,
        emi: emi,
        interest: interest,
        principal: principalPaid,
        balance: balance
      });
    }
    
    return {
      emi: emi,
      totalInterest: interestPerMonth * months,
      totalPayment: totalPayment,
      schedule: results
    };
  },
  
  // Show amortization modal
  showAmortizationSchedule(loan) {
    const calc = this.calculateAmortization(
      loan.principal,
      loan.interest,
      loan.duration
    );
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content kf-card">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa-solid fa-calculator me-2"></i>Amortization Schedule
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-4">
                <div class="p-2 rounded" style="background:var(--color-bg-secondary)">
                  <small class="text-muted">Monthly EMI</small>
                  <div class="fw-bold">${fmtCur(calc.emi)}</div>
                </div>
              </div>
              <div class="col-4">
                <div class="p-2 rounded" style="background:var(--color-bg-secondary)">
                  <small class="text-muted">Total Interest</small>
                  <div class="fw-bold">${fmtCur(calc.totalInterest)}</div>
                </div>
              </div>
              <div class="col-4">
                <div class="p-2 rounded" style="background:var(--color-bg-secondary)">
                  <small class="text-muted">Total Payment</small>
                  <div class="fw-bold">${fmtCur(calc.totalPayment)}</div>
                </div>
              </div>
            </div>
            
            <div class="table-responsive" style="max-height:300px;overflow:auto;">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>EMI</th>
                    <th>Interest</th>
                    <th>Principal</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  ${calc.schedule.slice(0, 24).map(row => `
                    <tr>
                      <td>${row.month}</td>
                      <td>${fmtCur(row.emi)}</td>
                      <td>${fmtCur(row.interest)}</td>
                      <td>${fmtCur(row.principal)}</td>
                      <td>${fmtCur(row.balance)}</td>
                    </tr>
                  `).join('')}
                  ${calc.schedule.length > 24 ? `
                    <tr><td colspan="5" class="text-center text-muted">... ${calc.schedule.length - 24} more months</td></tr>
                  ` : ''}
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-kf-outline" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    new bootstrap.Modal(modal).show();
  },
  
  // Quick calculator for loan preview
  quickCalculate(principal, rate, duration) {
    const calc = this.calculateAmortization(principal, rate, duration);
    return {
      emi: calc.emi,
      totalInterest: calc.totalInterest,
      totalPayment: calc.totalPayment
    };
  }
};

// ── ISSUE 25: UX Improvements (Pull-to-refresh, Transitions) ───────────────

const UXEnhancements = {
  // Add pull-to-refresh to container
  enablePullToRefresh(containerEl, onRefresh) {
    let startY = 0;
    let currentY = 0;
    let pulling = false;
    
    containerEl.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      pulling = false;
    }, { passive: true });
    
    containerEl.addEventListener('touchmove', (e) => {
      currentY = e.touches[0].clientY;
      
      // Only trigger when pulling down at top
      if (currentY > startY + 50 && containerEl.scrollTop === 0) {
        pulling = true;
        containerEl.style.transform = `translateY(${Math.min(currentY - startY - 50, 80)}px)`;
      }
    }, { passive: true });
    
    containerEl.addEventListener('touchend', () => {
      if (pulling && currentY - startY > 100) {
        // Trigger refresh
        containerEl.style.transform = '';
        containerEl.style.transition = 'transform 0.3s';
        onRefresh();
        
        setTimeout(() => {
          containerEl.style.transition = '';
        }, 300);
      } else {
        containerEl.style.transform = '';
        containerEl.style.transition = 'transform 0.3s';
        setTimeout(() => {
          containerEl.style.transition = '';
        }, 300);
      }
      pulling = false;
    }, { passive: true });
  },
  
  // Smooth page transition
  transitionTo(newContent, containerEl) {
    containerEl.style.opacity = '0';
    containerEl.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
      containerEl.innerHTML = newContent;
      containerEl.style.opacity = '1';
      containerEl.style.transform = 'translateX(0)';
    }, 150);
  },
  
  // Animate list items on load
  animateListItems(listEl) {
    const items = listEl.querySelectorAll('.card, .list-group-item');
    items.forEach((item, idx) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(10px)';
      item.style.transition = 'opacity 0.2s, transform 0.2s';
      
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, idx * 30);
    });
  }
};

// Initialize keyboard shortcuts on load
document.addEventListener('DOMContentLoaded', () => {
  KeyboardShortcuts.setupDefaults();
});

console.log('✅ Phase 4 Utilities loaded successfully');


// ── ISSUE 22: Dark Mode for Modals ─────────────────────────────────────────

const DarkModeUtil = {
  // Verify all modals respect dark mode
  verifyModals() {
    const modals = document.querySelectorAll('.modal');
    let issues = [];
    
    modals.forEach((modal, idx) => {
      const content = modal.querySelector('.modal-content');
      if (!content) return;
      
      // Check if using kf-card class for dark mode support
      if (!content.classList.contains('kf-card')) {
        issues.push(`Modal ${idx + 1} missing kf-card class`);
      }
    });
    
    return {
      totalModals: modals.length,
      issues: issues,
      allGood: issues.length === 0
    };
  },
  
  // Apply dark mode classes to all modals
  ensureModalDarkMode() {
    const modals = document.querySelectorAll('.modal-content');
    modals.forEach(modal => {
      if (!modal.classList.contains('kf-card')) {
        modal.classList.add('kf-card');
      }
    });
  },
  
  // Monitor for dynamically created modals
  watchNewModals() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList?.contains('modal')) {
            const content = node.querySelector('.modal-content');
            if (content && !content.classList.contains('kf-card')) {
              content.classList.add('kf-card');
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return observer;
  }
};

// ── ISSUE 26: Code Organization ─────────────────────────────────────────────

const CodeOrganizer = {
  // This is a documentation utility - shows code structure
  getSectionMap() {
    return {
      '1. Configuration': 'Lines 1-60: AppConfig, constants, legacy compatibility',
      '2. Security Utilities': 'Lines 61-400: CryptoUtil, PINManager, AuthManager',
      '3. Validation': 'Lines 401-550: Validator with all validation rules',
      '4. Data Management': 'Lines 551-750: BackupManager, ConnectionMonitor',
      '5. Error Handling': 'Lines 751-850: ErrorHandler, Debouncer, Throttle',
      '6. UI Utilities': 'Lines 851-950: LoadingUI',
      '7. State Management': 'Lines 951-1100: Store, SecureStore',
      '8. Translation': 'Lines 1101-1300: T object with all translations',
      '9. Helper Functions': 'Lines 1301-1500: $, $$, fmtDate, fmtCur, etc.',
      '10. API Functions': 'Lines 1501-1800: apiAuth, apiCall, refreshToken',
      '11. Navigation': 'Lines 1801-2000: showApp, showAuth, showPage',
      '12. Rendering': 'Lines 2001-3500: renderDashboard, renderClients, etc.',
      '13. Modal Handlers': 'Lines 3501-4500: Client, Loan, Payment modals',
      '14. Event Listeners': 'Lines 4501-5000: Button clicks, form submits',
      '15. PIN Handlers': 'Lines 5001-5200: PIN setup, unlock, forgot',
      '16. Initialization': 'Lines 5201-5404: DOMContentLoaded, init()'
    };
  },
  
  // Suggest refactoring if file too large
  analyzeFileSize(filename, lineCount) {
    const recommendations = [];
    
    if (lineCount > 5000) {
      recommendations.push('Consider splitting into modules (auth.js, ui.js, api.js)');
    }
    if (lineCount > 10000) {
      recommendations.push('⚠️ File is very large - recommend immediate refactoring');
    }
    
    return {
      filename,
      lineCount,
      status: lineCount > 5000 ? 'needs refactoring' : 'acceptable',
      recommendations
    };
  }
};

// ── ISSUE 27: Image Optimization ────────────────────────────────────────────

const ImageOptimizer = {
  // Check if images are optimized
  checkImages() {
    const images = document.querySelectorAll('img');
    const report = [];
    
    images.forEach((img, idx) => {
      const src = img.src;
      const isBase64 = src.startsWith('data:');
      const isOptimized = src.includes('.webp') || src.includes('-optimized');
      
      if (!isBase64 && !isOptimized) {
        report.push({
          index: idx + 1,
          src: src.substring(0, 50) + '...',
          recommendation: 'Convert to WebP or compress with TinyPNG'
        });
      }
    });
    
    return {
      totalImages: images.length,
      unoptimized: report.length,
      report: report
    };
  },
  
  // Instructions for manual optimization
  getOptimizationGuide() {
    return {
      tools: [
        { name: 'TinyPNG', url: 'https://tinypng.com', description: 'Online PNG/JPG compression' },
        { name: 'Squoosh', url: 'https://squoosh.app', description: 'Google\'s image optimizer' },
        { name: 'ImageOptim', url: 'https://imageoptim.com', description: 'Mac app for optimization' }
      ],
      steps: [
        '1. Download all images from project',
        '2. Upload to TinyPNG or Squoosh',
        '3. Download compressed versions',
        '4. Replace original files',
        '5. Verify image quality'
      ],
      targets: [
        'logo.png (should be <50KB)',
        'Any banner images (<200KB)',
        'Client photos (handled by PhotoUploader)'
      ]
    };
  }
};

// ── ISSUE 28: Chart Performance ─────────────────────────────────────────────

const ChartPerformance = {
  _chartCache: new Map(),
  _dataCache: new Map(),
  
  // Check if data has changed
  hasDataChanged(cacheKey, newData) {
    const cached = this._dataCache.get(cacheKey);
    if (!cached) return true;
    
    // Simple comparison
    return JSON.stringify(cached) !== JSON.stringify(newData);
  },
  
  // Memoize chart data
  memoizeChartData(cacheKey, data) {
    this._dataCache.set(cacheKey, JSON.parse(JSON.stringify(data)));
  },
  
  // Get or create chart
  getOrCreateChart(canvasId, createFn) {
    const cached = this._chartCache.get(canvasId);
    if (cached) {
      return cached;
    }
    
    const chart = createFn();
    this._chartCache.set(canvasId, chart);
    return chart;
  },
  
  // Update chart only if data changed
  updateChartIfNeeded(canvasId, dataKey, newData, updateFn) {
    if (this.hasDataChanged(dataKey, newData)) {
      this.memoizeChartData(dataKey, newData);
      updateFn();
    }
  },
  
  // Destroy chart when page changes
  destroyChart(canvasId) {
    const chart = this._chartCache.get(canvasId);
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
    this._chartCache.delete(canvasId);
  },
  
  // Clear all caches
  clearCache() {
    this._chartCache.forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    this._chartCache.clear();
    this._dataCache.clear();
  },
  
  // Example usage wrapper for dashboard charts
  optimizedRenderChart(canvasId, data) {
    const dataKey = `${canvasId}_data`;
    
    // Only re-render if data changed
    if (!this.hasDataChanged(dataKey, data)) {
      console.log(`Chart ${canvasId} - using cached version`);
      return;
    }
    
    // Data changed, update cache and render
    this.memoizeChartData(dataKey, data);
    
    // Destroy old chart if exists
    this.destroyChart(canvasId);
    
    console.log(`Chart ${canvasId} - rendering with new data`);
    
    // Create new chart (implementation depends on chart library)
    // Example: const chart = new Chart(ctx, config);
  }
};

// ── Auto-initialization for Phase 4 enhancements ────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Enable dark mode monitoring for dynamically created modals
  DarkModeUtil.watchNewModals();
  
  // Ensure existing modals have dark mode support
  DarkModeUtil.ensureModalDarkMode();
  
  console.log('✅ Phase 4 Complete: All UX/Performance enhancements loaded');
});
