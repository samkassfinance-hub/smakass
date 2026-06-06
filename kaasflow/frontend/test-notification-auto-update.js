/**
 * Test script for notification auto-update functionality
 * Run in browser console to test
 */

(function() {
  'use strict';

  // Test function to simulate payment recorded message
  async function testAutoUpdate() {
    console.log('🧪 TEST: Starting auto-update test...');
    
    // Check if service worker is available
    if (!('serviceWorker' in navigator)) {
      console.error('❌ Service Worker not supported');
      return;
    }
    
    // Get service worker registration
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.error('❌ No service worker registered');
      return;
    }
    
    console.log('✅ Service Worker found:', registration.scope);
    
    // Simulate receiving a PAYMENT_RECORDED message from service worker
    console.log('📨 Simulating PAYMENT_RECORDED message from SW...');
    
    // Trigger the message handler
    const mockMessage = {
      type: 'PAYMENT_RECORDED',
      action: 'paid',
      loan_id: 'test-loan-123',
      client_name: 'Test Client',
      amount: 5000,
      result: { success: true, message: 'Payment marked as PAID' }
    };
    
    // Dispatch event to test message handling
    const event = new MessageEvent('message', {
      data: mockMessage,
      source: registration.active
    });
    
    // Trigger the event listener
    navigator.serviceWorker.dispatchEvent(event);
    
    console.log('✅ Test message dispatched. Check console for app response.');
    
    // Also test the updatePaymentData function directly
    console.log('\n🧪 Testing updatePaymentData function directly...');
    
    // Check if the function exists
    if (typeof window.updatePaymentData === 'function') {
      console.log('✅ updatePaymentData function found');
      
      // Create a test loan if needed
      const loans = window.Store?.loans();
      if (!loans || loans.length === 0) {
        console.log('⚠️ No loans found, creating test loan...');
        const testLoan = {
          id: 'test-loan-123',
          principal: 10000,
          interestRate: 10,
          interestType: 'percentage',
          duration: 12,
          type: 'monthly',
          status: 'active',
          clientId: 'test-client-123'
        };
        
        if (window.Store?.saveLoans) {
          window.Store.saveLoans([testLoan]);
          console.log('✅ Test loan created');
        }
      }
      
      // Call the function
      window.updatePaymentData('test-loan-123', 'paid', 5000);
      console.log('✅ updatePaymentData called successfully');
    } else {
      console.error('❌ updatePaymentData function not found');
    }
  }
  
  // Test function to check notification action support
  function testNotificationSupport() {
    console.log('\n🔍 Checking notification support...');
    
    if (!('Notification' in window)) {
      console.error('❌ Notifications not supported');
      return;
    }
    
    console.log('📱 Notification support:', true);
    console.log('📋 Permission:', Notification.permission);
    console.log('🔧 Max actions:', Notification.maxActions || 'Unknown');
    
    // Check service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        console.log('📝 SW Registrations:', regs.length);
        if (regs.length > 0) {
          console.log('📋 SW Scope:', regs[0].scope);
          console.log('📋 SW State:', regs[0].active ? 'Active' : 'Inactive');
        }
      });
    }
  }
  
  // Test function to send message to service worker
  async function testSWCommunication() {
    console.log('\n📡 Testing Service Worker communication...');
    
    if (!('serviceWorker' in navigator)) {
      console.error('❌ Service Worker not supported');
      return;
    }
    
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.active) {
      console.error('❌ No active service worker');
      return;
    }
    
    // Send a test message to service worker
    registration.active.postMessage({
      type: 'TEST_COMMUNICATION',
      message: 'Hello from app!',
      timestamp: new Date().toISOString()
    });
    
    console.log('✅ Test message sent to Service Worker');
  }
  
  // Expose test functions
  window.testNotificationAutoUpdate = {
    runAllTests: async () => {
      console.log('🚀 ===== NOTIFICATION AUTO-UPDATE TEST SUITE =====');
      await testNotificationSupport();
      await testSWCommunication();
      await testAutoUpdate();
      console.log('✅ ===== TEST SUITE COMPLETE =====');
    },
    testSupport: testNotificationSupport,
    testCommunication: testSWCommunication,
    testAutoUpdate: testAutoUpdate
  };
  
  console.log('✅ Test suite loaded. Type:');
  console.log('   testNotificationAutoUpdate.runAllTests() - Run all tests');
  console.log('   testNotificationAutoUpdate.testSupport() - Check notification support');
  console.log('   testNotificationAutoUpdate.testCommunication() - Test SW communication');
  console.log('   testNotificationAutoUpdate.testAutoUpdate() - Test auto-update');
  
})();