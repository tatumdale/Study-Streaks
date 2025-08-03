# Development Environment Setup

## Overview

This guide provides detailed instructions for setting up the StudyStreaks development environment across different operating systems. The setup includes Docker for infrastructure, Node.js for the application runtime, and various development tools.

## System Requirements

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **RAM** | 8GB | 16GB+ |
| **Storage** | 10GB free | 20GB+ free (SSD preferred) |
| **CPU** | 2 cores | 4+ cores |
| **Network** | Broadband | High-speed broadband |

### Operating System Support

- **macOS**: 10.15+ (Catalina or later)
- **Windows**: 10/11 with WSL2
- **Linux**: Ubuntu 20.04+, Debian 11+, or equivalent

## Installation Guide

### macOS Setup

#### 1. Install Prerequisites

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required tools
brew install node@18 pnpm git docker

# Install Docker Desktop
brew install --cask docker

# Verify installations
node --version    # Should be 18.x or higher
pnpm --version    # Should be 8.x or higher
docker --version  # Should be 24.x or higher
```

#### 2. Configure Git

```bash
# Set global Git configuration
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Configure SSH key for GitHub (recommended)
ssh-keygen -t ed25519 -C "your.email@example.com"
cat ~/.ssh/id_ed25519.pub # Add this to GitHub
```

### Windows Setup (WSL2)

#### 1. Enable WSL2

```powershell
# Run as Administrator in PowerShell
wsl --install
# Restart computer when prompted
```

#### 2. Install Ubuntu in WSL2

```powershell
# Install Ubuntu 22.04 LTS
wsl --install -d Ubuntu-22.04

# Set Ubuntu as default
wsl --set-default Ubuntu-22.04
```

#### 3. Setup Development Tools in WSL2

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install Docker Desktop for Windows (download from docker.com)
# Enable WSL2 integration in Docker Desktop settings

# Verify installations
node --version
pnpm --version
docker --version
```

### Linux (Ubuntu/Debian) Setup

#### 1. Install Node.js and pnpm

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install build essentials
sudo apt-get install -y build-essential git curl
```

#### 2. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Verify installation (may need to logout/login)
docker --version
docker compose version
```

## IDE Configuration

### VS Code Setup

#### 1. Install VS Code

```bash
# macOS
brew install --cask visual-studio-code

# Windows
# Download from https://code.visualstudio.com/

# Linux
sudo snap install code --classic
```

#### 2. Essential Extensions

Install these extensions for optimal development experience:

```bash
# Install via VS Code CLI
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension Prisma.prisma
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.eslint
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-azuretools.vscode-docker
code --install-extension GitHub.copilot
code --install-extension ms-vscode.vscode-json
```

#### 3. VS Code Configuration

Create `.vscode/settings.json` in your project:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "prisma.showPrismaDataPlatformNotification": false,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "esbenp.prettier-vscode",
    "ms-vscode.eslint",
    "bradlc.vscode-tailwindcss",
    "ms-azuretools.vscode-docker",
    "github.copilot"
  ]
}
```

### Alternative IDEs

#### WebStorm Configuration

1. **Install WebStorm**: Download from JetBrains
2. **Enable Prettier**: File → Settings → Languages & Frameworks → JavaScript → Prettier
3. **Configure ESLint**: File → Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
4. **Install Prisma Plugin**: File → Settings → Plugins → Search "Prisma"

#### Cursor IDE (Alternative)

```bash
# Download from cursor.sh
# Import VS Code settings automatically
# Enhanced with AI features for development
```

## Database Setup

### Local PostgreSQL with Docker

The recommended approach uses Docker Compose for consistent environments:

```yaml
# infrastructure/docker/development/docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: studystreaks-postgres
    environment:
      POSTGRES_DB: studystreaks_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpass123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    command: postgres -c log_statement=all -c log_destination=stderr

  redis:
    image: redis:7-alpine
    container_name: studystreaks-redis
    ports:
      - "6379:6379"
    command: redis-server --requirepass devpass123
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Start Development Infrastructure

```bash
# Start infrastructure
pnpm run docker:up

# Check containers are running
docker ps

# View logs
pnpm run docker:logs

# Stop infrastructure
pnpm run docker:down
```

### Database Tools

#### 1. Prisma Studio
```bash
# Open Prisma Studio (web-based database GUI)
pnpm run db:studio
# Opens at http://localhost:5555
```

#### 2. Database CLI Access
```bash
# Connect to PostgreSQL directly
docker exec -it studystreaks-postgres psql -U dev -d studystreaks_dev

# Common SQL commands
\dt        # List tables
\d users   # Describe users table
\q         # Quit
```

#### 3. Redis CLI Access
```bash
# Connect to Redis
docker exec -it studystreaks-redis redis-cli -a devpass123

# Common Redis commands
KEYS *           # List all keys
GET session:xxx  # Get session data
FLUSHALL         # Clear all data
exit             # Quit
```

## Environment Configuration

### Environment Variables

Create `.env.local` file:

```bash
touch .env.local
```

#### Development Environment Values

```bash
# Database Configuration
DATABASE_URL="postgresql://dev:devpass123@localhost:5432/studystreaks_dev"
DIRECT_URL="postgresql://dev:devpass123@localhost:5432/studystreaks_dev"

# Redis Configuration
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="devpass123"

# NextAuth Configuration
NEXTAUTH_SECRET="development-secret-must-be-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"

# Supabase Configuration (Development)
SUPABASE_URL="https://your-dev-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-dev-publishable-key"
SUPABASE_SECRET_KEY="your-dev-secret-key"

# Public Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://your-dev-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-dev-publishable-key"

# Development Settings
NODE_ENV="development"
SKIP_ENV_VALIDATION="false"

# File Upload Limits
MAX_FILE_SIZE="5242880"  # 5MB
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp,application/pdf"

# Email Configuration (Optional for development)
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="your-mailtrap-user"
SMTP_PASSWORD="your-mailtrap-password"
SMTP_FROM="dev@studystreaks.local"

# Encryption Key (Development)
ENCRYPTION_KEY="development-encryption-key-32-characters-long-123"
```

### Environment Validation

Test environment configuration:

```bash
# Validate environment variables
pnpm run typecheck

# Test database connection
pnpm run db:generate
pnpm run db:push

# Test Redis connection
node -e "
const Redis = require('redis');
const client = Redis.createClient({ url: process.env.REDIS_URL, password: process.env.REDIS_PASSWORD });
client.connect().then(() => console.log('Redis connected')).catch(console.error);
"
```

## Development Tools Setup

### Git Configuration

#### 1. Global Git Settings

```bash
# Configure Git user
git config --global user.name "Your Name"
git config --global user.email "your.email@domain.com"

# Set default branch name
git config --global init.defaultBranch main

# Configure line endings (important for cross-platform)
git config --global core.autocrlf input   # macOS/Linux
git config --global core.autocrlf true    # Windows

# Configure editor
git config --global core.editor "code --wait"
```

#### 2. Git Hooks Setup

```bash
# Install Husky (Git hooks)
pnpm run prepare

# Verify hooks are installed
ls -la .husky/
```

#### 3. SSH Key Setup

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@domain.com"

# Add to SSH agent
ssh-add ~/.ssh/id_ed25519

# Copy public key to clipboard
# macOS:
pbcopy < ~/.ssh/id_ed25519.pub
# Linux:
xclip -sel clip < ~/.ssh/id_ed25519.pub
# Windows (WSL):
cat ~/.ssh/id_ed25519.pub | clip.exe

# Add to GitHub: Settings → SSH and GPG keys → New SSH key
```

### Browser Development Tools

#### Chrome DevTools Setup

1. **Install Chrome DevTools Extensions**:
   - React Developer Tools
   - Redux DevTools (if using Redux)
   - Prisma Studio Extension

2. **Configure DevTools**:
   - Enable "Disable cache" during development
   - Set up device emulation for mobile testing
   - Configure network throttling for performance testing

#### Firefox Developer Edition

Alternative browser with excellent developer tools:
- Download from developer.mozilla.org
- Built-in responsive design mode
- Excellent CSS Grid/Flexbox inspection tools

## Performance Optimization

### Development Performance

#### 1. Optimize Docker Performance

```bash
# macOS: Allocate more resources to Docker Desktop
# Settings → Resources → Advanced
# CPU: 4+ cores
# Memory: 8GB+
# Swap: 2GB
# Disk: 64GB+
```

#### 2. Node.js Performance

```bash
# Increase Node.js memory limit if needed
export NODE_OPTIONS="--max-old-space-size=8192"

# Add to your shell profile (.bashrc, .zshrc)
echo 'export NODE_OPTIONS="--max-old-space-size=8192"' >> ~/.zshrc
```

#### 3. VS Code Performance

```json
// Add to VS Code settings.json
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.next/**": true,
    "**/dist/**": true,
    "**/build/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  }
}
```

## Troubleshooting Common Issues

### Port Conflicts

```bash
# Check what's using a port
lsof -i :3000     # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process using port
kill -9 $(lsof -t -i:3000)  # macOS/Linux
```

### Docker Issues

```bash
# Reset Docker state
docker system prune -a

# Remove all volumes (careful!)
docker volume prune

# Restart Docker Desktop
# macOS: Docker Desktop → Restart
# Linux: sudo systemctl restart docker
```

### Permission Issues (Linux/macOS)

```bash
# Fix npm global permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc

# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
# Log out and back in
```

### Database Connection Issues

```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# Reset database
pnpm run docker:down
docker volume rm studystreaks_postgres_data
pnpm run docker:up
pnpm run db:push
```

## Environment Verification

### Complete Setup Verification

Run this checklist to ensure everything is working:

```bash
# 1. Check versions
node --version     # Should be 18.x+
pnpm --version     # Should be 8.x+
docker --version   # Should be 24.x+

# 2. Start infrastructure
pnpm run docker:up

# 3. Install dependencies
pnpm install

# 4. Setup database
pnpm run db:generate
pnpm run db:push

# 5. Run type checking
pnpm run typecheck

# 6. Start development server
pnpm run dev

# 7. Open application
open http://localhost:3000
```

### Health Check Script

Create a health check script:

```bash
#!/bin/bash
# scripts/health-check.sh

echo "🔍 StudyStreaks Development Environment Health Check"
echo "=================================================="

# Check Node.js
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js: $(node --version)"
else
    echo "❌ Node.js not installed"
fi

# Check pnpm
if command -v pnpm >/dev/null 2>&1; then
    echo "✅ pnpm: $(pnpm --version)"
else
    echo "❌ pnpm not installed"
fi

# Check Docker
if command -v docker >/dev/null 2>&1; then
    echo "✅ Docker: $(docker --version)"
else
    echo "❌ Docker not installed"
fi

# Check containers
if docker ps | grep -q studystreaks-postgres; then
    echo "✅ PostgreSQL container running"
else
    echo "❌ PostgreSQL container not running"
fi

if docker ps | grep -q studystreaks-redis; then
    echo "✅ Redis container running"
else
    echo "❌ Redis container not running"
fi

echo "=================================================="
echo "🎉 Environment check complete!"
```

Make it executable and run:

```bash
chmod +x scripts/health-check.sh
./scripts/health-check.sh
```

## Next Steps

After completing the environment setup:

1. **Run the Getting Started Guide**: [getting-started.md](./getting-started.md)
2. **Review the Testing Guide**: [testing-guide.md](./testing-guide.md)
3. **Study the Code Standards**: [../Boundary Policies & Rules/Code Standards.md](../Boundary%20Policies%20&%20Rules/Code%20Standards.md)
4. **Understand the Architecture**: [../architecture/overview.md](../architecture/overview.md)

Your development environment is now ready for StudyStreaks development! 🚀