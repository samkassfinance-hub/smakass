/**
 * PIN Security Enhancement Patch
 * This file contains the corrected PIN setup and unlock handlers
 * to be integrated into app.js
 */

// ═══════════════════════════════════════════════════════════════════
// STEP 1: Fix the duplicate $ declaration in app.js around line 520
// ═══════════════════════════════════════════════════════════════════
// CHANGE THIS:
//   const $ = (sel, ctx = document) => ctx.querySelector(sel);
//   const $ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
//
// TO THIS:
//   const $ = (sel, ctx = document) => ctx.querySelector(sel);
//   const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ═══════════════════════════════════════════════════════════════════
// STEP 2: Replace PIN Setup Handler (around line 3990)
// ═══════════════════════════════════════════════════════════════════
// Replace the existing $('#btn-confirm-pin')?.addEventListener() with:

$('#btn-confirm-pin')?.addEventListener('click', async () => {
  const inputs = $$('#pin-setup-inputs .pin-digit-input');
  const pin = Array.from(inputs).map(i => i.value).join('');
  const errEl = $('#pin-setup-error');
  
  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    errEl.textContent = 'Enter a valid 4-digit PIN';
    errEl.classList.remove('d-none');
    inputs.forEach(i => i.classList.add('shake'));
    setTimeout(() => inputs.forEach(i => i.classList.remove('shake')), 500);
    return;
  }
  
  // Check for weak PIN
  if (PINManager.isWeakPIN(pin)) {
    errEl.textContent = 'Weak PIN! Avoid 1234, 0000, sequential or repeating digits';
    errEl.classList.remove('d-none');
    inputs.forEach(i => i.classList.add('shake'));
    setTimeout(() => inputs.forEach(i => i.classList.remove('shake')), 500);
    return;
  }
  
  // Hash the PIN before storing
  const pinHash = await simpleHash(pin);
  
  // Save hashed PIN
  const s = Store.settings();
  s.appPinHash = pinHash;
  // Remove legacy appPin
  delete s.appPin;
  Store.saveSettings(s);
  
  // Initialize SecureStore with encryption
  await SecureStore.initialize(pin);
  
  // Sync to backend
  const sessionUser = getSession()?.user;
  if (sessionUser && sessionUser.email) {
    apiAuth('set-pin', { email: sessionUser.email, pin: pin }).catch(e => console.error(e));
  }
  if (window.KFSync) {
    KFSync.backup(true);
  }
  
  // Show success animation
  inputs.forEach(i => i.classList.add('success'));
  showToast('🔒 Security PIN set successfully!', 'success');
  setTimeout(() => showApp(), 600);
});

// ═══════════════════════════════════════════════════════════════════
// STEP 3: Replace PIN Unlock Handler (around line 4020)
// ═══════════════════════════════════════════════════════════════════
// Replace the existing $('#btn-unlock-pin')?.addEventListener() with:

$('#btn-unlock-pin')?.addEventListener('click', async () => {
  const inputs = $$('#pin-lock-inputs .pin-digit-input');
  const pin = Array.from(inputs).map(i => i.value).join('');
  const errEl = $('#pin-lock-error');
  const s = Store.settings();
  const savedPinHash = s.appPinHash;
  const savedPin = s.appPin; // Legacy support
  
  if (pin.length !== 4) {
    errEl.textContent = 'Enter your 4-digit PIN';
    errEl.classList.remove('d-none');
    return;
  }
  
  // Check lockout
  if (PINManager.isLockedOut()) {
    const remaining = PINManager.getLockoutTimeRemaining();
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    errEl.textContent = `Locked. Try again in ${minutes}m ${seconds}s`;
    errEl.classList.remove('d-none');
    return;
  }
  
  // Verify PIN (hash or legacy)
  let isCorrect = false;
  if (savedPinHash) {
    const enteredHash = await simpleHash(pin);
    isCorrect = (enteredHash === savedPinHash);
  } else if (savedPin) {
    isCorrect = (pin === savedPin);
  }
  
  if (!isCorrect) {
    const lockedOut = PINManager.recordFailedAttempt();
    if (lockedOut) {
      errEl.textContent = 'Too many attempts. Locked for 5 minutes.';
    } else {
      const remaining = PINManager.getAttemptsRemaining();
      errEl.textContent = `Incorrect PIN. ${remaining} attempt(s) remaining`;
    }
    errEl.classList.remove('d-none');
    inputs.forEach(i => { i.classList.add('shake'); i.value = ''; });
    setTimeout(() => { inputs.forEach(i => i.classList.remove('shake')); if (inputs[0]) inputs[0].focus(); }, 500);
    return;
  }
  
  // PIN correct!
  PINManager.clearAttempts();
  errEl.classList.add('d-none');
  
  // Initialize SecureStore with encryption
  await SecureStore.initialize(pin);
  
  inputs.forEach(i => i.classList.add('success'));
  setTimeout(() => showApp(), 400);
});

// ═══════════════════════════════════════════════════════════════════
// STEP 4: Update hasPin() and getPin() functions (around line 714)
// ═══════════════════════════════════════════════════════════════════
// Replace the existing hasPin() and getPin() functions with:

function hasPin() {
  const s = Store.settings();
  return !!(s && (s.appPinHash || s.appPin) && (s.appPinHash || s.appPin.length === 4));
}

function getPin() {
  const s = Store.settings();
  // Return legacy PIN if it exists (for backward compatibility)
  return s.appPin || null;
}
