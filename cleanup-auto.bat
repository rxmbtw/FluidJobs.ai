@echo off
echo ========================================
echo FluidJobs.ai Auto Cleanup - Starting...
echo ========================================
echo.

echo Creating cleanup log...
echo Cleanup started at %date% %time% > cleanup-log.txt
echo.

REM Backend root cleanup
echo [1/9] Cleaning backend root scripts...
cd backend
if exist add-admin.js del /q add-admin.js 2>nul && echo Deleted: add-admin.js >> ..\cleanup-log.txt
if exist create_table.js del /q create_table.js 2>nul && echo Deleted: create_table.js >> ..\cleanup-log.txt
if exist create-test-job.js del /q create-test-job.js 2>nul && echo Deleted: create-test-job.js >> ..\cleanup-log.txt
if exist debug-accounts.js del /q debug-accounts.js 2>nul && echo Deleted: debug-accounts.js >> ..\cleanup-log.txt
if exist debug-unpublish.js del /q debug-unpublish.js 2>nul && echo Deleted: debug-unpublish.js >> ..\cleanup-log.txt
if exist delete-jobs-without-pdf.js del /q delete-jobs-without-pdf.js 2>nul && echo Deleted: delete-jobs-without-pdf.js >> ..\cleanup-log.txt
if exist explain-migration-failures.js del /q explain-migration-failures.js 2>nul && echo Deleted: explain-migration-failures.js >> ..\cleanup-log.txt
if exist get-job-details.js del /q get-job-details.js 2>nul && echo Deleted: get-job-details.js >> ..\cleanup-log.txt
if exist investigate-jd-pdfs.js del /q investigate-jd-pdfs.js 2>nul && echo Deleted: investigate-jd-pdfs.js >> ..\cleanup-log.txt
if exist list-bucket.js del /q list-bucket.js 2>nul && echo Deleted: list-bucket.js >> ..\cleanup-log.txt
if exist list-jobs-without-pdf.js del /q list-jobs-without-pdf.js 2>nul && echo Deleted: list-jobs-without-pdf.js >> ..\cleanup-log.txt
if exist list-jobs.js del /q list-jobs.js 2>nul && echo Deleted: list-jobs.js >> ..\cleanup-log.txt
if exist migrate.js del /q migrate.js 2>nul && echo Deleted: migrate.js >> ..\cleanup-log.txt
if exist republish-jobs.js del /q republish-jobs.js 2>nul && echo Deleted: republish-jobs.js >> ..\cleanup-log.txt
if exist run-migration.js del /q run-migration.js 2>nul && echo Deleted: run-migration.js >> ..\cleanup-log.txt
if exist setup-jobs-schema.js del /q setup-jobs-schema.js 2>nul && echo Deleted: setup-jobs-schema.js >> ..\cleanup-log.txt
if exist setup-unpublish-table.js del /q setup-unpublish-table.js 2>nul && echo Deleted: setup-unpublish-table.js >> ..\cleanup-log.txt
if exist test-auth-endpoint.js del /q test-auth-endpoint.js 2>nul && echo Deleted: test-auth-endpoint.js >> ..\cleanup-log.txt
if exist test-crud-operations.js del /q test-crud-operations.js 2>nul && echo Deleted: test-crud-operations.js >> ..\cleanup-log.txt
if exist test-db.js del /q test-db.js 2>nul && echo Deleted: test-db.js >> ..\cleanup-log.txt
if exist test-server.js del /q test-server.js 2>nul && echo Deleted: test-server.js >> ..\cleanup-log.txt
if exist test-upload.js del /q test-upload.js 2>nul && echo Deleted: test-upload.js >> ..\cleanup-log.txt
if exist verify-jobs-match.js del /q verify-jobs-match.js 2>nul && echo Deleted: verify-jobs-match.js >> ..\cleanup-log.txt
if exist verify-setup.bat del /q verify-setup.bat 2>nul && echo Deleted: verify-setup.bat >> ..\cleanup-log.txt
if exist replace-candidates.bat del /q replace-candidates.bat 2>nul && echo Deleted: replace-candidates.bat >> ..\cleanup-log.txt
if exist replace-candidates.sh del /q replace-candidates.sh 2>nul && echo Deleted: replace-candidates.sh >> ..\cleanup-log.txt
if exist .env.minio del /q .env.minio 2>nul && echo Deleted: .env.minio >> ..\cleanup-log.txt
if exist .env.template del /q .env.template 2>nul && echo Deleted: .env.template >> ..\cleanup-log.txt
echo Done: Backend root cleaned

REM Backend scripts cleanup
echo [2/9] Cleaning backend scripts folder...
cd scripts
del /q add-admin-users.js add-all-pdfs.js add-auth-fields.js add-job-pdf-manual.js add-no-of-openings.js add-org-fields.js add-pdf-for-existing-job.js add-registration-dates.js add-sample-pdf-record.js 2>nul
del /q check-bucket-files.js check-candidates-table.js check-job-attachments.js check-schema.js check-tables.js check-user.js 2>nul
del /q clean-database.js cleanup-admin-users.js cleanup-jobs-keep-10.js correct-import.js 2>nul
del /q create-application-details-table.js create-auth-table.js create-bucket-simple.js create-candidate-skills-table.js create-contact-table.js 2>nul
del /q create-email-logs-table.js create-email-templates-table.js create-final-missing-tables.js create-inquiries-table.js create-interviews-table.js 2>nul
del /q create-job-metrics-table.js create-job-requirements-table.js create-login-attempts-table.js create-notifications-table.js create-password-reset-table.sql 2>nul
del /q create-remaining-tables.js create-sample-job-with-pdf.js create-saved-jobs-table.js create-sessions-table.js create-skills-master-table.js 2>nul
del /q create-status-history-table.js create-test-user.js create-user-activity-table.js 2>nul
del /q examine-csv.js examine-specific-record.js import-correct-data.js import-corrected-mapping.js import-jds-from-bucket.js import-original-candidates.js 2>nul
del /q make-bucket-public.js manual-bucket-setup.md replace-candidates-from-gcs.js setup-enhanced-jobs.js setup-forgot-password.js setup-gcs-bucket.js setup-password-reset.js 2>nul
del /q simple-fix.js test-attachment-api.js test-gcs-config.js test-google-auth.js test-registration.js 2>nul
del /q update-with-manual-pdf.js upload-job-pdf-gcs.js upload-job-pdf.js upload-pdf-to-bucket.js upload-real-pdf.js use-public-pdf.js 2>nul
del /q verify-database-completeness.js verify-import.js candidates_backup_*.json 2>nul
echo Done: Backend scripts cleaned (kept create-superadmin.js and test-email.js)

REM Backend config cleanup
echo [3/9] Cleaning backend config SQL files...
cd ..\config
del /q *.sql 2>nul
echo Done: Backend config cleaned

REM Backend migrations cleanup
echo [4/9] Cleaning obsolete migrations...
cd ..\migrations
if exist 002_gcp_schema.sql del /q 002_gcp_schema.sql 2>nul && echo Deleted: migrations/002_gcp_schema.sql >> ..\..\cleanup-log.txt
echo Done: Migrations cleaned

REM Frontend google-cloud-sdk cleanup
echo [5/9] Removing Google Cloud SDK (~500MB)...
cd ..\..\FluidJobs.ai
if exist google-cloud-sdk (
    rmdir /s /q google-cloud-sdk 2>nul && echo Deleted: google-cloud-sdk folder >> ..\cleanup-log.txt
    echo Done: Google Cloud SDK removed
) else (
    echo Done: Google Cloud SDK already removed
)

REM Frontend -p folder cleanup
echo [6/9] Removing unknown -p folder...
if exist -p (
    rmdir /s /q -p 2>nul && echo Deleted: -p folder >> ..\cleanup-log.txt
    echo Done: -p folder removed
) else (
    echo Done: -p folder already removed
)

REM Frontend duplicate dashboards
echo [7/9] Removing duplicate dashboard files...
if exist src\components\CandidateDashboard.tsx del /q src\components\CandidateDashboard.tsx 2>nul && echo Deleted: CandidateDashboard.tsx >> ..\cleanup-log.txt
if exist src\components\CompanyDashboard.tsx del /q src\components\CompanyDashboard.tsx 2>nul && echo Deleted: CompanyDashboard.tsx >> ..\cleanup-log.txt
if exist src\components\DashboardLayout.tsx del /q src\components\DashboardLayout.tsx 2>nul && echo Deleted: DashboardLayout.tsx >> ..\cleanup-log.txt
if exist src\components\DashboardRouter.tsx del /q src\components\DashboardRouter.tsx 2>nul && echo Deleted: DashboardRouter.tsx >> ..\cleanup-log.txt
if exist src\pages\dashboard\CandidateDashboard.tsx del /q src\pages\dashboard\CandidateDashboard.tsx 2>nul && echo Deleted: pages/dashboard/CandidateDashboard.tsx >> ..\cleanup-log.txt
echo Done: Duplicate dashboards removed

REM Root cleanup
echo [8/9] Cleaning root directory...
cd ..
del /q list-bucket.js quick-fix.sh setup-forgot-password.bat test-forgot-password.bat 2>nul
del /q temp_sidebar.txt temp_themed.txt current_sidebar.txt current_themed.txt production.env 2>nul
del /q deploy-backend.bat deploy-frontend.bat update-live.bat launch-app.bat 2>nul
del /q start-backend.bat START-BACKEND-NOW.bat start-work.bat end-work.bat quick-commit.bat start.sh 2>nul
echo Done: Root directory cleaned

echo [9/9] Finalizing cleanup...
echo. >> cleanup-log.txt
echo Cleanup completed at %date% %time% >> cleanup-log.txt
echo Done: Cleanup complete!

echo.
echo ========================================
echo Cleanup Summary
echo ========================================
echo Done: Backend root scripts removed
echo Done: Backend scripts folder cleaned
echo Done: Backend config SQL files removed
echo Done: Obsolete migrations removed
echo Done: Google Cloud SDK removed
echo Done: Duplicate dashboards removed
echo Done: Root directory cleaned
echo.
echo Check cleanup-log.txt for detailed list
echo.
