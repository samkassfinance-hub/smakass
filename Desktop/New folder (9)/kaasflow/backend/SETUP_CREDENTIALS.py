#!/usr/bin/env python3
"""
Interactive script to setup your .env credentials
Run: python3 SETUP_CREDENTIALS.py
"""

import os
import sys

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def print_header(text):
    print("\n" + "="*80)
    print(f"🔑 {text}")
    print("="*80 + "\n")

def get_input_with_validation(prompt, min_length=None, prefix=None):
    """Get user input with optional validation"""
    while True:
        value = input(prompt).strip()
        
        if not value:
            print("❌ Cannot be empty!")
            continue
        
        if min_length and len(value) < min_length:
            print(f"❌ Too short! Minimum {min_length} characters required.")
            continue
        
        if prefix and not value.startswith(prefix):
            print(f"⚠️  Warning: This should start with '{prefix}'")
            confirm = input("Continue anyway? (y/n): ").lower()
            if confirm != 'y':
                continue
        
        return value

def main():
    clear_screen()
    
    print("""
╔════════════════════════════════════════════════════════════════════════════╗
║                  🔧 SAMKASS CREDENTIALS SETUP WIZARD                      ║
║                                                                            ║
║              This will help you configure your .env file                  ║
╚════════════════════════════════════════════════════════════════════════════╝
    """)
    
    # =========================================================================
    # RESEND EMAIL API
    # =========================================================================
    
    print_header("Step 1: Resend Email API")
    
    print("""
📧 We need your Resend API key for sending emails.

TO GET YOUR COMPLETE API KEY:
  1. Go to: https://resend.com/api-keys
  2. Find: "samkass" (ID: 61798d8d-0511-42cb-b4be-7a41a09875a2)
  3. Click on it to REVEAL the complete token
  4. Copy the ENTIRE key (should be 40+ characters)
  
⚠️  Important: Copy the COMPLETE key, not just the preview!
    """)
    
    resend_key = get_input_with_validation(
        "Enter your Resend API key: ",
        min_length=40,
        prefix="re_"
    )
    
    print(f"✅ Resend key set: {resend_key[:10]}...{resend_key[-6:]}")
    
    # =========================================================================
    # SUPABASE
    # =========================================================================
    
    print_header("Step 2: Supabase Service Role Key")
    
    print("""
🗄️  We need your Supabase Service Role key for database access.

TO GET YOUR SERVICE ROLE KEY:
  1. Go to: https://app.supabase.com/project/eahyuwpejwbqzzolajzr/settings/api
  2. Find: "Service Role (secret)"
  3. Copy the complete key (should be 100+ characters)
  
⚠️  Important: This is SECRET - keep it safe!
               Don't share this key with anyone!
    """)
    
    supabase_url = "https://eahyuwpejwbqzzolajzr.supabase.co"
    print(f"Supabase URL is already set to:\n  {supabase_url}\n")
    
    supabase_key = get_input_with_validation(
        "Enter your Supabase Service Role key: ",
        min_length=100
    )
    
    print(f"✅ Supabase key set: {supabase_key[:15]}...{supabase_key[-6:]}")
    
    # =========================================================================
    # VERIFY AND SAVE
    # =========================================================================
    
    print_header("Step 3: Review and Save")
    
    print("Here's what will be saved to .env:\n")
    print(f"  RESEND_API_KEY={resend_key[:15]}...{resend_key[-6:]}")
    print(f"  RESEND_FROM_EMAIL=onboarding@resend.dev")
    print(f"  SUPABASE_URL={supabase_url}")
    print(f"  SUPABASE_SERVICE_ROLE_KEY={supabase_key[:15]}...{supabase_key[-6:]}")
    
    confirm = input("\nLooks good? (y/n): ").lower()
    
    if confirm != 'y':
        print("\n❌ Setup cancelled. No changes made.")
        return False
    
    # =========================================================================
    # WRITE .env FILE
    # =========================================================================
    
    print("\n⏳ Writing .env file...")
    
    env_content = f"""# ================================================================================
# 🔑 SAMKASS ENVIRONMENT CONFIGURATION
# ================================================================================
# DO NOT COMMIT THIS FILE TO GIT - Contains sensitive credentials
# Created: {os.popen('date').read().strip()}

# ================================================================================
# 📧 RESEND EMAIL API CONFIGURATION
# ================================================================================
RESEND_API_KEY={resend_key}
RESEND_FROM_EMAIL=onboarding@resend.dev

# ================================================================================
# 🗄️  SUPABASE DATABASE CONFIGURATION
# ================================================================================
SUPABASE_URL={supabase_url}
SUPABASE_SERVICE_ROLE_KEY={supabase_key}

# ================================================================================
# 🔐 SECURITY & JWT
# ================================================================================
SECRET_KEY=your-secret-key-here

# ================================================================================
# 🌐 ENVIRONMENT
# ================================================================================
VERCEL=0
FRONTEND_URL=http://localhost:5500

# ================================================================================
# END OF CONFIGURATION
# ================================================================================
"""
    
    try:
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✅ .env file created successfully!")
    except Exception as e:
        print(f"❌ Error writing .env file: {e}")
        return False
    
    # =========================================================================
    # RUN TESTS
    # =========================================================================
    
    print_header("Step 4: Test Your Setup")
    
    print("""
Now let's verify everything works:
    """)
    
    test_now = input("Run integration tests now? (y/n): ").lower()
    
    if test_now == 'y':
        print("\n⏳ Running tests...\n")
        os.system('python3 test_integration.py')
    else:
        print("""
✅ Setup complete! Your credentials are saved.

To test later, run:
  python3 test_integration.py
    """)
    
    print_header("Setup Complete!")
    
    print("""
✅ Your .env file has been created with your credentials!

NEXT STEPS:
  1. The credentials are now saved in: kaasflow/backend/.env
  2. Run this to test: python3 test_integration.py
  3. Check email at: mohaneni80@gmail.com
  4. Verify OTP emails are received
  
⚠️  IMPORTANT SECURITY NOTES:
  • Never commit .env file to Git!
  • Never share your API keys with anyone!
  • The Service Role key is SECRET - keep it safe!
  • For production, use Vercel environment variables!
    """)
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
