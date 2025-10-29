# FluidJobs.ai - Developer Setup Guide

## 🚀 Quick Start for Developers

This guide will help you set up the FluidJobs.ai application with all the latest features including LinkedIn OAuth integration.

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Git

### 1. Clone and Setup

```bash
git clone https://github.com/rxmbtw/FluidJobs.ai.git
cd FluidJobs.ai
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
# Server Configuration
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Database Configuration (Update with your PostgreSQL credentials)
DB_HOST=your_db_host
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# LinkedIn OAuth (Get from LinkedIn Developer Console)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# JWT & Session
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-session-secret-key-change-this-in-production
```

### 3. Frontend Setup

```bash
cd ../FluidJobs.ai
npm install
```

Create `.env` file in frontend directory:
```env
REACT_APP_BACKEND_URL=http://localhost:8000
INLINE_RUNTIME_CHUNK=false
GENERATE_SOURCEMAP=false
```

### 4. Database Setup

1. Create a PostgreSQL database
2. Run the schema files in this order:
   ```bash
   # In backend directory
   psql -d your_database -f config/schema.sql
   psql -d your_database -f config/profile_schema.sql
   psql -d your_database -f config/enhanced_jobs_schema.sql
   psql -d your_database -f config/pending_auth_schema.sql
   ```

### 5. OAuth Setup

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:8000/api/auth/google/callback`

#### LinkedIn OAuth:
1. Go to [LinkedIn Developer Console](https://www.linkedin.com/developers/apps)
2. Create a new app
3. Add redirect URI: `http://localhost:8000/api/auth/linkedin/callback`
4. Enable scopes: `openid`, `profile`, `email`

### 6. Running the Application

#### Start Backend:
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:8000

#### Start Frontend:
```bash
cd FluidJobs.ai
npm start
```
Frontend will run on http://localhost:3000

### 7. Features Available

✅ **Authentication System**
- Google OAuth integration
- LinkedIn OAuth integration
- JWT token-based authentication
- Role-based access (Admin/Candidate)

✅ **User Management**
- Profile creation and editing
- File upload (resumes, profile images)
- Candidate management system

✅ **Job Management**
- Enhanced job posting system
- Job application tracking
- Bulk import functionality

✅ **Database Integration**
- PostgreSQL with optimized schema
- File storage management
- User session handling

### 8. Troubleshooting

#### Port Issues:
If port 8000 is in use:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

#### Database Connection Issues:
- Verify PostgreSQL is running
- Check database credentials in .env
- Ensure database exists and schema is applied

#### OAuth Issues:
- Verify redirect URIs match exactly
- Check client IDs and secrets
- Ensure OAuth apps are properly configured

### 9. Latest Updates (Current Version)

- ✅ Fixed LinkedIn OAuth2 authentication with API v2
- ✅ Added comprehensive error handling and logging
- ✅ Fixed database schema compatibility issues
- ✅ Enhanced authentication flow with proper user data fetching
- ✅ Added file upload and job management features
- ✅ Improved profile management system
- ✅ Fixed CSP issues in frontend
- ✅ Added proper session management

### 10. Development Workflow

1. Pull latest changes: `git pull origin main`
2. Install any new dependencies: `npm install` (in both directories)
3. Update .env files if needed
4. Run database migrations if any
5. Start both servers
6. Test authentication flows

### 11. Support

If you encounter any issues:
1. Check the console logs (both frontend and backend)
2. Verify all environment variables are set
3. Ensure database is properly configured
4. Check OAuth app configurations

The application should work seamlessly after following this setup guide. All authentication flows (Google and LinkedIn) are fully functional.