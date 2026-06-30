/**
 * KaasFlow - Phase 5: Compliance & Legal
 * Issues 29-32: GDPR, Data Retention, Audit Log, ToS Acceptance
 */

'use strict';

// ── ISSUE 29: GDPR Compliance ───────────────────────────────────────────────

const GDPRCompliance = {
  CONSENT_KEY: 'kf_gdpr_consent',
  
  // Check if user has given consent
  hasConsent() {
    const consent = localStorage.getItem(this.CONSENT_KEY);
    return consent === 'granted';
  },
  
  // Record consent
  grantConsent() {
    const consentData = {
      granted: true,
      timestamp: new Date().toISOString(),
      version: '1.0',
      ipAddress: 'not-tracked', // Respect privacy
      userAgent: navigator.userAgent
    };
    localStorage.setItem(this.CONSENT_KEY, 'granted');
    localStorage.setItem(this.CONSENT_KEY + '_details', JSON.stringify(consentData));
  },
  
  // Revoke consent
  revokeConsent() {
    localStorage.removeItem(this.CONSENT_KEY);
    // Keep details for audit trail
  },
  
  // Show cookie consent banner
  showConsentBanner() {
    if (this.hasConsent()) return;
    
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--color-bg-card, #fff);
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
      padding: 1rem;
      z-index: 10000;
      border-top: 2px solid var(--color-primary-kf);
    `;
    
    banner.innerHTML = `
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-9">
            <p class="mb-0">
              <i class="fa-solid fa-cookie-bite me-2"></i>
              <strong>We use cookies and localStorage</strong> to provide core functionality like login, data storage, and preferences. 
              By continuing, you agree to our 
              <a href="privacy-policy.html" target="_blank">Privacy Policy</a> and 
              <a href="terms-conditions.html" target="_blank">Terms of Service</a>.
            </p>
          </div>
          <div class="col-md-3 text-end">
            <button class="btn-kf-outline btn-sm me-2" id="gdpr-decline">Decline</button>
            <button class="btn-kf-primary btn-sm" id="gdpr-accept">Accept</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    document.getElementById('gdpr-accept').addEventListener('click', () => {
      this.grantConsent();
      banner.remove();
      showToast('Preferences saved', 'success');
    });
    
    document.getElementById('gdpr-decline').addEventListener('click', () => {
      banner.remove();
      showToast('Some features may not work without consent', 'warning');
      // Show limited functionality notice
      this.showLimitedModeNotice();
    });
  },
  
  // Show limited mode notice
  showLimitedModeNotice() {
    const notice = document.createElement('div');
    notice.className = 'alert alert-warning m-3';
    notice.innerHTML = `
      <strong>Limited Mode:</strong> Without consent, we cannot save your data locally. 
      Please accept to use the full application.
    `;
    document.body.prepend(notice);
  },
  
  // Right to be forgotten - Export all user data
  exportUserData() {
    const userData = {
      exportDate: new Date().toISOString(),
      user: getSession()?.user || null,
      settings: Store.settings(),
      clients: Store.clients(),
      loans: Store.loans(),
      payments: Store.payments(),
      backupHistory: BackupManager.getHistory(),
      consent: {
        status: this.hasConsent() ? 'granted' : 'denied',
        details: JSON.parse(localStorage.getItem(this.CONSENT_KEY + '_details') || '{}')
      }
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-data-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('Your data has been exported', 'success');
    
    // Log this action
    AuditLogger.log('data_export', 'User exported all their data');
  },
  
  // Right to be forgotten - Delete all user data
  async deleteAllUserData() {
    const confirmed = await DeleteConfirmation.confirm(
      'Delete All Data',
      'This will permanently delete ALL your data including clients, loans, payments, and settings. This action cannot be undone.',
      {
        confirmText: 'DELETE EVERYTHING',
        dangerLevel: 'extreme'
      }
    );
    
    if (!confirmed) return false;
    
    // Final confirmation
    const finalConfirm = prompt('Type DELETE to confirm permanent deletion:');
    if (finalConfirm !== 'DELETE') {
      showToast('Deletion cancelled', 'info');
      return false;
    }
    
    // Log before deletion
    AuditLogger.log('data_deletion', 'User initiated complete data deletion');
    
    // Clear all localStorage
    Object.keys(LS).forEach(key => {
      localStorage.removeItem(LS[key]);
    });
    
    // Clear session
    localStorage.removeItem(this.CONSENT_KEY);
    localStorage.removeItem(this.CONSENT_KEY + '_details');
    
    showToast('All data deleted. Redirecting to login...', 'success');
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
    return true;
  }
};

// ── ISSUE 30: Data Retention Policy ─────────────────────────────────────────

const DataRetention = {
  SETTINGS_KEY: 'kf_retention_policy',
  
  // Default retention: 24 months for completed loans
  getPolicy() {
    const saved = localStorage.getItem(this.SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    
    return {
      completedLoans: 24, // months
      deletedClients: 3, // months in recycle bin
      auditLogs: 12, // months
      backups: 3, // keep last 3 backups
      enabled: false // Disabled by default
    };
  },
  
  // Save policy
  savePolicy(policy) {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(policy));
  },
  
  // Check and cleanup old data
  cleanupOldData() {
    const policy = this.getPolicy();
    if (!policy.enabled) return { cleaned: 0, message: 'Retention policy disabled' };
    
    const now = Date.now();
    const msPerMonth = 30 * 24 * 60 * 60 * 1000;
    let cleaned = 0;
    
    // Clean completed loans older than retention period
    if (policy.completedLoans) {
      const loans = Store.loans();
      const threshold = now - (policy.completedLoans * msPerMonth);
      
      const filtered = loans.filter(loan => {
        if (loan.status === 'completed' && loan.completedAt) {
          const completedTime = new Date(loan.completedAt).getTime();
          if (completedTime < threshold) {
            cleaned++;
            AuditLogger.log('auto_cleanup', `Deleted completed loan ${loan.id} (older than ${policy.completedLoans} months)`);
            return false;
          }
        }
        return true;
      });
      
      if (filtered.length < loans.length) {
        Store.saveLoans(filtered);
      }
    }
    
    // Clean old recycle bin items
    if (policy.deletedClients) {
      const recycleBin = JSON.parse(localStorage.getItem(LS.recycleBin) || '[]');
      const threshold = now - (policy.deletedClients * msPerMonth);
      
      const filtered = recycleBin.filter(item => {
        const deletedTime = new Date(item.deletedAt).getTime();
        if (deletedTime < threshold) {
          cleaned++;
          return false;
        }
        return true;
      });
      
      localStorage.setItem(LS.recycleBin, JSON.stringify(filtered));
    }
    
    // Clean old backups (keep only specified count)
    if (policy.backups) {
      const history = BackupManager.getHistory();
      if (history.length > policy.backups) {
        const toKeep = history.slice(0, policy.backups);
        localStorage.setItem(BackupManager.BACKUP_KEY, JSON.stringify(toKeep));
        cleaned += history.length - policy.backups;
      }
    }
    
    return {
      cleaned,
      message: `Cleaned ${cleaned} old items`
    };
  },
  
  // Show retention policy settings
  showPolicySettings() {
    const policy = this.getPolicy();
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content kf-card">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa-solid fa-clock-rotate-left me-2"></i>Data Retention Policy
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted-kf">Automatically delete old data to save storage space.</p>
            
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="retention-enabled" ${policy.enabled ? 'checked' : ''}>
              <label class="form-check-label" for="retention-enabled">
                Enable automatic cleanup
              </label>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Delete completed loans after (months)</label>
              <input type="number" class="form-control" id="retention-loans" value="${policy.completedLoans}" min="1" max="60">
              <small class="text-muted">Set to 0 to keep forever</small>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Keep deleted items in recycle bin for (months)</label>
              <input type="number" class="form-control" id="retention-deleted" value="${policy.deletedClients}" min="1" max="12">
            </div>
            
            <div class="mb-3">
              <label class="form-label">Number of backups to keep</label>
              <input type="number" class="form-control" id="retention-backups" value="${policy.backups}" min="1" max="10">
            </div>
            
            <div class="alert alert-warning">
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              <strong>Warning:</strong> Deleted data cannot be recovered. Create a backup before enabling.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-kf-outline" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn-kf-primary" id="btn-save-retention">Save Policy</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    
    document.getElementById('btn-save-retention').addEventListener('click', () => {
      const newPolicy = {
        enabled: document.getElementById('retention-enabled').checked,
        completedLoans: parseInt(document.getElementById('retention-loans').value),
        deletedClients: parseInt(document.getElementById('retention-deleted').value),
        backups: parseInt(document.getElementById('retention-backups').value),
        auditLogs: 12
      };
      
      this.savePolicy(newPolicy);
      AuditLogger.log('settings_change', 'Updated data retention policy');
      showToast('Retention policy updated', 'success');
      
      // Run cleanup now
      if (newPolicy.enabled) {
        const result = this.cleanupOldData();
        if (result.cleaned > 0) {
          showToast(result.message, 'info');
        }
      }
      
      bsModal.hide();
      modal.remove();
    });
    
    bsModal.show();
  }
};

// ── ISSUE 31: Audit Log ──────────────────────────────────────────────────────

const AuditLogger = {
  LOG_KEY: 'kf_audit_log',
  MAX_LOGS: 1000,
  
  // Log an action
  log(action, details, metadata = {}) {
    const entry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      action: action,
      details: details,
      user: getSession()?.user?.email || 'anonymous',
      metadata: {
        ...metadata,
        userAgent: navigator.userAgent,
        online: navigator.onLine
      }
    };
    
    const logs = this.getLogs();
    logs.unshift(entry);
    
    // Keep only last MAX_LOGS
    if (logs.length > this.MAX_LOGS) {
      logs.splice(this.MAX_LOGS);
    }
    
    localStorage.setItem(this.LOG_KEY, JSON.stringify(logs));
    
    // Also log to console in development
    if (AppConfig.environment === 'development') {
      console.log(`[AUDIT] ${action}:`, details);
    }
  },
  
  // Get all logs
  getLogs() {
    try {
      return JSON.parse(localStorage.getItem(this.LOG_KEY) || '[]');
    } catch (e) {
      return [];
    }
  },
  
  // Get logs filtered by action type
  getLogsByAction(action) {
    return this.getLogs().filter(log => log.action === action);
  },
  
  // Get logs for date range
  getLogsByDateRange(startDate, endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return this.getLogs().filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime >= start && logTime <= end;
    });
  },
  
  // Show audit log viewer
  showAuditLog() {
    const logs = this.getLogs().slice(0, 100); // Show last 100
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content kf-card">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fa-solid fa-clipboard-list me-2"></i>Audit Log
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <input type="text" class="form-control" id="audit-search" placeholder="Search logs...">
            </div>
            
            <div class="table-responsive" style="max-height:400px;overflow:auto;">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th style="width:160px">Timestamp</th>
                    <th style="width:150px">Action</th>
                    <th>Details</th>
                    <th style="width:120px">User</th>
                  </tr>
                </thead>
                <tbody id="audit-log-tbody">
                  ${logs.map(log => `
                    <tr>
                      <td class="fs-xs">${new Date(log.timestamp).toLocaleString()}</td>
                      <td><span class="badge bg-primary">${log.action}</span></td>
                      <td class="fs-xs">${log.details}</td>
                      <td class="fs-xs text-muted">${log.user}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="mt-3 text-muted fs-xs">
              Showing ${logs.length} of ${this.getLogs().length} total logs
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-kf-outline" id="btn-export-audit">Export</button>
            <button type="button" class="btn-kf-outline" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    
    // Search functionality
    document.getElementById('audit-search').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const tbody = document.getElementById('audit-log-tbody');
      const rows = tbody.querySelectorAll('tr');
      
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    });
    
    // Export functionality
    document.getElementById('btn-export-audit').addEventListener('click', () => {
      const dataStr = JSON.stringify(this.getLogs(), null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-log-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast('Audit log exported', 'success');
    });
    
    bsModal.show();
  },
  
  // Clear old logs (called by DataRetention)
  clearOldLogs(monthsToKeep = 12) {
    const threshold = Date.now() - (monthsToKeep * 30 * 24 * 60 * 60 * 1000);
    const logs = this.getLogs();
    
    const filtered = logs.filter(log => {
      return new Date(log.timestamp).getTime() > threshold;
    });
    
    localStorage.setItem(this.LOG_KEY, JSON.stringify(filtered));
    return logs.length - filtered.length;
  }
};

// ── ISSUE 32: Terms of Service Acceptance ───────────────────────────────────

const ToSManager = {
  TOS_KEY: 'kf_tos_acceptance',
  TOS_VERSION: '1.0',
  
  // Check if user has accepted current ToS
  hasAccepted() {
    const acceptance = this.getAcceptance();
    return acceptance && acceptance.version === this.TOS_VERSION;
  },
  
  // Get acceptance record
  getAcceptance() {
    try {
      return JSON.parse(localStorage.getItem(this.TOS_KEY) || 'null');
    } catch (e) {
      return null;
    }
  },
  
  // Record acceptance
  recordAcceptance() {
    const acceptance = {
      version: this.TOS_VERSION,
      acceptedAt: new Date().toISOString(),
      ipAddress: 'not-tracked', // Privacy
      userAgent: navigator.userAgent
    };
    
    localStorage.setItem(this.TOS_KEY, JSON.stringify(acceptance));
    AuditLogger.log('tos_acceptance', `User accepted ToS v${this.TOS_VERSION}`);
  },
  
  // Show ToS acceptance modal
  showAcceptanceModal() {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.setAttribute('data-bs-backdrop', 'static');
      modal.setAttribute('data-bs-keyboard', 'false');
      
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div class="modal-content kf-card">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="fa-solid fa-file-contract me-2"></i>Terms of Service & Privacy Policy
              </h5>
            </div>
            <div class="modal-body">
              <p>By using KaasFlow, you agree to our Terms of Service and Privacy Policy.</p>
              
              <div class="accordion mb-3" id="tos-accordion">
                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#tos-content">
                      Terms of Service (Summary)
                    </button>
                  </h2>
                  <div id="tos-content" class="accordion-collapse collapse show" data-bs-parent="#tos-accordion">
                    <div class="accordion-body fs-sm">
                      <ul>
                        <li>You are responsible for the accuracy of data you enter</li>
                        <li>You must comply with applicable lending laws in your jurisdiction</li>
                        <li>We provide the software "as-is" without warranties</li>
                        <li>You retain ownership of all your data</li>
                        <li>We do not store your data on our servers (local-first)</li>
                      </ul>
                      <a href="terms-conditions.html" target="_blank">Read full Terms of Service →</a>
                    </div>
                  </div>
                </div>
                
                <div class="accordion-item">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#privacy-content">
                      Privacy Policy (Summary)
                    </button>
                  </h2>
                  <div id="privacy-content" class="accordion-collapse collapse" data-bs-parent="#tos-accordion">
                    <div class="accordion-body fs-sm">
                      <ul>
                        <li>We use localStorage for data storage (no server uploads)</li>
                        <li>Authentication is handled by secure backend API</li>
                        <li>We do not sell or share your data with third parties</li>
                        <li>You can export or delete your data at any time</li>
                        <li>We use cookies only for essential functionality</li>
                      </ul>
                      <a href="privacy-policy.html" target="_blank">Read full Privacy Policy →</a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="tos-accept-checkbox">
                <label class="form-check-label" for="tos-accept-checkbox">
                  I have read and agree to the Terms of Service and Privacy Policy
                </label>
              </div>
              
              <div class="alert alert-info mt-3 fs-sm">
                <i class="fa-solid fa-info-circle me-2"></i>
                <strong>Version:</strong> ${this.TOS_VERSION} | 
                <strong>Last Updated:</strong> June 1, 2026
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-kf-outline" id="btn-tos-decline">Decline</button>
              <button type="button" class="btn-kf-primary" id="btn-tos-accept" disabled>Accept & Continue</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      const bsModal = new bootstrap.Modal(modal);
      
      const acceptBtn = document.getElementById('btn-tos-accept');
      const checkbox = document.getElementById('tos-accept-checkbox');
      
      // Enable button only when checkbox is checked
      checkbox.addEventListener('change', () => {
        acceptBtn.disabled = !checkbox.checked;
      });
      
      // Handle acceptance
      document.getElementById('btn-tos-accept').addEventListener('click', () => {
        this.recordAcceptance();
        showToast('Thank you for accepting our terms', 'success');
        bsModal.hide();
        modal.remove();
        resolve(true);
      });
      
      // Handle decline
      document.getElementById('btn-tos-decline').addEventListener('click', () => {
        showToast('You must accept to use KaasFlow', 'error');
        // Keep modal open or redirect to landing page
        resolve(false);
      });
      
      bsModal.show();
    });
  },
  
  // Check and show ToS if needed (call on app init)
  async checkAndShow() {
    if (!this.hasAccepted()) {
      const accepted = await this.showAcceptanceModal();
      if (!accepted) {
        // Redirect to landing page or show limited access
        window.location.href = '/';
      }
      return accepted;
    }
    return true;
  }
};

// ── Auto-initialization ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Show GDPR consent banner if not accepted
  if (!GDPRCompliance.hasConsent()) {
    setTimeout(() => {
      GDPRCompliance.showConsentBanner();
    }, 1000);
  }
  
  // Auto-log page navigation
  AuditLogger.log('page_load', `Loaded ${window.location.pathname}`);
  
  console.log('✅ Phase 5 Compliance utilities loaded');
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GDPRCompliance, DataRetention, AuditLogger, ToSManager };
}
