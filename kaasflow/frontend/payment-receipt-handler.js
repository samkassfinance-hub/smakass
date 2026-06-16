/**
 * Payment Receipt Handler - Generates and downloads PDF receipts after payment
 * Shows receipt details and download button after successful payment
 */

(function() {
  'use strict';

  window.PaymentReceiptHandler = {
    
    /**
     * Show receipt popup after successful payment
     */
    showReceiptPopup(paymentData) {
      const {
        plan_name = 'Plan',
        plan_type = 'unknown',
        payment_id = '',
        amount = 0,
        payment_time = new Date().toISOString()
      } = paymentData;

      const amount_rupees = (amount / 100).toFixed(2);

      // Parse payment time
      let formatted_time = 'Just now';
      try {
        const dt = new Date(payment_time);
        formatted_time = dt.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        console.warn('⚠️ Could not parse payment time:', e);
      }

      // Create modal HTML
      const modalHTML = `
        <div class="modal fade" id="paymentReceiptModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
          <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content kf-modal-content">
              <!-- Header -->
              <div class="modal-header" style="border-bottom: 2px solid var(--color-success); background: linear-gradient(135deg, rgba(76,175,80,0.1), rgba(124,211,33,0.1));">
                <div>
                  <h5 class="modal-title" style="color: var(--color-success); font-weight: 700; margin-bottom: 0;">
                    <i class="fa-solid fa-circle-check me-2"></i>Payment Successful!
                  </h5>
                  <small style="color: var(--kf-text-muted);">Your subscription is now active</small>
                </div>
                <button type="button" class="btn-close kf-btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>

              <!-- Body -->
              <div class="modal-body" style="padding: 2rem;">
                <!-- Success Icon -->
                <div style="text-align: center; margin-bottom: 1.5rem;">
                  <div style="font-size: 4rem; color: var(--color-success); margin-bottom: 1rem;">
                    <i class="fa-solid fa-check-circle"></i>
                  </div>
                </div>

                <!-- Receipt Details -->
                <div style="background: var(--kf-card); border: 1px solid var(--kf-divider); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                  
                  <!-- Plan Info -->
                  <div style="margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--kf-divider);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                      <div>
                        <div style="font-size: 0.85rem; color: var(--kf-text-muted); margin-bottom: 0.25rem;">Plan</div>
                        <div style="font-size: 1.1rem; font-weight: 600; color: var(--kf-text);">${plan_name}</div>
                      </div>
                      <div>
                        <div style="font-size: 0.85rem; color: var(--kf-text-muted); margin-bottom: 0.25rem;">Amount Paid</div>
                        <div style="font-size: 1.1rem; font-weight: 600; color: var(--color-success);">₹${amount_rupees}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Transaction Info -->
                  <div style="margin-bottom: 1.5rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                      <div>
                        <div style="font-size: 0.85rem; color: var(--kf-text-muted); margin-bottom: 0.25rem;">Transaction ID</div>
                        <div style="font-size: 0.95rem; color: var(--kf-text); font-family: monospace; word-break: break-all;">${payment_id}</div>
                      </div>
                      <div>
                        <div style="font-size: 0.85rem; color: var(--kf-text-muted); margin-bottom: 0.25rem;">Date & Time</div>
                        <div style="font-size: 0.95rem; color: var(--kf-text);">${formatted_time} IST</div>
                      </div>
                    </div>
                  </div>

                  <!-- Features List -->
                  <div style="margin-bottom: 1rem;">
                    <div style="font-size: 0.85rem; color: var(--kf-text-muted); margin-bottom: 0.75rem; font-weight: 600;">Included Features:</div>
                    <ul style="margin: 0; padding-left: 1.5rem; list-style: none;">
                      <li style="margin-bottom: 0.5rem; color: var(--kf-text);">
                        <i class="fa-solid fa-check" style="color: var(--color-success); margin-right: 0.5rem;"></i>
                        Unlimited client additions
                      </li>
                      <li style="margin-bottom: 0.5rem; color: var(--kf-text);">
                        <i class="fa-solid fa-check" style="color: var(--color-success); margin-right: 0.5rem;"></i>
                        All premium features unlocked
                      </li>
                      <li style="margin-bottom: 0.5rem; color: var(--kf-text);">
                        <i class="fa-solid fa-check" style="color: var(--color-success); margin-right: 0.5rem;"></i>
                        Full app access until expiry
                      </li>
                      <li style="color: var(--kf-text);">
                        <i class="fa-solid fa-check" style="color: var(--color-success); margin-right: 0.5rem;"></i>
                        Collection mode & WhatsApp reminders
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Download Receipt Button -->
                <button type="button" class="btn-kf-primary w-100 py-3" id="btn-download-receipt" style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem;">
                  <i class="fa-solid fa-download me-2"></i>Download Receipt (PDF)
                </button>

                <!-- Continue Button -->
                <button type="button" class="btn-kf-outline w-100 py-2" data-bs-dismiss="modal" style="color: var(--kf-text-muted); border-color: var(--kf-divider);">
                  Continue to App
                </button>
              </div>

              <!-- Footer -->
              <div class="modal-footer" style="border-top: 1px solid var(--kf-divider); background: var(--kf-card-secondary);">
                <small style="color: var(--kf-text-muted);">
                  <i class="fa-solid fa-lock me-1"></i>
                  Your payment is secure. Receipt emailed to your registered email.
                </small>
              </div>
            </div>
          </div>
        </div>
      `;

      // Remove existing modal if present
      const existing = document.getElementById('paymentReceiptModal');
      if (existing) existing.remove();

      // Insert modal
      document.body.insertAdjacentHTML('beforeend', modalHTML);

      // Show modal
      const modal = new bootstrap.Modal(document.getElementById('paymentReceiptModal'));
      modal.show();

      // Setup download button
      document.getElementById('btn-download-receipt').addEventListener('click', async () => {
        await this.downloadReceiptPDF({
          plan_type,
          payment_id,
          amount
        });
      });

      // Store payment data for receipt generation
      this.lastPaymentData = {
        plan_type,
        payment_id,
        amount,
        plan_name,
        payment_time
      };
    },

    /**
     * Download receipt as PDF
     */
    async downloadReceiptPDF(data) {
      const btn = document.getElementById('btn-download-receipt');
      const originalContent = btn.innerHTML;
      
      try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Generating PDF...';

        const apiBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
          ? 'http://127.0.0.1:5000/api'
          : window.location.origin + '/api';

        const email = window.RazorpayPayment?.getUserEmail?.() || 
                     (JSON.parse(localStorage.getItem('kf_session') || '{}').user?.email);

        const headers = {
          'Content-Type': 'application/json',
          'X-User-Email': email
        };

        const token = window.RazorpayPayment?.getSessionToken?.();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Request PDF from server
        const res = await fetch(`${apiBase}/subscription/download-receipt`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
          signal: AbortSignal.timeout(15000)
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        // Get PDF blob
        const blob = await res.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SamKass_Receipt_${data.plan_type}_${Date.now()}.pdf`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Show success message
        if (typeof showToast === 'function') {
          showToast('✅ Receipt downloaded successfully!', 'success');
        }

        btn.innerHTML = '<i class="fa-solid fa-check me-2"></i>Downloaded!';
        setTimeout(() => {
          btn.disabled = false;
          btn.innerHTML = originalContent;
        }, 2000);

      } catch (e) {
        console.error('❌ Receipt download error:', e);
        
        if (typeof showToast === 'function') {
          showToast('❌ Failed to download receipt: ' + e.message, 'error');
        }

        btn.disabled = false;
        btn.innerHTML = originalContent;
      }
    }
  };

})();

console.log('✅ payment-receipt-handler.js loaded');
