# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Study Streaks is a UK educational platform built as an Nx monorepo with Next.js, designed specifically for UK schools with multi-tenant architecture and GDPR compliance. It's a gamified homework tracking system that supports UK educational structure including year groups, key stages, and school house systems.

## Essential Documentation

**IMPORTANT:** Before making any changes to this codebase, you MUST read the relevant documentation in the `/docs/` folder. This documentation serves as the single source of truth for requirements, standards, and implementation guidelines.

### Quick Reference Guide
- **Start Here:** `docs/README.md` - Documentation overview and usage guide
- **Before Writing Code:** `docs/Boundary Policies & Rules/Code Standards.md` - Mandatory coding standards
- **Before Completing Features:** `docs/Boundary Policies & Rules/Definition of Done.md` - Quality checklist
- **For Database Changes:** Review all files in `docs/Database Schema/` folder
- **For User Experience:** `docs/Product Management/Personas/` - Student and teacher personas
- **For Legal Compliance:** `docs/Product Management/Compliance and Data Governance.md`

### Documentation Structure

#### Boundary Policies & Rules (`docs/Boundary Policies & Rules/`)
- **Code Standards.md** - TypeScript/React coding standards, GDPR-specific patterns, accessibility requirements, and Cursor AI integration guidelines
- **Definition of Done.md** - Complete quality checklist including security, GDPR compliance, accessibility (WCAG 2.1 AA), and UK education standards

#### Database Schema (`docs/Database Schema/`)
- **DB-Multi-Tenancy and School Management.md** - School entity foundation with UK government integration (URN, DfE numbers)
- **DB-User Management & Authentication.md** - UK educational roles, GDPR compliance, DBS check tracking
- **DB-Educational Structure.md** - UK school structure, progressive learning clubs, evidence-based tracking
- **DB-Homework Tracking & Evidence.md** - Photo evidence, reading logs, parent involvement systems
- **DB-Streaks.md** - Gamification system with fair streak calculation and pause management
- **studystreaks_sample_data.json** - Real-world test data for Weobley Primary School

#### Product Management (`docs/Product Management/`)
- **Compliance and Data Governance.md** - UK legal requirements (GDPR, ICO Children's Code, safeguarding)
- **Personas/Persona - Student User.md** - 8-year-old Charlie representing primary school motivations
- **Personas/Persona - Class Admin User.md** - Miss Chen representing UK primary teachers' workflow

#### Project Setup Help Files (`docs/Project Setup Help Files/`)
- **Tech Stack.md** - Complete technology stack with educational-specific libraries
- **Testing Strategy.md** - Comprehensive testing approach prioritizing security and compliance
- **Monorepo Structure.md** - Recommended project organization for scalable UK educational platform

## Development Commands

### Primary Development Workflow
```bash
# Start development servers
npx nx dev web                    # Main Next.js web application
npx nx dev storybook             # Component documentation

# Building and testing
npx nx build web                 # Build web application
npx nx test web                  # Run unit tests for web app
npx nx test web --watch          # Run tests in watch mode
npx nx e2e web-e2e              # Run end-to-end tests
npx nx lint web                  # Lint web application

# Database operations
npx nx run database:db:generate  # Generate Prisma client after schema changes
npx nx run database:db:push     # Push schema changes to database
npx nx run database:db:migrate  # Run database migrations
npx nx run database:db:seed     # Seed database with test data

# Monorepo operations
npx nx graph                    # View project dependency graph
npx nx affected:build          # Build only affected projects
npx nx affected:test           # Test only affected projects
npx nx run-many --target=build # Build all projects
```

### Local Environment Setup
```bash
# Start local database (PostgreSQL + Redis)
cd infrastructure/docker/development && docker-compose up -d

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Fill in required environment variables

# Initialize database
npx nx run database:db:push
npx nx run database:db:seed
```

## JIRA Integration & AI Tool Policy

### JIRA Ticket Format
All JIRA tickets use the format: **CPG-xxx** (Comprehensive Primary Gamification)

Examples:
- `CPG-123` - User Dashboard Redesign  
- `CPG-124` - Fix Streak Calculation Bug
- `CPG-125` - GDPR Data Deletion Feature

### Manual Label Policy for AI Tools

**CRITICAL**: Before working on any JIRA ticket, AI tools (Claude Code, Cursor, etc.) MUST check for the "Manual" label.

#### Manual Label Rules
- **Label**: `Manual` (case-sensitive)
- **Purpose**: Requires explicit human approval before AI can work on the issue
- **Scope**: Issues marked "Manual" cannot be worked on autonomously by AI tools

#### AI Tool Behavior
```yaml
JIRA Issue Status Check:
  CPG-123 (no labels): ✅ AI can work autonomously
  CPG-124 + "Manual": ❌ STOP - Ask user for explicit permission
  CPG-125 + "Manual" + user approval: ✅ Proceed with work
```

#### When Manual Label is Used
- **Sensitive Features**: Authentication, payments, data privacy
- **Complex Architecture**: Major system changes
- **UI/UX Critical**: User-facing changes requiring design review
- **Security Concerns**: Any functionality touching user data
- **Client Requirements**: Features needing specific business approval

#### User Override Process
When AI encounters a "Manual" labeled issue:
1. **Stop and notify**: "CPG-123 has 'Manual' label - requires your approval"
2. **Wait for confirmation**: User must explicitly say "yes" or "proceed"  
3. **Document override**: Log that user approved the work
4. **Proceed**: AI can now work with full permissions

This enables **autonomous AI development** while maintaining **human control** over sensitive features.

### Branching Strategy
All branches must follow JIRA integration format:
```bash
feature/CPG-123-user-dashboard-redesign
bugfix/CPG-124-streak-calculation-fix
hotfix/CPG-125-gdpr-data-deletion-patch
```

See `docs/git-branching-strategy.md` for complete branching guidelines.

### Local-Only Files System

This project includes a comprehensive system for managing files that should **never be committed to git**. Use this for sensitive documentation, personal notes, temporary files, and work-in-progress content.

#### Quick Usage
```bash
# Store sensitive documentation locally
cp migration-plan.md .local/docs/

# Create personal development notes
echo "Feature idea: Add notification system" > .local/notes/ideas.md

# Use templates for consistent formatting
cp .local/templates/jira-task.md .local/temp/new-feature-issue.md

# Verify files are ignored by git
git status  # Should not show .local/ files
```

#### Protected File Patterns
The following are automatically ignored by git:
- **Directories**: `.local/`, `local/`, `.private/`, `.notes/`, `.scratch/`
- **Files**: `*.local.*`, `*.private`, `*.notes`, `*.draft`, `*.wip`, `*.temp`
- **Specific**: `README.local.md`, `NOTES.md`, `SCRATCH.md`, `JIRA-ISSUE-*.md`

#### Directory Structure
```
.local/
├── README.md              # Documentation for local system
├── docs/                  # Local documentation
├── scripts/               # Helper scripts
├── notes/                 # Personal notes
├── temp/                  # Temporary files
├── configs/               # Local configuration overrides
└── templates/             # File templates
    ├── jira-task.md       # JIRA issue template
    └── migration-plan.md  # Migration plan template
```

#### When to Use Local Files
- **Migration documentation** that contains sensitive details
- **JIRA issue drafts** before they're ready to publish
- **Personal development notes** and observations
- **Temporary API keys** for testing (prefer .env files for real secrets)
- **Work-in-progress documentation** that's not ready for the team
- **Security-related documentation** that should stay local

**Security Note**: Even local files exist on your machine. Be cautious with real production credentials - use proper .env files for actual secrets.

## Architecture Overview

### Monorepo Structure

**Apps:** Primary applications each with their own deployment
- `apps/web/` - Main Next.js application (primary user-facing app)
- `apps/admin/` - Admin dashboard (future development)
- `apps/mobile/` - Mobile application (future development)
- `apps/storybook/` - Component documentation
- `apps/web-e2e/` - End-to-end tests for web app

**Packages:** Shared libraries used across apps
- `packages/database/` - Prisma schema, client, and database utilities
- `packages/auth/` - NextAuth.js configuration and authentication logic
- `packages/ui/` - Shared React components and design system
- `packages/config/` - Environment variables and feature flags with Zod validation
- `packages/utils/` - Shared TypeScript utilities and helpers

**Services:** Backend services (future microservice architecture)
- `services/api/` - RESTful API service
- `services/background/` - Background job processing
- `services/websocket/` - Real-time communication

### Multi-Tenant Database Architecture

All database models include `schoolId` for row-level security and tenant isolation. Key considerations:
- Every query must include school context for security
- School-based data isolation enforced at both database and application levels
- UK-specific educational models with GDPR compliance built-in

### Authentication & Authorization

- **Authentication:** NextAuth.js v4 with custom credentials provider
- **Multi-tenancy:** School-based user isolation with domain validation
- **RBAC:** Custom role-based access control with fine-grained permissions
- **User Types:** Teacher, Student, Parent, SchoolAdmin with context-aware permissions

### UK Educational System Support

The codebase includes specific UK educational system features:
- Year groups (Reception=0 to Year 6=6)
- Key Stages (EYFS, KS1, KS2, KS3, KS4, KS5)
- UK school types and identifiers (URN, DfE numbers)
- House systems and school branding
- Subject-specific homework clubs with gamification

## Technology Stack

- **Framework:** Next.js 15.2.4 with React 19
- **Language:** TypeScript with strict configuration
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** TailwindCSS with custom design system
- **Testing:** Jest + Testing Library + Playwright
- **Package Manager:** pnpm with workspace configuration
- **Build System:** Nx with dependency graph and caching

## Environment Variables

Required environment variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` - Supabase configuration
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL` - NextAuth.js configuration
- `REDIS_URL`, `REDIS_PASSWORD` - Redis for caching and sessions
- `ENCRYPTION_KEY` - For encrypting PII data

## Development Standards

### AI Assistant Guidelines

**For Claude Code and other AI assistants working with this codebase:**

#### Documentation Strategy
- **Always use local files** for sensitive documentation (migrations, security plans, JIRA drafts)
- **Store in `.local/`** directory or use protected naming patterns (`*.local.*`, `*.notes`, `*.draft`)
- **Reference local templates** in `.local/templates/` for consistent formatting
- **Never commit** migration plans, security documentation, or JIRA issue content to git

#### Recommended Workflow
```bash
# 1. Create documentation locally first
cp .local/templates/migration-plan.md .local/docs/supabase-migration.md

# 2. Work with sensitive content safely
echo "Security issue details..." > .local/notes/security-analysis.md

# 3. Verify git protection
git status  # Should not show .local/ files

# 4. Use local docs for reference
cat .local/docs/project-notes.md
```

#### File Creation Priority
1. **First choice**: Use `.local/` directory for any sensitive or temporary content
2. **Second choice**: Use protected naming patterns (`*.local.md`, `*.draft`, `*.notes`)
3. **Last resort**: Create files that will be committed (only for permanent project documentation)

#### When to Use Local vs Committed Files
- **Local files**: Migration plans, security documentation, JIRA drafts, personal notes, API keys, temporary analysis
- **Committed files**: Permanent project documentation, code standards, public guides, team-shared templates

### Module Boundaries
Nx enforces strict module boundaries. Apps can import from packages, but packages should not import from apps. Check dependency graph with `npx nx graph`.

### Database Changes
1. Modify schema in `packages/database/prisma/schema.prisma`
2. Run `npx nx run database:db:generate` to update Prisma client
3. Run `npx nx run database:db:push` for development or create migration for production

### Testing Strategy
- Unit tests: Jest + Testing Library for components and utilities
- Integration tests: API routes and database operations
- E2E tests: Playwright for user workflows
- Accessibility tests: jest-axe integration
- Custom utilities in `tools/testing/` for UK educational context

### Security & Compliance

**CRITICAL:** This platform handles children's data and must comply with UK legal requirements. Review `docs/Product Management/Compliance and Data Governance.md` for complete requirements.

**Mandatory Compliance Checks:**
- All 15 ICO Children's Code standards must be met
- GDPR data subject rights implementation required
- 7-year data retention for UK educational records
- WCAG 2.1 AA accessibility compliance
- Multi-tenant data isolation (every query must include `schoolId`)
- All PII data encrypted using configured encryption key
- DBS check tracking for safeguarding compliance

**Before Code Release:**
- Complete the Definition of Done checklist (`docs/Boundary Policies & Rules/Definition of Done.md`)
- Verify multi-tenancy isolation is maintained
- Run accessibility tests with jest-axe
- Validate GDPR compliance for any data handling changes

**Documentation Security:**
- **Never commit** sensitive documentation (migration plans, security analysis, API keys)
- **Always use** `.local/` directory or protected file patterns for sensitive content
- **Verify git status** before committing to ensure no sensitive files are tracked
- **Use local templates** from `.local/templates/` for consistent documentation

## User Context & Personas

Before implementing any user-facing features, review the personas in `docs/Product Management/Personas/`:

**Primary Users:**
- **Students (Charlie, 8 years old):** Need immediate feedback, social connection, celebration of effort over performance. Features must be inclusive and supportive of diverse family circumstances.
- **Teachers (Miss Chen):** Need time-saving tools that enhance relationships rather than replace them. Want streamlined homework management without additional administrative burden.

**Key Design Principles:**
- Celebrate effort and participation, not just academic achievement
- Support diverse family circumstances (working parents, different home situations)
- Maintain teacher-student relationships as central to the experience
- Ensure accessibility and inclusivity for all students

## Common Patterns

### Multi-Tenant Queries
Always include school context in database queries:
```typescript
const students = await prisma.student.findMany({
  where: { schoolId: user.schoolId }
});
```

### UK Educational Context
Use helper utilities for UK-specific features:
```typescript
import { getYearGroupDisplay, getKeyStageFromYearGroup } from '@study-streaks/utils';
```

### Authentication Guards
Use NextAuth.js with custom role-based guards:
```typescript
import { requireAuth } from '@study-streaks/auth';
```

### Streak Pause Management
Implement fair streak pausing for illness/circumstances:
```typescript
// Reference DB-Streaks.md for complete pause logic
const pauseStreak = await createStreakPause({
  studentId,
  reason: 'illness',
  retroactive: true, // Allow retrospective fairness
  evidenceRequired: false // Trust-based system
});
```