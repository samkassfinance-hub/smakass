#!/bin/bash

# Subscription System - Setup Verification Script
# Checks that all files are in place and basic functionality works

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "🔍 SamKass Subscription System - Verification Script"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Function to check if file exists
check_file() {
    local file=$1
    local name=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $name exists"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $name missing at: $file"
        ((FAILED++))
    fi
}

# Function to check if directory exists
check_dir() {
    local dir=$1
    local name=$2
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅${NC} $name directory exists"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $name directory missing at: $dir"
        ((FAILED++))
    fi
}

echo "📋 CHECKING FILE STRUCTURE..."
echo "────────────────────────────────────────────────────────────────"

check_file "kaasflow/backend/subscription_manager.py" "Backend: subscription_manager.py"
check_file "kaasflow/backend/routes/subscription_routes.py" "Backend: subscription_routes.py"
check_file "kaasflow/backend/SUBSCRIPTION_SCHEMA.sql" "Backend: SUBSCRIPTION_SCHEMA.sql"
check_file "kaasflow/frontend/subscription-enforcement.js" "Frontend: subscription-enforcement.js"

echo ""
echo "📚 CHECKING DOCUMENTATION..."
echo "────────────────────────────────────────────────────────────────"

check_file "SUBSCRIPTION_ENFORCEMENT_GUIDE.md" "Docs: SUBSCRIPTION_ENFORCEMENT_GUIDE.md"
check_file "SUBSCRIPTION_MIGRATION_GUIDE.md" "Docs: SUBSCRIPTION_MIGRATION_GUIDE.md"
check_file "SUBSCRIPTION_QUICK_REFERENCE.md" "Docs: SUBSCRIPTION_QUICK_REFERENCE.md"
check_file "SUBSCRIPTION_SETUP_CHECKLIST.md" "Docs: SUBSCRIPTION_SETUP_CHECKLIST.md"
check_file "SUBSCRIPTION_SYSTEM_SUMMARY.md" "Docs: SUBSCRIPTION_SYSTEM_SUMMARY.md"

echo ""
echo "🔗 CHECKING INTEGRATION..."
echo "────────────────────────────────────────────────────────────────"

# Check if app.py imports subscription routes
if grep -q "from routes.subscription_routes import subscription_bp" kaasflow/backend/app.py 2>/dev/null; then
    echo -e "${GREEN}✅${NC} app.py imports subscription_bp"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️ ${NC} app.py doesn't import subscription_bp (need to add manually)"
    ((FAILED++))
fi

# Check if app.py registers subscription blueprint
if grep -q "app.register_blueprint(subscription_bp" kaasflow/backend/app.py 2>/dev/null; then
    echo -e "${GREEN}✅${NC} app.py registers subscription_bp"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️ ${NC} app.py doesn't register subscription_bp (need to add manually)"
    ((FAILED++))
fi

# Check if index.html includes subscription-enforcement.js
if grep -q "subscription-enforcement.js" kaasflow/frontend/index.html 2>/dev/null; then
    echo -e "${GREEN}✅${NC} index.html includes subscription-enforcement.js"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️ ${NC} index.html doesn't include subscription-enforcement.js (need to add manually)"
    ((FAILED++))
fi

echo ""
echo "🔐 CHECKING SECURITY..."
echo "────────────────────────────────────────────────────────────────"

# Check if subscription_manager uses datetime.utcnow()
if grep -q "datetime.utcnow()" kaasflow/backend/subscription_manager.py 2>/dev/null; then
    echo -e "${GREEN}✅${NC} subscription_manager uses UTC time"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} subscription_manager doesn't use UTC time"
    ((FAILED++))
fi

# Check if subscription_routes has validation
if grep -q "check_client_limit" kaasflow/backend/routes/subscription_routes.py 2>/dev/null; then
    echo -e "${GREEN}✅${NC} subscription_routes has client limit checks"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} subscription_routes missing client limit checks"
    ((FAILED++))
fi

# Check if frontend has blocking modal
if grep -q "showExpiryBlockingModal" kaasflow/frontend/subscription-enforcement.js 2>/dev/null; then
    echo -e "${GREEN}✅${NC} Frontend has blocking modal implementation"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Frontend missing blocking modal"
    ((FAILED++))
fi

echo ""
echo "⚙️  CHECKING CODE QUALITY..."
echo "────────────────────────────────────────────────────────────────"

# Check Python syntax
if python3 -m py_compile kaasflow/backend/subscription_manager.py 2>/dev/null; then
    echo -e "${GREEN}✅${NC} subscription_manager.py syntax OK"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} subscription_manager.py has syntax errors"
    ((FAILED++))
fi

if python3 -m py_compile kaasflow/backend/routes/subscription_routes.py 2>/dev/null; then
    echo -e "${GREEN}✅${NC} subscription_routes.py syntax OK"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} subscription_routes.py has syntax errors"
    ((FAILED++))
fi

# Check JavaScript syntax (basic)
if grep -q "window.SubscriptionEnforcement" kaasflow/frontend/subscription-enforcement.js; then
    echo -e "${GREEN}✅${NC} subscription-enforcement.js basic structure OK"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} subscription-enforcement.js missing namespace"
    ((FAILED++))
fi

echo ""
echo "📝 CHECKING DOCUMENTATION CONTENT..."
echo "────────────────────────────────────────────────────────────────"

# Check for key sections in main guide
if grep -q "API Endpoints" SUBSCRIPTION_ENFORCEMENT_GUIDE.md; then
    echo -e "${GREEN}✅${NC} SUBSCRIPTION_ENFORCEMENT_GUIDE has API documentation"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} SUBSCRIPTION_ENFORCEMENT_GUIDE missing API docs"
    ((FAILED++))
fi

# Check for setup instructions
if grep -q "Step-by-Step Migration" SUBSCRIPTION_MIGRATION_GUIDE.md; then
    echo -e "${GREEN}✅${NC} SUBSCRIPTION_MIGRATION_GUIDE has migration steps"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} SUBSCRIPTION_MIGRATION_GUIDE incomplete"
    ((FAILED++))
fi

# Check for checklist
if grep -q "Phase 1" SUBSCRIPTION_SETUP_CHECKLIST.md; then
    echo -e "${GREEN}✅${NC} SUBSCRIPTION_SETUP_CHECKLIST has phases"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} SUBSCRIPTION_SETUP_CHECKLIST incomplete"
    ((FAILED++))
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📊 VERIFICATION SUMMARY"
echo "═══════════════════════════════════════════════════════════════"

TOTAL=$((PASSED + FAILED))

echo ""
echo "✅ Passed: $PASSED/$TOTAL"
echo "❌ Failed: $FAILED/$TOTAL"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All checks passed! System is ready to deploy.${NC}"
    echo ""
    echo "📚 Next steps:"
    echo "   1. Run: SUBSCRIPTION_SETUP_CHECKLIST.md"
    echo "   2. Deploy backend and frontend"
    echo "   3. Run database migrations: SUBSCRIPTION_SCHEMA.sql"
    echo "   4. Test in browser"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  Some checks failed. Please review errors above.${NC}"
    echo ""
    echo "🔧 Common fixes:"
    echo "   - Ensure all files are copied to correct locations"
    echo "   - Add imports to app.py (see SUBSCRIPTION_MIGRATION_GUIDE.md)"
    echo "   - Include script tags in HTML (see SUBSCRIPTION_SETUP_CHECKLIST.md)"
    echo ""
    exit 1
fi
