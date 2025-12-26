@echo off
echo Setting up Appwrite CLI...
call appwrite client --endpoint https://sgp.cloud.appwrite.io/v1
call appwrite client --project-id 694e3ccf0014edd1ce85
call appwrite client --key standard_970ab45accffb890835b3e39d3f00456fbbb11362e438e07a6e7925377281707cef0aab6342145f1e6f87302d9f534f235d58698d585602cdf96a3ca6ba39659a825385f894039fec8709972cbd6f8a556ea0043e52b3b173b29ac593d3091986dc4f50d472855962034efa2d726c89f925fb23ae8e5d8c064712fe1b33e486d

echo.
echo Uploading Management folder images...
for %%f in ("D:\FluidJobs.ai\FLuidJobs AI - Image Deck\Management\*.jpg") do (
    echo Uploading: %%~nxf
    call appwrite storage create-file --bucket-id 694e3cfd003213c820b2 --file-id unique^(^) --file "%%f"
)

echo.
echo Uploading Tech folder images...
for %%f in ("D:\FluidJobs.ai\FLuidJobs AI - Image Deck\Tech\*.jpg") do (
    echo Uploading: %%~nxf
    call appwrite storage create-file --bucket-id 694e3cfd003213c820b2 --file-id unique^(^) --file "%%f"
)

echo.
echo Upload complete!
pause
