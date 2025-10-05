from supabase import create_client, Client
from config.settings import get_settings

settings = get_settings()

supabase: Client = create_client(settings.supabase_url, settings.supabase_service_key)

def get_supabase_client() -> Client:
    return supabase
