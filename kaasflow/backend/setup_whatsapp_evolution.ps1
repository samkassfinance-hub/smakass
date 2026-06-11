# WhatsApp Evolution API Setup Script (PowerShell for Windows)
# This script sets up the Evolution API server for WhatsApp integration

Write-Host "🚀 WhatsApp Evolution API Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Visit: https://docs.docker.com/get-docker/" -ForegroundColor Yellow
    exit 1
}

# Generate a secure API key
Add-Type -AssemblyName System.Security
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::Create()
$rng.GetBytes($bytes)
$API_KEY = -join ($bytes | ForEach-Object { $_.ToString("x2") })
Write-Host "✓ Generated secure API key" -ForegroundColor Green

# Default values
$PORT = 8080
$HOSTNAME = if ($args[0]) { $args[0] } else { "localhost" }

Write-Host ""
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "Hostname/IP: $HOSTNAME"
Write-Host "Port: $PORT"
Write-Host "API Key: $API_KEY"
Write-Host ""

# Create docker-compose file
$dockerComposeContent = @"
version: '3.8'

services:
  evolution-api:
    image: atendai/evolution-api:latest
    container_name: evolution-api
    restart: always
    ports:
      - "$PORT`:8080"
    environment:
      AUTHENTICATION_API_KEY: $API_KEY
      AUTHENTICATION_EXPOSE_IN_FETCH_DATA: "true"
      LOG_LEVEL: "debug"
      PROVIDER: "docker"
    volumes:
      - evolution-data:/home/user/evolution
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  evolution-data:
"@

$dockerComposeContent | Out-File -FilePath "docker-compose-whatsapp.yml" -Encoding UTF8
Write-Host "✓ Created docker-compose file" -ForegroundColor Green

# Start the Evolution API
Write-Host ""
Write-Host "Starting Evolution API container..." -ForegroundColor Cyan
docker-compose -f docker-compose-whatsapp.yml up -d

Write-Host "⏳ Waiting for Evolution API to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verify the service is running
$running = docker ps | Select-String "evolution-api"
if ($running) {
    Write-Host "✓ Evolution API container is running" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start Evolution API container" -ForegroundColor Red
    exit 1
}

# Save credentials to file
$credentialsContent = @"
Evolution API Configuration
============================
Generated: $(Get-Date)

API URL: http://$HOSTNAME`:$PORT
API Key: $API_KEY

Add these to your .env file:
WHATSAPP_API_URL=http://$HOSTNAME`:$PORT
WHATSAPP_API_KEY=$API_KEY

Docker Compose file: docker-compose-whatsapp.yml

Useful Commands:
- View logs: docker logs evolution-api
- Stop: docker-compose -f docker-compose-whatsapp.yml down
- Restart: docker-compose -f docker-compose-whatsapp.yml restart
- Update: docker pull atendai/evolution-api:latest && docker-compose -f docker-compose-whatsapp.yml up -d
"@

$credentialsContent | Out-File -FilePath "evolution-api-credentials.txt" -Encoding UTF8

Write-Host ""
Write-Host "✅ Evolution API Setup Complete!" -ForegroundColor Green
Write-Host "=================================="
Write-Host ""
Write-Host "📋 Credentials saved to: evolution-api-credentials.txt" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update your .env file with:" -ForegroundColor White
Write-Host "   WHATSAPP_API_URL=http://$HOSTNAME`:$PORT" -ForegroundColor Magenta
Write-Host "   WHATSAPP_API_KEY=$API_KEY" -ForegroundColor Magenta
Write-Host ""
Write-Host "2. Restart your backend application" -ForegroundColor White
Write-Host ""
Write-Host "3. Test WhatsApp connection in the app" -ForegroundColor White
Write-Host ""
Write-Host "📍 API URL: http://$HOSTNAME`:$PORT" -ForegroundColor Cyan
Write-Host "🔑 API Key: $API_KEY" -ForegroundColor Cyan
Write-Host ""

# Copy to clipboard
$API_KEY | Set-Clipboard
Write-Host "📋 API Key copied to clipboard!" -ForegroundColor Green
