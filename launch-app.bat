@echo off
echo Starting FluidJobs.ai Application...
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd /d backend && npm run dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend...
start "Frontend" cmd /k "cd /d FluidJobs.ai && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
pause