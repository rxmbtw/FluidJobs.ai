@echo off
echo ========================================
echo FluidJobs.ai Project Cleanup Script
echo ========================================
echo.
echo This will delete 150+ obsolete files including:
echo - Old migration scripts
echo - GCP/GCS related files
echo - Debug and test scripts
echo - Duplicate dashboard files
echo - Google Cloud SDK folder (~500MB)
echo.
echo ⚠️  WARNING: This action cannot be undone!
echo.
pause
echo.

echo Creating backup list of files to delete...
echo Cleanup started at %date% %time% > cleanup-log.txt
echo.

REM Backend root cleanup
echo [1/9] Cleaning backend root scripts...
cd backend
if exist add-admin.js del /q add-admin.js && echo Deleted: add-admin.js >> ..\cleanup-log.txt
if exist create_table.js del /q create_table.js && echo Deleted: create_table.js >> ..\cleanup-log.txt
if exist create-test-job.js del /q create-test-job.js && echo Deleted: create-test-job.js >> ..\cleanup-log.txt
if exist debug-accounts.js del /q debug-accounts.js && echo Deleted: debug-accounts.js >> ..\cleanup-log.txt
if exist debug-unpublish.js del /q debug-unpublish.js && echo Deleted: debug-unpublish.js >> ..\cleanup-log.txt
if exist delete-jobs-without-pdf.js del /q delete-jobs-without-pdf.js && echo Deleted: delete-jobs-without-pdf.js >> ..\cleanup-log.txt
if exist explain-migration-failures.js del /q explain-migration-failures.js && echo Deleted: explain-migration-failures.js >> ..\cleanup-log.txt
if exist get-job-details.js del /q get-job-details.js && echo Deleted: get-job-details.js >> ..\cleanup-log.txt
if exist investigate-jd-pdfs.js del /q investigate-jd-pdfs.js && echo Deleted: investigate-jd-pdfs.js >> ..\cleanup-log.txt
if exist list-bucket.js del /q list-bucket.js && echo Deleted: list-bucket.js >> ..\cleanup-log.txt
if exist list-jobs-without-pdf.js del /q list-jobs-without-pdf.js && echo Deleted: list-jobs-without-pdf.js >> ..\cleanup-log.txt
if exist list-jobs.js del /q list-jobs.js && echo Deleted: list-jobs.js >> ..\cleanup-log.txt
if exist migrate.js del /q migrate.js && echo Deleted: migrate.js >> ..\cleanup-log.txt
if exist republish-jobs.js del /q republish-jobs.js && echo Deleted: republish-jobs.js >> ..\cleanup-log.txt
if exist run-migration.js del /q run-migration.js && echo Deleted: run-migration.js >> ..\cleanup-log.txt
if exist setup-jobs-schema.js del /q setup-jobs-schema.js && echo Deleted: setup-jobs-schema.js >> ..\cleanup-log.txt
if exist setup-unpublish-table.js del /q setup-unpublish-table.js && echo Deleted: setup-unpublish-table.js >> ..\cleanup-log.txt
if exist test-auth-endpoint.js del /q test-auth-endpoint.js && echo Deleted: test-auth-endpoint.js >> ..\cleanup-log.txt
if exist test-crud-operations.js del /q test-crud-operations.js && echo Deleted: test-crud-operations.js >> ..\cleanup-log.txt
if exist test-db.js del /q test-db.js && echo Deleted: test-db.js >> ..\cleanup-log.txt
if exist test-server.js del /q test-server.js && echo Deleted: test-server.js >> ..\cleanup-log.txt
if exist test-upload.js del /q test-upload.js && echo Deleted: test-upload.js >> ..\cleanup-log.txt
if exist verify-jobs-match.js del /q verify-jobs-match.js && echo Deleted: verify-jobs-match.js >> ..\cleanup-log.txt
if exist verify-setup.bat del /q verify-setup.bat && echo Deleted: verify-setup.bat >> ..\cleanup-log.txt
if exist replace-candidates.bat del /q replace-candidates.bat && echo Deleted: replace-candidates.bat >> ..\cleanup-log.txt
if exist replace-candidates.sh del /q replace-candidates.sh && echo Deleted: replace-candidates.sh >> ..\cleanup-log.txt
if exist .env.minio del /q .env.minio && echo Deleted: .env.minio >> ..\cleanup-log.txt
if exist .env.template del /q .env.template && echo Deleted: .env.template >> ..\cleanup-log.txt
echo ✓ Backend root cleaned

REM Backend scripts cleanup
echo [2/9] Cleaning backend scripts folder...
cd scripts
for %%f in (add-*.js check-*.js clean-*.js correct-*.js examine-*.js import-*.js make-*.js replace-*.js setup-*.js simple-*.js update-*.js upload-*.js use-*.js verify-*.js) do (
    if exist "%%f" (
        if not "%%f"=="create-superadmin.js" (
            if not "%%f"=="test-email.js" (
                del /q "%%f" && echo Deleted: scripts/%%f >> ..\..\cleanup-log.txt
            )
        )
    )
)
for %%f in (create-*.js) do (
    if exist "%%f" (
        if not "%%f"=="create-superadmin.js" (
            del /q "%%f" && echo Deleted: scripts/%%f >> ..\..\cleanup-log.txt
        )
    )
)
for %%f in (test-*.js) do (
    if exist "%%f" (
        if not "%%f"=="test-email.js" (
            del /q "%%f" && echo Deleted: scripts/%%f >> ..\..\cleanup-log.txt
        )
    )
)
if exist candidates_backup_*.json del /q candidates_backup_*.json && echo Deleted: backup JSON files >> ..\..\cleanup-log.txt
if exist manual-bucket-setup.md del /q manual-bucket-setup.md && echo Deleted: manual-bucket-setup.md >> ..\..\cleanup-log.txt
echo ✓ Backend scripts cleaned (kept create-superadmin.js and test-email.js)

REM Backend config cleanup
echo [3/9] Cleaning backend config SQL files...
cd ..\config
for %%f in (*.sql) do (
    del /q "%%f" && echo Deleted: config/%%f >> ..\..\cleanup-log.txt
)
echo ✓ Backend config cleaned

REM Backend migrations cleanup
echo [4/9] Cleaning obsolete migrations...
cd ..\migrations
if exist 002_gcp_schema.sql del /q 002_gcp_schema.sql && echo Deleted: migrations/002_gcp_schema.sql >> ..\..\cleanup-log.txt
echo ✓ Migrations cleaned

REM Frontend google-cloud-sdk cleanup
echo [5/9] Removing Google Cloud SDK (~500MB)...
cd ..\..\FluidJobs.ai
if exist google-cloud-sdk (
    rmdir /s /q google-cloud-sdk && echo Deleted: google-cloud-sdk folder >> ..\cleanup-log.txt
    echo ✓ Google Cloud SDK removed
) else (
    echo   (already removed)
)

REM Frontend -p folder cleanup
echo [6/9] Removing unknown -p folder...
if exist -p (
    rmdir /s /q -p && echo Deleted: -p folder >> ..\cleanup-log.txt
    echo ✓ -p folder removed
) else (
    echo   (already removed)
)

REM Frontend duplicate dashboards
echo [7/9] Removing duplicate dashboard files...
if exist src\components\CandidateDashboard.tsx del /q src\components\CandidateDashboard.tsx && echo Deleted: CandidateDashboard.tsx >> ..\cleanup-log.txt
if exist src\components\CompanyDashboard.tsx del /q src\components\CompanyDashboard.tsx && echo Deleted: CompanyDashboard.tsx >> ..\cleanup-log.txt
if exist src\components\DashboardLayout.tsx del /q src\components\DashboardLayout.tsx && echo Deleted: DashboardLayout.tsx >> ..\cleanup-log.txt
if exist src\components\DashboardRouter.tsx del /q src\components\DashboardRouter.tsx && echo Deleted: DashboardRouter.tsx >> ..\cleanup-log.txt
if exist src\pages\dashboard\CandidateDashboard.tsx del /q src\pages\dashboard\CandidateDashboard.tsx && echo Deleted: pages/dashboard/CandidateDashboard.tsx >> ..\cleanup-log.txt
echo ✓ Duplicate dashboards removed

REM Root cleanup
echo [8/9] Cleaning root directory...
cd ..
if exist list-bucket.js del /q list-bucket.js && echo Deleted: list-bucket.js >> cleanup-log.txt
if exist quick-fix.sh del /q quick-fix.sh && echo Deleted: quick-fix.sh >> cleanup-log.txt
if exist setup-forgot-password.bat del /q setup-forgot-password.bat && echo Deleted: setup-forgot-password.bat >> cleanup-log.txt
if exist test-forgot-password.bat del /q test-forgot-password.bat && echo Deleted: test-forgot-password.bat >> cleanup-log.txt
if exist temp_sidebar.txt del /q temp_sidebar.txt && echo Deleted: temp_sidebar.txt >> cleanup-log.txt
if exist temp_themed.txt del /q temp_themed.txt && echo Deleted: temp_themed.txt >> cleanup-log.txt
if exist current_sidebar.txt del /q current_sidebar.txt && echo Deleted: current_sidebar.txt >> cleanup-log.txt
if exist current_themed.txt del /q current_themed.txt && echo Deleted: current_themed.txt >> cleanup-log.txt
if exist production.env del /q production.env && echo Deleted: production.env >> cleanup-log.txt
if exist deploy-backend.bat del /q deploy-backend.bat && echo Deleted: deploy-backend.bat >> cleanup-log.txt
if exist deploy-frontend.bat del /q deploy-frontend.bat && echo Deleted: deploy-frontend.bat >> cleanup-log.txt
if exist update-live.bat del /q update-live.bat && echo Deleted: update-live.bat >> cleanup-log.txt
if exist launch-app.bat del /q launch-app.bat && echo Deleted: launch-app.bat >> cleanup-log.txt
if exist start-backend.bat del /q start-backend.bat && echo Deleted: start-backend.bat >> cleanup-log.txt
if exist START-BACKEND-NOW.bat del /q START-BACKEND-NOW.bat && echo Deleted: START-BACKEND-NOW.bat >> cleanup-log.txt
if exist start-work.bat del /q start-work.bat && echo Deleted: start-work.bat >> cleanup-log.txt
if exist end-work.bat del /q end-work.bat && echo Deleted: end-work.bat >> cleanup-log.txt
if exist quick-commit.bat del /q quick-commit.bat && echo Deleted: quick-commit.bat >> cleanup-log.txt
if exist start.sh del /q start.sh && echo Deleted: start.sh >> cleanup-log.txt
echo ✓ Root directory cleaned

echo [9/9] Finalizing cleanup...
echo. >> cleanup-log.txt
echo Cleanup completed at %date% %time% >> cleanup-log.txt
echo ✓ Cleanup complete!

echo.
echo ========================================
echo Cleanup Summary
echo ========================================
echo ✓ Backend root scripts removed
echo ✓ Backend scripts folder cleaned (kept 2 utilities)
echo ✓ Backend config SQL files removed
echo ✓ Obsolete migrations removed
echo ✓ Google Cloud SDK removed (~500MB)
echo ✓ Duplicate dashboards removed
echo ✓ Root directory cleaned
echo.
echo 📝 Check cleanup-log.txt for detailed list
echo.
echo ⚠️  IMPORTANT: Test your application now!
echo    Run: start.bat
echo.
pause
