@echo off
echo 🔧 FluidJobs.ai Quick Fix Script
echo.

echo 📋 Checking environment files...
if not exist "backend\.env" (
    echo ❌ Backend .env missing - copying template
    copy "backend\.env.template" "backend\.env"
) else (
    echo ✅ Backend .env exists
)

if not exist "FluidJobs.ai\.env" (
    echo ❌ Frontend .env missing - copying template  
    copy "FluidJobs.ai\.env.template" "FluidJobs.ai\.env"
) else (
    echo ✅ Frontend .env exists
)

echo.
echo 📦 Installing dependencies...
cd backend
call npm install
cd ..\FluidJobs.ai
call npm install
cd ..

echo.
echo 🗄️ Testing database connection...
cd backend
node ..\debug-db-test.js
cd ..

echo.
echo ✅ Quick fix complete!
echo 📝 Next steps:
echo   1. Edit .env files with your actual credentials
echo   2. Ensure PostgreSQL is running
echo   3. Run: start.bat
pause