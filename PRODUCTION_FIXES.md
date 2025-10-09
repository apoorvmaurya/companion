# Production Deployment Fixes

## Issues Fixed

### 1. CORS Configuration
**Problem**: Frontend on Vercel couldn't connect to backend on Render due to CORS restrictions.

**Solution**: Updated `backend/main.py` to allow Vercel domains:
```python
allowed_origins = [
    settings.frontend_url,
    "http://localhost:5173",
    "http://localhost:3000",
    "https://*.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Companions Endpoint Schema Mismatch
**Problem**: `CompanionResponse` schema was missing the `metadata` field.

**Solution**: Updated `backend/models/schemas.py`:
```python
class CompanionResponse(BaseModel):
    id: str
    name: str
    description: str
    avatar_url: str
    personality: str
    voice_id: str
    did_presenter_id: Optional[str] = None
    specialties: List[str]
    metadata: Optional[dict] = None  # Added
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True  # Added for Pydantic v2
```

### 3. Better Error Handling
**Problem**: Errors weren't being logged properly in production.

**Solution**: 
- Added error logging to `backend/routes/companions.py`
- Added try-catch with console logging to `frontend/src/services/api.ts`
- Added validation checks in `backend/services/supabase_client.py`

### 4. Updated .gitignore
**Problem**: Environment files and build artifacts weren't properly ignored.

**Solution**: Updated `.gitignore` with comprehensive Python and Node.js patterns including `.vercel` and `.render` folders.

## Environment Variables Required

### Backend (Render)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
DID_API_KEY=your_did_api_key
FRONTEND_URL=https://your-app.vercel.app
REDIS_URL=redis://localhost:6379 (optional)
TWILIO_ACCOUNT_SID=your_twilio_sid (optional)
TWILIO_AUTH_TOKEN=your_twilio_token (optional)
PORT=8000 (auto-set by Render)
```

### Frontend (Vercel)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND_URL=https://your-backend.onrender.com
VITE_WS_URL=https://your-backend.onrender.com
```

## Deployment Steps

### 1. Backend (Render)
1. Push code to GitHub
2. Create Web Service on Render
3. Set root directory: `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:socket_app --host 0.0.0.0 --port $PORT`
6. Add all environment variables
7. Deploy

### 2. Frontend (Vercel)
1. Create project on Vercel
2. Set root directory: `frontend`
3. Framework preset: Vite
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add all environment variables (with backend URL from Render)
7. Deploy

### 3. Database (Supabase)
1. Run migration: `supabase/migrations/001_initial_schema.sql`
2. Verify RLS policies are active
3. Create storage bucket: `recordings`
4. Verify companions table exists

## Testing Checklist

After deployment, verify:
- [ ] Backend health check: `https://your-backend.onrender.com/health`
- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] User can sign up
- [ ] User can log in
- [ ] Companions list loads (check browser console for errors)
- [ ] Can select a companion
- [ ] Video call initializes
- [ ] Chat works
- [ ] AI responds

## Common Issues & Solutions

### Issue: "Failed to fetch companions"
**Causes**:
1. CORS not configured properly
2. Backend not running
3. Environment variables not set
4. Database not initialized

**Debug**:
```bash
# Check backend health
curl https://your-backend.onrender.com/health

# Check companions endpoint
curl https://your-backend.onrender.com/api/companions

# Check browser console for CORS errors
# Check Render logs for Python errors
```

### Issue: Empty companions list
**Cause**: Database has no companions

**Solution**: Sync companions from external API:
```bash
curl -X POST https://your-backend.onrender.com/api/companions/sync
```

### Issue: CORS errors in browser
**Cause**: Frontend URL not in allowed origins

**Solution**: 
1. Set `FRONTEND_URL` env var on Render to your Vercel URL
2. Redeploy backend
3. Hard refresh frontend (Ctrl+Shift+R)

### Issue: "Supabase URL or Service Key not configured"
**Cause**: Environment variables not set on Render

**Solution**:
1. Go to Render dashboard → Environment
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
3. Redeploy

### Issue: WebSocket connection fails
**Cause**: Using HTTP URL for WebSocket

**Solution**: 
- Set `VITE_WS_URL` to use HTTPS (same as backend URL)
- Render automatically handles WSS upgrade

## Verification Commands

```bash
# Test backend health
curl https://your-backend.onrender.com/health

# Test companions endpoint
curl https://your-backend.onrender.com/api/companions

# Test WebRTC config
curl https://your-backend.onrender.com/api/webrtc/config

# Check logs on Render
# Go to Render dashboard → your service → Logs

# Check logs on Vercel
# Go to Vercel dashboard → your project → Deployments → View Function Logs
```

## Monitoring

### Backend Logs (Render)
Look for:
- "Supabase client initialized successfully"
- "LangMem initialized successfully"
- Any error messages

### Frontend Console (Browser)
Look for:
- "Failed to fetch companions" errors
- CORS errors
- Network errors
- API response status codes

## Performance Tips

1. Enable Redis caching on backend (optional but recommended)
2. Use Vercel Edge Network (automatic)
3. Monitor Supabase connection pool
4. Set up error tracking (Sentry)
5. Add health check monitoring (UptimeRobot)

## Security Notes

1. Never commit `.env` files
2. Use environment variables for all secrets
3. Rotate API keys regularly
4. Monitor Supabase dashboard for suspicious activity
5. Keep dependencies updated
6. Use HTTPS everywhere in production
