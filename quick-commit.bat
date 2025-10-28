@echo off
echo 💾 Quick Commit Script
echo.

set /p MESSAGE="Enter commit message: "

if "%MESSAGE%"=="" (
    echo ❌ Commit message required!
    pause
    exit /b 1
)

echo Adding all changes...
git add .

echo Committing with message: %MESSAGE%
git commit -m "%MESSAGE%"

echo Pushing to your branch...
git push

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Push failed! Try again or check connection.
    pause
    exit /b 1
)

echo.
echo ✅ Changes committed and pushed successfully!
echo.
pause