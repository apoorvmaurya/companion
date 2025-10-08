from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from config.settings import get_settings
from routes import companions, rooms, webrtc, did, recordings
from websocket.signaling import sio

settings = get_settings()

app = FastAPI(title="AI Companion API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(companions.router, prefix="/api/companions", tags=["companions"])
app.include_router(rooms.router, prefix="/api/video/rooms", tags=["rooms"])
app.include_router(webrtc.router, prefix="/api/webrtc", tags=["webrtc"])
app.include_router(did.router)
app.include_router(recordings.router)

socket_app = socketio.ASGIApp(sio, app)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/")
async def root():
    return {"message": "AI Companion API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:socket_app", host="0.0.0.0", port=settings.port, reload=True)
