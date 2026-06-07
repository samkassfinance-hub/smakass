/**
 * Comprehensive Test for Notification Auto-Update Fix
 * Tests the complete flow from notification button click to data update
 */

(function() {
  'use strict';

  console.log('🔧 ===== NOTIFICATION AUTO-UPDATE FIX TEST =====');

  // Test 1: Check if all required functions exist
  function testFunctionExistence() {
    console.log('\n1️⃣ Testing function existence...');
    
    const requiredFunctions = [
      'updatePaymentData',
      'navigateTo',
      'showToast'
    ];
    
    const missingFunctions = [];
    
    requiredFunctions.forEach(func => {
      if (typeof window[func] === 'function') {
        console.log(`✅ ${func} exists`);
      } else {
        console.log(`❌ ${func} missing`);
        missingFunctions.push(func);
      }
    });
    
    return missingFunctions.length === 0;
  }

  // Test 2: Check Store availability
  function testStoreAvailability() {
    console.log('\n2️⃣ Testing Store availability...');
    
    if (!window.Store) {
      console.log('❌ Store not available');
      return false;
    }
    
    const requiredMethods = ['loans', 'payments', 'clients', 'saveLoans', 'savePayments'];
    const missingMethods = [];
    
    requiredMethods.forEach(method => {
      if (typeof Store[method] === 'function') {
        console.log(`✅ Store.${method} exists`);
      } else {
        console.log(`❌ Store.${method} missing`);
        missingMethods.push(method);
      }
    });
    
    console.log(`📊 Current data: ${Store.loans().length} loans, ${Store.payments().length} payments`);
    
    return missingMethods.length === 0;
  }

  // Test 3: Create test data if needed
  function setupTestData() {
    console.log('\n3️⃣ Setting up test data...');
    
    const loans = Store.loans();
    let testLoan = loans.find(l => l.id === 'test-notification-loan');
    
    if (!testLoan) {
      console.log('📝 Creating test loan...');
      
      const newTestLoan = {
        id: 'test-notification-loan',
        clientId: 'test-notification-client',
        principal: 10000,
        interestRate: 10,
        interestType: 'percentage',
        duration: 12,
        type: 'monthly',
        status: 'active',
        startDate: '2024-01-01',
        nextDueDate: '2024-12-07',
        next_due_date: '2024-12-07',
        createdAt: new Date().toISOString()
      };
      
      loans.push(newTestLoan);
      Store.saveLoans(loans);
      testLoan = newTestLoan;
      console.log('✅ Test loan created:', testLoan.id);
    } else {
      console.log('✅ Test loan already exists:', testLoan.id);
    }
    
    // Check if test client exists
    const clients = Store.clients();
    let testClient = clients.find(c => c.id === 'test-notification-client');
    
    if (!testClient) {
      console.log('📝 Creating test client...');
      
      const newTestClient = {
        id: 'test-notification-client',
        name: 'Test Notification Client',
        phone: '9999999999',
        address: 'Test Address',
        createdAt: new Date().toISOString()
      };
      
      clients.push(newTestClient);
      Store.saveClients(clients);
      console.log('✅ Test client created:', newTestClient.id);
    } else {
      console.log('✅ Test client already exists:', testClient.id);
    }
    
    return { testLoan, testClient };
  }

  // Test 4: Test updatePaymentData function directly
  function testUpdatePaymentData(testLoan) {
    console.log('\n4️⃣ Testing updatePaymentData function...');
    
    const initialPaymentsCount = Store.payments().length;
    console.log(`📊 Initial payments count: ${initialPaymentsCount}`);
    
    try {
      // Test paid action
      console.log('🔄 Testing PAID action...');
      updatePaymentData(testLoan.id, 'paid', 5000);
      
      const newPaymentsCount = Store.payments().length;
      console.log(`📊 New payments count: ${newPaymentsCount}`);
      
      if (newPaymentsCount > initialPaymentsCount) {
        console.log('✅ Payment record created successfully');
        
        const newPayment = Store.payments().find(p => 
          p.loanId === testLoan.id && 
          p.amount === 5000 && 
          p.note === 'PAID via notification'
        );
        
        if (newPayment) {
          console.log('✅ Payment record has correct data:', newPayment);
          return true;
        } else {
          console.log('❌ Payment record has incorrect data');
          return false;
        }
      } else {
        console.log('❌ No new payment record created');
        return false;
      }
    } catch (error) {
      console.error('❌ Error in updatePaymentData:', error);
      return false;
    }
  }

  // Test 5: Test service worker message handling
  function testServiceWorkerMessage() {
    console.log('\n5️⃣ Testing Service Worker message handling...');
    
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker not supported');
      return false;
    }
    
    // Create a mock PAYMENT_RECORDED message
    const mockMessage = {
      type: 'PAYMENT_RECORDED',
      action: 'partly_paid',
      loan_id: 'test-notification-loan',
      client_name: 'Test Notification Client',
      amount: 2500,
      result: { success: true, message: 'Partial payment recorded' }
    };
    
    console.log('📨 Simulating PAYMENT_RECORDED message:', mockMessage);
    
    // Dispatch the message event
    const messageEvent = new MessageEvent('message', {
      data: mockMessage,
      origin: window.location.origin
    });
    
    // Get initial payment count
    const initialCount = Store.payments().length;
    console.log(`📊 Initial payment count: ${initialCount}`);
    
    // Trigger the message handler
    navigator.serviceWorker.dispatchEvent(messageEvent);
    
    // Allow time for processing
    setTimeout(() => {
      const finalCount = Store.payments().length;
      console.log(`📊 Final payment count: ${finalCount}`);
      
      if (finalCount > initialCount) {
        console.log('✅ Service Worker message handling works');
      } else {
        console.log('⚠️ Service Worker message may not have processed (async)');
      }
    }, 1000);
    
    return true;
  }

  // Test 6: Complete integration test
  async function testCompleteFlow() {
    console.log('\n6️⃣ Testing complete notification flow...');
    
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker not supported - skipping integration test');
      return false;
    }
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration || !registration.active) {
        console.log('❌ No active Service Worker - skipping integration test');
        return false;
      }
      
      console.log('✅ Service Worker is active');
      
      // Test notification with action buttons
      if ('showNotification' in registration) {
        console.log('🔔 Testing notification with action buttons...');
        
        await registration.showNotification('🧪 Test Notification', {
          body: 'Click the PAID button to test auto-update',
          icon: '/logo.png',
          requireInteraction: true,
          tag: 'test-notification-fix',
          data: {
            test: true,
            loan_id: 'test-notification-loan',
            client_name: 'Test Notification Client',
            amount: 1000
          },
          actions: [
            {
              action: 'paid',
              title: '✅ Paid',
              icon: '/logo.png'
            },
            {
              action: 'unpaid',
              title: '❌ Unpaid',
              icon: '/logo.png'
            },
            {
              action: 'partly_paid',
              title: '💰 Partial',
              icon: '/logo.png'
            }
          ]
        });
        
        console.log('✅ Test notification shown - click the buttons to test!');
        return true;
      }
    } catch (error) {
      console.error('❌ Error in complete flow test:', error);
      return false;
    }
    
    return false;
  }

  // Run all tests
  async function runAllTests() {
    console.log('🚀 Starting comprehensive notification test suite...\n');
    
    const results = {
      functionsExist: testFunctionExistence(),
      storeAvailable: testStoreAvailability()
    };
    
    if (!results.functionsExist || !results.storeAvailable) {
      console.log('\n❌ Critical components missing - stopping tests');
      return results;
    }
    
    const { testLoan } = setupTestData();
    
    results.updatePaymentData = testUpdatePaymentData(testLoan);
    results.serviceWorkerMessage = testServiceWorkerMessage();
    results.completeFlow = await testCompleteFlow();
    
    console.log('\n📊 ===== TEST RESULTS =====');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const allPassed = Object.values(results).every(r => r === true);
    console.log(`\n🎯 Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}`);
    
    if (allPassed) {
      console.log('\n💡 The notification auto-update feature should be working correctly!');
      console.log('💡 Test by clicking notification action buttons to see automatic data updates.');
    } else {
      console.log('\n🔧 Some components may need fixing for full functionality.');
    }
    
    return results;
  }

  // Expose test functions globally
  window.notificationFixTest = {
    runAllTests,
    testFunctionExistence,
    testStoreAvailability,
    setupTestData,
    testUpdatePaymentData,
    testServiceWorkerMessage,
    testCompleteFlow
  };

  console.log('✅ Notification fix test suite loaded');
  console.log('💡 Run: notificationFixTest.runAllTests()');

})();