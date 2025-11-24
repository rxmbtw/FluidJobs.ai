@echo off
echo ========================================
echo   FluidJobs.ai Forgot Password Setup
echo ========================================
echo.

echo ✅ Database table created successfully
echo ✅ Backend routes configured
echo ✅ Frontend modal integrated
echo.

echo ⚠️  EMAIL SETUP REQUIRED:
echo.
echo Your current email: ramsurse2@gmail.com
echo Status: Needs Gmail App Password
echo.
echo NEXT STEPS:
echo 1. Go to https://myaccount.google.com/security
echo 2. Enable 2-Factor Authentication
echo 3. Generate App Password for "Mail"
echo 4. Replace EMAIL_PASS in backend\.env with App Password
echo.
echo After setup, test with:
echo   cd backend
echo   node scripts/test-email.js
echo.
echo ========================================
echo   Setup Complete! 
echo   Configure Gmail App Password to finish
echo ========================================
pause