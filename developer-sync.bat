@echo off
echo 🔄 Developer Daily Sync Script
echo.

set /p BRANCH_NAME="Enter your branch name (frontend-dev/backend-dev/database-dev): "

echo Fetching latest changes from origin...
git fetch origin

echo Merging latest main branch changes...
git merge origin/main

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Merge conflicts detected!
    echo Please resolve conflicts manually and run script again.
    pause
    exit /b 1
)

echo Pushing updated branch...
git push origin feature/%BRANCH_NAME%

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Push failed! Check your branch name and try again.
    pause
    exit /b 1
)

echo.
echo ✅ Sync completed successfully!
echo Your branch is now up to date with main.
echo.
pause