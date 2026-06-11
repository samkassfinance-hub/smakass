#!/usr/bin/env python3
"""
WhatsApp Integration Testing Suite
Tests all WhatsApp API endpoints and integration
"""

import os
import sys
import json
import time
import requests
from datetime import datetime

# Configuration
API_BASE = "http://localhost:8080"
API_KEY = os.getenv("WHATSAPP_API_KEY", "387ec87f3544ad933ee9905809a4e93985238082ec697f99651d0255b9b72371")
INSTANCE_NAME = "test_instance_" + str(int(time.time()))

# Test results
results = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "tests": []
}

def log_test(name, status, message=""):
    """Log a test result"""
    results["total"] += 1
    if status:
        results["passed"] += 1
        symbol = "✓"
        color = "\033[92m"  # Green
    else:
        results["failed"] += 1
        symbol = "✗"
        color = "\033[91m"  # Red
    
    reset = "\033[0m"
    print(f"{color}{symbol}{reset} {name}")
    if message:
        print(f"  └─ {message}")
    
    results["tests"].append({
        "name": name,
        "status": status,
        "message": message,
        "timestamp": datetime.now().isoformat()
    })

def test_health():
    """Test API health endpoint"""
    try:
        resp = requests.get(f"{API_BASE}/health", timeout=5)
        success = resp.status_code == 200
        log_test(
            "API Health Check",
            success,
            f"Status: {resp.status_code}"
        )
        return success
    except Exception as e:
        log_test("API Health Check", False, str(e))
        return False

def test_create_instance():
    """Test creating a WhatsApp instance"""
    try:
        payload = {
            "instanceName": INSTANCE_NAME,
            "qrcode": True,
            "integration": "WHATSAPP-BAILEYS"
        }
        headers = {
            "Content-Type": "application/json",
            "apikey": API_KEY
        }
        
        resp = requests.post(
            f"{API_BASE}/instance/create",
            json=payload,
            headers=headers,
            timeout=10
        )
        
        success = resp.status_code in [200, 201]
        data = resp.json() if resp.text else {}
        message = f"Status: {resp.status_code}, Instance: {INSTANCE_NAME}"
        
        log_test("Create Instance", success, message)
        return success
    except Exception as e:
        log_test("Create Instance", False, str(e))
        return False

def test_get_qr_code():
    """Test getting QR code"""
    try:
        headers = {
            "apikey": API_KEY
        }
        
        resp = requests.get(
            f"{API_BASE}/instance/connect/{INSTANCE_NAME}",
            headers=headers,
            timeout=10
        )
        
        success = resp.status_code == 200
        data = resp.json() if resp.text else {}
        has_qr = "base64" in data
        
        message = f"Status: {resp.status_code}, Has QR: {has_qr}"
        log_test("Get QR Code", success and has_qr, message)
        return success and has_qr
    except Exception as e:
        log_test("Get QR Code", False, str(e))
        return False

def test_connection_status():
    """Test checking connection status"""
    try:
        headers = {
            "apikey": API_KEY
        }
        
        resp = requests.get(
            f"{API_BASE}/instance/connectionState/{INSTANCE_NAME}",
            headers=headers,
            timeout=10
        )
        
        success = resp.status_code == 200
        data = resp.json() if resp.text else {}
        state = data.get("instance", {}).get("state", "unknown")
        
        message = f"Status: {resp.status_code}, State: {state}"
        log_test("Get Connection Status", success, message)
        return success
    except Exception as e:
        log_test("Get Connection Status", False, str(e))
        return False

def test_send_message():
    """Test sending a message"""
    try:
        # First, simulate connection
        headers = {
            "Content-Type": "application/json",
            "apikey": API_KEY
        }
        
        payload = {
            "number": "919876543210",
            "options": {
                "delay": 1200,
                "presence": "composing",
                "linkPreview": False
            },
            "textMessage": {
                "text": "Test message from KaasFlow"
            }
        }
        
        resp = requests.post(
            f"{API_BASE}/message/sendText/{INSTANCE_NAME}",
            json=payload,
            headers=headers,
            timeout=10
        )
        
        success = resp.status_code in [200, 201]
        data = resp.json() if resp.text else {}
        
        message = f"Status: {resp.status_code}, Response: {resp.text[:100]}"
        log_test("Send Message", success, message)
        return success
    except Exception as e:
        log_test("Send Message", False, str(e))
        return False

def test_auth_failure():
    """Test that invalid auth key fails"""
    try:
        headers = {
            "apikey": "invalid-key-12345"
        }
        
        resp = requests.get(
            f"{API_BASE}/instance/connect/{INSTANCE_NAME}",
            headers=headers,
            timeout=10
        )
        
        # Should fail with 401
        success = resp.status_code == 401
        message = f"Status: {resp.status_code} (expected 401)"
        log_test("Auth Failure Detection", success, message)
        return success
    except Exception as e:
        log_test("Auth Failure Detection", False, str(e))
        return False

def test_disconnect():
    """Test disconnecting"""
    try:
        headers = {
            "apikey": API_KEY
        }
        
        resp = requests.delete(
            f"{API_BASE}/instance/logout/{INSTANCE_NAME}",
            headers=headers,
            timeout=10
        )
        
        success = resp.status_code == 200
        message = f"Status: {resp.status_code}"
        log_test("Disconnect Instance", success, message)
        return success
    except Exception as e:
        log_test("Disconnect Instance", False, str(e))
        return False

def test_delete_instance():
    """Test deleting instance"""
    try:
        headers = {
            "apikey": API_KEY
        }
        
        resp = requests.delete(
            f"{API_BASE}/instance/delete/{INSTANCE_NAME}",
            headers=headers,
            timeout=10
        )
        
        success = resp.status_code == 200
        message = f"Status: {resp.status_code}"
        log_test("Delete Instance", success, message)
        return success
    except Exception as e:
        log_test("Delete Instance", False, str(e))
        return False

def main():
    """Run all tests"""
    print("\n")
    print("╔═══════════════════════════════════════════════╗")
    print("║  WhatsApp Integration Test Suite              ║")
    print("╚═══════════════════════════════════════════════╝")
    print()
    
    print(f"Testing API: {API_BASE}")
    print(f"API Key: {API_KEY[:16]}...")
    print(f"Instance: {INSTANCE_NAME}")
    print()
    print("Running tests...")
    print()
    
    # Run tests in sequence
    test_health()
    if results["passed"] == 0:
        print("\n❌ API is not responding. Is Evolution API running?")
        print(f"   Start it with: docker-compose -f docker-compose-whatsapp.yml up -d")
        sys.exit(1)
    
    test_create_instance()
    test_get_qr_code()
    test_connection_status()
    test_auth_failure()
    test_send_message()
    test_disconnect()
    test_delete_instance()
    
    # Print summary
    print()
    print("╔═══════════════════════════════════════════════╗")
    print("║  Test Summary                                 ║")
    print("╚═══════════════════════════════════════════════╝")
    print()
    print(f"Total Tests: {results['total']}")
    print(f"✓ Passed: {results['passed']}")
    print(f"✗ Failed: {results['failed']}")
    print()
    
    if results["failed"] == 0:
        print("✅ All tests passed! WhatsApp integration is working.")
        return 0
    else:
        print("❌ Some tests failed. Check the errors above.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    
    # Save results to file
    with open("whatsapp_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n📋 Results saved to: whatsapp_test_results.json")
    
    sys.exit(exit_code)
