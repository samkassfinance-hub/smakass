/**
 * ═══════════════════════════════════════════════════════════════════
 * SamKass PWA Install Handler
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
    console.log('[PWA] App already running in standalone mode');
  }
  
  return isAppInstalled;
}

/**
 * Capture beforeinstallprompt event EARLY (before any user interaction)
 */
window.addEventListener('beforeinstallprompt', (event) => {
  console.log('[PWA] ✅ beforeinstallprompt event captured!');
  event.preventDefault(); // Prevent auto-prompt
  deferredPrompt = event;
  console.log('[PWA] Deferred prompt stored, ready for manual trigger');
});

/**
 * Listen for app installation
 */
window.addEventListener('appinstalled', () => {
  console.log('[PWA] ✅ App installed successfully');
  deferredPrompt = null;
  isAppInstalled = true;
  
  // Optionally hide install buttons
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
  });
}

/**
 * MAIN: Handle install button clicks
 * Shows native prompt if available, otherwise iOS fallback
 */
async function handleInstallClick() {
  console.log('[PWA] Install button clicked');
  console.log('[PWA] deferredPrompt available:', !!deferredPrompt);
  console.log('[PWA] isAppInstalled:', isAppInstalled);

  // Check if already installed
  if (checkIfAlreadyInstalled()) {
    showToast?.('SamKass is already installed on your device! 📱', 'info');
    return;
  }

  // If native prompt is available, show it
  if (deferredPrompt) {
    try {
      console.log('[PWA] Showing native install prompt...');
      await deferredPrompt.prompt();
      
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] User choice:', outcome);

      if (outcome === 'accepted') {
        console.log('[PWA] ✅ User accepted install');
        showToast?.('Installing SamKass...', 'success');
      } else {
        console.log('[PWA] User dismissed install');
        showToast?.('Install cancelled', 'info');
      }

      // Reset after use
      deferredPrompt = null;
    } catch (error) {
      console.error('[PWA] Error showing native prompt:', error);
      showIOSInstallModal();
    }
  } else {
    // Fallback: Show iOS/unsupported browser instructions
    console.log('[PWA] Native prompt not available, showing fallback modal');
    showIOSInstallModal();
  }
}

/**
 * Show iOS/Unsupported Browser Fallback Modal
 * Clean UI matching SamKass green theme
 */
function showIOSInstallModal() {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
  
  console.log('[PWA] Showing install instructions modal (iOS=' + isIOS + ')');

  const overlayId = 'pwa-install-modal-overlay';
  
  // Check if already open
  if (document.getElementById(overlayId)) {
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

  if (isIOS) {
    modal.innerHTML = `
      <div style="text-align: center;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #16a34a; margin-bottom: 12px;">
          <i class="fa-solid fa-download" style="margin-right: 8px;"></i>Install SamKass
        </h2>
        <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 20px; line-height: 1.6;">
          Add SamKass to your home screen for quick access
        </p>
        <div style="background: #f3f4f6; border-radius: 12px; padding: 16px; text-align: left; margin-bottom: 20px;">
          <p style="font-size: 0.875rem; color: #374151; margin-bottom: 12px; font-weight: 600;">Steps:</p>
          <ol style="margin: 0; padding-left: 20px; font-size: 0.875rem; color: #4b5563; line-height: 1.8;">
            <li>Tap the <strong>Share</strong> button (↑) at the bottom</li>
            <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
            <li>Tap <strong>Add</strong> to confirm</li>
          </ol>
        </div>
        <button onclick="document.getElementById('${overlayId}').remove()" 
                style="width: 100%; padding: 12px 24px; background: #16a34a; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1rem;">
          Got it!
        </button>
      </div>
    `;
  } else {
    // Android / Chrome instructions
    modal.innerHTML = `
      <div style="text-align: center;">
        <h2 style="font-size: 1.5rem; font-weight: 700; color: #16a34a; margin-bottom: 12px;">
          <i class="fa-solid fa-download" style="margin-right: 8px;"></i>Install SamKass
        </h2>
        <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 20px; line-height: 1.6;">
          Install SamKass as an app on your device
        </p>
        <div style="background: #f3f4f6; border-radius: 12px; padding: 16px; text-align: left; margin-bottom: 20px;">
          <p style="font-size: 0.875rem; color: #374151; margin-bottom: 12px; font-weight: 600;">To install:</p>
          <ul style="margin: 0; padding-left: 20px; font-size: 0.875rem; color: #4b5563; line-height: 1.8; list-style: none;">
            <li style="margin-bottom: 8px;"><strong>Chrome/Edge:</strong> Tap menu (⋮) → Install app</li>
            <li style="margin-bottom: 8px;"><strong>Firefox:</strong> Tap menu (⋮) → Install</li>
            <li style="margin-bottom: 8px;"><strong>Samsung:</strong> Tap menu (⋮) → Install app</li>
          </ul>
        </div>
        <button onclick="document.getElementById('${overlayId}').remove()" 
                style="width: 100%; padding: 12px 24px; background: #16a34a; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1rem;">
          Got it!
        </button>
      </div>
    `;
  }

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Add animation style
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
}

/**
 * Register service worker (required for PWA)
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(reg => {
          console.log('[SW] ✅ Service Worker registered:', reg.scope);
        })
        .catch(err => {
          console.warn('[SW] ⚠️ Service Worker registration failed:', err);
        });
    });
  } else {
    console.warn('[SW] Service Workers not supported');
  }
}

/**
 * Initialize PWA on page load
 */
function initPWA() {
  console.log('[PWA] Initializing PWA module');
  
  // Register service worker
  registerServiceWorker();
  
  // Check if already installed
  checkIfAlreadyInstalled();
  
  // Wire up install buttons
  const installButtons = document.querySelectorAll('[data-pwa-install-btn]');
  installButtons.forEach(btn => {
    btn.addEventListener('click', handleInstallClick);
    console.log('[PWA] Wired install button:', btn.id || btn.className);
  });

  if (installButtons.length === 0) {
    console.warn('[PWA] No install buttons found with [data-pwa-install-btn] attribute');
  }

  console.log('[PWA] ✅ PWA module ready');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPWA);
} else {
  initPWA();
}

// Export for use in other scripts
window.PWAInstall = {
  handleInstallClick,
  showIOSInstallModal,
  checkIfAlreadyInstalled,
  getDeferredPrompt: () => deferredPrompt,
  isInstalled: () => isAppInstalled
};

console.log('[PWA] ✅ PWA install module loaded');
