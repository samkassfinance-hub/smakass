#!/bin/bash
# Vercel Environment Variable Setup Script
# Run this script to add RESEND_API_KEY to your Vercel project

echo "======================================================================"
echo "🔧 Vercel Environment Variable Setup"
echo "======================================================================"
echo ""
echo "This script will help you add RESEND_API_KEY to your Vercel project"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI is not installed"
    echo ""
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed!"
    echo ""
fi

echo "📋 Please enter your complete Resend API key:"
echo "   (Get it from: https://resend.com/api-keys)"
read -p "API Key: " RESEND_KEY

if [ -z "$RESEND_KEY" ]; then
    echo "❌ No API key provided. Exiting."
    exit 1
fi

echo ""
echo "🔄 Adding RESEND_API_KEY to Vercel..."
cd kaasflow/backend

# Add environment variable to production
vercel env add RESEND_API_KEY production <<< "$RESEND_KEY"

# Add to preview
vercel env add RESEND_API_KEY preview <<< "$RESEND_KEY"

# Add to development
vercel env add RESEND_API_KEY development <<< "$RESEND_KEY"

echo ""
echo "✅ Environment variable added successfully!"
echo ""
echo "🚀 Now redeploying your backend..."
vercel --prod

echo ""
echo "======================================================================"
echo "✅ COMPLETE! Your backend has been redeployed with the API key"
echo "======================================================================"
echo ""
echo "📧 Test your OTP emails now at: https://www.samkass.site"
echo ""
