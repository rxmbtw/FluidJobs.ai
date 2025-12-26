@echo off
cd /d "%~dp0"
echo Starting FluidJobs Mobile Preview...
echo.
echo Choose preview option:
echo 1. Web Browser (fastest)
echo 2. Full Expo Dev Server (all platforms)
echo.
choice /c 12 /n /m "Enter choice (1 or 2): "

if errorlevel 2 goto expo
if errorlevel 1 goto web

:web
echo Starting web preview...
call npm run web
goto end

:expo
echo Starting Expo dev server...
call npm start
goto end

:end
pause
