# Add all environment variables to Vercel

Write-Host "🔧 Setting Vercel Environment Variables..." -ForegroundColor Green
Write-Host ""

# Define all variables
$variables = @(
    @{name="SUPABASE_URL"; value="https://puhovplmbaldrisxqssy.supabase.co"},
    @{name="SUPABASE_ANON_KEY"; value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1aG92cGxtYmFsZHJpc3hxc3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjExNTMsImV4cCI6MjA5NzE5NzE1M30.Py6KprKu6eUxRw1r3P0jPfhNAr8d8PxsgGmUYIel2WA"},
    @{name="SUPABASE_SERVICE_ROLE_KEY"; value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1aG92cGxtYmFsZHJpc3hxc3N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYyMTE1MywiZXhwIjoyMDk3MTk3MTUzfQ.pltOHHfWO1nMg8gcpEbYN7tW3NYgq-9IMt4-dEy09T4"},
    @{name="RESEND_API_KEY"; value="re_6AzZuetp_JXwyGB87X2DAKvr7JWFfiokr"},
    @{name="RESEND_FROM_EMAIL"; value="onboarding@resend.dev"},
    @{name="SECRET_KEY"; value="samkass-secret-key-prod-2026"},
    @{name="VERCEL"; value="1"},
    @{name="FRONTEND_URL"; value="https://www.samkass.site"}
)

# Add each variable
foreach ($var in $variables) {
    Write-Host "Adding $($var.name)..." -ForegroundColor Yellow
    $result = $var.value | vercel env add $var.name production
    Write-Host "  ✅ Added" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ All variables added!" -ForegroundColor Green
Write-Host ""
Write-Host "Now redeploy..." -ForegroundColor Cyan
