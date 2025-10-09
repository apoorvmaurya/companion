from fastapi import APIRouter
from models.schemas import WebRTCConfigResponse
from config.settings import get_settings

router = APIRouter()

settings = get_settings()

@router.get("/config", response_model=WebRTCConfigResponse)
async def get_webrtc_config():
    ice_servers = [
        {"urls": ["stun:stun.l.google.com:19302"]},
        {"urls": ["stun:stun1.l.google.com:19302"]}
    ]

    if settings.twilio_account_sid and settings.twilio_auth_token:
        ice_servers.append({
            "urls": [
                f"turn:global.turn.twilio.com:3478?transport=udp",
                f"turn:global.turn.twilio.com:3478?transport=tcp"
            ],
            "username": settings.twilio_account_sid,
            "credential": settings.twilio_auth_token
        })

    return {"iceServers": ice_servers}
