from supabase import create_client, Client
from config.settings import get_settings
import sys

settings = get_settings()

try:
    if not settings.supabase_url or not settings.supabase_service_key:
        print("ERROR: Supabase URL or Service Key not configured!")
        print(f"SUPABASE_URL: {'Set' if settings.supabase_url else 'NOT SET'}")
        print(f"SUPABASE_SERVICE_KEY: {'Set' if settings.supabase_service_key else 'NOT SET'}")
        sys.exit(1)

    supabase: Client = create_client(settings.supabase_url, settings.supabase_service_key)
    print("Supabase client initialized successfully")
except Exception as e:
    print(f"ERROR: Failed to initialize Supabase client: {e}")
    sys.exit(1)

def get_supabase_client() -> Client:
    return supabase
