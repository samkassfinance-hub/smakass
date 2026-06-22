/**
 * Supabase Frontend Integration
 * Handles data sync, authentication, and real-time updates
 */

class SupabaseIntegration {
  constructor() {
    this.backupInterval = null;
    this.isSyncing = false;
    this.BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
    this.API_BASE = 'http://localhost:5000/api';
  }

  /**
   * Initialize Supabase integration
   */
  async init() {
    console.log('🔄 Initializing Supabase integration...');
    try {
      // Check connection status
      const status = await this.checkConnectionStatus();
      if (status.supabase_configured) {
        console.log('✅ Supabase is configured');
        this.startAutoBackup();
      } else {
        console.warn('⚠️ Supabase not configured');
      }
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
    }
  }

  /**
   * Check if Supabase is connected
   */
  async checkConnectionStatus() {
    try {
      const response = await fetch(`${this.API_BASE}/sync/status`);
      return await response.json();
    } catch (error) {
      console.error('Connection check failed:', error);
      return { supabase_configured: false };
    }
  }

  /**
   * Get authentication token from localStorage
   */
  getAuthToken() {
    return localStorage.getItem('authToken') || '';
  }

  /**
   * Get user email from localStorage
   */
  getUserEmail() {
    return localStorage.getItem('userEmail') || '';
  }

  /**
   * Prepare headers for API requests
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getAuthToken()}`,
      'X-User-Email': this.getUserEmail()
    };
  }

  /**
   * Backup app data to Supabase
   */
  async backupData() {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return false;
    }

    this.isSyncing = true;
    try {
      const userData = {
        clients: JSON.parse(localStorage.getItem('clients') || '[]'),
        loans: JSON.parse(localStorage.getItem('loans') || '[]'),
        payments: JSON.parse(localStorage.getItem('payments') || '[]'),
        settings: JSON.parse(localStorage.getItem('settings') || '{}')
      };

      const response = await fetch(`${this.API_BASE}/sync/backup`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Data backed up successfully');
        this.showNotification('Data synced with cloud', 'success');
        return true;
      } else {
        console.error('Backup failed:', result.errors);
        this.showNotification('Failed to sync data', 'error');
        return false;
      }
    } catch (error) {
      console.error('Backup error:', error);
      this.showNotification('Sync error: ' + error.message, 'error');
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Restore app data from Supabase
   */
  async restoreData() {
    try {
      const response = await fetch(`${this.API_BASE}/sync/restore`, {
        headers: this.getHeaders()
      });

      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;
        localStorage.setItem('clients', JSON.stringify(data.clients || []));
        localStorage.setItem('loans', JSON.stringify(data.loans || []));
        localStorage.setItem('payments', JSON.stringify(data.payments || []));
        localStorage.setItem('settings', JSON.stringify(data.settings || {}));

        console.log('✅ Data restored successfully');
        this.showNotification('Data restored from cloud', 'success');
        return true;
      } else {
        console.log('No backup data found');
        return false;
      }
    } catch (error) {
      console.error('Restore error:', error);
      this.showNotification('Failed to restore data', 'error');
      return false;
    }
  }

  /**
   * Start automatic data backup interval
   */
  startAutoBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    // Backup immediately on start
    this.backupData();

    // Then backup at regular intervals
    this.backupInterval = setInterval(() => {
      this.backupData();
    }, this.BACKUP_INTERVAL);

    console.log(`🔄 Auto-backup enabled (every ${this.BACKUP_INTERVAL / 1000}s)`);
  }

  /**
   * Stop automatic backup
   */
  stopAutoBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      console.log('Auto-backup stopped');
    }
  }

  /**
   * Show notification to user
   */
  showNotification(message, type = 'info') {
    const notificationId = `notification-${Date.now()}`;
    const notification = document.createElement('div');
    notification.id = notificationId;
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button class="notification-close" onclick="document.getElementById('${notificationId}').remove()">×</button>
      </div>
    `;

    // Add to body or specific container
    const container = document.querySelector('.notification-container') || document.body;
    container.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      const elem = document.getElementById(notificationId);
      if (elem) elem.remove();
    }, 5000);
  }

  /**
   * Force manual backup
   */
  async manualBackup() {
    console.log('Manual backup requested...');
    const success = await this.backupData();
    return success;
  }

  /**
   * Force manual restore
   */
  async manualRestore() {
    if (confirm('This will overwrite your local data with cloud backup. Continue?')) {
      console.log('Manual restore requested...');
      const success = await this.restoreData();
      if (success) {
        window.location.reload();
      }
      return success;
    }
    return false;
  }

  /**
   * Handle data change events
   */
  onDataChange(callback) {
    // Monitor localStorage changes
    window.addEventListener('storage', (event) => {
      if (['clients', 'loans', 'payments', 'settings'].includes(event.key)) {
        callback(event);
      }
    });
  }
}

// Initialize Supabase integration when DOM is ready
const supabaseIntegration = new SupabaseIntegration();

document.addEventListener('DOMContentLoaded', () => {
  supabaseIntegration.init();

  // Add global methods for manual operations
  window.manualSyncNow = () => supabaseIntegration.manualBackup();
  window.restoreFromCloud = () => supabaseIntegration.manualRestore();
});

// Handle page unload - final backup
window.addEventListener('beforeunload', () => {
  supabaseIntegration.backupData();
});
