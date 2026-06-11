#!/bin/bash

# WhatsApp Evolution API Setup Script
# This script sets up the Evolution API server for WhatsApp integration

set -e

echo "🚀 WhatsApp Evolution API Setup"
echo "================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✓ Docker found"

# Generate a secure API key
API_KEY=$(openssl rand -hex 32)
echo "✓ Generated secure API key"

# Default port
PORT=8080
HOSTNAME=${1:-localhost}

echo ""
echo "Configuration:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Hostname/IP: $HOSTNAME"
echo "Port: $PORT"
echo "API Key: $API_KEY"
echo ""

# Create docker-compose file for Evolution API
cat > docker-compose-whatsapp.yml << EOF
version: '3.8'

services:
  evolution-api:
    image: atendai/evolution-api:latest
    container_name: evolution-api
    restart: always
    ports:
      - "$PORT:8080"
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
EOF

echo "✓ Created docker-compose file"

# Start the Evolution API
echo ""
echo "Starting Evolution API container..."
docker-compose -f docker-compose-whatsapp.yml up -d

echo "⏳ Waiting for Evolution API to be ready..."
sleep 10

# Verify the service is running
if docker ps | grep -q evolution-api; then
    echo "✓ Evolution API container is running"
else
    echo "❌ Failed to start Evolution API container"
    exit 1
fi

# Save configuration
cat > evolution-api-credentials.txt << EOF
Evolution API Configuration
============================
Generated: $(date)

API URL: http://$HOSTNAME:$PORT
API Key: $API_KEY

Add these to your .env file:
WHATSAPP_API_URL=http://$HOSTNAME:$PORT
WHATSAPP_API_KEY=$API_KEY

Docker Compose file: docker-compose-whatsapp.yml

Useful Commands:
- View logs: docker logs evolution-api
- Stop: docker-compose -f docker-compose-whatsapp.yml down
- Restart: docker-compose -f docker-compose-whatsapp.yml restart
- Update: docker pull atendai/evolution-api:latest && docker-compose -f docker-compose-whatsapp.yml up -d
EOF

echo ""
echo "✅ Evolution API Setup Complete!"
echo "=================================="
echo ""
echo "📋 Credentials saved to: evolution-api-credentials.txt"
echo ""
echo "🔧 Next Steps:"
echo "1. Update your .env file with:"
echo "   WHATSAPP_API_URL=http://$HOSTNAME:$PORT"
echo "   WHATSAPP_API_KEY=$API_KEY"
echo ""
echo "2. Restart your backend application"
echo ""
echo "3. Test WhatsApp connection in the app"
echo ""
echo "📍 API URL: http://$HOSTNAME:$PORT"
echo "🔑 API Key: $API_KEY"
echo ""
