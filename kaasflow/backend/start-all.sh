#!/bin/bash

# Complete Startup Script for KaasFlow with WhatsApp
# Starts both Flask backend and Evolution API

echo "🚀 KaasFlow with WhatsApp - Complete Startup"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not installed${NC}"
    echo "   Install from: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✓ Docker installed${NC}"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found in backend directory${NC}"
    echo "   Please run from: kaasflow/backend/"
    exit 1
fi
echo -e "${GREEN}✓ .env file found${NC}"

echo ""
echo "📝 Starting services..."
echo ""

# Start Evolution API in background
echo "🐳 Starting Evolution API..."
docker-compose -f docker-compose-whatsapp.yml up -d

# Check if container started
sleep 3
if docker ps | grep -q evolution-api; then
    echo -e "${GREEN}✓ Evolution API started${NC}"
else
    echo -e "${RED}❌ Failed to start Evolution API${NC}"
    exit 1
fi

echo ""
echo "🐍 Starting Flask Backend..."
echo ""

# Check if Flask is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found${NC}"
    exit 1
fi

# Check if requirements are installed
if ! python3 -c "import flask" 2>/dev/null; then
    echo "📦 Installing Python dependencies..."
    pip install -q -r requirements.txt
fi

# Start Flask
python3 app.py

# This will keep the Flask server running in foreground
# Evolution API continues in background via Docker

echo ""
echo -e "${GREEN}✅ All services started${NC}"
echo ""
echo "📍 Access your app at: http://localhost:3000"
echo "🔧 Backend API at: http://localhost:5000"
echo "📱 WhatsApp API at: http://localhost:8080"
echo ""
echo "📋 To stop services:"
echo "   1. Press Ctrl+C to stop Flask"
echo "   2. Run: docker-compose -f docker-compose-whatsapp.yml down"
echo ""
