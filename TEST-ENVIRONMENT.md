# 🧪 StudyStreaks Environment Testing

Quick reference for testing your development environment setup.

## 🚀 Quick Commands

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
# Test only
./scripts/test-environment.sh

# Complete setup
./scripts/setup-and-test.sh
```

## ✅ What Gets Tested

- **Docker Services** (PostgreSQL, Redis, Redis Commander)
- **Web Application** (localhost:3000 accessibility)
- **Authentication** (NextAuth endpoints, route protection)
- **Database** (connectivity, test user data)
- **Environment** (required variables configured)

## 🔐 Test Credentials

⚠️ **For actual test credentials, see:** `docs/development/environment-testing-with-credentials.md`

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@[MASKED].co.uk` | `[MASKED]` |
| **Teacher** | `teacher@[MASKED].co.uk` | `[MASKED]` |

## 📊 Expected Result

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

## 🔧 If Tests Fail

### 1. Start Docker Services
```bash
cd infrastructure/docker/development
./start.sh
```

### 2. Start Web Application
```bash
pnpm run dev:web
```

### 3. Seed Database
```bash
cd packages/database
npx tsx src/simple-seed-basic.ts
```

### 4. Check Environment Variables
Ensure `.env.local` contains:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## 📖 Detailed Guide

For comprehensive documentation, see: [docs/testing/environment-testing-guide.md](docs/testing/environment-testing-guide.md)

---

**Ready to start development?** 
Run `npm run test:env` to verify your setup! 🎉 