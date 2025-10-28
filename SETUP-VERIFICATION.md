# ✅ Setup Verification Checklist

## Pre-Requirements
- [ ] Node.js v16+ installed
- [ ] PostgreSQL v12+ installed and running
- [ ] Git installed

## Environment Setup
- [ ] `backend/.env` exists with all variables filled
- [ ] `FluidJobs.ai/.env` exists with backend URL
- [ ] Google OAuth credentials configured
- [ ] JWT secrets are 32+ characters

## Database Verification
- [ ] PostgreSQL server running
- [ ] Database `fluidjobs_db` created
- [ ] Connection test passes: `node debug-db-test.js`
- [ ] Candidates table exists with data

## Backend Verification
- [ ] Dependencies installed: `cd backend && npm install`
- [ ] Server starts: `npm run dev`
- [ ] Health endpoint responds: `curl http://localhost:8000/api/health`
- [ ] Protected endpoints return 401: `curl http://localhost:8000/api/candidates`

## Frontend Verification
- [ ] Dependencies installed: `cd FluidJobs.ai && npm install`
- [ ] App builds: `npm run build`
- [ ] App starts: `npm start`
- [ ] Landing page loads: `curl http://localhost:3000`

## Authentication Flow
- [ ] Google OAuth redirect works: `curl http://localhost:8000/api/auth/google`
- [ ] Callback endpoint configured
- [ ] JWT tokens generated properly

## Final Test
- [ ] Both servers running simultaneously
- [ ] Frontend can communicate with backend
- [ ] Google login flow completes
- [ ] Protected routes work with authentication

## Common Issues & Solutions

**Database Connection Failed:**
```bash
# Check PostgreSQL is running
pg_ctl status
# Verify credentials in .env match your setup
```

**Port Already in Use:**
```bash
# Kill processes on ports 3000/8000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Google OAuth Error:**
- Verify redirect URI matches exactly: `http://localhost:8000/api/auth/google/callback`
- Check authorized origins include: `http://localhost:3000`

**Build Errors:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```