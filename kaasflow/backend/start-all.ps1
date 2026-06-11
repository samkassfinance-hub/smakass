# Complete Startup Script for KaasFlow with WhatsApp (PowerShell)
# Starts both Flask backend and Evolution API

Write-Host "🚀 KaasFlow with WhatsApp - Complete Startup" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not installed" -ForegroundColor Red
    Write-Host "   Install Docker Desktop from: https://docs.docker.com/get-docker/" -ForegroundColor Yellow
    exit 1
}

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "❌ .env file not found in current directory" -ForegroundColor Red
    Write-Host "   Please run from: kaasflow/backend/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ .env file found" -ForegroundColor Green

Write-Host ""
Write-Host "📝 Starting services..." -ForegroundColor Cyan
Write-Host ""

# Start Evolution API in background
Write-Host "🐳 Starting Evolution API..." -ForegroundColor Yellow
docker-compose -f docker-compose-whatsapp.yml up -d

# Check if container started
Start-Sleep -Seconds 3
$running = docker ps | Select-String "evolution-api"
if ($running) {
    Write-Host "✓ Evolution API started" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start Evolution API" -ForegroundColor Red
    Write-Host "   Try: docker-compose -f docker-compose-whatsapp.yml up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🐍 Starting Flask Backend..." -ForegroundColor Yellow
Write-Host ""

# Check if Python is available
try {
    $pythonVersion = python --version
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found" -ForegroundColor Red
    Write-Host "   Install Python from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Check if requirements are installed
try {
    python -c "import flask" -ErrorAction Stop 2>$null
} catch {
    Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
    pip install -q -r requirements.txt
}

# Start Flask
Write-Host "Starting Flask server..." -ForegroundColor Cyan
Write-Host ""
python app.py

# This will keep the Flask server running in foreground
# Evolution API continues in background via Docker
