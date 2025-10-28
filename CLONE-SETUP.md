# 🚀 FluidJobs.ai - Post-Clone Setup Guide

## Quick Setup (Automated)
```bash
git clone https://github.com/rxmbtw/FluidJobs.ai.git
cd FluidJobs.ai
quick-fix.bat  # Windows
```

## Manual Setup Steps

### 1. Environment Configuration
```bash
# Copy environment templates
copy backend\.env.template backend\.env
copy FluidJobs.ai\.env.template FluidJobs.ai\.env
```

### 2. Configure Environment Variables

**Backend (.env):**
```env
# Database (Update with your PostgreSQL credentials)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=fluidjobs_db

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Generate random 32+ character strings
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
SESSION_SECRET=your-session-secret-key-min-32-chars

# Server URLs
PORT=8000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb fluidjobs_db

# Run schema setup
psql -U postgres -d fluidjobs_db -f debug-database-setup.sql
```

### 4. Install Dependencies & Start
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd FluidJobs.ai
npm install
npm start
```

### 5. Verify Setup
```bash
# Test database connection
node debug-db-test.js

# Test API endpoints
curl http://localhost:8000/api/health
curl http://localhost:3000
```

## Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Set authorized origins: `http://localhost:3000`
5. Set redirect URIs: `http://localhost:8000/api/auth/google/callback`

## Troubleshooting
- Run `debug-db-test.js` for database issues
- Check `debug-api-security.js` for API problems
- Use browser console with `routeDebugger.checkRoutes()` for frontend issues

## Security Features
✅ All API endpoints require authentication
✅ JWT token validation
✅ Role-based access control
✅ CORS properly configured