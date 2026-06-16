@echo off
REM ================================================================================
REM KaasFlow Backend Startup Script (Windows)
REM ================================================================================

title KaasFlow Backend - Running on http://127.0.0.1:5000

echo.
echo ==================================================================================
echo  🚀 Starting KaasFlow Backend Server
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

REM Navigate to backend directory
cd /d "%~dp0kaasflow\backend"

if %errorlevel% neq 0 (
    echo ❌ Failed to navigate to backend directory
    pause
    exit /b 1
)

echo ✅ Navigated to backend directory
echo.

REM Check if .env exists
if not exist ".env" (
    echo ❌ .env file not found!
    echo Please ensure .env exists in kaasflow/backend/
    pause
    exit /b 1
)

echo ✅ .env file found
echo.

REM Check Python dependencies
echo 📦 Checking Python dependencies...
python -c "import flask" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Flask not installed. Installing dependencies...
    pip install -r requirements.txt
)

echo.
echo ==================================================================================
echo  🔑 Configuration Check
echo ==================================================================================
echo.

REM Check for Razorpay key
python -c "import os; os.chdir('.'); from dotenv import load_dotenv; load_dotenv(); key = os.getenv('RAZORPAY_KEY_ID'); print('✅ RAZORPAY_KEY_ID found' if key else '❌ RAZORPAY_KEY_ID NOT FOUND')"

echo.
echo ==================================================================================
echo  🚀 Starting Flask Server
echo ==================================================================================
echo.
echo 📍 Backend URL: http://127.0.0.1:5000
echo 📍 API Endpoint: http://127.0.0.1:5000/api/payment/key
echo.
echo ⏳ Please wait for the server to start...
echo.

REM Start Flask
python app.py

if %errorlevel% neq 0 (
    echo.
    echo ❌ Failed to start backend!
    echo Please check the error messages above
    pause
)
