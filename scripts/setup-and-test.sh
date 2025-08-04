#!/bin/bash

# Complete Environment Setup and Test Script
# This script will start all services and then run comprehensive tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 StudyStreaks Complete Environment Setup${NC}"
echo "=========================================="
echo "This script will:"
echo "1. Start Docker containers"
echo "2. Start the web application"
echo "3. Seed the database with test data"
echo "4. Run comprehensive environment tests"
echo ""

# Function to check if a service is running
check_service() {
    local service_name="$1"
    local check_command="$2"
    
    echo -n "Checking $service_name... "
    if eval "$check_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Running${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Not running${NC}"
        return 1
    fi
}

# Step 1: Start Docker containers
echo -e "\n${BLUE}📦 Step 1: Starting Docker Containers${NC}"
echo "----------------------------------------"

cd infrastructure/docker/development

if ! check_service "Docker containers" "docker compose ps | grep -q 'Up'"; then
    echo "Starting Docker containers..."
    ./start.sh
    
    # Wait for containers to be healthy
    echo "Waiting for containers to be healthy..."
    sleep 10
    
    # Verify containers are running
    if ! docker compose ps | grep -q "Up.*healthy"; then
        echo -e "${RED}❌ Failed to start Docker containers${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker containers started successfully${NC}"
else
    echo -e "${GREEN}✅ Docker containers already running${NC}"
fi

cd ../../../

# Step 2: Check if web application is running
echo -e "\n${BLUE}🌐 Step 2: Checking Web Application${NC}"
echo "----------------------------------------"

if ! check_service "Web application on port 3000" "lsof -i :3000 | grep -q LISTEN"; then
    echo -e "${YELLOW}⚠️  Web application not running. Please start it manually:${NC}"
    echo "   pnpm run dev:web"
    echo ""
    echo "Waiting for you to start the web application..."
    echo "Press any key when the web application is running..."
    read -n 1 -s
    
    # Check again
    if ! check_service "Web application on port 3000" "lsof -i :3000 | grep -q LISTEN"; then
        echo -e "${RED}❌ Web application is still not running${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Web application already running${NC}"
fi

# Step 3: Seed database with test data
echo -e "\n${BLUE}🗄️ Step 3: Seeding Database${NC}"
echo "----------------------------------------"

cd packages/database

# Check if test users already exist
if npx tsx -e "
import { PrismaClient } from './src/generated';
const prisma = new PrismaClient();
(async () => {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@oakwood-primary.co.uk' } });
  if (admin) { console.log('exists'); process.exit(0); }
  process.exit(1);
})();
" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Test users already exist${NC}"
else
    echo "Seeding database with test users..."
    npx tsx src/simple-seed-basic.ts
    echo -e "${GREEN}✅ Database seeded successfully${NC}"
fi

cd ../../

# Step 4: Wait a moment for everything to settle
echo -e "\n${BLUE}⏳ Step 4: Waiting for services to settle${NC}"
echo "----------------------------------------"
sleep 3
echo -e "${GREEN}✅ Ready to run tests${NC}"

# Step 5: Run comprehensive tests
echo -e "\n${BLUE}🧪 Step 5: Running Environment Tests${NC}"
echo "=========================================="

# Run the test script
if ./scripts/test-environment.sh; then
    echo ""
    echo -e "${GREEN}🎉 SETUP COMPLETE AND VERIFIED!${NC}"
    echo ""
    echo -e "${GREEN}Your StudyStreaks development environment is ready!${NC}"
    echo ""
    echo "🔗 Quick Links:"
    echo "   • Web App: http://localhost:3000"
    echo "   • Admin Dashboard: http://localhost:3000/admin/dashboard"
    echo "   • Database UI: http://localhost:8081"
    echo ""
    echo "🔐 Test Credentials:"
    echo "   • Admin: admin@oakwood-primary.co.uk / Admin123!"
    echo "   • Teacher: j.smith@oakwood-primary.co.uk / Teacher123!"
    echo ""
    echo "🛠️  Development Commands:"
    echo "   • Start web app: pnpm run dev:web"
    echo "   • Start admin app: pnpm run dev:admin"
    echo "   • Database studio: cd packages/database && npm run db:studio"
    echo "   • Run tests: ./scripts/test-environment.sh"
    echo ""
else
    echo ""
    echo -e "${RED}❌ SETUP INCOMPLETE${NC}"
    echo ""
    echo "Some tests failed. Please check the output above and fix any issues."
    echo ""
    echo "Common troubleshooting:"
    echo "• Restart Docker: cd infrastructure/docker/development && docker compose restart"
    echo "• Restart web app: Kill existing process and run 'pnpm run dev:web'"
    echo "• Check environment: Ensure .env.local has correct values"
    echo "• Re-seed database: cd packages/database && npx tsx src/simple-seed-basic.ts"
    exit 1
fi 