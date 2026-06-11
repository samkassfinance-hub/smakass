#!/usr/bin/env python3
"""
Test script to verify WhatsApp endpoints are registered
"""

import os
import sys

# Add backend to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

from app import app

def test_routes():
    """Print all registered routes"""
    print("\n📍 Registered Routes in Flask App:")
    print("=" * 60)
    
    for rule in app.url_map.iter_rules():
        # Filter for API routes
        if 'whatsapp' in str(rule) or 'api' in str(rule.rule):
            methods = ','.join(rule.methods - {'HEAD', 'OPTIONS'})
            print(f"{rule.rule:40} [{methods}]")
    
    print("\n✅ Route listing complete")
    
    # Check for whatsapp routes specifically
    print("\n🔍 Checking for WhatsApp routes:")
    whatsapp_routes = [str(rule) for rule in app.url_map.iter_rules() if 'whatsapp' in str(rule)]
    
    if whatsapp_routes:
        print(f"✅ Found {len(whatsapp_routes)} WhatsApp routes:")
        for route in whatsapp_routes:
            print(f"   - {route}")
    else:
        print("❌ NO WhatsApp routes found!")
        print("\n⚠️  This means the blueprint is not registered!")
        print("   Check app.py for blueprint registration")

if __name__ == '__main__':
    test_routes()
