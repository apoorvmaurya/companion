from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class RoomStatus(str, Enum):
    waiting = "waiting"
    active = "active"
    ended = "ended"

class SenderType(str, Enum):
    user = "user"
    companion = "companion"

class CreateRoomRequest(BaseModel):
    companion_id: str

class RoomResponse(BaseModel):
    id: str
    room_id: str
    user_id: str
    companion_id: str
    status: RoomStatus
    created_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    expires_at: datetime

class CompanionResponse(BaseModel):
    id: str
    name: str
    description: str
    avatar_url: str
    personality: str
    voice_id: str
    did_presenter_id: Optional[str] = None
    specialties: List[str]
    is_active: bool
    created_at: datetime

class MessageRequest(BaseModel):
    room_id: str
    content: str

class WebRTCConfigResponse(BaseModel):
    iceServers: List[dict]

class UploadRecordingRequest(BaseModel):
    room_id: str
