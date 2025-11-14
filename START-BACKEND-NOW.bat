@echo off
title FluidJobs.ai Backend Server
color 0A
echo ========================================
echo   FluidJobs.ai Backend Server
echo ========================================
echo.
echo Starting server on http://localhost:8000
echo.
cd /d "%~dp0\backend"
node server.js
pause
