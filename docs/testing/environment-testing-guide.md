# Environment Testing Guide

This guide explains how to use the comprehensive environment testing suite to ensure your StudyStreaks development environment is properly set up and ready for product development.

## Overview

The testing suite validates:
- ✅ Docker containers (PostgreSQL, Redis, Redis Commander)
- ✅ Web application accessibility and authentication
- ✅ Database connectivity and test data
- ✅ Route protection and security
- ✅ Environment variables configuration

## Quick Start

### Option 1: Complete Setup and Test (Recommended)
This will set up everything and run tests:

```bash
npm run setup:complete
```

### Option 2: Test Only (if environment is already running)
This only runs the tests:

```bash
npm run test:env
```

## Detailed Scripts

### 1. Complete Setup Script (`scripts/setup-and-test.sh`)

**Purpose**: Sets up the entire development environment and validates it.

**What it does**:
1. 📦 Starts Docker containers (PostgreSQL, Redis, Redis Commander)
2. 🌐 Checks if web application is running (prompts to start if needed)
3. 🗄️ Seeds database with test users
4. ⏳ Waits for services to stabilize
5. 🧪 Runs comprehensive environment tests

**Usage**:
```bash
./scripts/setup-and-test.sh
# or
npm run setup:complete
```

### 2. Environment Test Script (`scripts/test-environment.sh`)

**Purpose**: Validates that the development environment is working correctly.

**Test Categories**:
- **Docker Containers**: Verifies PostgreSQL, Redis, and Redis Commander are running
- **Web Application**: Tests HTTP responses and content serving
- **Authentication System**: Validates NextAuth endpoints and route protection
- **Database**: Confirms connectivity and test data existence
- **Environment Configuration**: Checks required environment variables

**Usage**:
```bash
./scripts/test-environment.sh
# or
npm run test:env
```

## Test Results

### ✅ Success Output
When all tests pass, you'll see:
```
🎯 STATUS: ✅ ENVIRONMENT READY FOR DEVELOPMENT

🚀 Your development environment is fully configured and ready!
   You can now start product development in Cursor or Claude Code.

💡 Next Steps:
   • Access the app: http://localhost:3000
   • Admin login: [See credentials file for details]
   • Teacher login: [See credentials file for details]
   • Database UI: http://localhost:8081 (Redis Commander)
```

### ❌ Failure Output
When tests fail, you'll see specific error messages and troubleshooting guidance:
```
🎯 STATUS: ❌ ENVIRONMENT SETUP INCOMPLETE

🔧 Please fix the failed tests before starting development.

Common fixes:
• Ensure Docker containers are running: cd infrastructure/docker/development && ./start.sh
• Ensure web server is running: pnpm run dev:web
• Check environment variables in .env.local
• Run database seed: cd packages/database && npx tsx src/simple-seed-basic.ts
```

## Test Credentials

⚠️ **For actual test credentials, see:** `docs/development/environment-testing-with-credentials.md`

After successful setup, these test users are available:

| User Type | Email | Password | Access Level |
|-----------|-------|----------|--------------|
| **Admin** | `admin@[MASKED].co.uk` | `[MASKED]` | Full school administration |
| **Teacher** | `teacher@[MASKED].co.uk` | `[MASKED]` | Class management |

## Manual Testing Checklist

After running automated tests, you can manually verify:

### 1. Web Application Access
- [ ] Navigate to http://localhost:3000
- [ ] Page loads with "StudyStreaks" branding
- [ ] Shows "Sign in to get started" for unauthenticated users
- [ ] No other functionality is visible without authentication

### 2. Authentication Flow
- [ ] Click "Sign In" button → redirects to `/auth/signin`
- [ ] Login form is displayed
- [ ] Test admin login: [Use credentials from credentials file]
- [ ] Successful login redirects to appropriate dashboard
- [ ] User information is displayed correctly

### 3. Route Protection
- [ ] Try accessing `/admin/dashboard` without authentication
- [ ] Should redirect to signin or show authentication prompt
- [ ] Protected routes require valid session

### 4. Database UI Access
- [ ] Navigate to http://localhost:8081
- [ ] Redis Commander interface loads
- [ ] Can view Redis data

## Troubleshooting

### Common Issues

#### 1. Docker Containers Not Running
**Error**: "Docker service postgres is not running"
```bash
cd infrastructure/docker/development
./start.sh
```

#### 2. Web Application Not Responding
**Error**: "Web application returned 502/503"
```bash
# Kill existing processes
pkill -f "next dev"
# Start fresh
pnpm run dev:web
```

#### 3. Database Connection Issues
**Error**: "Database integration test failed"
```bash
# Check database status
cd infrastructure/docker/development
docker compose ps
# Restart if needed
docker compose restart postgres
```

#### 4. Missing Test Users
**Error**: "Test users not found in database"
```bash
cd packages/database
npx tsx src/simple-seed-basic.ts
```

#### 5. Environment Variables Missing
**Error**: "Missing required environment variables"
- Ensure `.env.local` exists in project root
- Check that required variables are set:
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`

### Advanced Debugging

#### View Logs
```bash
# Docker container logs
cd infrastructure/docker/development
docker compose logs postgres
docker compose logs redis

# Next.js development logs
# Check the terminal where you ran `pnpm run dev:web`
```

#### Manual Database Testing
```bash
cd packages/database
npx tsx src/test-integration.ts
```

#### Manual Authentication Testing
```bash
# Test session endpoint
curl http://localhost:3000/api/auth/session

# Test signin page
curl http://localhost:3000/auth/signin
```

## Integration with Development Workflow

### Before Starting Development
Always run the environment test to ensure everything is working:
```bash
npm run test:env
```

### After Major Changes
If you've made significant changes to:
- Database schema
- Authentication configuration
- Docker setup
- Environment variables

Run the complete setup to verify everything still works:
```bash
npm run setup:complete
```

### Continuous Integration
These scripts can be integrated into CI/CD pipelines to validate environment setup in different environments.

## Support

If you encounter issues not covered in this guide:

1. **Check Docker Status**: Ensure Docker Desktop is running
2. **Verify Ports**: Make sure ports 3000, 5432, 6379, and 8081 are available
3. **Check Logs**: Review application and Docker logs for specific errors
4. **Environment Variables**: Verify all required variables are properly configured
5. **Clean Restart**: Sometimes a complete restart resolves transient issues

The environment testing suite is designed to catch common setup issues early, ensuring a smooth development experience. 