import socketio
from services.ai_service import AIService
from services.supabase_client import get_supabase_client
from datetime import datetime

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)

ai_service = AIService()

@sio.event
async def connect(sid, environ, auth):
    print(f"Client connected: {sid}")
    return True

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def join(sid, data):
    room_id = data.get("roomId")
    user_id = data.get("userId")
    role = data.get("role")

    if not room_id:
        return {"error": "Room ID is required"}

    sio.enter_room(sid, room_id)
    print(f"User {user_id} joined room {room_id} as {role}")

    supabase = get_supabase_client()
    supabase.table("video_rooms").update({
        "status": "active",
        "started_at": datetime.utcnow().isoformat()
    }).eq("room_id", room_id).execute()

    await sio.emit("user_joined", {"userId": user_id, "role": role}, room=room_id, skip_sid=sid)

    return {"success": True}

@sio.event
async def offer(sid, data):
    room_id = data.get("roomId")
    sdp = data.get("sdp")

    if not room_id or not sdp:
        return {"error": "Room ID and SDP are required"}

    await sio.emit("offer", {"sdp": sdp}, room=room_id, skip_sid=sid)
    return {"success": True}

@sio.event
async def answer(sid, data):
    room_id = data.get("roomId")
    sdp = data.get("sdp")

    if not room_id or not sdp:
        return {"error": "Room ID and SDP are required"}

    await sio.emit("answer", {"sdp": sdp}, room=room_id, skip_sid=sid)
    return {"success": True}

@sio.event
async def candidate(sid, data):
    room_id = data.get("roomId")
    candidate = data.get("candidate")

    if not room_id or not candidate:
        return {"error": "Room ID and candidate are required"}

    await sio.emit("candidate", {"candidate": candidate}, room=room_id, skip_sid=sid)
    return {"success": True}

@sio.event
async def chat_message(sid, data):
    room_id = data.get("roomId")
    message = data.get("message")
    user_id = data.get("userId")

    if not room_id or not message:
        return {"error": "Room ID and message are required"}

    user_message = {
        "sender_type": "user",
        "content": message,
        "timestamp": datetime.utcnow().isoformat()
    }

    await sio.emit("chat_message", user_message, room=room_id)

    supabase = get_supabase_client()
    supabase.table("messages").insert({
        "room_id": room_id,
        "sender_type": "user",
        "content": message,
        "timestamp": user_message["timestamp"]
    }).execute()

    await sio.emit("companion_typing", {}, room=room_id)

    try:
        room_response = supabase.table("video_rooms").select("companion_id, user_id").eq("room_id", room_id).maybeSingle().execute()
        if not room_response.data:
            print(f"Room not found: {room_id}")
            return {"success": False, "error": "Room not found"}

        companion_id = room_response.data.get("companion_id")
        room_user_id = room_response.data.get("user_id") or user_id

        companion_response = supabase.table("companions").select("*").eq("id", companion_id).maybeSingle().execute()
        if not companion_response.data:
            print(f"Companion not found: {companion_id}")
            return {"success": False, "error": "Companion not found"}

        companion = companion_response.data

        ai_response = await ai_service.generate_response(message, companion, room_id, room_user_id)

        companion_message = {
            "sender_type": "companion",
            "content": ai_response,
            "timestamp": datetime.utcnow().isoformat()
        }

        await sio.emit("chat_message", companion_message, room=room_id)

        supabase.table("messages").insert({
            "room_id": room_id,
            "sender_type": "companion",
            "content": ai_response,
            "timestamp": companion_message["timestamp"]
        }).execute()

    except Exception as e:
        print(f"Error generating AI response: {e}")

    return {"success": True}

@sio.event
async def leave(sid, data):
    room_id = data.get("roomId")

    if not room_id:
        return {"error": "Room ID is required"}

    sio.leave_room(sid, room_id)
    await sio.emit("user_left", {}, room=room_id, skip_sid=sid)

    return {"success": True}

@sio.event
async def end_call(sid, data):
    room_id = data.get("roomId")

    if not room_id:
        return {"error": "Room ID is required"}

    supabase = get_supabase_client()
    supabase.table("video_rooms").update({
        "status": "ended",
        "ended_at": datetime.utcnow().isoformat()
    }).eq("room_id", room_id).execute()

    await sio.emit("call_ended", {}, room=room_id)
    sio.leave_room(sid, room_id)

    return {"success": True}
