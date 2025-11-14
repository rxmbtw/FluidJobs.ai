@echo off
echo ========================================
echo FluidJobs.ai - Google Auth Setup Check
echo ========================================
echo.

echo Checking environment variables...
echo.

cd /d "%~dp0"

node -e "require('dotenv').config(); console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set ✅' : 'Missing ❌'); console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set ✅' : 'Missing ❌'); console.log('BACKEND_URL:', process.env.BACKEND_URL); console.log('FRONTEND_URL:', process.env.FRONTEND_URL); console.log('DB_HOST:', process.env.DB_HOST); console.log(''); console.log('Google OAuth URL:'); console.log('http://localhost:8000/api/auth/google?role=Candidate');"

echo.
echo ========================================
echo Setup verification complete!
echo ========================================
pause
