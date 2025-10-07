# Setup Guide - AI Companion Video Call Platform

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Supabase account
- Google Gemini API key
- ElevenLabs API key
- D-ID API key
- Redis (optional, for caching)
- Twilio account (optional, for TURN servers)

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-companion-platform

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Database Setup (Supabase)

1. Create a new Supabase project at https://supabase.com
2. Go to Project Settings → API to get your credentials
3. Run the database migration:
   - Go to SQL Editor in Supabase Dashboard
   - Copy content from `supabase/migrations/001_initial_schema.sql`
   - Execute the SQL

### 3. Configure Environment Variables

#### Frontend (.env)
Create `frontend/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND_URL=http://localhost:8000
VITE_WS_URL=http://localhost:8000
```

#### Backend (.env)
Create `backend/.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
DID_API_KEY=your_did_api_key
REDIS_URL=redis://localhost:6379
TWILIO_ACCOUNT_SID=optional
TWILIO_AUTH_TOKEN=optional
FRONTEND_URL=http://localhost:5173
PORT=8000
```

### 4. Get API Keys

#### Google Gemini
1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy to `GEMINI_API_KEY`

#### ElevenLabs
1. Sign up at https://elevenlabs.io
2. Go to Profile → API Key
3. Copy to `ELEVENLABS_API_KEY`

#### D-ID
1. Sign up at https://studio.d-id.com
2. Go to Settings → API
3. Create API key
4. Copy to `DID_API_KEY`

#### LangMem (Optional)
1. Visit https://langmem.com
2. Sign up and get API key
3. LangMem will auto-initialize if available

### 5. Start Development Servers

#### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate
python main.py
```

Backend will run on http://localhost:8000

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Frontend will run on http://localhost:5173

### 6. Sync Companions (Optional)

The platform can sync companions from an external API:

```bash
curl -X POST http://localhost:8000/api/companions/sync
```

Or manually add companions via Supabase Dashboard.

## Production Deployment

### Frontend (Vercel)

1. **Connect Repository**
   - Go to https://vercel.com
   - Import your Git repository
   - Select the `frontend` directory as root

2. **Configure Build Settings**
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Add Environment Variables**
   - Add all `VITE_*` variables from `.env`
   - Update `VITE_BACKEND_URL` to your production backend URL
   - Update `VITE_WS_URL` to your production WebSocket URL

4. **Deploy**
   - Click Deploy
   - Vercel will build and deploy automatically

### Backend (Render)

1. **Create Web Service**
   - Go to https://render.com
   - Create New → Web Service
   - Connect your Git repository

2. **Configure Service**
   ```
   Name: ai-companion-backend
   Root Directory: backend
   Runtime: Python 3.11
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn main:socket_app --host 0.0.0.0 --port $PORT
   ```

3. **Add Environment Variables**
   - Add all variables from `backend/.env`
   - Update `FRONTEND_URL` to your Vercel URL
   - Render automatically provides `PORT`

4. **Deploy**
   - Render will automatically deploy
   - Note your service URL

5. **Update Frontend**
   - Update `VITE_BACKEND_URL` and `VITE_WS_URL` in Vercel
   - Redeploy frontend

### Database (Supabase)

Supabase is already production-ready. No additional setup needed.

1. **Verify Production Settings**
   - Check Row Level Security is enabled
   - Review API rate limits
   - Monitor usage in dashboard

2. **Storage Setup**
   - Ensure `recordings` bucket exists
   - Verify storage policies are active

## Testing

### Frontend Tests
```bash
cd frontend
npm run test
```

### Backend Tests
```bash
cd backend
pytest
```

### Manual Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Can view companions list
- [ ] Can select a companion
- [ ] Video call initializes
- [ ] Camera and microphone work
- [ ] Chat messages send and receive
- [ ] AI responses are generated
- [ ] D-ID avatar animates (if configured)
- [ ] Call can be ended
- [ ] Recording upload works (if implemented)

## Troubleshooting

### WebRTC Connection Issues

**Problem**: Video call doesn't connect

**Solutions**:
1. Check browser permissions for camera/mic
2. Verify STUN/TURN server configuration
3. Check firewall settings
4. Test with different network (corporate firewalls may block WebRTC)
5. Add Twilio TURN servers for better NAT traversal

### Socket.IO Connection Fails

**Problem**: Real-time features don't work

**Solutions**:
1. Verify backend is running
2. Check CORS settings in `backend/main.py`
3. Ensure `VITE_WS_URL` matches backend URL
4. Check browser console for errors
5. Verify firewall allows WebSocket connections

### Supabase Authentication Errors

**Problem**: Login/signup fails

**Solutions**:
1. Verify Supabase URL and keys are correct
2. Check Supabase project is active
3. Verify email confirmation settings in Supabase Auth
4. Check RLS policies are correctly configured
5. Review Supabase Auth logs

### AI Service Errors

**Problem**: AI doesn't respond

**Solutions**:
1. Verify API keys are correct
2. Check API quota limits
3. Review backend logs for errors
4. Test API keys with curl:
   ```bash
   curl https://generativelanguage.googleapis.com/v1/models \
     -H "Authorization: Bearer $GEMINI_API_KEY"
   ```
5. Ensure services are not blocked by firewall

### D-ID Avatar Not Working

**Problem**: Avatar doesn't animate

**Solutions**:
1. Verify D-ID API key is correct
2. Check D-ID account has credits
3. Verify presenter_id is valid
4. Check network can reach D-ID servers
5. Review backend logs for D-ID errors

### LangMem Integration Issues

**Problem**: Conversation context not working

**Solutions**:
1. Check LangMem is properly installed
2. Verify network connectivity
3. LangMem is optional - system works without it
4. Check backend logs for memory service errors

## Environment-Specific Notes

### Development
- Use localhost URLs
- Enable CORS for all origins
- Enable detailed logging
- Use test API keys if available

### Staging
- Use staging Supabase project
- Limit CORS to staging domains
- Enable moderate logging
- Use production-like data

### Production
- Use production Supabase project
- Restrict CORS to production domains
- Enable error-only logging
- Use production API keys
- Enable rate limiting
- Set up monitoring and alerts

## Performance Optimization

### Frontend
- Enable code splitting in Vite
- Optimize images with CDN
- Use lazy loading for components
- Implement service worker for caching
- Enable gzip compression

### Backend
- Enable Redis caching
- Use connection pooling for database
- Implement rate limiting
- Use async operations
- Enable response compression

### Database
- Create indexes on frequently queried columns (already done)
- Use database connection pooling
- Monitor slow queries
- Archive old data periodically

## Security Best Practices

1. **Never commit `.env` files**
2. **Rotate API keys regularly**
3. **Use HTTPS in production**
4. **Enable Supabase RLS policies**
5. **Implement rate limiting**
6. **Validate all user inputs**
7. **Use secure WebSocket (WSS) in production**
8. **Monitor for suspicious activity**
9. **Keep dependencies updated**
10. **Use environment-specific configs**

## Support

For issues and questions:
1. Check this documentation
2. Review error logs
3. Check Supabase dashboard
4. Review API service status pages
5. Open an issue on GitHub

## Next Steps

After successful setup:
1. Customize companion personalities
2. Add custom avatars
3. Configure voice options
4. Set up monitoring
5. Implement analytics
6. Add custom features
7. Optimize performance
8. Scale infrastructure as needed
