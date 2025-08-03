# StudyStreaks Docker Development Environment

This directory contains Docker configurations for running StudyStreaks in a local development environment.

## 🚀 Quick Start

### 1. Environment Setup

Create your local environment configuration:

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file and change the default passwords
nano .env  # or use your preferred editor
```

**⚠️ IMPORTANT**: Change all default passwords in the `.env` file before starting services!

### 2. Start Services

```bash
# Make the start script executable
chmod +x start.sh

# Start core services (PostgreSQL, Redis, Redis Commander)
./start.sh

# Start with API service
./start.sh api

# Start with API and background services
./start.sh api background
```

### 3. Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove all data (reset database)
docker compose down -v
```

## 📊 Services Overview

| Service | Port | Purpose | Access |
|---------|------|---------|---------|
| PostgreSQL | 5432 | Development database | Database tools |
| Redis | 6379 | Caching & sessions | Redis CLI |
| Redis Commander | 8081 | Redis UI management | http://localhost:8081 |
| API Service | 3001 | Backend API (optional) | http://localhost:3001 |

## 🔧 Configuration

### Environment Variables

All sensitive configuration is managed through the `.env` file:

```bash
# Database
POSTGRES_DB=studystreaks_dev
POSTGRES_USER=dev
POSTGRES_PASSWORD=your_secure_password_here

# Redis
REDIS_PASSWORD=your_redis_password_here

# Redis Commander (Development UI)
REDIS_COMMANDER_USER=admin
REDIS_COMMANDER_PASSWORD=your_admin_password_here

# API Service
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

### Service Profiles

Services are organized using Docker Compose profiles:

- **Core services** (default): PostgreSQL, Redis, Redis Commander
- **api** profile: Adds the API service
- **background** profile: Adds background job processing

## 🔍 Health Checks

All services include health checks to ensure they're ready before dependent services start:

```bash
# Check service status
docker compose ps

# View service logs
docker compose logs postgres
docker compose logs redis
docker compose logs api
```

## 🗄️ Database Management

### Connection Information

- **Host**: localhost
- **Port**: 5432
- **Database**: Value from `POSTGRES_DB` in `.env`
- **User**: Value from `POSTGRES_USER` in `.env`
- **Password**: Value from `POSTGRES_PASSWORD` in `.env`

### Database Tools

Connect using any PostgreSQL client:

```bash
# Using psql
psql -h localhost -p 5432 -U dev -d studystreaks_dev

# Using connection string
postgresql://dev:your_password@localhost:5432/studystreaks_dev
```

### Initialize Database Schema

After starting the services, initialize the database schema using Prisma:

```bash
# From project root
cd ../../../

# Generate Prisma client
npx nx run database:db:generate

# Push schema to database
npx nx run database:db:push

# Seed with test data (optional)
npx nx run database:db:seed
```

## 🔐 Security Notes

### Development Environment

- **Default passwords**: All services use environment variables with secure defaults
- **Network isolation**: All services run on an isolated Docker network
- **Host binding**: Services only bind to localhost (127.0.0.1)

### Production Considerations

**⚠️ DO NOT use this configuration for production!**

For production deployment:
- Use external managed databases (e.g., AWS RDS, Google Cloud SQL)
- Implement proper secret management (e.g., AWS Secrets Manager)
- Use TLS/SSL for all connections
- Implement proper backup and monitoring

## 🛠️ Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check if ports are already in use
netstat -an | grep 5432
netstat -an | grep 6379

# Check Docker daemon is running
docker info
```

**Database connection errors:**
```bash
# Verify database is healthy
docker compose ps
docker compose logs postgres

# Test connection
docker compose exec postgres pg_isready -U dev
```

**Redis connection errors:**
```bash
# Check Redis status
docker compose logs redis

# Test Redis connection
docker compose exec redis redis-cli ping
```

### Reset Everything

```bash
# Stop all services and remove volumes
docker compose down -v

# Remove all containers and images (nuclear option)
docker system prune -a

# Start fresh
./start.sh
```

## 📝 Development Workflow

1. **Start services**: `./start.sh`
2. **Initialize database**: Run Prisma commands from project root
3. **Start your applications**: Run Next.js dev servers
4. **Develop**: Make changes to your code
5. **Stop services**: `docker compose down` when done

## 🔄 Updates

To update service images:

```bash
# Pull latest images
docker compose pull

# Restart services with new images
docker compose down
./start.sh
```

## 📁 File Structure

```
infrastructure/docker/development/
├── .env.example          # Environment template
├── .env                  # Your local config (git-ignored)
├── docker-compose.yml    # Service definitions
├── init.sql             # Database initialization
├── start.sh             # Startup script
└── README.md            # This file
```