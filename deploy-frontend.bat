@echo off
echo Deploying Frontend to Google Cloud Run...

set PROJECT_ID=your-project-id
set SERVICE_NAME=fluidjobs-frontend
set REGION=us-central1

cd FluidJobs.ai

echo Building and pushing Docker image...
gcloud builds submit --tag gcr.io/%PROJECT_ID%/%SERVICE_NAME%

echo Deploying to Cloud Run...
gcloud run deploy %SERVICE_NAME% ^
  --image gcr.io/%PROJECT_ID%/%SERVICE_NAME% ^
  --platform managed ^
  --region %REGION% ^
  --allow-unauthenticated ^
  --port 80

echo Frontend deployed successfully!
pause