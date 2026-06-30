// ══════════════════════════════════════════════════════════════
// FORGOT PASSWORD OTP FLOW
// ══════════════════════════════════════════════════════════════

let resetPasswordEmail = '';
let resetPasswordToken = '';

// Handle OTP inputs typing for password reset
$$('.reset-password-otp-input').forEach(input => {
  input.addEventListener('input', (e) => {
    if (e.target.value.length > 1) e.target.value = e.target.value.slice(0, 1);
    if (e.target.value && e.target.dataset.idx < 5) {
      $$('.reset-password-otp-input')[parseInt(e.target.dataset.idx) + 1].focus();
    }
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !e.target.value && e.target.dataset.idx > 0) {
      $$('.reset-password-otp-input')[parseInt(e.target.dataset.idx) - 1].focus();
    }
    if (e.key === 'Enter') {
      const otpStr = $$('.reset-password-otp-input').map(i => i.value).join('');
      if(otpStr.length === 6) $('#btn-verify-password-otp')?.click();
    }
  });
});

// Step 1: Send OTP
$('#btn-send-password-otp')?.addEventListener('click', async () => {
  const email = $('#forgot-password-email').value.trim();
  
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email address', 'error');
    return;
  }
  
  resetPasswordEmail = email;
  
  const btn = $('#btn-send-password-otp');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
  
  try {
    const res = await apiAuth('forgot-password/send-otp', { email: resetPasswordEmail });
    
    if (res && res.success) {
      let message = 'OTP sent successfully to your email.';
      
      if (res.otp) {
        message = `⚠️ Email failed. Your OTP is: ${res.otp}`;
        console.log(`🔢 Password Reset OTP: ${res.otp}`);
        showToast(`OTP: ${res.otp} (Email delivery failed)`, 'warning', 8000);
      } else {
        showToast(message, 'success');
      }
      
      $('#forgot-password-step-1').style.display = 'none';
      $('#forgot-password-step-2').style.display = 'block';
      setTimeout(() => $$('.reset-password-otp-input')[0]?.focus(), 100);
    } else {
      showToast(res.error || 'Failed to send OTP', 'error');
    }
  } catch (err) {
    showToast('Error sending OTP', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Send OTP <i class="fa-solid fa-paper-plane ms-1"></i>';
  }
});

// Step 2: Verify OTP
$('#btn-verify-password-otp')?.addEventListener('click', async () => {
  const otp = $$('.reset-password-otp-input').map(i => i.value).join('');
  
  if (otp.length !== 6) {
    showToast('Please enter the 6-digit OTP', 'error');
    return;
  }
  
  const btn = $('#btn-verify-password-otp');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Verifying...';
  
  try {
    const res = await apiAuth('forgot-password/verify-otp', { email: resetPasswordEmail, otp: otp });
    
    if (res && res.success) {
      resetPasswordToken = res.reset_token;
      
      showToast('OTP verified successfully', 'success');
      $('#forgot-password-step-2').style.display = 'none';
      $('#forgot-password-step-3').style.display = 'block';
      setTimeout(() => $('#reset-new-password')?.focus(), 100);
    } else {
      showToast(res.error || 'Invalid OTP', 'error');
    }
  } catch (err) {
    showToast('Error verifying OTP', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Verify OTP <i class="fa-solid fa-check ms-1"></i>';
  }
});

// Step 3: Save New Password
$('#btn-save-new-password')?.addEventListener('click', async () => {
  const newPassword = $('#reset-new-password').value.trim();
  const confirmPassword = $('#reset-confirm-password').value.trim();
  
  if (!newPassword || newPassword.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }
  
  const btn = $('#btn-save-new-password');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
  
  try {
    const res = await apiAuth('reset-password', { 
      reset_token: resetPasswordToken, 
      new_password: newPassword 
    });
    
    if (res && res.success) {
      const modalEl = document.getElementById('forgotPasswordModal');
      bootstrap.Modal.getInstance(modalEl)?.hide();
      
      showToast('🔒 Password reset successfully!', 'success');
      
      if (res.token && res.user) {
        saveSessionIsolated(res.token, res.user);
        state.session = getSession();
        
        if (hasPin()) {
          showPinLock();
        } else {
          showPinSetup();
        }
      } else {
        setTimeout(() => showAuth(), 500);
      }
    } else {
      showToast(res.error || 'Failed to reset password', 'error');
    }
  } catch (err) {
    showToast('Error resetting password', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Reset Password <i class="fa-solid fa-check ms-1"></i>';
  }
});
