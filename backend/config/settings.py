from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    supabase_url: str
    supabase_service_key: str
    gemini_api_key: str
    elevenlabs_api_key: str
    did_api_key: str
    redis_url: str = "redis://localhost:6379"
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    frontend_url: str = "http://localhost:5173"
    port: int = 8000

    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()
