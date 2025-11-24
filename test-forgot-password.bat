@echo off
echo Testing Forgot Password Functionality...
echo.

echo 1. Make sure backend server is running (start.bat)
echo 2. Go to login page
echo 3. Click "Forgot Your Password?"
echo 4. Enter: ramsurse2@gmail.com
echo 5. Check your email for verification code
echo.

echo ✅ Fixed Issues:
echo   - Table name: users → candidates
echo   - Column name: id → candidate_id  
echo   - Password field: password → password_hash
echo.

echo The forgot password should now work!
pause