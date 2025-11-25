# FluidJobs.ai

AI-powered job platform with candidate management and Google authentication.

## Quick Start

```bash
git clone https://github.com/rxmbtw/FluidJobs.ai.git
cd FluidJobs.ai
start.bat
```

## What You Need

- Node.js (v16+)
- PostgreSQL (v12+)

## Setup

1. **Clone and run:**
   ```bash
   git clone https://github.com/rxmbtw/FluidJobs.ai.git
   cd FluidJobs.ai
   start.bat
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env` in both `FluidJobs.ai/` and `backend/` folders
   - Add your database URL and Google OAuth credentials

3. **Access:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

## Features

- React + TypeScript frontend
- Node.js + Express backend
- PostgreSQL database
- Google OAuth login
- Candidate management
- File uploads
- Search and filtering

## Tech Stack

**Frontend:** React, TypeScript, Tailwind CSS  
**Backend:** Node.js, Express, PostgreSQL  
**Auth:** Google OAuth, JWT

## Project Structure

```
FluidJobs.ai/
├── FluidJobs.ai/    # React frontend
├── backend/         # Node.js backend
└── start.bat        # Quick start script
```

## License

MIT License
