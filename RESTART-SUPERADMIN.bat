@echo off
color 0A
echo.
echo ============================================================
echo    SUPERADMIN DASHBOARD - COMPLETE CACHE CLEAR AND RESTART
echo ============================================================
echo.

echo [1/6] Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak > nul
echo       Done!

echo.
echo [2/6] Clearing React build cache...
cd "d:\FluidJobs.ai\FluidJobs.ai"
if exist "build" (
    rmdir /s /q "build"
    echo       Deleted: build/
)
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo       Deleted: node_modules\.cache/
)
if exist ".cache" (
    rmdir /s /q ".cache"
    echo       Deleted: .cache/
)
echo       Done!

echo.
echo [3/6] Clearing npm cache...
npm cache clean --force >nul 2>&1
echo       Done!

echo.
echo [4/6] Starting Backend Server...
cd "d:\FluidJobs.ai\backend"
start "FluidJobs Backend" cmd /k "color 0B && echo Backend Server Running... && npm run dev"
timeout /t 5 /nobreak > nul
echo       Backend started on http://localhost:8000

echo.
echo [5/6] Starting Frontend Application...
cd "d:\FluidJobs.ai\FluidJobs.ai"
start "FluidJobs Frontend" cmd /k "color 0E && echo Frontend Application Running... && set GENERATE_SOURCEMAP=false && npm start"
echo       Frontend starting on http://localhost:3000

echo.
echo [6/6] Opening browser...
timeout /t 10 /nobreak > nul
start http://localhost:3000/superadmin/login

echo.
echo ============================================================
echo                    IMPORTANT INSTRUCTIONS
echo ============================================================
echo.
echo  When browser opens, you MUST do ONE of these:
echo.
echo  OPTION 1 - Hard Refresh (Recommended):
echo    Press: Ctrl + Shift + R
echo    Or:    Ctrl + F5
echo.
echo  OPTION 2 - Clear Browser Cache:
echo    1. Press Ctrl + Shift + Delete
echo    2. Select "Cached images and files"
echo    3. Click "Clear data"
echo    4. Refresh page (F5)
echo.
echo  OPTION 3 - Use Incognito Mode:
echo    Press: Ctrl + Shift + N (Chrome/Edge)
echo    Then navigate to: http://localhost:3000/superadmin/login
echo.
echo ============================================================
echo.
echo  After login, open Browser Console (F12) and verify:
echo  You should see: "SuperAdminDashboard LOADED - Version 2026-01-17"
echo.
echo ============================================================
echo.
pause
