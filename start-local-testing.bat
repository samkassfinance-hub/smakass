@echo off
echo ========================================
echo   SamKass Local Testing Launcher
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

echo [1/3] Starting Backend Server...
echo.
start "SamKass Backend" cmd /k "cd kaasflow\backend && python app.py"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend Server...
echo.
start "SamKass Frontend" cmd /k "cd kaasflow\frontend && python -m http.server 5500"
timeout /t 2 /nobreak >nul

echo [3/3] Opening Browser...
echo.
start http://127.0.0.1:5500

echo.
echo ========================================
echo   Servers are running!
echo ========================================
echo.
echo Backend:  http://127.0.0.1:5000
echo Frontend: http://127.0.0.1:5500
echo.
echo Press F12 in browser to open Console
echo.
echo To stop servers, close the terminal windows
echo ========================================
echo.
pause
