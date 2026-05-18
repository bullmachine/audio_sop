@echo off
REM Production Data Sync Script - Runs daily at 6 AM (06:00)
REM No authentication required - calls system endpoint

set PROJECT_DIR=C:\mern\cost_rate_approval\backend
set LOG_FILE=%PROJECT_DIR%\logs\cron-sync.log

REM Load environment variables from .env file
set "ENV_FILE=%PROJECT_DIR%\.env"
if exist "%ENV_FILE%" (
    for /f "usebackq tokens=1,2 delims==" %%a in ("%ENV_FILE%") do (
        if /i "%%a"=="PORT" set "SERVER_PORT=%%b"
        if /i "%%a"=="HOST" set "SERVER_HOST=%%b"
    )
)

REM Build API URL from environment variables
if "%SERVER_HOST%"=="" set "SERVER_HOST=localhost"
if "%SERVER_PORT%"=="" set "SERVER_PORT=5000"
set "API_URL=http://%SERVER_HOST%:%SERVER_PORT%/api/system-cron/sync"
set "HEALTH_URL=http://%SERVER_HOST%:%SERVER_PORT%/api/system-cron/health"

REM Create logs directory if it doesn't exist
if not exist "%PROJECT_DIR%\logs" mkdir "%PROJECT_DIR%\logs"

REM Debug: Log the values being used
echo %date% %time% - SERVER_HOST: %SERVER_HOST% >> "%LOG_FILE%"
echo %date% %time% - SERVER_PORT: %SERVER_PORT% >> "%LOG_FILE%"

REM Log start
echo %date% %time% - Starting 6 AM production data sync... >> "%LOG_FILE%"
echo %date% %time% - Using API URL: %API_URL% >> "%LOG_FILE%"

REM Check if server is running
powershell -Command "try { Invoke-RestMethod -Uri '%HEALTH_URL%' -UseBasicParsing | Out-Null; exit 0 } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo %date% %time% - ERROR: Server not running at %HEALTH_URL% >> "%LOG_FILE%"
    exit /b 1
)

REM Trigger the sync
powershell -Command "
try {
    $response = Invoke-RestMethod -Uri '%API_URL%' -Method POST -Headers @{'Content-Type'='application/json'} -Body '{}' -UseBasicParsing
    Write-Output '200'
    $response | ConvertTo-Json -Compress
} catch {
    Write-Output $_.Exception.Response.StatusCode.StatusCode
    Write-Output \"ERROR: $($_.Exception.Message)\"
}
" > temp_response.txt

set /p HTTP_CODE=<temp_response.txt
set /p RESPONSE_BODY=<temp_response.txt
del temp_response.txt

REM Log results
echo %date% %time% - HTTP Status: %HTTP_CODE% >> "%LOG_FILE%"
echo %date% %time% - Response: %RESPONSE_BODY% >> "%LOG_FILE%"

REM Check result
if "%HTTP_CODE%"=="200" (
    echo %date% %time% - 6 AM production data sync completed successfully >> "%LOG_FILE%"
    exit /b 0
) else (
    echo %date% %time% - ERROR: 6 AM production data sync failed. HTTP Code: %HTTP_CODE% >> "%LOG_FILE%"
    exit /b 1
)
