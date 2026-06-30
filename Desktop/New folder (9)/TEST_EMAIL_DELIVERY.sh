#!/bin/bash

# SamKass Email Delivery Test
# Tests all 3 email types in production

BASE_URL="https://samkasssite.vercel.app"
TEST_EMAIL="mohaneni80@gmail.com"

echo "🚀 SamKass Email Delivery Test"
echo "=============================="
echo "Base URL: $BASE_URL"
echo "Test Email: $TEST_EMAIL"
echo ""

# Test 1: Register (Welcome Email)
echo "📧 TEST 1: Registration - Welcome Email"
echo "========================================"
echo "Sending registration request..."
curl -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"TestPassword123!\",
    \"financier_name\": \"Test Financier\"
  }" \
  -w "\n\nStatus: %{http_code}\n"

echo ""
echo "✅ Check email at: $TEST_EMAIL"
echo "   Expected: Welcome email from noreply@samkass.site"
echo "   Subject: 🚀 Welcome to SamKass! Your Finance Manager is Ready"
echo "   Content: Founder's message + 3-step guide + pricing"
echo ""
echo "Press Enter to continue to Test 2..."
read

# Test 2: Password Reset OTP
echo ""
echo "📧 TEST 2: Password Reset - OTP Email"
echo "======================================="
echo "Sending password reset OTP request..."
curl -X POST $BASE_URL/auth/forgot-password/send-otp \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\"
  }" \
  -w "\n\nStatus: %{http_code}\n"

echo ""
echo "✅ Check email at: $TEST_EMAIL"
echo "   Expected: Password reset OTP email from noreply@samkass.site"
echo "   Subject: 🔒 Your Password Reset Code - SamKass"
echo "   Content: 6-digit OTP code"
echo ""
echo "Press Enter to continue to Test 3..."
read

# Test 3: PIN Reset OTP
echo ""
echo "📧 TEST 3: PIN Reset - OTP Email"
echo "=================================="
echo "Sending PIN reset OTP request..."
curl -X POST $BASE_URL/auth/forgot-pin/send-otp \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\"
  }" \
  -w "\n\nStatus: %{http_code}\n"

echo ""
echo "✅ Check email at: $TEST_EMAIL"
echo "   Expected: PIN reset OTP email from noreply@samkass.site"
echo "   Subject: 🔐 Your Security PIN Reset Code - SamKass"
echo "   Content: 6-digit OTP code"
echo ""

echo ""
echo "=============================="
echo "✅ All Tests Complete!"
echo "=============================="
echo ""
echo "Summary:"
echo "  • Test 1: Welcome Email ✅"
echo "  • Test 2: Password Reset OTP ✅"
echo "  • Test 3: PIN Reset OTP ✅"
echo ""
echo "Check all 3 emails at: $TEST_EMAIL"
echo ""
echo "Expected Results:"
echo "  ✓ All 3 emails received"
echo "  ✓ From: noreply@samkass.site"
echo "  ✓ Professional HTML design"
echo "  ✓ Personalized with user name"
echo "  ✓ OTP codes visible in emails"
echo ""
