@echo off
echo Starting FluidJobs.ai Application...
echo.

echo Killing any existing processes...
taskkill /F /IM node.exe >nul 2>&1

echo Installing dependencies...
cd backend
call npm install
cd ..
cd FluidJobs.ai
call npm install --legacy-peer-deps
cd ..

echo.
echo Starting Backend Server...
start "FluidJobs Backend" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 5 /nobreak > nul

echo Starting Frontend Application...
start "FluidJobs Frontend" cmd /k "cd /d %~dp0FluidJobs.ai && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
pause