@echo off
echo 🚀 Setting up parallel development branches for FluidJobs.ai
echo.

echo Creating dev branch...
git checkout -b dev
git push -u origin dev

echo Creating frontend development branch...
git checkout -b feature/frontend-dev
git push -u origin feature/frontend-dev

echo Creating backend development branch...  
git checkout -b feature/backend-dev
git push -u origin feature/backend-dev

echo Creating database development branch...
git checkout -b feature/database-dev
git push -u origin feature/database-dev

echo Returning to main branch...
git checkout main

echo.
echo ✅ All branches created successfully!
echo.
echo 📋 Available branches:
echo   - main (production)
echo   - dev (integration)
echo   - feature/frontend-dev (Developer 1)
echo   - feature/backend-dev (Developer 2)  
echo   - feature/database-dev (Developer 3)
echo.
echo 🎯 Next steps:
echo   1. Each developer clones the repo
echo   2. Each developer checks out their assigned branch
echo   3. Follow PARALLEL-DEVELOPMENT-GUIDE.md
echo.
pause