"""
Generate VAPID keys for push notifications
Run this once to generate your keys, then add them to .env
"""

from pywebpush import webpush
import json

print("=" * 60)
print("SamKass - VAPID Key Generator")
print("=" * 60)
print("\nGenerating VAPID keys for push notifications...\n")

try:
    vapid_keys = webpush.generate_vapid_keys()
    
    print("✅ Keys generated successfully!\n")
    print("Copy these values to your .env file:")
    print("-" * 60)
    print(f"VAPID_PUBLIC_KEY={vapid_keys['public_key']}")
    print(f"VAPID_PRIVATE_KEY={vapid_keys['private_key']}")
    print(f"VAPID_CLAIM_EMAIL=mailto:samkassfinance@gmail.com")
    print("-" * 60)
    
    print("\nAlso add the public key to frontend/push-notifications.js:")
    print("-" * 60)
    print(f"const VAPID_PUBLIC_KEY = '{vapid_keys['public_key']}';")
    print("-" * 60)
    
    print("\n✅ Setup complete! Your push notifications are ready.")
    print("\nNote: Keep your private key secret and never commit it to Git!")
    
except Exception as e:
    print(f"❌ Error generating keys: {e}")
    print("\nMake sure pywebpush is installed:")
    print("  pip install pywebpush")
