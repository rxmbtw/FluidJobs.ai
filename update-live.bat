@echo off
echo Updating Live Application...

set /p component="Update (1) Backend, (2) Frontend, or (3) Both? "

if "%component%"=="1" goto backend
if "%component%"=="2" goto frontend
if "%component%"=="3" goto both

:backend
echo Updating Backend...
call deploy-backend.bat
goto end

:frontend
echo Updating Frontend...
call deploy-frontend.bat
goto end

:both
echo Updating Both Services...
call deploy-backend.bat
call deploy-frontend.bat
goto end

:end
echo Update completed!
pause