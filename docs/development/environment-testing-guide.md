# StudyStreaks Development Environment Testing Guide

This guide provides instructions for testing your StudyStreaks development environment to ensure it's ready for product development.

## Quick Commands

### Test Everything (Recommended)
```bash
npm run test:env
```

### Complete Setup + Test
```bash
npm run setup:complete
```

### Manual Scripts
```bash
# Test environment only
./scripts/test-environment.sh

# Complete setup and test
./scripts/setup-and-test.sh
```

## What Gets Tested

The comprehensive test suite validates:

- **📦 Docker Containers**: PostgreSQL, Redis, Redis Commander health
- **🌐 Web Application**: HTTP responses, content serving, port binding
- **🔐 Authentication**: NextAuth endpoints, route protection, signin pages
- **🗄️ Database**: Connectivity, integration tests, test user data
- **🔧 Environment**: Required variables, configuration validation

## Test Results

When all tests pass, you'll see:
```
🎯 STATUS: ✅ ENVIRONMENT READY FOR DEVELOPMENT

🚀 Your development environment is fully configured and ready!
   You can now start product development in Cursor or Claude Code.
```

## Test Credentials

⚠️ **For test user credentials and sensitive configuration details, see:**

📄 **`docs/development/environment-testing-with-credentials.md`**

*Note: This file contains sensitive information and is excluded from version control.*

This document includes:
- Development test user accounts and passwords
- Database connection strings
- API keys and secrets
- Manual testing procedures
- Troubleshooting with sensitive details

## Common Troubleshooting

### Docker Services Not Running
```bash
cd infrastructure/docker/development
./start.sh
```

### Web Application Not Responding
```bash
# Kill existing processes and restart
pkill -f "next dev"
pnpm run dev:web
```

### Database Connection Issues
```bash
cd packages/database
npx tsx src/test-integration.ts
```

### Missing Test Users
```bash
cd packages/database
npx tsx src/simple-seed-basic.ts
```

## Environment Requirements

Ensure these files and configurations exist:

### Required Files
- ✅ `.env.local` - Environment variables
- ✅ `infrastructure/docker/development/docker-compose.yml` - Docker services
- ✅ Test user data seeded in database

### Required Services
- ✅ Docker Desktop running
- ✅ Ports available: 3000, 5432, 6379, 8081
- ✅ Supabase database accessible

## Development Workflow

### Before Starting Work
```bash
npm run test:env
```

### After Environment Changes
```bash
npm run setup:complete
```

### After Database Schema Changes
```bash
cd packages/database
npm run db:push
npx tsx src/simple-seed-basic.ts
npm run test:env
```

## Integration with CI/CD

These test scripts can be integrated into your continuous integration pipeline to validate environment setup automatically.

## Support

For detailed troubleshooting, test credentials, and sensitive configuration information, refer to the comprehensive guide:

📄 **`docs/development/environment-testing-with-credentials.md`**

---

**Ready to start development?** Run `npm run test:env` to verify your setup! 🎉 