@echo off
echo ========================================
echo FORCE REFRESH - SuperAdmin Dashboard
echo ========================================
echo.

echo Step 1: Killing all Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak > nul

echo Step 2: Deleting build cache...
cd "d:\FluidJobs.ai\FluidJobs.ai"
if exist "build" rmdir /s /q "build"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"
if exist ".cache" rmdir /s /q ".cache"

echo Step 3: Starting backend...
cd "d:\FluidJobs.ai\backend"
start "Backend" cmd /k "npm run dev"
timeout /t 5 /nobreak > nul

echo Step 4: Starting frontend with cache clear...
cd "d:\FluidJobs.ai\FluidJobs.ai"
start "Frontend" cmd /k "set GENERATE_SOURCEMAP=false && npm start"

echo.
echo ========================================
echo IMPORTANT: In your browser, do this:
echo 1. Press Ctrl+Shift+Delete
echo 2. Clear "Cached images and files"
echo 3. OR Press Ctrl+F5 to hard refresh
echo ========================================
echo.
pause
