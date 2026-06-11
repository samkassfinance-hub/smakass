#!/bin/bash

# SamKass Cron Endpoint Test Script
# Tests if the push notification cron endpoint is working

echo "🧪 Testing SamKass Cron Endpoint..."
echo ""

# Replace with your actual CRON_SECRET from Vercel environment variables
CRON_SECRET="${1:-your-secret-here}"

if [ "$CRON_SECRET" = "your-secret-here" ]; then
  echo "⚠️  WARNING: Using default secret. Pass your actual secret:"
  echo "   ./test_cron_endpoint.sh YOUR_ACTUAL_SECRET"
  echo ""
fi

echo "🌐 Endpoint: https://samkass.site/api/cron/send-notifications"
echo "🔐 Secret: ${CRON_SECRET:0:10}..."
echo ""

# Test with correct secret
echo "📤 Sending request with secret..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "https://samkass.site/api/cron/send-notifications" \
  -H "X-Cron-Secret: $CRON_SECRET" \
  -H "Content-Type: application/json")

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
# Extract response body (all but last line)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "📊 HTTP Status: $HTTP_CODE"
echo "📋 Response:"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo ""

# Interpret results
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ SUCCESS: Endpoint is working!"
  echo "   Notifications were sent (or no due loans found)"
elif [ "$HTTP_CODE" = "401" ]; then
  echo "❌ UNAUTHORIZED: Secret is incorrect"
  echo "   Check your CRON_SECRET in Vercel environment variables"
  echo "   Run: vercel env ls"
elif [ "$HTTP_CODE" = "500" ]; then
  echo "❌ SERVER ERROR: Check Vercel logs"
  echo "   Run: vercel logs --follow"
else
  echo "⚠️  UNEXPECTED STATUS: $HTTP_CODE"
fi

echo ""
echo "💡 Next steps:"
echo "   1. Get your CRON_SECRET from Vercel dashboard"
echo "   2. Run: ./test_cron_endpoint.sh YOUR_SECRET"
echo "   3. Setup external cron at: cron-job.org"
