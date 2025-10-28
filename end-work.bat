@echo off
echo 🌅 End of Work - Integration Script
echo.

echo Current status:
git status
echo.

set /p CONFIRM="Have you committed all changes? (y/n): "
if /i "%CONFIRM%" NEQ "y" (
    echo Please commit your changes first using quick-commit.bat
    pause
    exit /b 1
)

echo Getting your current branch...
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i

echo Final push to your branch...
git push

echo Switching to dev branch...
git checkout dev

echo Getting latest dev changes...
git pull origin dev

echo Merging your changes from %CURRENT_BRANCH%...
git merge %CURRENT_BRANCH%

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Merge conflicts! Please resolve manually.
    pause
    exit /b 1
)

echo Pushing integrated changes to dev...
git push origin dev

echo Returning to your branch...
git checkout %CURRENT_BRANCH%

echo.
echo ✅ End of day integration complete!
echo Your changes are now in the dev branch.
echo.
pause