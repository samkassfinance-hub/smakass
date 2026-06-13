/**
 * Export localStorage Data for WhatsApp Automation
 * 
 * HOW TO USE:
 * 1. Open your webapp in browser (where your data is stored)
 * 2. Open Browser Console (Press F12, go to Console tab)
 * 3. Copy and paste this ENTIRE script
 * 4. Press Enter
 * 5. Script will download localStorage_backup.json file
 * 6. Move that file to kaasflow/backend/ folder
 */

(function exportLocalStorage() {
  console.log('📦 Exporting localStorage data...');
  
  const data = {
    kf_clients: JSON.parse(localStorage.getItem('kf_clients') || '[]'),
    kf_loans: JSON.parse(localStorage.getItem('kf_loans') || '[]'),
    kf_payments: JSON.parse(localStorage.getItem('kf_payments') || '[]'),
    kf_settings: JSON.parse(localStorage.getItem('kf_settings') || '{}'),
    exported_at: new Date().toISOString()
  };
  
  console.log(`✅ Clients: ${data.kf_clients.length}`);
  console.log(`✅ Loans: ${data.kf_loans.length}`);
  console.log(`✅ Payments: ${data.kf_payments.length}`);
  
  // Create download
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'localStorage_backup.json';
  a.click();
  
  console.log('✅ Downloaded: localStorage_backup.json');
  console.log('📁 Move this file to: kaasflow/backend/');
})();
