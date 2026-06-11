@echo off
REM Vercel Environment Variable Setup Script for Windows
REM Run this script to add RESEND_API_KEY to your Vercel project

echo ======================================================================
echo 🔧 Vercel Environment Variable Setup
echo ======================================================================
echo.
echo This script will help you add RESEND_API_KEY to your Vercel project
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI is not installed
    echo.
    echo 📥 Installing Vercel CLI...
    call npm install -g vercel
    echo ✅ Vercel CLI installed!
    echo.
)

set /p RESEND_KEY="📋 Enter your complete Resend API key: "

if "%RESEND_KEY%"=="" (
    echo ❌ No API key provided. Exiting.
    pause
    exit /b 1
)

echo.
echo 🔄 Adding RESEND_API_KEY to Vercel...
cd kaasflow\backend

echo %RESEND_KEY% | vercel env add RESEND_API_KEY production
echo %RESEND_KEY% | vercel env add RESEND_API_KEY preview
echo %RESEND_KEY% | vercel env add RESEND_API_KEY development

echo.
echo ✅ Environment variable added successfully!
echo.
echo 🚀 Now redeploying your backend...
call vercel --prod

echo.
echo ======================================================================
echo ✅ COMPLETE! Your backend has been redeployed with the API key
echo ======================================================================
echo.
echo 📧 Test your OTP emails now at: https://www.samkass.site
echo.
pause
