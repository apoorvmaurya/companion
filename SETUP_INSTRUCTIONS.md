# AI Companion Platform - Setup Instructions

## Critical Issues Fixed

### 1. Authentication Error (401 - Invalid Token)
**Problem**: The backend was using the wrong key to verify JWT tokens from Supabase.

**Solution**:
- Updated `backend/utils/auth.py` to use `SUPABASE_JWT_SECRET` instead of service key
- Added proper JWT verification with audience validation

### 2. Missing Environment Variables
**Problem**: Backend required environment variables that weren't configured.

**Solution**: Added required variables to `.env` file (see below for configuration)

### 3. Empty Database
**Problem**: No database tables or data existed.

**Solution**:
- Created all required tables with proper RLS policies
- Added 4 sample AI companions
- Created storage bucket for call recordings

### 4. WebSocket URL Configuration
**Problem**: Frontend was looking for undefined `VITE_WS_URL`.

**Solution**: Updated to use `VITE_BACKEND_URL` for WebSocket connections

## Required Configuration Steps

### 1. Get Your Supabase Credentials

You need to obtain the following from your Supabase dashboard:

1. **JWT Secret**:
   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
   - Copy the "JWT Secret" value

2. **Service Role Key**:
   - Same page as above
   - Copy the "service_role" key (not the anon key)

### 2. Update `.env` File

Replace the placeholder values in `.env`:

```env
# These are already set correctly:
VITE_SUPABASE_URL=https://mozusqumgqgyxxwqlihu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_BACKEND_URL=http://localhost:8000

# YOU MUST UPDATE THESE:
SUPABASE_URL=https://mozusqumgqgyxxwqlihu.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_from_supabase_dashboard
SUPABASE_JWT_SECRET=your_jwt_secret_from_supabase_dashboard

# REQUIRED FOR AI FEATURES:
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
DID_API_KEY=your_did_api_key_here

# OPTIONAL (for better WebRTC connectivity):
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

# These are fine as-is:
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
PORT=8000
```

### 3. Get API Keys

#### Gemini API Key (Required for AI conversations)
1. Go to: https://makersuite.google.com/app/apikey
2. Create a new API key
3. Add to `.env` as `GEMINI_API_KEY`

#### ElevenLabs API Key (Required for voice synthesis)
1. Go to: https://elevenlabs.io/
2. Sign up and get your API key from Settings
3. Add to `.env` as `ELEVENLABS_API_KEY`

#### D-ID API Key (Required for animated avatars)
1. Go to: https://www.d-id.com/
2. Sign up and get your API key
3. Add to `.env` as `DID_API_KEY`

## Database Setup

The following tables have been created with proper RLS policies:

- `profiles` - User profiles
- `companions` - AI companions (4 sample companions added)
- `video_rooms` - Video call rooms
- `messages` - Chat messages
- `call_recordings` - Recorded calls

Storage bucket `recordings` has been created for call recordings.

## Starting the Application

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start the Backend

```bash
cd backend
python main.py
```

The backend will start on http://localhost:8000

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on http://localhost:5173

## Testing the Fix

1. Sign up for a new account or log in
2. Browse the companions page - you should see 4 AI companions
3. Click on a companion to start a call
4. The room should be created successfully (no more 401 errors!)

## Available Features

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

## Troubleshooting

### Still Getting 401 Errors?
- Double-check that `SUPABASE_JWT_SECRET` is set correctly
- Make sure you're copying the JWT Secret, not the anon key
- Restart the backend after updating `.env`

### Can't See Companions?
- Check that the database migration ran successfully
- Verify companions exist: Log into Supabase dashboard → Table Editor → companions

### WebSocket Connection Issues?
- Ensure backend is running on port 8000
- Check browser console for connection errors
- Verify CORS settings in `backend/main.py`

### Voice/Avatar Not Working?
- Ensure API keys are set in `.env`
- Check backend logs for API errors
- Verify API key validity on respective platforms

## Notes

- Redis is optional; the app will work without it
- Twilio credentials are optional but improve WebRTC reliability
- All API keys should be kept secure and never committed to git
