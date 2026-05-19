import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
# Using service role key for backend admin operations
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
JWT_SECRET = os.environ.get("JWT_SECRET")

# Clean the strings to prevent "Invalid API key" errors caused by accidental spaces or quotes
SUPABASE_URL = (SUPABASE_URL or "").strip().strip('"').strip("'")
SUPABASE_SERVICE_ROLE_KEY = (SUPABASE_SERVICE_ROLE_KEY or "").strip().strip('"').strip("'")

PLACEHOLDERS = ["your-actual-id", "your-long-service-role-key", "abcde12345"]

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY or any(p in (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) for p in PLACEHOLDERS) or "..." in SUPABASE_SERVICE_ROLE_KEY:
    print("\n❌ ERROR: Supabase credentials are missing or still using placeholder values!")
    print(f"Check your .env file in: {os.path.dirname(__file__)}")
    print("Please replace 'your-actual-id' and 'your-long-service-role-key' with real keys from your Supabase Dashboard.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)