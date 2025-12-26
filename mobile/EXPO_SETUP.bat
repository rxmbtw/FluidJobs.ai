@echo off
echo ========================================
echo FluidJobs Mobile - Expo Setup
echo ========================================
echo.

echo Step 1: Installing Expo CLI...
call npm install -g expo-cli
echo.

echo Step 2: Creating Expo project...
cd ..
call npx create-expo-app FluidJobsMobile --template blank-typescript
echo.

echo Step 3: Installing dependencies...
cd FluidJobsMobile
call npm install @react-navigation/native @react-navigation/bottom-tabs axios
call npx expo install react-native-screens react-native-safe-area-context
call npx expo install react-native-gesture-handler react-native-reanimated
echo.

echo Step 4: Creating src directory...
mkdir src
mkdir src\components
mkdir src\screens
mkdir src\navigation
mkdir src\assets
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Copy files from mobile\src\ to FluidJobsMobile\src\
echo 2. Copy mobile\App.tsx to FluidJobsMobile\App.tsx
echo 3. Add logo image to FluidJobsMobile\src\assets\logo.png
echo 4. Run: npx expo start
echo.
pause
