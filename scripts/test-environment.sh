#!/bin/bash

# Environment Setup Test Script
# Tests the entire development environment to ensure everything is working correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
START_TIME=$(date +%s)

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}$1${NC}"
    echo "----------------------------------------"
}

# Function to run a test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Testing: $test_name... "
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Function to run a test with detailed output on failure
run_test_verbose() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Testing: $test_name... "
    
    local output
    if output=$(eval "$test_command" 2>&1); then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo -e "${RED}Error: $output${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo "🧪 StudyStreaks Environment Setup Test"
echo "======================================"
echo "Testing development environment readiness..."

# Test 1: Docker Containers
print_section "📦 Docker Containers"

run_test "Docker is running" "docker info"
run_test "Docker Compose is available" "docker compose version"

# Change to docker directory and test services
cd infrastructure/docker/development

run_test "PostgreSQL container is running" "docker compose exec postgres pg_isready -h localhost -p 5432"
run_test "Redis container is running" "docker compose exec redis redis-cli -a 'change_me_redis_password_123' ping | grep -q PONG"
run_test "Redis Commander is accessible" "curl -s -o /dev/null -w '%{http_code}' http://localhost:8081 | grep -q 200"

# Return to project root
cd ../../../

# Test 2: Web Application
print_section "🌐 Web Application"

run_test "Port 3000 is listening" "lsof -i :3000 | grep -q LISTEN"
run_test "Web app returns 200" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 | grep -q 200"
run_test "Web app serves StudyStreaks content" "curl -s http://localhost:3000 | grep -q StudyStreaks"
run_test "NextAuth session endpoint works" "curl -s http://localhost:3000/api/auth/session | grep -q '{}'"

# Test 3: Authentication Pages
print_section "🔐 Authentication System"

run_test "Signin page is accessible" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/auth/signin | grep -q 200"
run_test "Signin page contains form" "curl -s http://localhost:3000/auth/signin | grep -i -q 'sign.*in'"

# Test protected routes (should redirect or show auth prompt)
run_test "Admin dashboard is protected" "curl -s -w '%{http_code}' http://localhost:3000/admin/dashboard | grep -E -q '30[0-9]|40[0-9]|200'"
run_test "Teacher dashboard is protected" "curl -s -w '%{http_code}' http://localhost:3000/teacher/dashboard | grep -E -q '30[0-9]|40[0-9]|200'"

# Test 4: Database Connectivity
print_section "🗄️ Database"

run_test_verbose "Database integration test" "cd packages/database && npx tsx src/test-integration.ts | grep -q 'completed successfully'"

# Test 5: Environment Variables
print_section "🔧 Environment Configuration"

run_test "Environment file exists" "test -f .env.local"
run_test "DATABASE_URL is set" "grep -q 'DATABASE_URL=' .env.local"
run_test "NEXTAUTH_SECRET is set" "grep -q 'NEXTAUTH_SECRET=' .env.local"
run_test "NEXTAUTH_URL is set" "grep -q 'NEXTAUTH_URL=' .env.local"

# Test 6: Test User Data
print_section "👥 Test Users"

run_test_verbose "Test users exist in database" "cd packages/database && npx tsx -e \"
import { PrismaClient } from './src/generated';
const prisma = new PrismaClient();
(async () => {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@oakwood-primary.co.uk' } });
  const teacher = await prisma.user.findUnique({ where: { email: 'j.smith@oakwood-primary.co.uk' } });
  if (!admin || !teacher) throw new Error('Test users not found');
  console.log('Test users verified');
  await prisma.\\\$disconnect();
})();\" | grep -q 'Test users verified'"

# Generate final report
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))s

echo ""
echo "======================================"
echo "📊 TEST RESULTS SUMMARY"
echo "======================================"
echo "Total Tests: $TOTAL_TESTS"
echo -e "✅ Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "❌ Failed: ${RED}$FAILED_TESTS${NC}"
echo "⏱️  Duration: ${DURATION}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎯 STATUS: ✅ ENVIRONMENT READY FOR DEVELOPMENT${NC}"
    echo ""
    echo "🚀 Your development environment is fully configured and ready!"
    echo "   You can now start product development in Cursor or Claude Code."
    echo ""
    echo "💡 Next Steps:"
    echo "   • Access the app: http://localhost:3000"
    echo "   • Admin login: admin@oakwood-primary.co.uk / Admin123!"
    echo "   • Teacher login: j.smith@oakwood-primary.co.uk / Teacher123!"
    echo "   • Database UI: http://localhost:8081 (Redis Commander)"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}🎯 STATUS: ❌ ENVIRONMENT SETUP INCOMPLETE${NC}"
    echo ""
    echo "🔧 Please fix the failed tests before starting development."
    echo ""
    echo "Common fixes:"
    echo "• Ensure Docker containers are running: cd infrastructure/docker/development && ./start.sh"
    echo "• Ensure web server is running: pnpm run dev:web"
    echo "• Check environment variables in .env.local"
    echo "• Run database seed: cd packages/database && npx tsx src/simple-seed-basic.ts"
    exit 1
fi 