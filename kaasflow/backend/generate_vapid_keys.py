#!/usr/bin/env python3
"""
Generate VAPID Keys for Web Push Notifications
Run this once: python generate_vapid_keys.py
"""

import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization

def generate_vapid_keys():
    print("🔑 Generating VAPID Keys for Web Push Notifications...")
    
    # Generate ECDSA key pair using P-256 curve (required for VAPID)
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()
    
    # Serialize private key
    private_key_der = private_key.private_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    
    # Serialize public key in uncompressed format
    public_key_der = public_key.public_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    # Convert to base64 strings (URL-safe, no padding)
    private_key_b64 = base64.urlsafe_b64encode(private_key_der).decode('utf-8').rstrip('=')
    public_key_b64 = base64.urlsafe_b64encode(public_key_der).decode('utf-8').rstrip('=')
    
    print("\n✅ VAPID Keys Generated Successfully!")
    print("\n📋 Add these to your .env file:")
    print("-" * 50)
    print(f"VAPID_PRIVATE_KEY={private_key_b64}")
    print(f"VAPID_PUBLIC_KEY={public_key_b64}")
    print(f"VAPID_CLAIM_EMAIL=mailto:your-email@example.com")
    print("-" * 50)
    
    print("\n💡 Replace 'your-email@example.com' with your actual email")
    print("💡 Keep the VAPID_PRIVATE_KEY secret - never expose it in frontend!")
    
    return private_key_b64, public_key_b64

if __name__ == "__main__":
    generate_vapid_keys()