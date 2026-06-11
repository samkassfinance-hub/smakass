#!/bin/bash

# WhatsApp Automation Backend Startup Script
# For Linux/Mac systems

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  SamKass Backend Server - WhatsApp Automation Setup        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Get script directory
BACKEND_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "Backend directory: $BACKEND_DIR"

# Check if .env exists
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo "❌ ERROR: .env file not found!"
    echo "Create .env file with WhatsApp credentials first."
    exit 1
fi

echo "✅ .env file found"

# Check Python
echo ""
echo "Checking Python installation..."

if command -v python3 &> /dev/null; then
    PYTHON="python3"
    PYTHON_VERSION=$($PYTHON --version 2>&1)
elif command -v python &> /dev/null; then
    PYTHON="python"
    PYTHON_VERSION=$($PYTHON --version 2>&1)
else
    echo "❌ ERROR: Python not installed!"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

echo "✅ $PYTHON_VERSION"

# Check dependencies
echo ""
echo "Checking dependencies..."

$PYTHON -c "import flask; import dotenv; import supabase; import apscheduler" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Installing required dependencies..."
    echo "Running: pip install -r requirements.txt"
    $PYTHON -m pip install -r "$BACKEND_DIR/requirements.txt" -q
    if [ $? -ne 0 ]; then
        echo "❌ ERROR: Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
else
    echo "✅ All dependencies installed"
fi

# Display configuration
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Configuration                                             ║"
echo "╚════════════════════════════════════════════════════════════╝"

WHATSAPP_URL=$(grep "WHATSAPP_API_URL" "$BACKEND_DIR/.env" | cut -d'=' -f2)
WHATSAPP_KEY=$(grep "WHATSAPP_API_KEY" "$BACKEND_DIR/.env" | cut -d'=' -f2)

if [ -n "$WHATSAPP_URL" ]; then
    echo "WhatsApp API URL: $WHATSAPP_URL"
else
    echo "⚠️  WhatsApp API URL not configured"
fi

if [ -n "$WHATSAPP_KEY" ]; then
    KEY_DISPLAY="${WHATSAPP_KEY:0:10}...${WHATSAPP_KEY: -5}"
    echo "WhatsApp API Key: $KEY_DISPLAY"
else
    echo "⚠️  WhatsApp API Key not configured"
fi

# Start server
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Starting Backend Server                                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "🚀 Starting Flask server..."
echo "   Backend: http://localhost:5000"
echo "   Health: http://localhost:5000/health"
echo ""
echo "📱 WhatsApp Automation: ENABLED"
echo "⏰ Daily Reminders: 9:00 AM IST"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd "$BACKEND_DIR"
$PYTHON app.py
