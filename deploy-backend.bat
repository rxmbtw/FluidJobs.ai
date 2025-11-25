@echo off
echo Deploying Backend to Google Cloud Run...

set PROJECT_ID=your-project-id
set SERVICE_NAME=fluidjobs-backend
set REGION=us-central1

cd backend

echo Building and pushing Docker image...
gcloud builds submit --tag gcr.io/%PROJECT_ID%/%SERVICE_NAME%

echo Deploying to Cloud Run...
gcloud run deploy %SERVICE_NAME% ^
  --image gcr.io/%PROJECT_ID%/%SERVICE_NAME% ^
  --platform managed ^
  --region %REGION% ^
  --allow-unauthenticated ^
  --port 8080 ^
  --set-env-vars DATABASE_URL=%DATABASE_URL%,GOOGLE_CLIENT_ID=%GOOGLE_CLIENT_ID%,GOOGLE_CLIENT_SECRET=%GOOGLE_CLIENT_SECRET%,JWT_SECRET=%JWT_SECRET%

echo Backend deployed successfully!
pause