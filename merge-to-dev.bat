@echo off
echo 🔄 End of Day - Merge to Dev Branch
echo.

set /p BRANCH_NAME="Enter your branch name (frontend-dev/backend-dev/database-dev): "

echo Current branch status:
git status

echo.
set /p CONFIRM="Have you committed all your changes? (y/n): "
if /i "%CONFIRM%" NEQ "y" (
    echo Please commit your changes first and run this script again.
    pause
    exit /b 1
)

echo Switching to dev branch...
git checkout dev

echo Pulling latest dev changes...
git pull origin dev

echo Merging your feature branch...
git merge feature/%BRANCH_NAME%

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Merge conflicts detected in dev branch!
    echo Please resolve conflicts and complete merge manually.
    pause
    exit /b 1
)

echo Pushing updated dev branch...
git push origin dev

echo Switching back to your feature branch...
git checkout feature/%BRANCH_NAME%

echo.
echo ✅ Successfully merged to dev branch!
echo Your changes are now integrated with the team.
echo.
pause