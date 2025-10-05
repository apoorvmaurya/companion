from fastapi import APIRouter, HTTPException
from typing import List
import requests
from services.supabase_client import get_supabase_client
from models.schemas import CompanionResponse

router = APIRouter()

PERSONAS_API_URL = "https://persona-fetcher-api.up.railway.app/personas"

@router.get("", response_model=List[CompanionResponse])
async def get_companions():
    try:
        supabase = get_supabase_client()
        response = supabase.table("companions").select("*").eq("is_active", True).execute()

        if not response.data:
            await sync_companions()
            response = supabase.table("companions").select("*").eq("is_active", True).execute()

        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{companion_id}", response_model=CompanionResponse)
async def get_companion(companion_id: str):
    try:
        supabase = get_supabase_client()
        response = supabase.table("companions").select("*").eq("id", companion_id).single().execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Companion not found")

        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync")
async def sync_companions():
    try:
        response = requests.get(PERSONAS_API_URL, timeout=10)
        response.raise_for_status()
        personas = response.json()

        supabase = get_supabase_client()

        for persona in personas:
            companion_data = {
                "id": persona.get("id", persona.get("name", "").lower().replace(" ", "_")),
                "name": persona.get("name", ""),
                "description": persona.get("description", persona.get("bio", "")),
                "avatar_url": persona.get("avatar_url", persona.get("image", "")),
                "personality": persona.get("personality", ""),
                "voice_id": persona.get("voice_id", ""),
                "specialties": persona.get("specialties", []),
                "metadata": persona.get("metadata", {}),
                "is_active": True
            }

            supabase.table("companions").upsert(companion_data).execute()

        return {"message": f"Synced {len(personas)} companions"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync companions: {str(e)}")
