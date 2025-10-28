@echo off
echo 🌅 Starting Work - Daily Sync
echo.

echo Getting latest changes from main...
git pull origin main

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to pull changes. Check internet connection.
    pause
    exit /b 1
)

echo.
echo ✅ Ready to work!
echo Your branch is synced with latest changes.
echo.
echo 💡 Remember:
echo   - Commit every hour: git add . && git commit -m "description"
echo   - Push regularly: git push
echo   - Run end-work.bat at 6 PM
echo.
pause