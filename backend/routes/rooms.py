from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
import uuid
from services.supabase_client import get_supabase_client
from models.schemas import CreateRoomRequest, RoomResponse
from utils.auth import get_current_user

router = APIRouter()

@router.post("", response_model=RoomResponse)
async def create_room(request: CreateRoomRequest, user_id: str = Depends(get_current_user)):
    try:
        supabase = get_supabase_client()

        room_id = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(hours=2)

        room_data = {
            "room_id": room_id,
            "user_id": user_id,
            "companion_id": request.companion_id,
            "status": "waiting",
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": expires_at.isoformat()
        }

        response = supabase.table("video_rooms").insert(room_data).execute()

        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(room_id: str, user_id: str = Depends(get_current_user)):
    try:
        supabase = get_supabase_client()
        response = supabase.table("video_rooms").select("*").eq("room_id", room_id).single().execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Room not found")

        if response.data["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")

        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{room_id}/end")
async def end_room(room_id: str, user_id: str = Depends(get_current_user)):
    try:
        supabase = get_supabase_client()

        update_data = {
            "status": "ended",
            "ended_at": datetime.utcnow().isoformat()
        }

        response = supabase.table("video_rooms").update(update_data).eq("room_id", room_id).eq("user_id", user_id).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Room not found")

        return {"message": "Room ended successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
