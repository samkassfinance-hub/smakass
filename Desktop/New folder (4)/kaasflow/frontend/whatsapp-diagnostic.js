/**
 * WhatsApp Settings Diagnostic Script
 * Run this in the browser console to diagnose issues
 * 
 * Usage:
 * 1. Open browser DevTools (F12)
 * 2. Copy and paste this entire file into the Console
 * 3. Press Enter
 * 4. Review the diagnostic report
 */

(function() {
    console.clear();
    console.log('%c🔍 WhatsApp Settings Diagnostic Report', 'font-size: 20px; font-weight: bold; color: #7ed321;');
    console.log('%c' + '='.repeat(60), 'color: #7ed321;');
    console.log('');

    const results = {
        timestamp: new Date().toISOString(),
        passed: 0,
        failed: 0,
        warnings: 0,
        details: []
    };

    function pass(category, message, data) {
        console.log('%c✅ PASS', 'color: green; font-weight: bold', `[${category}]`, message);
        if (data) console.log('   ', data);
        results.passed++;
        results.details.push({ status: 'PASS', category, message, data });
    }

    function fail(category, message, data) {
        console.log('%c❌ FAIL', 'color: red; font-weight: bold', `[${category}]`, message);
        if (data) console.log('   ', data);
        results.failed++;
        results.details.push({ status: 'FAIL', category, message, data });
    }

    function warn(category, message, data) {
        console.log('%c⚠️  WARN', 'color: orange; font-weight: bold', `[${category}]`, message);
        if (data) console.log('   ', data);
        results.warnings++;
        results.details.push({ status: 'WARN', category, message, data });
    }

    function info(category, message, data) {
        console.log('%cℹ️  INFO', 'color: blue; font-weight: bold', `[${category}]`, message);
        if (data) console.log('   ', data);
        results.details.push({ status: 'INFO', category, message, data });
    }

    // ============================================================
    // 1. CHECK ENVIRONMENT
    // ============================================================
    console.log('\n%c1️⃣ Environment Check', 'font-size: 16px; font-weight: bold; color: #7ed321;');
    console.log('─'.repeat(60));

    info('Environment', 'Browser', `${navigator.userAgent.split(' ').pop()}`);
    info('Environment', 'URL', window.location.href);
    info('Environment', 'Protocol', window.location.protocol);
    info('Environment', 'Hostname', window.location.hostname);

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
        pass('Environment', 'Running on localhost');
    } else {
        pass('Environment', 'Running on production/remote server');
    }

    // ============================================================
    // 2. CHECK AUTHENTICATION
    // ============================================================
    console.log('\n%c2️⃣ Authentication Check', 'font-size: 16px; font-weight: bold; color: #7ed321;');
    console.log('─'.repeat(60));

    let userId = null;
    const authData = {};

    // Check kf_session
    const kfSession = localStorage.getItem('kf_session');
    if (kfSession) {
        try {
            const session = JSON.parse(kfSession);
            authData.kf_session = session;
            if (session.user) {
                userId = session.user.id || session.user.email || session.user.user_id;
                pass('Auth', 'Found user in kf_session', { userId });
            }
        } catch (e) {
            fail('Auth', 'Error parsing kf_session', e.message);
        }
    } else {
        warn('Auth', 'No kf_session found in localStorage');
    }

    // Check user object
    const userObj = localStorage.getItem('user');
    if (userObj) {
        try {
            const user = JSON.parse(userObj);
            authData.user = user;
            if (!userId) {
                userId = user.id || user.email || user.user_id;
            }
            pass('Auth', 'Found user object', { userId: userId || 'not extracted' });
        } catch (e) {
            fail('Auth', 'Error parsing user object', e.message);
        }
    } else {
        warn('Auth', 'No user object found in localStorage');
    }

    // Check userEmail
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        authData.userEmail = userEmail;
        if (!userId) {
            userId = userEmail;
        }
        pass('Auth', 'Found userEmail', userEmail);
    }

    if (userId) {
        pass('Auth', 'User ID successfully extracted', userId);
    } else {
        fail('Auth', 'Could not extract user ID from any source');
        console.log('%c💡 Fix: Login to the app first', 'color: blue; font-weight: bold;');
    }

    // ============================================================
    // 3. CHECK LOCAL STORAGE
    // ============================================================
    console.log('\n%c3️⃣ LocalStorage Check', 'font-size: 16px; font-weight: bold; color: #7ed321;');
    console.log('─'.repeat(60));

    const allKeys = Object.keys(localStorage);
    info('Storage', `Total keys in localStorage: ${allKeys.length}`);
    
    const relevantKeys = allKeys.filter(k => 
        k.includes('user') || k.includes('session') || k.includes('kf_') || k.includes('auth')
    );
    
    if (relevantKeys.length > 0) {
        pass('Storage', 'Found relevant storage keys', relevantKeys);
    } else {
        warn('Storage', 'No relevant authentication keys found');
    }

    // ============================================================
    // 4. CHECK API CONFIGURATION
    // ============================================================
    console.log('\n%c4️⃣ API Configuration Check', 'font-size: 16px; font-weight: bold; color: #7ed321;');
    console.log('─'.repeat(60));

    const expectedAPIUrl = isLocalhost 
        ? 'http://localhost:5000/api'
        : 'https://kaasflow-backend.vercel.app/api';

    info('API', 'Expected API URL', expectedAPIUrl);

    // Try to detect actual API URL from page
    if (typeof API_URL !== 'undefined') {
        if (API_URL === expectedAPIUrl) {
            pass('API', 'API_URL matches expected', API_URL);
        } else {
            warn('API', 'API_URL differs from expected', { expected: expectedAPIUrl, actual: API_URL });
        }
    } else {
        warn('API', 'API_URL variable not defined on this page');
    }

    // ============================================================
    // 5. CHECK DOM ELEMENTS
    // ============================================================
    console.log('\n%c5️⃣ DOM Elements Check', 'font-size: 16px; font-weight: bold; color: #7ed321;');
    console.log('─'.repeat(60));

    // Check if we're on the settings page
    const isSettingsPage = window.location.pathname.includes('whatsapp-settings');
    
    if (isSettingsPage) {
        const requiredElements = [
            'whatsapp_number',
            'business_name',
            'whatsapp_enabled',
            'whatsapp-settings-form',
            'test-btn',
            'alert-container'
        ];

        requiredElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                pass('DOM', `Found element: #${id}`, el.tagName);
            } else {
                fail('DOM', `Missing element: #${id}`);
            }
        });
    } else {
        // Check if we're on main app
        const settingsBtn = document.querySelector('#btn-whatsapp-settings');
        if (settingsBtn) {
            pass('DOM', 'Found WhatsApp settings button on main page');
            
            // Check if it has click handler
            const hasListener = settingsBtn.onclick !== null || 
                                settingsBtn.getAttribute('onclick') !== null;
            if (hasListener) {
                pass('DOM', 'Button has click handler');
            } else {
                warn('DOM', 'Button may not have click handler attached yet');
            }
        } else {
            warn('DOM', 'Not on WhatsApp settings page and button not found');
        }
    }

    // ============================================================
    // 6. TEST API CONNECTION
    // ============================================================
    console.log('\n%c6️⃣ API Connection Test', 'font-size: 16px; font-weight: bold; color: #7ed321;');
    console.log('─'.repeat(60));

    if (userId) {
        const testUrl = `${expectedAPIUrl}/whatsapp/settings?user_id=${encodeURIComponent(userId)}`;
        info('API', 'Testing connection to:', testUrl);
        
        fetch(testUrl)
            .then(response => {
                info('API', `Response status: ${response.status} ${response.statusText}`);
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    pass('API', 'Backend is responding correctly', data);
                } else {
                    warn('API', 'Backend responded but with error', data);
                }
                printSummary();
            })
            .catch(error => {
                fail('API', 'Backend connection failed', error.message);
                console.log('%c💡 Fix: Make sure backend is running (python app.py)', 'color: blue; font-weight: bold;');
                printSummary();
            });
    } else {
        warn('API', 'Skipping API test (no user ID available)');
        printSummary();
    }

    // ============================================================
    // SUMMARY
    // ============================================================
    function printSummary() {
        console.log('\n%c📊 Summary', 'font-size: 18px; font-weight: bold; color: #7ed321;');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${results.passed}`);
        console.log(`❌ Failed: ${results.failed}`);
        console.log(`⚠️  Warnings: ${results.warnings}`);
        console.log('');

        if (results.failed === 0 && results.warnings === 0) {
            console.log('%c🎉 All checks passed! System is ready.', 'color: green; font-size: 16px; font-weight: bold;');
        } else if (results.failed > 0) {
            console.log('%c❌ Issues found. Please fix the failed checks above.', 'color: red; font-size: 16px; font-weight: bold;');
        } else {
            console.log('%c⚠️  Some warnings found. System should work but check warnings.', 'color: orange; font-size: 16px; font-weight: bold;');
        }

        console.log('');
        console.log('%c💡 Quick Fixes:', 'font-weight: bold; font-size: 14px;');
        console.log('   1. Not logged in → Login in main app first');
        console.log('   2. API errors → Start backend: python app.py');
        console.log('   3. Missing elements → Hard refresh (Ctrl+Shift+R)');
        console.log('   4. Still issues → Open test-whatsapp-link.html');
        console.log('');
        console.log('%cDiagnostic complete!', 'color: #7ed321; font-weight: bold;');
        console.log('');

        // Export results
        window.whatsappDiagnostic = results;
        console.log('%c💾 Results saved to: window.whatsappDiagnostic', 'color: blue;');
    }

})();
