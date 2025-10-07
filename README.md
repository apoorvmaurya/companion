# AI Companion Video Call & Streaming Platform

A full-stack web application for real-time video calls with AI companions, featuring WebRTC peer-to-peer streaming, intelligent conversations powered by Google Gemini, voice synthesis via ElevenLabs, lifelike avatars from D-ID, and conversation memory via LangMem.

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS (deployed on Vercel)
- **Backend**: Python + FastAPI + Socket.IO (deployed on Render)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **AI Services**: Google Gemini, ElevenLabs, D-ID, LangMem
- **Real-time**: WebRTC + Socket.IO for signaling

## Features

- User authentication with Supabase Auth
- Browse and select AI companions
- Real-time video calls with WebRTC
- AI-powered conversations with LangMem context retention
- Voice synthesis for AI responses via ElevenLabs
- D-ID animated talking avatars
- Real-time text chat during calls
- Call recording and playback
- Responsive design for mobile and desktop
- WebRTC signaling via Socket.IO
- Row-level security for data protection

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Supabase account
- Google Gemini API key
- ElevenLabs API key
- D-ID API key
- LangMem (auto-initializes)
- Redis instance (optional, for caching)
- Twilio account (optional, for TURN server)

## Setup

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

5. Start the server:
```bash
python main.py
```

### Database Setup

Run the migration file to create all required tables:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Execute the SQL

This creates the following tables with Row Level Security:
- **profiles** - User profiles
- **companions** - AI companion data
- **video_rooms** - Video call rooms
- **messages** - Chat messages
- **call_recordings** - Recording metadata
- **conversation_contexts** - Conversation history

See `docs/architecture.md` for detailed schema documentation.

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
SUPABASE_SERVICE_KEY=your_supabase_service_key
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
DID_API_KEY=your_did_api_key
REDIS_URL=redis://localhost:6379
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
FRONTEND_URL=http://localhost:5173
PORT=8000
```

## Deployment

### Frontend (Vercel)

1. Push your code to a Git repository
2. Import the project in Vercel
3. Set the root directory to `frontend`
4. Add environment variables in Vercel dashboard
5. Deploy

### Backend (Render)

1. Push your code to a Git repository
2. Create a new Web Service in Render
3. Set the root directory to `backend`
4. Add environment variables in Render dashboard
5. Deploy

Render will use the `render.yaml` configuration file automatically.

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Key Endpoints

### REST API
- `GET /api/companions` - List all companions
- `POST /api/video/rooms` - Create a video room
- `GET /api/webrtc/config` - Get WebRTC configuration
- `POST /api/did/streams` - Create D-ID avatar stream
- `POST /api/video/recordings` - Upload call recording

### WebSocket Events
- `join`, `offer`, `answer`, `candidate` - WebRTC signaling
- `chat_message` - Real-time chat
- `end_call` - End video session

## Technologies Used

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand (state management)
- Socket.IO Client
- Supabase JS Client
- date-fns

### Backend
- FastAPI
- Python Socket.IO
- Supabase Python Client
- Google Generative AI (Gemini)
- ElevenLabs
- D-ID
- LangMem
- Redis
- Pydantic

## Project Structure

```
project/
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API and WebSocket services
│   │   ├── stores/        # Zustand stores
│   │   ├── contexts/      # React contexts
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── package.json
└── backend/
    ├── routes/            # API routes
    ├── services/          # Business logic services
    ├── websocket/         # WebSocket handlers
    ├── models/            # Pydantic models
    ├── utils/             # Utility functions
    ├── config/            # Configuration
    └── requirements.txt
```

## Development

### Frontend
```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter
npm run typecheck    # Type checking
```

### Backend
```bash
cd backend
python main.py    # Start dev server
```

## License

MIT

## Documentation

- **[Architecture Documentation](docs/architecture.md)** - Detailed system architecture, data flows, and technical specifications
- **[Setup Guide](docs/SETUP.md)** - Comprehensive setup and deployment instructions
- **[API Documentation](http://localhost:8000/docs)** - Interactive API docs (when backend is running)

## Recent Improvements

### LangMem Integration
- Conversation memory across sessions
- Context-aware AI responses
- User interaction history tracking

### D-ID Avatar Streaming
- Real-time animated talking avatars
- WebRTC-based avatar streaming
- Text-to-avatar speech synthesis

### Enhanced Security
- Row Level Security on all tables
- JWT-based authentication
- Secure WebSocket connections
- Environment-specific configurations

### Improved Architecture
- Modular service layer
- Proper error handling
- Production-ready configuration
- Comprehensive documentation

## Support

For issues and questions:
1. Check the documentation in `docs/`
2. Review the setup guide
3. Open an issue on the repository
