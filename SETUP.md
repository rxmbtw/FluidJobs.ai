# FluidJobs.ai Setup Guide

## Quick Start

### Option 1: Automatic Setup (Windows)
```bash
# Clone the repository
git clone https://github.com/rxmbtw/FluidJobs.ai.git
cd FluidJobs.ai

# Run the startup script
start.bat
```

### Option 2: Manual Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/rxmbtw/FluidJobs.ai.git
   cd FluidJobs.ai
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd FluidJobs.ai
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Start Backend Server**
   ```bash
   npm run dev
   ```

5. **Start Frontend Application** (in a new terminal)
   ```bash
   cd FluidJobs.ai
   npm start
   ```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000

## Environment Setup

1. Copy `.env.example` to `.env` in both `FluidJobs.ai/` and `backend/` directories
2. Configure your environment variables as needed
3. Ensure PostgreSQL is running for database functionality

## Features Available

- ✅ Modern React Frontend
- ✅ Node.js/Express Backend  
- ✅ Google Authentication
- ✅ PostgreSQL Database
- ✅ File Upload System
- ✅ Candidate Management
- ✅ Profile Management

## Troubleshooting

- If port 8000 is in use, kill the process: `taskkill /F /IM node.exe`
- If port 3000 is in use, the React app will prompt to use a different port
- Ensure all dependencies are installed before starting the servers