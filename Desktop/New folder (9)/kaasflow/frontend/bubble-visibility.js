/**
 * Bubble Visibility Controller
 * Controls when Install App and Tutorial bubbles should be visible
 * 
 * SHOW BUBBLES ON:
 * - Auth screen (login page)
 * - Registration/Signup page
 * - PIN Setup page
 * - PIN Lock/Re-entry page
 * 
 * HIDE BUBBLES ON:
 * - Home page (main app)
 * - Dashboard
 * - Clients page
 * - All interior app pages
 * - Settings page
 */

const BubbleVisibility = {
  // Configuration: Pages where bubbles should be visible
  visibleOnPages: [
    'auth-screen',        // Login page
    'pin-lock-screen',    // PIN lock/re-entry
    // Note: PIN setup is rendered in auth-screen
  ],

  // Get current active screen
  getCurrentScreen() {
    const screens = {
      'auth-screen': document.getElementById('auth-screen'),
      'pin-lock-screen': document.getElementById('pin-lock-screen'),
      'main-app': document.getElementById('main-app'),
      'loading-screen': document.getElementById('loading-screen'),
    };

    for (const [screenName, element] of Object.entries(screens)) {
      if (element && element.style.display !== 'none') {
        return screenName;
      }
    }
    return null;
  },

  // Check if bubbles should be visible on current screen
  shouldShowBubbles() {
    const currentScreen = this.getCurrentScreen();
    
    // Show bubbles on auth and PIN lock screens
    if (currentScreen === 'auth-screen' || currentScreen === 'pin-lock-screen') {
      return true;
    }
    
    // Hide on main app and other screens
    return false;
  },

  // Update bubble visibility
  updateBubbleVisibility() {
    const shouldShow = this.shouldShowBubbles();
    
    // Get bubble elements
    const logoBubbleContainer = document.getElementById('logo-bubble-container');
    const videoBubbleContainer = document.getElementById('video-bubble-container');
    
    if (logoBubbleContainer) {
      logoBubbleContainer.style.display = shouldShow ? 'flex' : 'none';
    }
    
    if (videoBubbleContainer) {
      videoBubbleContainer.style.display = shouldShow ? 'flex' : 'none';
    }

    console.log(`🫧 Bubbles visibility: ${shouldShow ? '✅ VISIBLE' : '❌ HIDDEN'} (Screen: ${this.getCurrentScreen()})`);
  },

  // Initialize - watch for screen changes
  init() {
    console.log('🫧 Initializing Bubble Visibility Controller...');
    
    // Initial check
    this.updateBubbleVisibility();
    
    // Watch for changes - use MutationObserver to detect display changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const element = mutation.target;
          // Check if any main screen's display property changed
          if (element.id === 'auth-screen' || 
              element.id === 'pin-lock-screen' || 
              element.id === 'main-app' ||
              element.id === 'loading-screen') {
            this.updateBubbleVisibility();
          }
        }
      }
    });

    // Observe all screen elements for changes
    const screens = [
      'auth-screen',
      'pin-lock-screen',
      'main-app',
      'loading-screen',
    ];

    screens.forEach(screenId => {
      const element = document.getElementById(screenId);
      if (element) {
        observer.observe(element, { attributes: true, attributeFilter: ['style'] });
      }
    });

    // Also hook into app functions that change screens
    // (as backup to MutationObserver)
    this.hookScreenFunctions();

    console.log('✅ Bubble Visibility Controller initialized');
  },

  // Hook into global screen functions
  hookScreenFunctions() {
    // Override showAuth if it exists
    if (typeof window.showAuth === 'function') {
      const originalShowAuth = window.showAuth;
      window.showAuth = function() {
        originalShowAuth.apply(this, arguments);
        BubbleVisibility.updateBubbleVisibility();
      };
    }

    // Override showPinSetup if it exists
    if (typeof window.showPinSetup === 'function') {
      const originalShowPinSetup = window.showPinSetup;
      window.showPinSetup = function() {
        originalShowPinSetup.apply(this, arguments);
        BubbleVisibility.updateBubbleVisibility();
      };
    }

    // Override showPinLock if it exists
    if (typeof window.showPinLock === 'function') {
      const originalShowPinLock = window.showPinLock;
      window.showPinLock = function() {
        originalShowPinLock.apply(this, arguments);
        BubbleVisibility.updateBubbleVisibility();
      };
    }

    // Override showApp if it exists
    if (typeof window.showApp === 'function') {
      const originalShowApp = window.showApp;
      window.showApp = async function() {
        await originalShowApp.apply(this, arguments);
        BubbleVisibility.updateBubbleVisibility();
      };
    }

    // Override navigateTo if it exists
    if (typeof window.navigateTo === 'function') {
      const originalNavigateTo = window.navigateTo;
      window.navigateTo = function(page) {
        originalNavigateTo.apply(this, arguments);
        // Delay slightly to ensure DOM is updated
        setTimeout(() => {
          BubbleVisibility.updateBubbleVisibility();
        }, 100);
      };
    }
  },
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    BubbleVisibility.init();
  });
} else {
  // DOM already loaded
  BubbleVisibility.init();
}

// Expose globally for debugging
window.BubbleVisibility = BubbleVisibility;

console.log('✅ bubble-visibility.js loaded');
