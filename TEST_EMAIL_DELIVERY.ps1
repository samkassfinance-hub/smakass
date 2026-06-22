# SamKass Email Delivery Test
# Tests all 3 email types in production

$BASE_URL = "https://samkasssite.vercel.app"
$TEST_EMAIL = "mohaneni80@gmail.com"

Write-Host "🚀 SamKass Email Delivery Test" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host "Base URL: $BASE_URL" -ForegroundColor Cyan
Write-Host "Test Email: $TEST_EMAIL" -ForegroundColor Cyan
Write-Host ""

# Test 1: Register (Welcome Email)
Write-Host "📧 TEST 1: Registration - Welcome Email" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Sending registration request..." -ForegroundColor White

$body1 = @{
    email = $TEST_EMAIL
    password = "TestPassword123!"
    financier_name = "Test Financier"
} | ConvertTo-Json

$response1 = Invoke-WebRequest -Uri "$BASE_URL/auth/register" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body1 `
    -UseBasicParsing

Write-Host "Response Status: $($response1.StatusCode)" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Check email at: $TEST_EMAIL" -ForegroundColor Green
Write-Host "   Expected: Welcome email from noreply@samkass.site" -ForegroundColor Cyan
Write-Host "   Subject: 🚀 Welcome to SamKass! Your Finance Manager is Ready" -ForegroundColor Cyan
Write-Host "   Content: Founder's message + 3-step guide + pricing" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Enter to continue to Test 2..." -ForegroundColor White
Read-Host

# Test 2: Password Reset OTP
Write-Host ""
Write-Host "📧 TEST 2: Password Reset - OTP Email" -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Yellow
Write-Host "Sending password reset OTP request..." -ForegroundColor White

$body2 = @{
    email = $TEST_EMAIL
} | ConvertTo-Json

$response2 = Invoke-WebRequest -Uri "$BASE_URL/auth/forgot-password/send-otp" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body2 `
    -UseBasicParsing

Write-Host "Response Status: $($response2.StatusCode)" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Check email at: $TEST_EMAIL" -ForegroundColor Green
Write-Host "   Expected: Password reset OTP email from noreply@samkass.site" -ForegroundColor Cyan
Write-Host "   Subject: 🔒 Your Password Reset Code - SamKass" -ForegroundColor Cyan
Write-Host "   Content: 6-digit OTP code" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Enter to continue to Test 3..." -ForegroundColor White
Read-Host

# Test 3: PIN Reset OTP
Write-Host ""
Write-Host "📧 TEST 3: PIN Reset - OTP Email" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Yellow
Write-Host "Sending PIN reset OTP request..." -ForegroundColor White

$body3 = @{
    email = $TEST_EMAIL
} | ConvertTo-Json

$response3 = Invoke-WebRequest -Uri "$BASE_URL/auth/forgot-pin/send-otp" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body3 `
    -UseBasicParsing

Write-Host "Response Status: $($response3.StatusCode)" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Check email at: $TEST_EMAIL" -ForegroundColor Green
Write-Host "   Expected: PIN reset OTP email from noreply@samkass.site" -ForegroundColor Cyan
Write-Host "   Subject: 🔐 Your Security PIN Reset Code - SamKass" -ForegroundColor Cyan
Write-Host "   Content: 6-digit OTP code" -ForegroundColor Cyan
Write-Host ""

Write-Host ""
Write-Host "==============================" -ForegroundColor Green
Write-Host "✅ All Tests Complete!" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "  • Test 1: Welcome Email ✅" -ForegroundColor Green
Write-Host "  • Test 2: Password Reset OTP ✅" -ForegroundColor Green
Write-Host "  • Test 3: PIN Reset OTP ✅" -ForegroundColor Green
Write-Host ""
Write-Host "Check all 3 emails at: $TEST_EMAIL" -ForegroundColor Cyan
Write-Host ""
Write-Host "Expected Results:" -ForegroundColor White
Write-Host "  ✓ All 3 emails received" -ForegroundColor Green
Write-Host "  ✓ From: noreply@samkass.site" -ForegroundColor Green
Write-Host "  ✓ Professional HTML design" -ForegroundColor Green
Write-Host "  ✓ Personalized with user name" -ForegroundColor Green
Write-Host "  ✓ OTP codes visible in emails" -ForegroundColor Green
Write-Host ""
