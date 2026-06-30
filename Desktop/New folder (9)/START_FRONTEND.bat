@echo off
REM ================================================================================
REM KaasFlow Frontend Startup Script (Windows)
REM ================================================================================

title KaasFlow Frontend - Running on http://127.0.0.1:5500

echo.
echo ==================================================================================
echo  🚀 Starting KaasFlow Frontend Server
echo ==================================================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from https://www.python.org
    pause
    exit /b 1
)

echo ✅ Python found
echo.

REM Navigate to frontend directory
cd /d "%~dp0kaasflow\frontend"

if %errorlevel% neq 0 (
    echo ❌ Failed to navigate to frontend directory
    pause
    exit /b 1
)

echo ✅ Navigated to frontend directory
echo.

REM Check if index.html exists
if not exist "index.html" (
    echo ❌ index.html not found!
    echo Please ensure index.html exists in kaasflow/frontend/
    pause
    exit /b 1
)

echo ✅ index.html found
echo.

echo ==================================================================================
echo  ⚠️  IMPORTANT: Backend Must Be Running First!
echo ==================================================================================
echo.
echo 1. Open another terminal/command prompt
echo 2. Run: START_BACKEND.bat
echo 3. Wait for "Running on http://127.0.0.1:5000" message
echo 4. Come back to this window and press Enter
echo.
pause

echo.
echo ==================================================================================
echo  🚀 Starting Python HTTP Server
echo ==================================================================================
echo.
echo 📍 Frontend URL: http://127.0.0.1:5500
echo 📍 Open in browser: http://127.0.0.1:5500
echo.
echo ⏳ Server starting...
echo.

REM Start HTTP server on port 5500
python -m http.server 5500

if %errorlevel% neq 0 (
    echo.
    echo ❌ Failed to start frontend!
    echo Please check the error messages above
    pause
)
