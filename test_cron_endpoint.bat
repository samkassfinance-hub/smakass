@echo off
REM SamKass Cron Endpoint Test Script (Windows)
REM Tests if the push notification cron endpoint is working

echo 🧪 Testing SamKass Cron Endpoint...
echo.

REM Replace with your actual CRON_SECRET from Vercel environment variables
set CRON_SECRET=%1
if "%CRON_SECRET%"=="" set CRON_SECRET=your-secret-here

if "%CRON_SECRET%"=="your-secret-here" (
  echo ⚠️  WARNING: Using default secret. Pass your actual secret:
  echo    test_cron_endpoint.bat YOUR_ACTUAL_SECRET
  echo.
)

echo 🌐 Endpoint: https://samkass.site/api/cron/send-notifications
echo 🔐 Secret: %CRON_SECRET:~0,10%...
echo.

REM Test with PowerShell (more reliable on Windows)
echo 📤 Sending request with secret...
powershell -Command "$response = try { Invoke-WebRequest -Uri 'https://samkass.site/api/cron/send-notifications' -Method POST -Headers @{'X-Cron-Secret'='%CRON_SECRET%'} -UseBasicParsing; $response.StatusCode; $response.Content } catch { $_.Exception.Response.StatusCode.value__; (New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())).ReadToEnd() }; Write-Output $response"

echo.
echo 💡 Next steps:
echo    1. Get your CRON_SECRET from Vercel dashboard
echo    2. Run: test_cron_endpoint.bat YOUR_SECRET
echo    3. Setup external cron at: cron-job.org
