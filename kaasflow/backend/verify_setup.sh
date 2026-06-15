#!/bin/bash

# SamKass Email & Supabase Setup Verification Script
# Usage: bash verify_setup.sh

echo "🔍 SamKass Integration Verification"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "📋 Run: cp .env.example .env"
    echo "📝 Then edit .env with your credentials"
    exit 1
fi

echo "✓ .env file found"
echo ""

# Check Resend API Key
RESEND_KEY=$(grep "RESEND_API_KEY=" .env | cut -d'=' -f2)
if [ -z "$RESEND_KEY" ]; then
    echo "❌ RESEND_API_KEY not set in .env"
else
    KEY_LENGTH=${#RESEND_KEY}
    if [ $KEY_LENGTH -lt 40 ]; then
        echo "❌ RESEND_API_KEY too short (${KEY_LENGTH} chars, need 40+)"
    else
        KEY_PREVIEW="${RESEND_KEY:0:6}...${RESEND_KEY: -6}"
        echo "✅ RESEND_API_KEY: ${KEY_PREVIEW} (${KEY_LENGTH} chars)"
    fi
fi

echo ""

# Check Supabase URL
SUPABASE_URL=$(grep "SUPABASE_URL=" .env | cut -d'=' -f2)
if [ -z "$SUPABASE_URL" ]; then
    echo "❌ SUPABASE_URL not set in .env"
else
    echo "✅ SUPABASE_URL: $SUPABASE_URL"
fi

echo ""

# Check Supabase Service Role Key
SUPABASE_KEY=$(grep "SUPABASE_SERVICE_ROLE_KEY=" .env | cut -d'=' -f2)
if [ -z "$SUPABASE_KEY" ]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY not set in .env"
else
    KEY_LENGTH=${#SUPABASE_KEY}
    if [ $KEY_LENGTH -lt 100 ]; then
        echo "❌ SUPABASE_SERVICE_ROLE_KEY too short (${KEY_LENGTH} chars, need 100+)"
    else
        KEY_PREVIEW="${SUPABASE_KEY:0:10}...${SUPABASE_KEY: -6}"
        echo "✅ SUPABASE_SERVICE_ROLE_KEY: ${KEY_PREVIEW} (${KEY_LENGTH} chars)"
    fi
fi

echo ""
echo "=================================="
echo "To run comprehensive tests:"
echo "python3 test_integration.py"
echo ""
