@echo off
echo ========================================
echo FluidJobs.ai - Replace Candidates Script
echo ========================================
echo.
echo WARNING: This will replace ALL existing candidates!
echo Make sure you have a backup before proceeding.
echo.
set /p confirm="Are you sure you want to continue? (y/N): "
if /i "%confirm%" neq "y" (
    echo Operation cancelled.
    pause
    exit /b 1
)

echo.
echo Starting candidate replacement process...
node scripts/replace-candidates-from-gcs.js

echo.
echo Process completed. Check the output above for results.
pause