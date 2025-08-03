# Getting Started with StudyStreaks

Quick setup guide for new developers joining the StudyStreaks project.

## 🚀 Prerequisites

- **Node.js** 18.17.0+
- **pnpm** (package manager)
- **Docker Desktop** (for local services)
- **Git**

## ⚡ Quick Setup

```bash
# 1. Clone and install
git clone https://github.com/tatumdale/Study-Streaks.git
cd Study-Streaks
pnpm install

# 2. Set up Docker services
cd infrastructure/docker/development
cp .env.example .env
# Edit .env and change default passwords
./start.sh

# 3. Set up database
cd ../../../
pnpm run db:generate
pnpm run db:push
pnpm run db:seed

# 4. Start development
pnpm run dev:web
```

## 🌐 Development URLs

- **Main App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001 (optional)
- **Storybook**: http://localhost:4400 (optional)
- **Redis UI**: http://localhost:8081

## 📋 Environment Setup

### Root Environment (.env.local)
```bash
# Database
DATABASE_URL="postgresql://dev:your_password@localhost:5432/studystreaks_dev"

# NextAuth
NEXTAUTH_SECRET="your-secret-minimum-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Redis
REDIS_URL="redis://:your_password@localhost:6379"

# Required for production features
SUPABASE_URL="your_supabase_url"
SUPABASE_PUBLISHABLE_KEY="your_key"
```

### Docker Environment (infrastructure/docker/development/.env)
```bash
POSTGRES_PASSWORD=your_secure_password
REDIS_PASSWORD=your_secure_password
REDIS_COMMANDER_PASSWORD=your_admin_password
```

## 🛠️ Development Commands

```bash
# Start main application
pnpm run dev:web

# Run tests
pnpm run test

# Lint code
pnpm run lint

# Database operations
pnpm run db:generate  # Generate Prisma client
pnpm run db:push      # Push schema changes
pnpm run db:seed      # Seed test data

# Docker services
cd infrastructure/docker/development
./start.sh            # Start services
docker compose down   # Stop services
```

## 🏗️ Project Structure

```
StudyStreaks/
├── apps/
│   ├── web/              # Main Next.js application
│   ├── admin/            # Admin dashboard
│   └── storybook/        # Component documentation
├── packages/
│   ├── database/         # Prisma schema & utilities
│   ├── auth/             # Authentication logic
│   ├── ui/               # Shared components
│   └── config/           # Configuration
├── infrastructure/
│   └── docker/           # Development environment
└── docs/                 # Project documentation
```

## 🔧 Troubleshooting

### Docker Issues
```bash
# Reset Docker environment
docker compose down -v
./start.sh
```

### Database Issues
```bash
# Verify database connection
docker compose ps
pnpm run db:push
```

### Dependency Issues
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📚 Next Steps

1. Read documentation in `docs/` folder
2. Check `CLAUDE.md` for development guidelines
3. Explore the codebase starting with `apps/web/`
4. Run the test suite to understand testing patterns

## 🔐 Security

- All `.env` files are git-ignored
- Change default Docker passwords
- Never commit secrets to the repository
- Use `.local/` directory for sensitive documentation

## 🆘 Getting Help

- Check existing documentation in `docs/`
- Review error messages carefully
- Check Docker logs: `docker compose logs service-name`
- Ensure all prerequisites are properly installed

---

**Ready to contribute?** Navigate to http://localhost:3000 after setup to see the StudyStreaks application running locally!