/**
 * ═══════════════════════════════════════════════════════════════════
 * SamKass PWA Install Handler - UNIFIED & RELIABLE
 * Manages native browser install prompts + iOS fallback
 * ═══════════════════════════════════════════════════════════════════
 */

// Global PWA state
let deferredPrompt = null;
let isAppInstalled = false;

console.log('[PWA] Initializing install handler...');

/**
 * Detect if app is already installed (standalone mode)
 */
function checkIfAlreadyInstalled() {
  isAppInstalled = window.matchMedia('(display-mode: standalone)').matches 
    || window.navigator.standalone === true;
  
  if (isAppInstalled) {
    console.log('[PWA] ✅ App already running in standalone mode');
  }
  
  return isAppInstalled;
}

/**
 * CRITICAL: Capture beforeinstallprompt event EARLY - ONLY ONCE
 * This must run as early as possible and only register once
 */
(function setupInstallPromptListener() {
  if (window.PWA_INSTALL_LISTENER_SET) {
    console.log('[PWA] ℹ️ beforeinstallprompt listener already registered');
    return;
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    console.log('[PWA] ✅✅✅ beforeinstallprompt event FIRED ✅✅✅');
    event.preventDefault(); // Prevent auto-prompt
    deferredPrompt = event;
    console.log('[PWA] ✅ Deferred prompt STORED - ready for manual trigger');
    console.log('[PWA] Event object:', event);
  });

  window.PWA_INSTALL_LISTENER_SET = true;
  console.log('[PWA] ✅ beforeinstallprompt listener registered (ONCE)');
})();

/**
 * Listen for app installation
 */
window.addEventListener('appinstalled', () => {
  console.log('[PWA] ✅ APP INSTALLED EVENT - User successfully installed app!');
  deferredPrompt = null;
  isAppInstalled = true;
  hideInstallButtons();
});

/**
 * Hide install buttons if app is already installed
 */
function hideInstallButtons() {
  const buttons = document.querySelectorAll('[data-pwa-install-btn]');
  buttons.forEach(btn => {
    btn.innerHTML = '<i class="fa-solid fa-check me-2"></i>App Installed';
    btn.disabled = true;
    btn.style.opacity = '0.6';
    btn.style.cursor = 'default';
  });
}

/**
 * MAIN: Handle install button clicks - RELIABLE & PROVEN
 * Shows native prompt if available, otherwise iOS fallback
 * This works from ANY trigger point (logo, settings button, etc)
 */
async function handleInstallClick() {
  console.log('[PWA] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[PWA] Install trigger CLICKED');
  console.log('[PWA] Current state:');
  console.log('  - deferredPrompt available:', !!deferredPrompt);
  console.log('  - isAppInstalled:', isAppInstalled);
  console.log('  - display-mode standalone:', window.matchMedia('(display-mode: standalone)').matches);
  console.log('  - navigator.standalone:', window.navigator.standalone);
  console.log('[PWA] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Check if already installed
  if (checkIfAlreadyInstalled()) {
    console.log('[PWA] ℹ️ App already installed, showing message');
    showToast?.('✅ SamKass is already installed on your device!', 'info');
    return;
  }

  // If native prompt is available, show it
  if (deferredPrompt) {
    try {
      console.log('[PWA] 🎯 Showing native install prompt...');
      
      // Call prompt()
      await deferredPrompt.prompt();
      console.log('[PWA] ✅ prompt() called successfully');
      
      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] 📊 User choice:', outcome);

      if (outcome === 'accepted') {
        console.log('[PWA] ✅✅✅ User ACCEPTED install - starting installation...');
        showToast?.('📱 Installing SamKass...', 'success');
        deferredPrompt = null; // Reset after use
        isAppInstalled = true;
      } else if (outcome === 'dismissed') {
        console.log('[PWA] ℹ️ User dismissed the install prompt');
        showToast?.('✋ Install prompt dismissed', 'info');
        deferredPrompt = null; // Can prompt again later
      }
    } catch (error) {
      console.error('[PWA] ❌ Error showing native prompt:', error);
      console.log('[PWA] Showing iOS/unsupported fallback modal instead');
      showIOSInstallModal();
    }
  } else {
    // Fallback: Show iOS/unsupported browser instructions
    console.log('[PWA] ℹ️ Native prompt not available');
    console.log('[PWA] Reasons: App may already be installed, browser unsupported, or event not captured');
    console.log('[PWA] Showing installation instructions modal...');
    showIOSInstallModal();
  }
}

/**
 * Show iOS/Unsupported Browser Fallback Modal
 * Displays appropriate instructions for the user's device/browser
 */
function showIOSInstallModal() {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
  const isAndroid = /android/i.test(navigator.userAgent.toLowerCase());
  
  console.log('[PWA] 📱 Showing install instructions modal');
  console.log('[PWA]   - iOS detected:', isIOS);
  console.log('[PWA]   - Android detected:', isAndroid);
  console.log('[PWA]   - User agent:', navigator.userAgent);

  const overlayId = 'pwa-install-modal-overlay';
  
  // Don't create duplicate modals
  if (document.getElementById(overlayId)) {
    console.log('[PWA] Modal already open, skipping');
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = overlayId;
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 9999;
    animation: slideUp 0.3s ease-out;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white;
    border-radius: 20px 20px 0 0;
    padding: 24px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
    animation: slideUp 0.3s ease-out;
  `;

  let instructionHTML = '';

  if (isIOS) {
    instructionHTML = `
      <div style="text-align: center;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #059669; margin-bottom: 12px;">
          <i class="fa-solid fa-download" style="margin-right: 8px;"></i>Install SamKass
        </h2>
        <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 20px; line-height: 1.6;">
          Add SamKass to your home screen for quick access and offline use
        </p>
        <div style="background: #f0fdf4; border-left: 4px solid #059669; border-radius: 8px; padding: 16px; text-align: left; margin-bottom: 20px;">
          <p style="font-size: 0.875rem; color: #374151; margin: 0 0 12px 0; font-weight: 600;">📲 Steps to Install:</p>
          <ol style="margin: 0; padding-left: 20px; font-size: 0.875rem; color: #4b5563; line-height: 2;">
            <li><strong>Tap the Share button</strong> (↑) at the bottom of Safari</li>
            <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
            <li>Tap <strong>"Add"</strong> in the top-right corner</li>
            <li>SamKass will now appear on your home screen!</li>
          </ol>
        </div>
        <button onclick="document.getElementById('${overlayId}').remove()" 
                style="width: 100%; padding: 14px 24px; background: #059669; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1rem; transition: background 0.2s;">
          ✓ Got it!
        </button>
      </div>
    `;
  } else {
    // Android or other browsers
    instructionHTML = `
      <div style="text-align: center;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #059669; margin-bottom: 12px;">
          <i class="fa-solid fa-download" style="margin-right: 8px;"></i>Install SamKass
        </h2>
        <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 20px; line-height: 1.6;">
          Install SamKass as an app on your device for faster access
        </p>
        <div style="background: #f0fdf4; border-left: 4px solid #059669; border-radius: 8px; padding: 16px; text-align: left; margin-bottom: 20px;">
          <p style="font-size: 0.875rem; color: #374151; margin: 0 0 12px 0; font-weight: 600;">📲 Installation Methods:</p>
          <div style="font-size: 0.875rem; color: #4b5563; line-height: 1.8;">
            <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #dbeafe;">
              <strong>✓ Chrome / Edge (Recommended)</strong><br>
              Tap the menu (⋮) → <strong>"Install app"</strong>
            </div>
            <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #dbeafe;">
              <strong>✓ Firefox</strong><br>
              Tap the menu (⋮) → <strong>"Install"</strong>
            </div>
            <div>
              <strong>✓ Samsung Browser</strong><br>
              Tap the menu (⋮) → <strong>"Install app"</strong>
            </div>
          </div>
        </div>
        <button onclick="document.getElementById('${overlayId}').remove()" 
                style="width: 100%; padding: 14px 24px; background: #059669; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1rem; transition: background 0.2s;">
          ✓ Got it!
        </button>
      </div>
    `;
  }

  modal.innerHTML = instructionHTML;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Add animation style if not already present
  if (!document.getElementById('pwa-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'pwa-modal-styles';
    style.textContent = `
      @keyframes slideUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  console.log('[PWA] ✅ Install instructions modal displayed');
}

/**
 * Register service worker (REQUIRED for PWA to work)
 * This enables offline functionality and app installation
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Delay slightly to ensure page is ready
    setTimeout(() => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(reg => {
          console.log('[SW] ✅ Service Worker registered successfully');
          console.log('[SW]   Scope:', reg.scope);
          console.log('[SW]   Installation status:', reg.installing ? 'installing' : 'ready');
        })
        .catch(err => {
          console.warn('[SW] ⚠️ Service Worker registration failed');
          console.warn('[SW]   Error:', err.message);
          console.warn('[SW]   Note: PWA install may not work without Service Worker');
        });
    }, 1000);
  } else {
    console.warn('[SW] ⚠️ Service Workers not supported in this browser');
  }
}

/**
 * Initialize PWA on page load
 * Sets up all event listeners and button handlers
 */
function initPWA() {
  console.log('[PWA] ╔════════════════════════════════════════════╗');
  console.log('[PWA] ║        PWA INITIALIZATION STARTED         ║');
  console.log('[PWA] ╚════════════════════════════════════════════╝');
  
  // Register service worker
  registerServiceWorker();
  
  // Check if already installed
  checkIfAlreadyInstalled();
  
  // Wire up install buttons
  const installButtons = document.querySelectorAll('[data-pwa-install-btn]');
  console.log('[PWA] 🔍 Found', installButtons.length, 'install button(s)');
  
  installButtons.forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log(`[PWA] Install button #${index + 1} clicked:`, btn.id || btn.className);
      handleInstallClick();
    });
    console.log(`[PWA] ✅ Button #${index + 1} registered:`, btn.id || 'no-id', btn.className);
  });

  if (installButtons.length === 0) {
    console.warn('[PWA] ⚠️ No install buttons found with [data-pwa-install-btn] attribute');
  }

  // Debug info
  console.log('[PWA] ─────────────────────────────────────────');
  console.log('[PWA] Environment Check:');
  console.log('  - beforeinstallprompt supported:', 'beforeinstallprompt' in window);
  console.log('  - Service Worker support:', 'serviceWorker' in navigator);
  console.log('  - Platform:', navigator.platform);
  console.log('  - User Agent:', navigator.userAgent.substring(0, 60) + '...');
  console.log('[PWA] ─────────────────────────────────────────');
  console.log('[PWA] ✅ PWA module initialized and ready!');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  console.log('[PWA] DOM still loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[PWA] DOMContentLoaded fired, initializing...');
    initPWA();
  });
} else {
  console.log('[PWA] DOM already loaded, initializing immediately...');
  initPWA();
}

// Also try to initialize after a short delay to catch any edge cases
setTimeout(() => {
  if (!window.PWA_INIT_COMPLETE) {
    console.log('[PWA] Fallback initialization check...');
    initPWA();
  }
}, 2000);

// Mark as initialized
window.addEventListener('DOMContentLoaded', () => {
  window.PWA_INIT_COMPLETE = true;
});

// Export for use in other scripts
window.PWAInstall = {
  handleInstallClick,
  showIOSInstallModal,
  checkIfAlreadyInstalled,
  getDeferredPrompt: () => deferredPrompt,
  isInstalled: () => isAppInstalled,
  debug: {
    state: () => ({
      deferredPrompt: !!deferredPrompt,
      isAppInstalled,
      beforeinstallpromptSupported: 'beforeinstallprompt' in window,
      serviceWorkerSupported: 'serviceWorker' in navigator
    })
  }
};

console.log('[PWA] ✅ PWA install module LOADED and READY');

