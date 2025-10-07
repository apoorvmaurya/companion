# AI Companion Video Call Platform - Architecture Documentation

## Overview

This is a real-time video calling platform that connects users with AI-powered companions featuring:
- WebRTC peer-to-peer video streaming
- Real-time chat with AI responses
- D-ID animated avatars
- LangMem conversation memory
- Voice synthesis via ElevenLabs
- Google Gemini AI for natural conversations

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **Real-time**: Socket.IO Client
- **Authentication**: Supabase Auth
- **WebRTC**: Native Browser APIs

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **WebSockets**: Python Socket.IO
- **Database**: Supabase (PostgreSQL)
- **AI Services**:
  - Google Gemini (Conversational AI)
  - ElevenLabs (Voice Synthesis)
  - D-ID (Animated Avatars)
  - LangMem (Conversation Memory)
- **Authentication**: Supabase + JWT
- **Caching**: Redis (optional)

### Infrastructure
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Frontend Deployment**: Vercel
- **Backend Deployment**: Render
- **WebRTC**: STUN/TURN servers (Google STUN + optional Twilio TURN)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   React UI   │  │   WebRTC     │  │   Socket.IO Client   │  │
│  │   (Vite)     │  │   (P2P)      │  │   (Real-time)        │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WSS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  REST API    │  │  Socket.IO   │  │   WebRTC Signaling   │  │
│  │  Endpoints   │  │  Server      │  │   (SDP/ICE)          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐      ┌──────────────┐
│   Supabase   │    │  AI Services │      │    Redis     │
│  (Database)  │    │              │      │  (Caching)   │
│              │    │  • Gemini    │      │  (Optional)  │
│  • Auth      │    │  • ElevenLabs│      └──────────────┘
│  • Storage   │    │  • D-ID      │
│  • RLS       │    │  • LangMem   │
└──────────────┘    └──────────────┘
```

## Component Architecture

### Frontend Components

```
src/
├── components/
│   ├── AuthGuard.tsx          # Protected route wrapper
│   ├── CallControls.tsx       # Mic/camera/end call controls
│   ├── ChatPanel.tsx          # Real-time chat interface
│   ├── CompanionCard.tsx      # Companion selection cards
│   └── VideoCallModal.tsx     # Video call modal wrapper
├── contexts/
│   └── AuthContext.tsx        # Authentication state
├── hooks/
│   └── useWebRTC.ts           # WebRTC logic & state
├── pages/
│   ├── Companions.tsx         # Companion selection page
│   ├── Landing.tsx            # Landing page
│   ├── Login.tsx              # Login page
│   ├── Signup.tsx             # Registration page
│   └── VideoCall.tsx          # Video call page
├── services/
│   ├── api.ts                 # REST API client
│   ├── supabase.ts            # Supabase client
│   └── websocket.ts           # Socket.IO client
├── stores/
│   ├── useCallStore.ts        # Call state management
│   └── useChatStore.ts        # Chat state management
└── types/
    └── index.ts               # TypeScript interfaces
```

### Backend Structure

```
backend/
├── config/
│   └── settings.py            # Environment configuration
├── models/
│   └── schemas.py             # Pydantic models
├── routes/
│   ├── companions.py          # Companion endpoints
│   ├── rooms.py               # Video room endpoints
│   ├── webrtc.py              # WebRTC config
│   ├── did.py                 # D-ID integration
│   └── recordings.py          # Recording upload
├── services/
│   ├── ai_service.py          # Gemini AI integration
│   ├── did_service.py         # D-ID avatar service
│   ├── memory_service.py      # LangMem integration
│   └── supabase_client.py     # Supabase client
├── utils/
│   └── auth.py                # JWT authentication
├── websocket/
│   └── signaling.py           # WebRTC signaling
└── main.py                    # Application entry point
```

## Data Flow Diagrams

### 1. User Registration & Authentication

```
┌──────┐                 ┌──────────┐              ┌──────────┐
│ User │────Register────▶│ Frontend │────HTTP─────▶│ Supabase │
└──────┘                 └──────────┘              └──────────┘
                              │                         │
                              │◀────JWT Token───────────┘
                              │
                              │───Store Token────▶ LocalStorage
```

### 2. Video Call Initialization

```
┌──────┐         ┌──────────┐         ┌─────────┐         ┌──────────┐
│ User │────1───▶│ Frontend │────2───▶│ Backend │────3───▶│ Supabase │
└──────┘         └──────────┘         └─────────┘         └──────────┘
                      │                    │
                      │                    │
                  4. Create Room           │
                      │◀───────────────────┘
                      │
                  5. Join Socket.IO
                      │────────────────────▶
                      │
                  6. Initialize WebRTC
                      │
                  7. Get STUN/TURN Config
                      │────────────────────▶
                      │◀────────────────────
                      │
                  8. Create Peer Connection
                      │
                  9. Get User Media (Camera/Mic)
                      │
                 10. Send WebRTC Offer
                      │────────────────────▶
                      │
                 11. Receive Answer
                      │◀────────────────────
                      │
                 12. Exchange ICE Candidates
                      │◀────────────────────▶
                      │
                 13. Video Call Connected
```

### 3. AI Conversation Flow with LangMem

```
┌──────┐         ┌──────────┐         ┌─────────┐         ┌─────────┐
│ User │────1───▶│ Frontend │────2───▶│ Backend │────3───▶│ LangMem │
└──────┘         └──────────┘         └─────────┘         └─────────┘
  Send Message                         │                        │
                                       │    Retrieve Context    │
                                       │◀───────────────────────┘
                                       │
                                       │────4────▶┌────────┐
                                       │          │ Gemini │
                                       │          └────────┘
                                       │             │
                                       │  Generate   │
                                       │  Response   │
                                       │◀────────────┘
                                       │
                                       │────5────▶┌─────────┐
                                       │          │ LangMem │
                                       │          └─────────┘
                                       │  Store Interaction
                                       │
                                  6. Return Response
                                       │
┌──────┐         ┌──────────┐         │
│ User │◀────────│ Frontend │◀────────┘
└──────┘         └──────────┘
  Receive AI Reply
```

### 4. D-ID Avatar Streaming

```
┌──────────┐         ┌─────────┐         ┌─────────┐
│ Frontend │────1───▶│ Backend │────2───▶│  D-ID   │
└──────────┘         └─────────┘         └─────────┘
  Request Avatar         │                    │
                         │  Create Stream     │
                         │                    │
                         │◀───Offer SDP───────┘
                         │
                    3. Send Answer
                         │────────────────────▶
                         │
                    4. Exchange ICE
                         │◀───────────────────▶
                         │
                    5. Stream Text
                         │────────────────────▶
                         │
                    6. Avatar Animation
┌──────────┐         │
│ Frontend │◀────────┘
└──────────┘
  Display Talking Avatar
```

## WebRTC Signaling Protocol

The platform uses Socket.IO for WebRTC signaling with the following events:

### Client → Server Events

1. **join**
   - Payload: `{ roomId, userId, role }`
   - Joins a video room and initializes session

2. **offer**
   - Payload: `{ roomId, sdp }`
   - Sends WebRTC offer SDP

3. **answer**
   - Payload: `{ roomId, sdp }`
   - Sends WebRTC answer SDP

4. **candidate**
   - Payload: `{ roomId, candidate }`
   - Sends ICE candidate for NAT traversal

5. **chat_message**
   - Payload: `{ roomId, message }`
   - Sends chat message

6. **end_call**
   - Payload: `{ roomId }`
   - Ends the call session

### Server → Client Events

1. **user_joined**
   - Payload: `{ userId, role }`
   - Notifies when user joins room

2. **offer**
   - Payload: `{ sdp }`
   - Receives WebRTC offer

3. **answer**
   - Payload: `{ sdp }`
   - Receives WebRTC answer

4. **candidate**
   - Payload: `{ candidate }`
   - Receives ICE candidate

5. **chat_message**
   - Payload: `{ sender_type, content, timestamp }`
   - Receives chat message

6. **companion_typing**
   - Payload: `{}`
   - Indicates AI is generating response

7. **call_ended**
   - Payload: `{}`
   - Notifies call has ended

## Database Schema

### Tables

#### profiles
- `id` (uuid, PK) - References auth.users
- `username` (text, unique)
- `avatar_url` (text)
- `created_at`, `updated_at` (timestamptz)

#### companions
- `id` (text, PK)
- `name`, `description`, `personality` (text)
- `avatar_url`, `voice_id`, `did_presenter_id` (text)
- `specialties` (text[])
- `metadata` (jsonb)
- `is_active` (boolean)
- `created_at` (timestamptz)

#### video_rooms
- `id` (uuid, PK)
- `room_id` (text, unique)
- `user_id` (uuid, FK → profiles)
- `companion_id` (text, FK → companions)
- `status` (text: waiting/active/ended)
- `created_at`, `started_at`, `ended_at`, `expires_at` (timestamptz)

#### messages
- `id` (uuid, PK)
- `room_id` (text, FK → video_rooms)
- `sender_type` (text: user/companion)
- `content` (text)
- `timestamp`, `created_at` (timestamptz)

#### call_recordings
- `id` (text, PK)
- `room_id` (text, FK → video_rooms)
- `storage_path`, `url` (text)
- `duration_seconds` (integer)
- `file_size_mb` (numeric)
- `created_at` (timestamptz)

#### conversation_contexts
- `id` (uuid, PK)
- `user_id` (uuid, FK → profiles)
- `companion_id` (text, FK → companions)
- `context_data` (jsonb)
- `last_interaction`, `created_at` (timestamptz)

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Users can only access their own data
- Companions are publicly readable when active
- Messages and recordings are scoped to room ownership

### Authentication Flow

1. User signs up/logs in via Supabase Auth
2. JWT token issued and stored in client
3. Token included in API requests via Authorization header
4. Backend validates JWT and extracts user_id
5. RLS policies enforce data access based on user_id

## API Endpoints

### Companions
- `GET /api/companions` - List active companions
- `GET /api/companions/{id}` - Get companion details
- `POST /api/companions/sync` - Sync from external API

### Video Rooms
- `POST /api/video/rooms` - Create new room
- `GET /api/video/rooms/{id}` - Get room details
- `POST /api/video/rooms/{id}/end` - End room session

### WebRTC
- `GET /api/webrtc/config` - Get ICE servers config

### D-ID
- `POST /api/did/streams` - Create avatar stream
- `POST /api/did/streams/answer` - Send WebRTC answer
- `POST /api/did/streams/ice` - Send ICE candidate
- `POST /api/did/streams/speak` - Stream text to avatar
- `DELETE /api/did/streams/{id}` - Delete stream

### Recordings
- `POST /api/video/recordings` - Upload recording
- `GET /api/video/recordings/{roomId}` - Get room recordings

## Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_URL=http://localhost:8000
VITE_WS_URL=http://localhost:8000
```

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
GEMINI_API_KEY=your_gemini_key
ELEVENLABS_API_KEY=your_elevenlabs_key
DID_API_KEY=your_did_key
REDIS_URL=redis://localhost:6379
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
FRONTEND_URL=http://localhost:5173
PORT=8000
```

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository
2. Set root directory to `frontend`
3. Add environment variables
4. Deploy automatically on push

### Backend (Render)
1. Connect GitHub repository
2. Set root directory to `backend`
3. Use `render.yaml` configuration
4. Add environment variables
5. Deploy automatically on push

## Performance Considerations

- WebRTC for low-latency peer-to-peer video
- Socket.IO for real-time bidirectional communication
- Redis caching for frequently accessed data
- Database indexes on foreign keys and timestamps
- LangMem for efficient conversation memory retrieval
- CDN delivery for static assets (Vercel)

## Monitoring & Logging

- FastAPI automatic API documentation at `/docs`
- Socket.IO connection logging
- Supabase real-time dashboard
- Error handling with descriptive messages
- WebRTC connection state monitoring

## Future Enhancements

- Multi-party video calls
- Screen sharing
- Call recording with transcription
- Analytics dashboard
- Mobile app (React Native)
- Advanced AI personalities
- Voice cloning integration
- Real-time translation
