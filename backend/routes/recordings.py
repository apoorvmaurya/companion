from fastapi import APIRouter, UploadFile, File, HTTPException
from services.supabase_client import get_supabase_client
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/video/recordings", tags=["Recordings"])

@router.post("")
async def upload_recording(
    room_id: str,
    file: UploadFile = File(...)
):
    try:
        supabase = get_supabase_client()

        file_content = await file.read()
        file_size_mb = len(file_content) / (1024 * 1024)

        recording_id = str(uuid.uuid4())
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'webm'
        storage_path = f"recordings/{room_id}/{recording_id}.{file_extension}"

        upload_response = supabase.storage.from_('recordings').upload(
            storage_path,
            file_content,
            {
                'content-type': file.content_type or 'video/webm',
                'cache-control': '3600'
            }
        )

        if hasattr(upload_response, 'error') and upload_response.error:
            raise HTTPException(status_code=500, detail=f"Storage upload failed: {upload_response.error}")

        public_url = supabase.storage.from_('recordings').get_public_url(storage_path)

        recording_data = {
            "id": recording_id,
            "room_id": room_id,
            "storage_path": storage_path,
            "url": public_url,
            "duration_seconds": 0,
            "file_size_mb": round(file_size_mb, 2),
            "created_at": datetime.utcnow().isoformat()
        }

        insert_response = supabase.table("call_recordings").insert(recording_data).execute()

        if hasattr(insert_response, 'error') and insert_response.error:
            raise HTTPException(status_code=500, detail=f"Database insert failed: {insert_response.error}")

        return {
            "success": True,
            "recording": recording_data
        }

    except Exception as e:
        print(f"Error uploading recording: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{room_id}")
async def get_recordings(room_id: str):
    try:
        supabase = get_supabase_client()

        response = supabase.table("call_recordings").select("*").eq("room_id", room_id).order("created_at", desc=True).execute()

        return {
            "recordings": response.data or []
        }

    except Exception as e:
        print(f"Error fetching recordings: {e}")
        raise HTTPException(status_code=500, detail=str(e))
