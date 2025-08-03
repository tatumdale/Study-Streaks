# StudyStreaks Environment Documentation

## Overview

StudyStreaks is built as a monorepo with multiple applications and services running on different ports. This document provides a comprehensive overview of all environments, services, and how to run them.

## Project Structure

```
StudyStreaks/
├── apps/
│   ├── web/              # Main Next.js application (port 3000)
│   ├── admin/            # Admin dashboard (port 3001) 
│   ├── mobile/           # React Native mobile app
│   ├── web-e2e/          # End-to-end tests
│   └── storybook/        # Component library documentation
├── packages/             # Shared packages
│   ├── auth/             # Authentication utilities
│   ├── database/         # Prisma schema and utilities
│   ├── config/           # Configuration and constants
│   ├── utils/            # Shared utilities
│   ├── ui/               # Shared UI components
│   ├── analytics/        # Analytics and tracking
│   ├── email/            # Email templates and sending
│   ├── gamification/     # Streaks and badges logic
│   └── integrations/     # Third-party integrations
├── services/             # Backend services
│   └── api/              # Express.js API service (port 3002)
└── infrastructure/       # Docker and deployment configs
```

## Environments & Services

### 🌐 Frontend Applications

#### 1. Main Web Application
- **Port**: `3000`
- **Location**: `/apps/web/`
- **Framework**: Next.js 15 + React 19
- **Purpose**: Primary user-facing application for students, teachers, and parents
- **Users**: Students, Teachers, Parents, School Admins
- **Features**: 
  - Authentication and user management
  - Homework tracking and submission
  - Study streaks and achievements
  - Parent-child communication
  - Role-based dashboards

**Start Command:**
```bash
pnpm run dev:web
# or
nx dev web
```

**Test Credentials:**
- **Admin**: `admin@oakwood-primary.co.uk` / `Admin123!`
- **Teacher**: `j.smith@oakwood-primary.co.uk` / `Teacher123!`

#### 2. Admin Dashboard
- **Port**: `3001`
- **Location**: `/apps/admin/`
- **Framework**: Next.js 14 + Refine.dev + Ant Design
- **Purpose**: School administration interface
- **Users**: School Administrators only
- **Features**:
  - User management (students, teachers, parents)
  - School-wide analytics and reporting
  - Class and curriculum management
  - System health monitoring
  - Data export and GDPR compliance tools

**Start Command:**
```bash
pnpm run dev:admin
# or
nx dev admin
```

**Authentication**: Separate NextAuth implementation with admin-only access

#### 3. Mobile Application
- **Platform**: React Native (iOS/Android)
- **Location**: `/apps/mobile/`
- **Status**: Planned for future development
- **Purpose**: Mobile access for students and parents

### 🔧 Backend Services

#### 1. API Service
- **Port**: `3002`
- **Location**: `/services/api/`
- **Framework**: Express.js + TypeScript
- **Purpose**: REST API backend for all applications
- **Features**:
  - Multi-tenant data access
  - Authentication endpoints
  - CRUD operations for all entities
  - File upload and processing
  - Background job queuing

**Start Command:**
```bash
pnpm run dev:api
# or
nx dev api
```

### 📊 Infrastructure Services

#### 1. PostgreSQL Database
- **Port**: `5432`
- **Container**: `studystreaks-postgres`
- **Database**: `studystreaks_dev`
- **Credentials**: `dev` / `devpass123`
- **Purpose**: Primary data storage with multi-tenant architecture

#### 2. Redis Cache & Sessions
- **Port**: `6379`
- **Container**: `studystreaks-redis`
- **Password**: `devpass123`
- **Purpose**: Session storage, caching, job queues

#### 3. Redis Commander (Dev Tool)
- **Port**: `8081`
- **Container**: `studystreaks-redis-ui`
- **Credentials**: `admin` / `admin`
- **Purpose**: Redis database management interface

## Package Manager & Monorepo

- **Package Manager**: pnpm v10.14.0
- **Monorepo Tool**: Nx v21.3.11
- **Node Version**: >=18.0.0

### Workspace Structure
```json
{
  "workspaces": [
    "apps/*",
    "packages/*", 
    "services/*"
  ]
}
```

## Running the Full Environment

### Development Setup

1. **Start Infrastructure Services:**
```bash
pnpm run docker:up
```

2. **Database Setup:**
```bash
# Generate Prisma client
pnpm run db:generate

# Push schema to database
pnpm run db:push

# Seed with test data
pnpm run db:seed
```

3. **Start All Applications:**
```bash
# Start all services in parallel
pnpm run dev

# Or start individually:
pnpm run dev:web     # Main app (port 3000)
pnpm run dev:admin   # Admin dashboard (port 3001) 
pnpm run dev:api     # API service (port 3002)
```

### Docker Infrastructure

**Start Infrastructure:**
```bash
docker-compose -f infrastructure/docker/development/docker-compose.yml up -d
```

**Services Started:**
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Redis Commander UI (port 8081)

## Environment Variables

### Required Environment Files

1. **Root Level**: `.env.local`
2. **Database Package**: `packages/database/.env`
3. **Web App**: `apps/web/.env.local`
4. **Admin App**: `apps/admin/.env.local`

### Key Environment Variables

```bash
# Database
DATABASE_URL="postgresql://dev:devpass123@localhost:5432/studystreaks_dev"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Redis
REDIS_URL="redis://devpass123@localhost:6379"

# API
API_URL="http://localhost:3002"
```

## Available Scripts

### Root Level Commands

```bash
# Development
pnpm run dev                    # Start all services
pnpm run dev:web               # Start main web app
pnpm run dev:admin             # Start admin dashboard
pnpm run dev:api               # Start API service

# Building
pnpm run build                 # Build all apps
pnpm run build:web             # Build web app only

# Testing
pnpm run test                  # Run all tests
pnpm run test:watch            # Run tests in watch mode
pnpm run e2e                   # Run end-to-end tests

# Database
pnpm run db:generate           # Generate Prisma client
pnpm run db:push               # Push schema to database
pnpm run db:migrate            # Run migrations
pnpm run db:seed               # Seed test data
pnpm run db:studio             # Open Prisma Studio

# Docker
pnpm run docker:up             # Start infrastructure
pnpm run docker:down           # Stop infrastructure
pnpm run docker:logs           # View docker logs

# Code Quality
pnpm run lint                  # Lint all code
pnpm run format                # Format all code
pnpm run typecheck             # Type check all TypeScript
```

## Technology Stack

### Frontend
- **Next.js 14/15**: React framework with App Router
- **React 18/19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Refine.dev**: Admin dashboard framework
- **Ant Design**: UI components for admin

### Backend
- **Express.js**: REST API framework
- **Prisma**: Database ORM and migrations
- **PostgreSQL**: Primary database
- **Redis**: Caching and sessions
- **NextAuth.js**: Authentication

### Development
- **pnpm**: Package manager
- **Nx**: Monorepo management
- **Jest**: Unit testing
- **Playwright**: End-to-end testing
- **ESLint/Prettier**: Code quality
- **Husky**: Git hooks

## Authentication & Users

### User Roles
1. **STUDENT**: Access to homework and progress tracking
2. **TEACHER**: Class management and assignment creation
3. **PARENT**: Child progress monitoring
4. **SCHOOL_ADMIN**: School-wide administration

### Test Accounts
```
Admin User:
- Email: admin@oakwood-primary.co.uk
- Password: Admin123!
- Access: Both main app (3000) and admin dashboard (3001)

Teacher User:
- Email: j.smith@oakwood-primary.co.uk  
- Password: Teacher123!
- Access: Main app (3000) only
```

## Multi-Tenancy

The platform supports multiple schools with data isolation:
- Each school has a unique `schoolId`
- All data queries include school-based filtering
- User authentication includes school context
- Admin users can only access their school's data

## Development Workflow

1. **Start Infrastructure**: `pnpm run docker:up`
2. **Seed Database**: `pnpm run db:seed`
3. **Start Applications**: `pnpm run dev`
4. **Access Applications**:
   - Main App: http://localhost:3000
   - Admin Dashboard: http://localhost:3001
   - API Docs: http://localhost:3002/docs
   - Redis UI: http://localhost:8081

## Troubleshooting

### Common Issues

1. **Port Already in Use**:
```bash
# Kill processes on specific ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

2. **Database Connection Issues**:
```bash
# Restart PostgreSQL container
docker restart studystreaks-postgres

# Check database status
pnpm run docker:logs
```

3. **Package Installation Issues**:
```bash
# Clear and reinstall
pnpm run clean
pnpm install
```

### Logs and Monitoring

- **Application Logs**: Available in terminal during development
- **Database Logs**: `pnpm run docker:logs`
- **Redis Monitoring**: http://localhost:8081

## Deployment

### Environments
- **Development**: Local development with Docker
- **Staging**: TBD (likely Vercel + Supabase)
- **Production**: TBD (likely Vercel + Supabase)

### Build Process
```bash
# Build all applications
pnpm run build

# Run production mode locally
pnpm run start
```

## Security Notes

- Development uses simple passwords for local Docker services
- All production credentials should use environment variables
- NextAuth handles secure session management
- Database queries include multi-tenant filtering
- GDPR compliance features built into data models