# WhatsApp Automation Backend Startup Script
# This script starts the backend server with WhatsApp support

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  SamKass Backend Server - WhatsApp Automation Setup        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Get current directory
$backendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Backend directory: $backendDir" -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path "$backendDir\.env")) {
    Write-Host "❌ ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Create .env file with WhatsApp credentials first." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green

# Check if Python is installed
Write-Host ""
Write-Host "Checking Python installation..." -ForegroundColor Cyan

$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  python command not found, trying python3..." -ForegroundColor Yellow
    $pythonVersion = python3 --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERROR: Python not installed!" -ForegroundColor Red
        Write-Host "Please install Python 3.8 or higher" -ForegroundColor Yellow
        exit 1
    }
    $python = "python3"
} else {
    $python = "python"
}

Write-Host "✅ $pythonVersion" -ForegroundColor Green

# Check if requirements are installed
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Cyan

$depsCheck = & $python -c "import flask; import dotenv; import supabase; import apscheduler; print('ok')" 2>&1
if ($depsCheck -ne "ok") {
    Write-Host "⚠️  Installing required dependencies..." -ForegroundColor Yellow
    Write-Host "Running: pip install -r requirements.txt" -ForegroundColor Cyan
    & $python -m pip install -r "$backendDir\requirements.txt" -q
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERROR: Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ All dependencies installed" -ForegroundColor Green
}

# Display configuration
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Configuration                                             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$envContent = Get-Content "$backendDir\.env"
$whatsappUrl = ($envContent | Select-String "WHATSAPP_API_URL").ToString().Split("=")[1].Trim()
$whatsappKey = ($envContent | Select-String "WHATSAPP_API_KEY").ToString().Split("=")[1].Trim()

if ($whatsappUrl) {
    Write-Host "WhatsApp API URL: $whatsappUrl" -ForegroundColor Green
} else {
    Write-Host "⚠️  WhatsApp API URL not configured" -ForegroundColor Yellow
}

if ($whatsappKey) {
    $keyDisplay = $whatsappKey.Substring(0, 10) + "..." + $whatsappKey.Substring($whatsappKey.Length - 5)
    Write-Host "WhatsApp API Key: $keyDisplay" -ForegroundColor Green
} else {
    Write-Host "⚠️  WhatsApp API Key not configured" -ForegroundColor Yellow
}

# Start the server
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Starting Backend Server                                   ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Starting Flask server..." -ForegroundColor Cyan
Write-Host "   Backend: http://localhost:5000" -ForegroundColor Yellow
Write-Host "   Health: http://localhost:5000/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 WhatsApp Automation: ENABLED" -ForegroundColor Green
Write-Host "⏰ Daily Reminders: 9:00 AM IST" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
Set-Location $backendDir
& $python app.py
