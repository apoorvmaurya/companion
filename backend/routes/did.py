from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.did_service import DIDService
from typing import Dict, Optional

router = APIRouter(prefix="/api/did", tags=["D-ID"])

did_service = DIDService()

class CreateStreamRequest(BaseModel):
    presenter_id: str
    session_id: str

class SDPAnswerRequest(BaseModel):
    stream_id: str
    answer: Dict

class ICECandidateRequest(BaseModel):
    stream_id: str
    candidate: Dict
    sdp_mid: str
    sdp_m_line_index: int

class StreamTextRequest(BaseModel):
    stream_id: str
    text: str
    voice_id: Optional[str] = None

@router.post("/streams")
async def create_stream(request: CreateStreamRequest):
    result = await did_service.create_stream(request.presenter_id, request.session_id)

    if not result:
        raise HTTPException(status_code=500, detail="Failed to create D-ID stream")

    return result

@router.post("/streams/answer")
async def send_answer(request: SDPAnswerRequest):
    success = await did_service.send_answer(request.stream_id, request.answer)

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send answer to D-ID")

    return {"success": True}

@router.post("/streams/ice")
async def send_ice_candidate(request: ICECandidateRequest):
    success = await did_service.send_ice_candidate(
        request.stream_id,
        request.candidate,
        request.sdp_mid,
        request.sdp_m_line_index
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send ICE candidate to D-ID")

    return {"success": True}

@router.post("/streams/speak")
async def stream_text(request: StreamTextRequest):
    success = await did_service.stream_text(request.stream_id, request.text, request.voice_id)

    if not success:
        raise HTTPException(status_code=500, detail="Failed to stream text to D-ID")

    return {"success": True}

@router.delete("/streams/{stream_id}")
async def delete_stream(stream_id: str):
    success = await did_service.delete_stream(stream_id)

    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete D-ID stream")

    return {"success": True}
