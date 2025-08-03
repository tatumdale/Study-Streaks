# Getting Started with StudyStreaks Development

## Overview

This guide will help you set up the StudyStreaks development environment and get your first contribution ready. StudyStreaks is a gamified homework platform for UK primary schools built with Next.js, TypeScript, and PostgreSQL.

## Prerequisites

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **pnpm** | 8+ | Package manager (preferred over npm) |
| **Docker** | 24+ | Local development infrastructure |
| **Docker Compose** | 2.20+ | Multi-container orchestration |
| **Git** | 2.40+ | Version control |

### Recommended IDE Setup

**VS Code Extensions:**
- **TypeScript**: Built-in TypeScript support
- **Prisma**: Database schema management
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Tailwind CSS IntelliSense**: CSS class completion
- **Docker**: Container management

**VS Code Settings:**
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

## Quick Start (5 minutes)

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/tatumdale/Study-Streaks.git
cd Study-Streaks

# Install dependencies
pnpm install

# Create environment file
touch .env.local
```

### 2. Configure Environment

Edit `.env.local` with your local development settings:

```bash
# Database (provided by Docker)
DATABASE_URL="postgresql://dev:devpass123@localhost:5432/studystreaks_dev"
DIRECT_URL="postgresql://dev:devpass123@localhost:5432/studystreaks_dev"

# Supabase (use your keys or test values)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
SUPABASE_SECRET_KEY="your-secret-key"

# NextAuth
NEXTAUTH_SECRET="development-secret-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"

# Redis
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="devpass123"

# Encryption
ENCRYPTION_KEY="dev-encryption-key-32-chars-long123"

# Public URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
```

### 3. Start Development Environment

```bash
# Start infrastructure (PostgreSQL, Redis)
pnpm run docker:up

# Setup database
pnpm run db:generate
pnpm run db:push
pnpm run db:seed

# Start development servers
pnpm run dev
```

### 4. Open Application

- **Main Application**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001 (if configured)
- **Prisma Studio**: http://localhost:5555 (run `pnpm run db:studio`)

## Project Structure

### Nx Monorepo Layout

```
Study-Streaks/
├── apps/
│   ├── web/                 # Main Next.js application
│   │   ├── src/
│   │   │   ├── app/         # Next.js 14 App Router
│   │   │   ├── components/  # React components
│   │   │   ├── lib/         # Utility functions
│   │   │   └── styles/      # Global styles
│   │   └── public/          # Static assets
│   └── admin/               # Admin dashboard (Refine)
├── packages/
│   ├── database/            # Prisma schema and client
│   │   ├── prisma/          # Database schema
│   │   ├── src/             # Database utilities
│   │   └── scripts/         # Database scripts
│   ├── config/              # Environment configuration
│   │   └── src/             # Config utilities
│   └── utils/               # Shared utilities
│       ├── src/             # Utility functions
│       └── tests/           # Utility tests
├── docs/                    # Documentation
├── infrastructure/          # Docker and deployment
├── tools/                   # Build and development tools
└── scripts/                 # Project scripts
```

### Key Files

| File | Purpose |
|------|---------|
| `nx.json` | Nx workspace configuration |
| `package.json` | Root package and workspace config |
| `tsconfig.base.json` | Base TypeScript configuration |
| `eslint.config.mjs` | ESLint configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
| `docker-compose.yml` | Local development infrastructure |

## Development Workflow

### Daily Development Commands

```bash
# Start development (most common)
pnpm run dev

# Run specific app
pnpm run dev:web      # Main application only
pnpm run dev:admin    # Admin dashboard only

# Database operations
pnpm run db:studio    # Open Prisma Studio
pnpm run db:reset     # Reset database with fresh data
pnpm run db:migrate   # Run pending migrations

# Code quality
pnpm run lint         # Check code style
pnpm run format       # Format code
pnpm run typecheck    # Check TypeScript

# Testing
pnpm run test         # Run all tests
pnpm run test:watch   # Run tests in watch mode
pnpm run test:coverage # Run tests with coverage
```

### Git Workflow

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/SSP-123-add-streak-system

# Make changes and commit
git add .
git commit -m "feat(streaks): add basic streak tracking"

# Push and create PR
git push -u origin feature/SSP-123-add-streak-system
# Create pull request on GitHub
```

### Branch Naming Convention

- **Features**: `feature/SSP-123-description`
- **Bug fixes**: `fix/SSP-456-bug-description`
- **Documentation**: `docs/update-api-documentation`
- **Hotfixes**: `hotfix/critical-security-patch`

## Understanding the Codebase

### Core Concepts

#### 1. Multi-Tenancy
Every data operation is scoped to a school (tenant):

```typescript
// Database queries automatically include school context
const students = await prisma.student.findMany({
  where: { 
    schoolId: session.user.schoolId, // Always included
    yearGroup: 3 
  }
});

// Use tenant-aware client
const tenantClient = getTenantClient(schoolId);
const students = await tenantClient.student.findMany({
  where: { yearGroup: 3 } // schoolId automatically added
});
```

#### 2. Type Safety
Everything is typed from database to UI:

```typescript
// Database types from Prisma
import type { Student, HomeworkCompletion } from '@study-streaks/database';

// API response types
interface StudentsResponse {
  students: Student[];
  pagination: PaginationInfo;
}

// Component props
interface StudentCardProps {
  student: Student;
  onUpdate: (student: Student) => void;
}
```

#### 3. Authentication Context
User context is available throughout the app:

```typescript
// In API routes
export default async function handler(req, res) {
  const session = await getServerSession(req, res);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  
  // session.user includes schoolId and roles
}

// In React components
export default function Dashboard() {
  const { data: session } = useSession();
  if (!session) return <LoginForm />;
  
  // Access user context
  const isTeacher = session.user.roles.includes('teacher');
}
```

### Common Development Patterns

#### 1. Creating API Endpoints

```typescript
// File: apps/web/src/app/api/students/route.ts
import { getServerSession } from 'next-auth';
import { getTenantClient } from '@study-streaks/database';
import { z } from 'zod';

const GetStudentsSchema = z.object({
  classId: z.string().uuid().optional(),
  yearGroup: z.number().min(0).max(6).optional(),
});

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.schoolId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = GetStudentsSchema.parse({
    classId: searchParams.get('classId'),
    yearGroup: Number(searchParams.get('yearGroup')),
  });

  const client = getTenantClient(session.user.schoolId);
  const students = await client.student.findMany({
    where: query,
    include: { class: true, parentStudents: { include: { parent: true } } },
  });

  return Response.json({ students });
}
```

#### 2. Creating React Components

```typescript
// File: apps/web/src/components/students/StudentCard.tsx
import { Student } from '@study-streaks/database';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StudentCardProps {
  student: Student & {
    class: { name: string };
    _count: { homeworkCompletions: number };
  };
  onSelect?: (student: Student) => void;
}

export function StudentCard({ student, onSelect }: StudentCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{student.firstName} {student.lastName}</span>
          <Badge variant="secondary">Year {student.yearGroup}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Class: {student.class.name}
        </p>
        <p className="text-sm">
          Homework completed: {student._count.homeworkCompletions}
        </p>
      </CardContent>
    </Card>
  );
}
```

#### 3. Database Operations

```typescript
// File: packages/database/src/operations/students.ts
import { prisma, getTenantClient } from '../client';
import type { CreateStudentData } from '../types';

export async function createStudent(
  schoolId: string,
  data: CreateStudentData
) {
  const client = getTenantClient(schoolId);
  
  return await client.student.create({
    data: {
      ...data,
      // Consent tracking for GDPR
      consentGiven: data.parentConsent.consentGiven,
      consentGivenBy: data.parentConsent.parentId,
      consentDate: new Date(),
      dataRetentionUntil: new Date(
        Date.now() + 7 * 365 * 24 * 60 * 60 * 1000 // 7 years
      ),
    },
    include: {
      class: true,
      parentStudents: { include: { parent: true } },
    },
  });
}
```

## Common Development Tasks

### Adding a New Feature

1. **Create Database Schema Changes**
   ```bash
   # Edit packages/database/prisma/schema.prisma
   # Add new models or modify existing ones
   
   # Generate migration
   pnpm run db:migrate:dev --name add-new-feature
   ```

2. **Create API Endpoints**
   ```bash
   # Create API route files in apps/web/src/app/api/
   # Follow RESTful conventions and type safety
   ```

3. **Create React Components**
   ```bash
   # Add components in apps/web/src/components/
   # Use TypeScript and follow existing patterns
   ```

4. **Add Tests**
   ```bash
   # Write unit tests for utilities
   # Write integration tests for API endpoints
   # Write component tests for React components
   ```

### Debugging Common Issues

#### Database Connection Issues
```bash
# Check if containers are running
docker ps

# Restart infrastructure
pnpm run docker:down
pnpm run docker:up

# Reset database
pnpm run db:reset
```

#### Type Errors
```bash
# Regenerate Prisma client
pnpm run db:generate

# Check TypeScript
pnpm run typecheck

# Clear Next.js cache
rm -rf .next
pnpm run dev
```

#### Authentication Issues
```bash
# Check session configuration
# Verify NEXTAUTH_SECRET is set
# Ensure NEXTAUTH_URL matches your development URL
```

## Next Steps

1. **Read Architecture Documentation**: [docs/architecture/](../architecture/)
2. **Understand the Database Schema**: [docs/Database Schema/](../Database%20Schema/)
3. **Review Code Standards**: [docs/Boundary Policies & Rules/Code Standards.md](../Boundary%20Policies%20&%20Rules/Code%20Standards.md)
4. **Study User Personas**: [docs/Product Management/](../Product%20Management/)
5. **Learn About GDPR Compliance**: [docs/compliance/](../compliance/)

## Getting Help

- **Documentation**: Check relevant docs in `/docs/` folder
- **Team Communication**: Use project communication channels
- **Issues**: Create GitHub issues for bugs or feature requests
- **Code Review**: All changes require peer review

Welcome to the StudyStreaks development team! 🎉