@echo off
echo Starting FluidJobs.ai Application...
echo.

echo Installing dependencies...
cd FluidJobs.ai
call npm install
cd ..\backend
call npm install
cd ..

echo.
echo Starting Backend Server...
start "FluidJobs Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Application...
start "FluidJobs Frontend" cmd /k "cd FluidJobs.ai && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
pause