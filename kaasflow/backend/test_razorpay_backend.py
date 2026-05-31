#!/usr/bin/env python3
"""
Test Razorpay Backend Integration
Verifies that Razorpay keys are loaded and can create orders
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 60)
print("RAZORPAY BACKEND TEST")
print("=" * 60)

# Check if keys are loaded
key_id = os.getenv('RAZORPAY_KEY_ID')
key_secret = os.getenv('RAZORPAY_KEY_SECRET')

print(f"\n✓ RAZORPAY_KEY_ID: {key_id}")
print(f"✓ RAZORPAY_KEY_SECRET: {key_secret[:10]}...{key_secret[-4:] if key_secret else 'NOT SET'}")

if not key_id or not key_secret:
    print("\n❌ ERROR: Razorpay keys not found in environment!")
    sys.exit(1)

# Try to import razorpay
try:
    import razorpay
    print("\n✓ razorpay package installed")
except ImportError:
    print("\n❌ ERROR: razorpay package not installed!")
    print("   Install it with: pip install razorpay")
    sys.exit(1)

# Try to create a client
try:
    client = razorpay.Client(auth=(key_id, key_secret))
    print("✓ Razorpay client created successfully")
except Exception as e:
    print(f"\n❌ ERROR creating Razorpay client: {e}")
    sys.exit(1)

# Try to create a test order
try:
    print("\n" + "=" * 60)
    print("CREATING TEST ORDER (₹270 = 27000 paise)")
    print("=" * 60)
    
    order_data = {
        'amount': 27000,  # ₹270 in paise
        'currency': 'INR',
        'receipt': 'test_receipt_001',
        'payment_capture': 1,
        'notes': {
            'plan_type': 'monthly',
            'test': 'true'
        }
    }
    
    order = client.order.create(data=order_data)
    
    print(f"\n✅ ORDER CREATED SUCCESSFULLY!")
    print(f"   Order ID: {order['id']}")
    print(f"   Amount: ₹{order['amount'] / 100} ({order['amount']} paise)")
    print(f"   Currency: {order['currency']}")
    print(f"   Status: {order['status']}")
    print(f"   Receipt: {order['receipt']}")
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED!")
    print("=" * 60)
    print("\nYour Razorpay integration is working correctly.")
    print("You can now test payments in the frontend.")
    
except Exception as e:
    print(f"\n❌ ERROR creating test order: {e}")
    print("\nPossible issues:")
    print("  1. Invalid API keys")
    print("  2. Network connectivity issues")
    print("  3. Razorpay account not activated")
    sys.exit(1)
