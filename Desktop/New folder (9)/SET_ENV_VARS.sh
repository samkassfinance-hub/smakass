#!/bin/bash

# Script to set all environment variables for Vercel deployment

echo "🔧 Setting Vercel Environment Variables..."

# Supabase
echo "Setting SUPABASE_URL..."
vercel env add SUPABASE_URL --yes

echo "Setting SUPABASE_ANON_KEY..."
vercel env add SUPABASE_ANON_KEY --yes

echo "Setting SUPABASE_SERVICE_ROLE_KEY..."
vercel env add SUPABASE_SERVICE_ROLE_KEY --yes

# Resend
echo "Setting RESEND_API_KEY..."
vercel env add RESEND_API_KEY --yes

echo "Setting RESEND_FROM_EMAIL..."
vercel env add RESEND_FROM_EMAIL --yes

# Other
echo "Setting SECRET_KEY..."
vercel env add SECRET_KEY --yes

echo "Setting VERCEL..."
vercel env add VERCEL --yes

echo "Setting FRONTEND_URL..."
vercel env add FRONTEND_URL --yes

echo ""
echo "✅ All variables set!"
echo ""
echo "Now deploying..."
vercel --prod

