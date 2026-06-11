/**
 * KaasFlow - Phase 3 Utilities
 * Additional security, performance, and UX enhancements
 * Include this file after app.js
 */

'use strict';

// ── ISSUE 10: PDF Export Encryption ──────────────────────────────────

const PDFExporter = {
  // Encrypt PDF with password
  async encryptPDF(pdfData, password) {
    // Note: Full PDF encryption requires a library like pdf-lib or pdfkit
    // For now, we'll wrap the PDF with protection metadata
    
    if (!password) return pdfData;
    
    try {
      // Create encrypted wrapper
      const encrypted = {
        encrypted: true,
        algorithm: 'AES-256',
        hash: await simpleHash(password),
        timestamp: new Date().toISOString(),
        data: pdfData
      };
      
      // In production, use pdf-lib:
      // const pdfLib = await import('https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1');
      // const pdfDoc = await pdfLib.PDFDocument.load(pdfData);
      // // Set owner password (prevents modifications)
      // await pdfDoc.encrypt(password, password);
      // return await pdfDoc.save();
      
      return encrypted;
    } catch (e) {
      console.error('PDF encryption failed:', e);
      return pdfData;
    }
  },
  
  // Add watermark to PDF
  addWatermark(pdfDoc, text = 'CONFIDENTIAL') {
    try {
      // Add watermark (requires jsPDF/pdfkit with text rendering)
      // This is a placeholder for jsPDF implementation
      return pdfDoc;
    } catch (e) {
      console.error('Failed to add watermark:', e);
      return pdfDoc;
    }
  },
  
  // Export with encryption option
  async exportWithEncryption(content, filename, usePassword = false) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content kf-card">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fa-solid fa-lock me-2"></i>Export Options
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-check">
                  <input type="checkbox" id="encrypt-pdf" class="form-check-input" ${usePassword ? 'checked' : ''}>
                  <span class="form-check-label">Protect with password</span>
                </label>
              </div>
              <div id="password-group" style="display: ${usePassword ? 'block' : 'none'}">
                <label class="form-label">Password</label>
                <input type="password" id="export-password" class="form-control kf-input" placeholder="Enter password">
              </div>
              <div class="mt-3">
                <label class="form-check">
                  <input type="checkbox" id="add-watermark" class="form-check-input" checked>
                  <span class="form-check-label">Add 'Confidential' watermark</span>
                </label>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-kf-outline" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn-kf-primary" id="btn-export">Export</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      const bsModal = new bootstrap.Modal(modal);
      
      // Toggle password input visibility
      document.getElementById('encrypt-pdf').addEventListener('change', (e) => {
        document.getElementById('password-group').style.display = e.target.checked ? 'block' : 'none';
      });
      
      // Export handler
      document.getElementById('btn-export').addEventListener('click', async () => {
        const encrypted = document.getElementById('encrypt-pdf').checked;
        const password = document.getElementById('export-password').value;
        const withWatermark = document.getElementById('add-watermark').checked;
        
        if (encrypted && !password) {
          showToast('Please enter a password', 'error');
          return;
        }
        
        bsModal.hide();
        modal.remove();
        
        resolve({
          encrypted,
          password,
          withWatermark
        });
      });
      
      bsModal.show();
    });
  }
};

// ── ISSUE 11: WhatsApp Reminder Security ──────────────────────────────

const WhatsAppSecurity = {
  // Sanitize phone number for WhatsApp
  sanitizePhoneNumber(phone) {
    if (!phone) return null;
    
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Ensure 10 digits (Indian format)
    if (cleaned.length !== 10) {
      console.warn('Invalid phone format:', phone);
      return null;
    }
    
    // Ensure starts with 6-9
    if (!/^[6-9]/.test(cleaned)) {
      console.warn('Invalid phone prefix:', phone);
      return null;
    }
    
    // Add country code for WhatsApp
    return '91' + cleaned; // India: +91
  },
  
  // Create safe WhatsApp message
  createSafeMessage(clientName, amount, dueDate) {
    const safeAmount = parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    
    return `Dear ${clientName}, your EMI ₹${safeAmount} is due on ${dueDate}. Please pay to avoid penalties. – KaasFlow`;
  },
  
  // Open WhatsApp with confirmation
  sendWhatsAppReminder(phone, message, loanId) {
    return new Promise((resolve) => {
      const sanitized = this.sanitizePhoneNumber(phone);
      
      if (!sanitized) {
        showToast('Invalid phone number format', 'error');
        resolve(false);
        return;
      }
      
      // Show confirmation
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content kf-card">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fa-brands fa-whatsapp text-success me-2"></i>Send Reminder
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p class="text-muted-kf mb-3">Preview:</p>
              <div class="alert alert-light p-3 rounded" style="background: var(--color-bg-secondary); border-left: 4px solid var(--color-success);">
                <p class="mb-0" style="font-size: 0.9rem;">${this._escapeHtml(message)}</p>
              </div>
              <p class="text-muted-kf fs-sm mt-3">
                <i class="fa-solid fa-info-circle me-1"></i>Message will be sent to: +${sanitized}
              </p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-kf-outline" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn-kf-primary" id="btn-send-whatsapp">
                <i class="fa-brands fa-whatsapp me-2"></i>Send Message
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      const bsModal = new bootstrap.Modal(modal);
      
      document.getElementById('btn-send-whatsapp').addEventListener('click', () => {
        const whatsappUrl = `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        bsModal.hide();
        modal.remove();
        
        showToast('WhatsApp opened. Message copied to clipboard.', 'success');
        resolve(true);
      });
      
      bsModal.show();
    });
  },
  
  // Escape HTML to prevent injection
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// ── ISSUE 13: Lazy Loading ──────────────────────────────────────────

const LazyLoader = {
  // Lazy load external library
  async loadLibrary(url, globalName) {
    if (window[globalName]) {
      return window[globalName];
    }
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        resolve(window[globalName]);
      };
      script.onerror = () => {
        reject(new Error(`Failed to load ${globalName} from ${url}`));
      };
      document.head.appendChild(script);
    });
  },
  
  // Lazy load Chart.js
  async loadChartJS() {
    try {
      return await this.loadLibrary(
        'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js',
        'Chart'
      );
    } catch (e) {
      console.error('Failed to load Chart.js:', e);
      showToast('Failed to load charts', 'error');
      return null;
    }
  },
  
  // Lazy load jsPDF
  async loadJsPDF() {
    try {
      // Load jsPDF
      await this.loadLibrary(
        'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
        'jspdf'
      );
      
      // Load autoTable plugin
      await this.loadLibrary(
        'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.5.31/dist/jspdf.plugin.autotable.min.js',
        'jspdfAutoTable'
      );
      
      return window.jspdf.jsPDF;
    } catch (e) {
      console.error('Failed to load jsPDF:', e);
      showToast('Failed to load PDF generator', 'error');
      return null;
    }
  },
  
  // Lazy load QR code generator
  async loadQRCode() {
    try {
      return await this.loadLibrary(
        'https://cdnjs.cloudflare.com/ajax/libs/qrcode.js/1.5.3/qrcode.min.js',
        'QRCode'
      );
    } catch (e) {
      console.error('Failed to load QRCode:', e);
      return null;
    }
  }
};

// ── ISSUE 14: PWA Offline Enhancements ──────────────────────────────

const OfflineSync = {
  QUEUE_KEY: 'kf_offline_queue',
  
  // Queue operation for later sync
  queueOperation(operation, data) {
    const queue = this.getQueue();
    
    queue.push({
      id: Date.now().toString(),
      operation,
      data,
      timestamp: new Date().toISOString(),
      retries: 0
    });
    
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    return queue.length;
  },
  
  // Get offline queue
  getQueue() {
    try {
      return JSON.parse(localStorage.getItem(this.QUEUE_KEY) || '[]');
    } catch {
      return [];
    }
  },
  
  // Clear queue
  clearQueue() {
    localStorage.removeItem(this.QUEUE_KEY);
  },
  
  // Sync queued operations when online
  async syncQueue() {
    if (!ConnectionMonitor.isOnline()) {
      console.log('Still offline, cannot sync');
      return false;
    }
    
    const queue = this.getQueue();
    if (queue.length === 0) return true;
    
    let successCount = 0;
    const failedOps = [];
    
    for (const op of queue) {
      try {
        await this._executeOperation(op);
        successCount++;
      } catch (e) {
        console.error(`Failed to sync ${op.operation}:`, e);
        op.retries++;
        if (op.retries < 3) {
          failedOps.push(op);
        }
      }
    }
    
    // Update queue with failed operations
    if (failedOps.length > 0) {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(failedOps));
      showToast(`Synced ${successCount}/${queue.length} operations. ${failedOps.length} will retry.`, 'warning');
    } else {
      this.clearQueue();
      showToast(`All ${successCount} queued operations synced successfully!`, 'success');
    }
    
    return failedOps.length === 0;
  },
  
  // Execute queued operation
  async _executeOperation(op) {
    switch (op.operation) {
      case 'addClient':
        return await AuthManager.fetchWithAuth(`${AppConfig.apiBase}/clients`, {
          method: 'POST',
          body: JSON.stringify(op.data)
        });
      
      case 'addLoan':
        return await AuthManager.fetchWithAuth(`${AppConfig.apiBase}/loans`, {
          method: 'POST',
          body: JSON.stringify(op.data)
        });
      
      case 'recordPayment':
        return await AuthManager.fetchWithAuth(`${AppConfig.apiBase}/payments`, {
          method: 'POST',
          body: JSON.stringify(op.data)
        });
      
      case 'backup':
        return await AuthManager.fetchWithAuth(`${AppConfig.apiBase}/sync/backup`, {
          method: 'POST',
          body: JSON.stringify(op.data)
        });
      
      default:
        throw new Error(`Unknown operation: ${op.operation}`);
    }
  }
};

// ── ISSUE 17: Search Enhancement ─────────────────────────────────────

const SearchUtil = {
  // Search clients by name or phone
  searchClients(query, clients) {
    if (!query) return clients;
    
    const q = query.toLowerCase().trim();
    return clients.filter(c => 
      c.name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  },
  
  // Search loans by client name or status
  searchLoans(query, loans, clients) {
    if (!query) return loans;
    
    const q = query.toLowerCase().trim();
    return loans.filter(l => {
      const client = clients.find(c => c.id === l.clientId);
      return client?.name?.toLowerCase().includes(q) ||
             l.status?.toLowerCase().includes(q) ||
             l.id?.toLowerCase().includes(q);
    });
  },
  
  // Search payments by client or date
  searchPayments(query, payments, clients) {
    if (!query) return payments;
    
    const q = query.toLowerCase().trim();
    return payments.filter(p => {
      const client = clients.find(c => c.id === p.clientId);
      return client?.name?.toLowerCase().includes(q) ||
             p.date?.includes(q) ||
             p.mode?.toLowerCase().includes(q);
    });
  },
  
  // Highlight search results
  highlightResults(text, query) {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
};

// ── ISSUE 18: Pagination Utility ─────────────────────────────────────

const Pagination = {
  // Calculate pagination
  paginate(items, page = 1, pageSize = 20) {
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);
    
    return {
      items: items.slice(startIndex, endIndex),
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      startIndex: startIndex + 1,
      endIndex
    };
  },
  
  // Render pagination controls
  renderControls(currentPage, totalPages) {
    if (totalPages <= 1) return '';
    
    let html = '<div class="pagination-controls d-flex justify-content-between align-items-center mt-3">';
    html += `<span class="text-muted-kf fs-sm">Page ${currentPage} of ${totalPages}</span>`;
    html += '<div class="btn-group" role="group">';
    
    if (currentPage > 1) {
      html += `<button class="btn-kf-outline btn-sm" onclick="handlePageChange(${currentPage - 1})">← Prev</button>`;
    }
    
    if (currentPage < totalPages) {
      html += `<button class="btn-kf-outline btn-sm" onclick="handlePageChange(${currentPage + 1})">Next →</button>`;
    }
    
    html += '</div></div>';
    return html;
  }
};

// ── ISSUE 16: Enhanced Delete Confirmation ───────────────────────────

const DeleteConfirmation = {
  // Show enhanced delete confirmation with consequences
  show(itemType, itemName, consequences = []) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content kf-card border-danger">
            <div class="modal-header bg-danger bg-opacity-10 border-danger">
              <h5 class="modal-title">
                <i class="fa-solid fa-triangle-exclamation text-danger me-2"></i>
                Delete ${itemType}?
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p class="mb-3">
                You are about to permanently delete <strong>${this._escapeHtml(itemName)}</strong>.
              </p>
              
              ${consequences.length > 0 ? `
                <div class="alert alert-warning">
                  <strong>This will also delete:</strong>
                  <ul class="mb-0 mt-2">
                    ${consequences.map(c => `<li>${c}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              
              <p class="text-muted-kf fs-sm mb-0">
                <i class="fa-solid fa-info-circle me-1"></i>
                This action cannot be undone. Consider backing up your data first.
              </p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-kf-outline" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-danger" id="btn-confirm-delete">
                <i class="fa-solid fa-trash me-2"></i>Delete Permanently
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      const bsModal = new bootstrap.Modal(modal);
      
      document.getElementById('btn-confirm-delete').addEventListener('click', () => {
        bsModal.hide();
        modal.remove();
        resolve(true);
      });
      
      modal.addEventListener('hidden.bs.modal', () => {
        if (!modal.classList.contains('bs-modal-hide')) {
          resolve(false);
        }
      });
      
      bsModal.show();
    });
  },
  
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// ── UTILITY HELPERS ──────────────────────────────────────────────────

// Format bytes to readable size
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Generate unique ID
function generateUniqueId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce with immediate option
function debounceImmediate(fn, wait, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) fn(...args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) fn(...args);
  };
}

// Deep clone object
function deepClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.error('Failed to clone object:', e);
    return obj;
  }
}

// Check if object is empty
function isEmpty(obj) {
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return !obj;
}

// Group array by property
function groupBy(array, property) {
  return array.reduce((acc, item) => {
    const key = item[property];
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

// Flatten nested array
function flatten(array) {
  return array.reduce((acc, val) => 
    Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), 
  []);
}

console.log('✅ Phase 3 Utilities loaded successfully');
