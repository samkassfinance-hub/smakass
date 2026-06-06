#!/usr/bin/env python3
"""
SamKass Local Testing - Automated Setup Verification
Run this to verify your local notification setup
"""

import os
import sys
import requests
import time
import subprocess
from pathlib import Path

def print_step(step, message):
    print(f"\n{'='*60}")
    print(f"STEP {step}: {message}")
    print('='*60)

def check_vapid_keys():
    """Check if VAPID keys are properly configured"""
    print_step(1, "Checking VAPID Configuration")
    
    env_file = Path("kaasflow/backend/.env")
    if not env_file.exists():
        print("❌ .env file not found")
        return False
    
    with open(env_file, 'r') as f:
        content = f.read()
    
    has_private = 'VAPID_PRIVATE_KEY=' in content
    has_public = 'VAPID_PUBLIC_KEY=' in content
    has_email = 'VAPID_CLAIM_EMAIL=' in content
    
    print(f"   VAPID_PRIVATE_KEY: {'✅' if has_private else '❌'}")
    print(f"   VAPID_PUBLIC_KEY: {'✅' if has_public else '❌'}")  
    print(f"   VAPID_CLAIM_EMAIL: {'✅' if has_email else '❌'}")
    
    if has_private and has_public and has_email:
        print("✅ VAPID keys are configured!")
        return True
    else:
        print("❌ VAPID keys missing")
        return False

def check_frontend_files():
    """Check if frontend files exist and have correct config"""
    print_step(2, "Checking Frontend Files")
    
    files_to_check = [
        "kaasflow/frontend/config.js",
        "kaasflow/frontend/sw.js",
        "kaasflow/frontend/index.html",
        "kaasflow/frontend/debug-notifications.html"
    ]
    
    all_exist = True
    for file_path in files_to_check:
        if Path(file_path).exists():
            print(f"   ✅ {file_path}")
        else:
            print(f"   ❌ {file_path}")
            all_exist = False
    
    # Check config.js content
    config_file = Path("kaasflow/frontend/config.js")
    if config_file.exists():
        with open(config_file, 'r') as f:
            config_content = f.read()
        
        if 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE' in config_content:
            print("   ✅ config.js has correct VAPID key")
        else:
            print("   ❌ config.js missing VAPID key")
            all_exist = False
    
    return all_exist

def start_backend_server():
    """Start the backend server for testing"""
    print_step(3, "Starting Backend Server")
    
    try:
        # Change to backend directory and start server
        os.chdir("kaasflow/backend")
        
        print("   Starting simple backend server...")
        # Start server in background
        process = subprocess.Popen([sys.executable, "app_simple.py"], 
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.PIPE)
        
        # Give it time to start
        time.sleep(3)
        
        # Check if it's running
        if process.poll() is None:
            print("   ✅ Backend server started (PID: {})".format(process.pid))
            return process
        else:
            print("   ❌ Backend server failed to start")
            return None
            
    except Exception as e:
        print(f"   ❌ Error starting server: {e}")
        return None
    finally:
        os.chdir("../..")  # Go back to original directory

def test_backend_endpoints(server_process):
    """Test backend endpoints"""
    print_step(4, "Testing Backend Endpoints")
    
    base_url = "http://localhost:5000"
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("   ✅ Health endpoint working")
        else:
            print(f"   ❌ Health endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Cannot connect to backend: {e}")
        return False
    
    # Test VAPID config endpoint
    try:
        response = requests.get(f"{base_url}/api/test-notification-config", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('vapid_configured'):
                print("   ✅ VAPID configuration endpoint working")
                print(f"      Public key preview: {data.get('vapid_public_key', 'N/A')}")
            else:
                print("   ❌ VAPID not configured in backend")
                return False
        else:
            print(f"   ❌ VAPID config endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ VAPID endpoint error: {e}")
        return False
    
    return True

def generate_browser_test_script():
    """Generate a test script for browser"""
    print_step(5, "Generating Browser Test Script")
    
    test_script = '''
<!DOCTYPE html>
<html>
<head>
    <title>SamKass Local Test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; }
        .test { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .info { background: #d1ecf1; color: #0c5460; }
        button { background: #7ed321; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>🔔 SamKass Local Notification Test</h1>
    
    <div id="results"></div>
    
    <button onclick="runTests()">Run All Tests</button>
    <button onclick="testNotification()">Test Simple Notification</button>
    
    <script src="config.js"></script>
    <script>
        function log(message, type = 'info') {
            const div = document.createElement('div');
            div.className = `test ${type}`;
            div.innerHTML = message;
            document.getElementById('results').appendChild(div);
        }
        
        function runTests() {
            document.getElementById('results').innerHTML = '';
            
            // Test 1: VAPID Configuration
            const vapidKey = window.SamKassConfig?.VAPID_PUBLIC_KEY;
            if (vapidKey && vapidKey.startsWith('MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE')) {
                log('✅ VAPID public key correctly loaded', 'success');
            } else {
                log('❌ VAPID public key missing or incorrect', 'error');
            }
            
            // Test 2: Browser Support
            const hasNotifications = 'Notification' in window;
            const hasServiceWorker = 'serviceWorker' in navigator;
            const hasPushManager = 'PushManager' in window;
            
            log(`Notifications: ${hasNotifications ? '✅' : '❌'}`, hasNotifications ? 'success' : 'error');
            log(`Service Worker: ${hasServiceWorker ? '✅' : '❌'}`, hasServiceWorker ? 'success' : 'error');
            log(`Push Manager: ${hasPushManager ? '✅' : '❌'}`, hasPushManager ? 'success' : 'error');
            
            // Test 3: Environment
            const isSecure = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
            log(`Secure Context: ${isSecure ? '✅' : '❌'}`, isSecure ? 'success' : 'error');
            
            // Test 4: Permission Status
            if (hasNotifications) {
                log(`Permission: ${Notification.permission}`, 'info');
            }
            
            log('Tests completed! Click "Test Simple Notification" to test notifications.', 'info');
        }
        
        async function testNotification() {
            if (!('Notification' in window)) {
                log('❌ Notifications not supported', 'error');
                return;
            }
            
            if (Notification.permission !== 'granted') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    log('❌ Permission denied', 'error');
                    return;
                }
            }
            
            new Notification('🔔 SamKass Local Test', {
                body: 'Local notification system is working!',
                requireInteraction: true
            });
            
            log('✅ Test notification sent!', 'success');
        }
        
        // Auto-run tests when page loads
        window.onload = runTests;
    </script>
</body>
</html>
    '''
    
    with open("kaasflow/frontend/local-test.html", "w") as f:
        f.write(test_script)
    
    print("   ✅ Browser test script created: kaasflow/frontend/local-test.html")
    print("   💡 Open http://localhost:8080/local-test.html in your browser")

def cleanup(server_process):
    """Cleanup running processes"""
    if server_process:
        print("\\n🧹 Cleaning up...")
        server_process.terminate()
        print("   ✅ Backend server stopped")

def main():
    print("🔔 SamKass Notification System - Local Testing")
    print("This script will verify your local setup step by step\\n")
    
    server_process = None
    
    try:
        # Check VAPID keys
        if not check_vapid_keys():
            print("\\n❌ Please configure VAPID keys first!")
            return
        
        # Check frontend files
        if not check_frontend_files():
            print("\\n❌ Frontend files missing!")
            return
        
        # Start backend server
        server_process = start_backend_server()
        if not server_process:
            print("\\n❌ Cannot start backend server!")
            return
        
        # Test backend
        if not test_backend_endpoints(server_process):
            print("\\n❌ Backend tests failed!")
            return
        
        # Generate browser test
        generate_browser_test_script()
        
        print("\\n" + "="*60)
        print("🎉 LOCAL SETUP VERIFICATION COMPLETE!")
        print("="*60)
        print("✅ VAPID keys configured")
        print("✅ Frontend files ready") 
        print("✅ Backend server running")
        print("✅ Endpoints working")
        print("✅ Browser test ready")
        
        print("\\n📋 NEXT STEPS:")
        print("1. Start frontend server:")
        print("   cd kaasflow/frontend")
        print("   python -m http.server 8080")
        print("\\n2. Open browser:")
        print("   http://localhost:8080/local-test.html")
        print("\\n3. Test notifications in browser")
        print("\\n4. If everything works, you're ready to push to GitHub!")
        
        print("\\n⏳ Backend server is running... Press Ctrl+C to stop")
        
        # Keep server running
        while True:
            time.sleep(1)
        
    except KeyboardInterrupt:
        print("\\n\\n👋 Testing stopped by user")
    except Exception as e:
        print(f"\\n❌ Unexpected error: {e}")
    finally:
        cleanup(server_process)

if __name__ == "__main__":
    main()