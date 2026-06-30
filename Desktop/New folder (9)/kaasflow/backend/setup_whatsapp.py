"""
Quick Setup Script for WhatsApp Reminder System
Validates setup and helps configure the system
"""

import os
import sys
import subprocess

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60 + "\n")

def print_status(status, message):
    symbols = {"success": "✓", "error": "✗", "info": "ℹ"}
    colors = {"success": "\033[92m", "error": "\033[91m", "info": "\033[94m"}
    reset = "\033[0m"
    symbol = symbols.get(status, "•")
    color = colors.get(status, "")
    print(f"{color}{symbol}{reset} {message}")

def check_python_version():
    """Check if Python version is 3.8 or higher"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print_status("success", f"Python {version.major}.{version.minor} detected")
        return True
    else:
        print_status("error", f"Python 3.8+ required, found {version.major}.{version.minor}")
        return False

def check_package_installed(package):
    """Check if a Python package is installed"""
    try:
        __import__(package)
        return True
    except ImportError:
        return False

def install_requirements():
    """Install required packages"""
    print_status("info", "Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print_status("success", "All packages installed successfully")
        return True
    except subprocess.CalledProcessError:
        print_status("error", "Failed to install packages")
        return False

def check_env_file():
    """Check if .env file exists and has required variables"""
    if not os.path.exists('.env'):
        print_status("error", ".env file not found")
        return False
    
    with open('.env', 'r') as f:
        content = f.read()
    
    required_vars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
    missing = []
    
    for var in required_vars:
        if var not in content:
            missing.append(var)
    
    if missing:
        print_status("error", f"Missing environment variables: {', '.join(missing)}")
        return False
    
    print_status("success", "Environment variables configured")
    return True

def test_supabase_connection():
    """Test Supabase connection"""
    try:
        from dotenv import load_dotenv
        from supabase import create_client
        
        load_dotenv()
        
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not url or not key:
            print_status("error", "Supabase credentials not found in .env")
            return False
        
        supabase = create_client(url, key)
        
        # Test connection by querying settings table
        response = supabase.table('kf_whatsapp_settings').select('*').limit(1).execute()
        
        print_status("success", "Supabase connection successful")
        return True
        
    except Exception as e:
        print_status("error", f"Supabase connection failed: {e}")
        return False

def check_database_tables():
    """Check if WhatsApp tables exist"""
    try:
        from dotenv import load_dotenv
        from supabase import create_client
        
        load_dotenv()
        
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        
        supabase = create_client(url, key)
        
        # Check if tables exist
        tables = ['kf_whatsapp_settings', 'kf_whatsapp_logs']
        for table in tables:
            try:
                supabase.table(table).select('*').limit(1).execute()
                print_status("success", f"Table '{table}' exists")
            except Exception as e:
                print_status("error", f"Table '{table}' not found. Run whatsapp_schema.sql in Supabase")
                return False
        
        return True
        
    except Exception as e:
        print_status("error", f"Database check failed: {e}")
        return False

def test_pywhatkit():
    """Test if PyWhatKit is working"""
    try:
        import pywhatkit as pwk
        print_status("success", "PyWhatKit imported successfully")
        print_status("info", "Note: PyWhatKit requires WhatsApp Web to be logged in")
        return True
    except ImportError:
        print_status("error", "PyWhatKit not installed")
        return False
    except Exception as e:
        print_status("error", f"PyWhatKit test failed: {e}")
        return False

def create_sample_env():
    """Create a sample .env file if it doesn't exist"""
    if os.path.exists('.env'):
        print_status("info", ".env file already exists")
        return
    
    sample_content = """# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Backend Configuration
BACKEND_PORT=5000
FRONTEND_URL=http://localhost:5500

# Other existing variables...
"""
    
    with open('.env.example', 'w') as f:
        f.write(sample_content)
    
    print_status("success", "Created .env.example file")
    print_status("info", "Copy .env.example to .env and fill in your credentials")

def main():
    """Main setup wizard"""
    print_header("WhatsApp Reminder System - Setup Wizard")
    
    # Change to script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    checks = []
    
    # 1. Python version check
    print("\n[1/7] Checking Python version...")
    checks.append(check_python_version())
    
    # 2. Check required packages
    print("\n[2/7] Checking required packages...")
    required_packages = ['flask', 'supabase', 'pywhatkit', 'dotenv']
    all_installed = True
    
    for package in required_packages:
        pkg_name = package if package != 'dotenv' else 'python-dotenv'
        if check_package_installed(package):
            print_status("success", f"{pkg_name} installed")
        else:
            print_status("error", f"{pkg_name} not installed")
            all_installed = False
    
    if not all_installed:
        response = input("\nInstall missing packages? (y/n): ")
        if response.lower() == 'y':
            checks.append(install_requirements())
        else:
            checks.append(False)
    else:
        checks.append(True)
    
    # 3. Check .env file
    print("\n[3/7] Checking environment configuration...")
    if not os.path.exists('.env'):
        print_status("error", ".env file not found")
        create_sample_env()
        print_status("info", "Please create .env file with your credentials and run setup again")
        checks.append(False)
    else:
        checks.append(check_env_file())
    
    # 4. Test Supabase connection
    print("\n[4/7] Testing Supabase connection...")
    checks.append(test_supabase_connection())
    
    # 5. Check database tables
    print("\n[5/7] Checking database tables...")
    checks.append(check_database_tables())
    
    # 6. Test PyWhatKit
    print("\n[6/7] Testing PyWhatKit...")
    checks.append(test_pywhatkit())
    
    # 7. Check scheduler scripts
    print("\n[7/7] Checking scheduler scripts...")
    scripts = ['run_daily_reminders.bat', 'run_daily_reminders.sh']
    scripts_exist = all(os.path.exists(s) for s in scripts)
    if scripts_exist:
        print_status("success", "Scheduler scripts found")
        checks.append(True)
    else:
        print_status("error", "Scheduler scripts not found")
        checks.append(False)
    
    # Summary
    print_header("Setup Summary")
    
    passed = sum(checks)
    total = len(checks)
    
    print(f"Checks passed: {passed}/{total}\n")
    
    if passed == total:
        print_status("success", "All checks passed! ✨")
        print("\nNext steps:")
        print("1. Open your app and go to Settings → WhatsApp Reminders")
        print("2. Configure your WhatsApp number")
        print("3. Send a test message to verify")
        print("4. Setup daily scheduler:")
        print("   - Windows: Use Task Scheduler with run_daily_reminders.bat")
        print("   - Linux/Mac: Setup cron with run_daily_reminders.sh")
        print("\nFor detailed instructions, see WHATSAPP_AUTOMATION_SETUP.md")
    else:
        print_status("error", "Some checks failed. Please fix the issues above.")
        print("\nCommon solutions:")
        print("- Install missing packages: pip install -r requirements.txt")
        print("- Create .env file with Supabase credentials")
        print("- Run whatsapp_schema.sql in Supabase SQL Editor")
        print("\nFor detailed help, see WHATSAPP_AUTOMATION_SETUP.md")
    
    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nSetup cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nSetup failed with error: {e}")
        sys.exit(1)
