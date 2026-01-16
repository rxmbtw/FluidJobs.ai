@echo off
echo ========================================
echo FORCE REFRESH - SuperAdmin Dashboard Fix
echo ========================================

echo.
echo 1. Killing all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo 2. Starting backend server...
start "Backend Server" cmd /k "cd /d d:\FluidJobs.ai\backend && npm run dev"

echo 3. Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak >nul

echo 4. Starting frontend server...
start "Frontend Server" cmd /k "cd /d d:\FluidJobs.ai\FluidJobs.ai && npm start"

echo.
echo ========================================
echo SERVERS STARTED!
echo ========================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo SuperAdmin: http://localhost:3000/superadmin/dashboard
echo.
echo Press Ctrl+Shift+R in browser to hard refresh!
echo ========================================
pause