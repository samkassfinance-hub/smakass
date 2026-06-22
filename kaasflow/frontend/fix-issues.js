/**
 * Fix for three main issues:
 * 1. Loan dropdown not populating clients
 * 2. App empty on login until reload
 * 3. PIN bubbles overlapping input
 */

// ============================================================
// FIX 1: Ensure Loan Client Dropdown is Populated
// ============================================================

function fixLoanClientDropdown() {
  const clientSelect = document.getElementById('loan-client-select');
  if (!clientSelect) return;

  // Get clients from localStorage
  let clients = [];
  try {
    const stored = localStorage.getItem('kf_clients');
    if (stored) {
      clients = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading clients:', e);
  }

  // Clear existing options (keep placeholder)
  const placeholder = clientSelect.querySelector('option[value=""]');
  clientSelect.innerHTML = '';
  if (placeholder) {
    clientSelect.appendChild(placeholder);
  }

  // Add client options
  if (clients && clients.length > 0) {
    clients.forEach(client => {
      const option = document.createElement('option');
      option.value = client.id;
      option.textContent = client.name;
      clientSelect.appendChild(option);
    });
  }

  // Make sure select is enabled
  clientSelect.disabled = false;
}

// Call when showing loan modal
document.addEventListener('DOMContentLoaded', () => {
  const loanModal = document.getElementById('loanModal');
  if (loanModal) {
    loanModal.addEventListener('show.bs.modal', () => {
      fixLoanClientDropdown();
    });
  }
});

// ============================================================
// FIX 2: App Empty on Login - Force Page Render
// ============================================================

function fixAppRenderOnLogin() {
  // Save original showPage function if it doesn't exist
  if (!window.originalShowPage) {
    window.originalShowPage = window.showPage || function() {};
    
    window.showPage = function(pageName) {
      console.log('🔧 Rendering page:', pageName);
      
      // Call original if exists
      if (typeof window.originalShowPage === 'function') {
        window.originalShowPage(pageName);
      }
      
      // Force re-render by ensuring DOM is updated
      setTimeout(() => {
        const mainContent = document.getElementById('main-content');
        if (mainContent && mainContent.innerHTML.trim() === '') {
          console.warn('⚠️ Main content empty, forcing re-render');
          // Trigger page render again
          if (typeof window.renderDashboard === 'function') {
            window.renderDashboard();
          }
        }
      }, 100);
    };
  }
}

// ============================================================
// FIX 3: PIN Bubbles - Make them float above input box
// ============================================================

function fixPINBubbles() {
  // Add CSS to move bubbles above the input area
  const style = document.createElement('style');
  style.textContent = `
    /* Move OTP input bubbles above the input area */
    .otp-inputs-container {
      display: flex !important;
      justify-content: center !important;
      gap: 0.75rem !important;
      margin-bottom: 1.5rem !important;
      position: relative !important;
    }
    
    .pin-digit-input {
      width: 45px !important;
      height: 45px !important;
      text-align: center !important;
      font-size: 1.5rem !important;
      font-weight: bold !important;
      border: 2px solid var(--color-border) !important;
      border-radius: 8px !important;
      padding: 0 !important;
      margin: 0 !important;
      transition: all 0.2s ease !important;
    }
    
    .pin-digit-input:focus {
      border-color: var(--color-primary) !important;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1) !important;
      outline: none !important;
    }
    
    .pin-digit-input:not(:empty) {
      background: var(--color-primary) !important;
      color: white !important;
      border-color: var(--color-primary) !important;
    }
    
    /* Ensure PIN input container doesn't overlap */
    .modal-body {
      padding: 1.5rem !important;
      max-height: 80vh !important;
      overflow-y: auto !important;
    }
    
    /* Add extra spacing for PIN modals */
    #forgot-pin-modal .modal-body {
      padding-top: 2rem !important;
    }
    
    /* Prevent bubbles from touching input box */
    .reset-otp-input {
      z-index: 10 !important;
      position: relative !important;
    }
    
    /* Floating animation - move up slightly */
    @keyframes floatUp {
      0% {
        transform: translateY(0);
        opacity: 0.8;
      }
      50% {
        transform: translateY(-2px);
        opacity: 1;
      }
      100% {
        transform: translateY(0);
        opacity: 0.8;
      }
    }
    
    .pin-digit-input:focus {
      animation: floatUp 0.3s ease-in-out !important;
    }
  `;
  document.head.appendChild(style);
}

// ============================================================
// Initialize All Fixes
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 Applying fixes...');
  
  // Fix 1: Loan dropdown
  fixLoanClientDropdown();
  
  // Fix 2: App render on login
  fixAppRenderOnLogin();
  
  // Fix 3: PIN bubbles
  fixPINBubbles();
  
  // Re-apply fixes when modal opens
  setInterval(() => {
    const loanModal = document.getElementById('loanModal');
    if (loanModal && loanModal.classList.contains('show')) {
      fixLoanClientDropdown();
    }
  }, 500);
  
  console.log('✅ All fixes applied');
});

// Also trigger when session loads
if (typeof window.onSessionLoaded === 'undefined') {
  window.onSessionLoaded = function() {
    console.log('🔧 Session loaded, applying fixes...');
    fixAppRenderOnLogin();
  };
} else {
  const original = window.onSessionLoaded;
  window.onSessionLoaded = function() {
    original();
    console.log('🔧 Session loaded, applying fixes...');
    fixAppRenderOnLogin();
  };
}
