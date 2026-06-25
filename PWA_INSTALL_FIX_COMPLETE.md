# PWA Install Prompt - Complete Fix ✅

## Problem
Users were not seeing the "Install / Cancel" popup when clicking:
1. **Install App button** in Settings page
2. **Logo bubble** at top of PIN entry page

## Root Cause
The beforeinstallprompt event was not being prevented properly, preventing the event from being captured and stored for manual triggering.

## Solution

### 1. **Capture beforeinstallprompt Event** (auth.js)
```javascript
window.deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault(); // MUST prevent to capture
    window.deferredPrompt = event;
    console.log('📦 deferredPrompt captured');
});
```

### 2. **Install App Button Handler** (app.js - renderSettings)
```javascript
installBtn.addEventListener('click', async () => {
    if (!window.deferredPrompt) {
        showToast('Install feature not available', 'info');
        return;
    }
    
    await window.deferredPrompt.prompt();
    const { outcome } = await window.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        showToast('App installed successfully!', 'success');
    }
    window.deferredPrompt = null;
});
```

### 3. **Logo Bubble Handler** (index.html)
```javascript
if (logoBubbleContainer) {
    makeDraggable(logoBubbleContainer, async function (e) {
        // Skip PIN inputs
        if (e.target?.classList.contains('pin-digit-input')) return;
        
        if (window.deferredPrompt) {
            await window.deferredPrompt.prompt();
            const { outcome } = await window.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('✅ App installed');
            }
            window.deferredPrompt = null;
        }
    });
}
```

## How It Works

1. **Browser fires beforeinstallprompt** → We prevent default and store the event
2. **User clicks Install button OR logo bubble** → We manually call `prompt()`
3. **Browser shows Install / Cancel dialog** → User chooses
4. **If accepted** → App installs to home screen
5. **If cancelled** → User sees cancellation message

## Files Modified
- `kaasflow/frontend/auth.js` - Capture beforeinstallprompt
- `kaasflow/frontend/app.js` - Install button handler
- `kaasflow/frontend/index.html` - Logo bubble handler

## Testing Checklist
✅ Click "Install App" button in Settings
   → Should show "Install / Cancel" dialog
✅ Click logo bubble on PIN page
   → Should show "Install / Cancel" dialog
✅ Click "Install" in either dialog
   → App should install to home screen
✅ Click "Cancel"
   → Dialog closes, no action
✅ PIN inputs still work
   → No popups on PIN entry

## Key Points
- beforeinstallprompt MUST be prevented to be captured
- deferredPrompt is stored globally (window.deferredPrompt)
- Manual trigger with .prompt() shows the browser's native dialog
- PIN inputs are protected from triggering install
