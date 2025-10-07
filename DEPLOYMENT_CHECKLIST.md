# Production Deployment Checklist

## Pre-Deployment

### API Keys & Credentials
- [ ] Obtain production Google Gemini API key
- [ ] Obtain production ElevenLabs API key
- [ ] Obtain production D-ID API key
- [ ] Create production Supabase project
- [ ] Get Supabase production URL and keys
- [ ] (Optional) Set up Twilio for TURN servers
- [ ] (Optional) Set up Redis instance

### Database Setup
- [ ] Create production Supabase project
- [ ] Go to SQL Editor in Supabase Dashboard
- [ ] Copy and execute `supabase/migrations/001_initial_schema.sql`
- [ ] Verify all tables were created
- [ ] Verify RLS policies are active
- [ ] Create `recordings` storage bucket (if not auto-created)
- [ ] Test storage policies

### Repository Setup
- [ ] Push code to GitHub/GitLab repository
- [ ] Verify `.gitignore` excludes `.env` files
- [ ] Tag release version
- [ ] Update repository description

## Frontend Deployment (Vercel)

### Setup
- [ ] Go to https://vercel.com
- [ ] Click "New Project"
- [ ] Import your Git repository
- [ ] Select root directory: `frontend`

### Build Configuration
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`
- [ ] Node Version: 18.x

### Environment Variables
Add these in Vercel dashboard:
- [ ] `VITE_SUPABASE_URL` = your production Supabase URL
- [ ] `VITE_SUPABASE_ANON_KEY` = your production anon key
- [ ] `VITE_BACKEND_URL` = (add after backend deployment)
- [ ] `VITE_WS_URL` = (add after backend deployment)

### Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Note your Vercel URL (e.g., `https://your-app.vercel.app`)
- [ ] Test the deployed frontend

## Backend Deployment (Render)

### Setup
- [ ] Go to https://render.com
- [ ] Click "New +" → "Web Service"
- [ ] Connect your Git repository
- [ ] Select root directory: `backend`

### Service Configuration
```
Name: ai-companion-backend
Runtime: Python 3.11
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:socket_app --host 0.0.0.0 --port $PORT
```

### Environment Variables
Add these in Render dashboard:
- [ ] `SUPABASE_URL` = your production Supabase URL
- [ ] `SUPABASE_SERVICE_KEY` = your production service role key
- [ ] `GEMINI_API_KEY` = your Google Gemini key
- [ ] `ELEVENLABS_API_KEY` = your ElevenLabs key
- [ ] `DID_API_KEY` = your D-ID key
- [ ] `FRONTEND_URL` = your Vercel URL
- [ ] `REDIS_URL` = (optional) your Redis URL
- [ ] `TWILIO_ACCOUNT_SID` = (optional)
- [ ] `TWILIO_AUTH_TOKEN` = (optional)
- [ ] `PORT` = (auto-provided by Render)

### Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete
- [ ] Note your Render URL (e.g., `https://your-app.onrender.com`)
- [ ] Check logs for any errors
- [ ] Visit `https://your-app.onrender.com/health` to verify

## Connect Frontend to Backend

### Update Frontend Environment
- [ ] Go back to Vercel dashboard
- [ ] Update environment variables:
  - `VITE_BACKEND_URL` = your Render URL
  - `VITE_WS_URL` = your Render URL (same URL)
- [ ] Redeploy frontend (trigger from dashboard)
- [ ] Wait for build to complete

## Post-Deployment Testing

### Authentication
- [ ] Navigate to your Vercel URL
- [ ] Test user registration
- [ ] Verify email confirmation (if enabled)
- [ ] Test user login
- [ ] Test logout
- [ ] Verify JWT token is stored

### Companion Selection
- [ ] View companions list
- [ ] Verify companions load from database
- [ ] Test companion search
- [ ] Select a companion

### Video Call
- [ ] Grant camera/microphone permissions
- [ ] Initiate video call
- [ ] Verify WebRTC connection establishes
- [ ] Check video streams display
- [ ] Test microphone mute/unmute
- [ ] Test camera on/off
- [ ] Verify call duration counter

### Chat & AI
- [ ] Send chat message
- [ ] Verify message appears in chat panel
- [ ] Wait for AI response
- [ ] Verify AI response uses context (LangMem)
- [ ] Send follow-up message
- [ ] Verify AI remembers conversation

### D-ID Avatar (If Configured)
- [ ] Check if avatar appears
- [ ] Verify avatar animates when AI speaks
- [ ] Check lip-sync quality
- [ ] Verify avatar stream is smooth

### Call Recording (If Enabled)
- [ ] Start call recording
- [ ] Stop call recording
- [ ] Verify recording uploads
- [ ] Check recording appears in database
- [ ] Verify recording is playable

### End Call
- [ ] Click "End Call"
- [ ] Verify call ends properly
- [ ] Check room status updates to "ended"
- [ ] Verify user redirects to companions page

### Cross-Browser Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Test on mobile Chrome
- [ ] Test on mobile Safari

### Network Conditions
- [ ] Test on good connection
- [ ] Test on slow 3G
- [ ] Test with VPN
- [ ] Test with corporate firewall
- [ ] Verify TURN servers help with NAT

## Monitoring Setup

### Application Monitoring
- [ ] Set up Vercel Analytics
- [ ] Set up Render Metrics
- [ ] Configure error tracking (Sentry recommended)
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure log aggregation

### Database Monitoring
- [ ] Monitor Supabase dashboard
- [ ] Set up usage alerts
- [ ] Monitor RLS policy performance
- [ ] Check storage usage
- [ ] Review slow queries

### API Service Monitoring
- [ ] Monitor Google Gemini API usage
- [ ] Monitor ElevenLabs API credits
- [ ] Monitor D-ID API credits
- [ ] Set up quota alerts
- [ ] Review API error rates

## Performance Optimization

### Frontend
- [ ] Enable Vercel Edge Network
- [ ] Configure caching headers
- [ ] Optimize images with Vercel Image Optimization
- [ ] Enable gzip/brotli compression
- [ ] Implement lazy loading for routes

### Backend
- [ ] Enable response compression
- [ ] Set up Redis caching (optional)
- [ ] Configure connection pooling
- [ ] Implement rate limiting
- [ ] Add request timeout limits

### Database
- [ ] Monitor query performance
- [ ] Add missing indexes if needed
- [ ] Set up connection pooling
- [ ] Configure automatic backups
- [ ] Archive old data periodically

## Security Hardening

### SSL/TLS
- [ ] Verify HTTPS is enforced (Vercel/Render auto)
- [ ] Check SSL certificate is valid
- [ ] Verify WebSocket uses WSS
- [ ] Test mixed content warnings

### CORS
- [ ] Verify CORS allows only production domains
- [ ] Test CORS from unauthorized origin fails
- [ ] Check preflight requests work

### Authentication
- [ ] Test expired JWT rejection
- [ ] Verify RLS policies work
- [ ] Test unauthorized access fails
- [ ] Check session timeout works

### API Keys
- [ ] Verify no API keys in client code
- [ ] Check environment variables are secure
- [ ] Rotate any exposed keys
- [ ] Set up key rotation schedule

### Rate Limiting (Recommended)
- [ ] Implement rate limiting on backend
- [ ] Configure limits per endpoint
- [ ] Add rate limit headers
- [ ] Test rate limit enforcement

## Backup & Recovery

### Database Backups
- [ ] Enable Supabase automatic backups
- [ ] Configure backup retention period
- [ ] Test database restore procedure
- [ ] Document recovery steps

### Code Backups
- [ ] Verify Git repository is up to date
- [ ] Tag production release
- [ ] Document rollback procedure
- [ ] Keep previous deployment accessible

### Configuration Backups
- [ ] Export environment variables
- [ ] Save deployment configurations
- [ ] Document third-party integrations
- [ ] Store credentials securely

## Documentation

### User Documentation
- [ ] Create user guide
- [ ] Add FAQ section
- [ ] Document known issues
- [ ] Provide troubleshooting tips

### Developer Documentation
- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Add API documentation link
- [ ] Include architecture diagrams

### Operations Documentation
- [ ] Document monitoring setup
- [ ] Add runbook for common issues
- [ ] Include escalation procedures
- [ ] Document maintenance windows

## Communication

### Stakeholders
- [ ] Notify team of deployment
- [ ] Share production URLs
- [ ] Provide access credentials (if needed)
- [ ] Schedule feedback session

### Users (If Applicable)
- [ ] Announce launch
- [ ] Provide getting started guide
- [ ] Share support contact
- [ ] Collect initial feedback

## Post-Launch

### Week 1
- [ ] Monitor error rates daily
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Fix critical issues immediately

### Week 2-4
- [ ] Analyze usage patterns
- [ ] Optimize slow queries
- [ ] Address user requests
- [ ] Plan feature improvements

### Ongoing
- [ ] Weekly metrics review
- [ ] Monthly security audit
- [ ] Quarterly dependency updates
- [ ] Regular backup testing

## Rollback Plan

### If Deployment Fails
1. [ ] Check deployment logs
2. [ ] Identify error cause
3. [ ] Fix locally and redeploy
4. [ ] Or rollback to previous version
5. [ ] Notify stakeholders

### Rollback Steps
1. [ ] Go to Vercel/Render dashboard
2. [ ] Find previous successful deployment
3. [ ] Click "Promote to Production"
4. [ ] Verify rollback successful
5. [ ] Investigate and fix issue

## Success Criteria

- [ ] Frontend loads without errors
- [ ] Backend health check passes
- [ ] User can register and login
- [ ] Video calls connect successfully
- [ ] AI responses work correctly
- [ ] No critical errors in logs
- [ ] Performance meets requirements
- [ ] Security tests pass
- [ ] All core features working

---

## Sign-off

**Deployed By**: ___________________
**Date**: ___________________
**Frontend URL**: ___________________
**Backend URL**: ___________________
**Status**: ⬜ Success  ⬜ Failed  ⬜ Partial

**Notes**:
________________________________
________________________________
________________________________
