# StudyStreaks

**Gamified Homework Motivation Platform for UK Primary Schools**

StudyStreaks is a comprehensive educational platform designed specifically for UK primary schools to motivate homework completion through gamification, buddy systems, and real-time progress tracking. Built with strict GDPR compliance and the ICO Children's Code in mind.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)

## 🏫 Platform Overview

### Core Features
- **📚 Subject-based Homework Clubs**: Maths, Reading, Spelling, and Topic clubs with progressive levels
- **👫 Buddy System**: Students work in small groups of 2-3 for motivation and support
- **🏆 Gamification**: Experience points, streaks, leaderboards, and achievement badges
- **📱 Multi-role Interface**: Dedicated dashboards for students, parents, teachers, and school admins
- **🔒 GDPR Compliant**: Built for UK educational data protection requirements
- **🏗️ Multi-tenant Architecture**: Secure school-by-school data isolation

### Target Users
- **Primary Schools** (Reception - Year 6) across the UK
- **Teachers** managing homework assignments and student progress
- **Students** (ages 4-11) completing homework and building streaks
- **Parents** supporting their children's learning journey
- **School Administrators** overseeing platform usage and compliance

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **pnpm** 8+
- **Docker** and **Docker Compose** (for local development)
- **PostgreSQL** 15+ (provided via Docker)
- **Redis** (provided via Docker)

### Development Setup

```bash
# Clone the repository
git clone https://github.com/tatumdale/Study-Streaks.git
cd Study-Streaks

# Install dependencies
pnpm install

# Start local infrastructure
pnpm run docker:up

# Setup database
pnpm run db:generate
pnpm run db:push
pnpm run db:seed

# Start development servers
pnpm run dev

# Open application
open http://localhost:3000
```

> **New Developer?** Check out our [Getting Started Guide](GETTING-STARTED.md) for detailed setup instructions.

### Available Commands

```bash
# Development
pnpm run dev              # Start all development servers
pnpm run dev:web          # Start web application only
pnpm run dev:admin        # Start admin dashboard only

# Database Operations
pnpm run db:generate      # Generate Prisma client
pnpm run db:push          # Push schema to database
pnpm run db:migrate       # Run migrations
pnpm run db:seed          # Seed with test data
pnpm run db:studio        # Open Prisma Studio

# Testing & Quality
pnpm run test             # Run all tests
pnpm run test:coverage    # Run tests with coverage
pnpm run lint             # Lint codebase
pnpm run typecheck        # TypeScript validation
pnpm run format           # Format code

# Build & Deploy
pnpm run build            # Build for production
pnpm run clean            # Clean build artifacts
```

## 🏗️ Architecture

### Technology Stack

**Frontend & UI**
- **Next.js 14** with App Router and React 18
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **Framer Motion** for animations

**Backend & Database**
- **Next.js API Routes** for backend logic
- **Prisma ORM** with PostgreSQL
- **NextAuth.js** for authentication
- **Multi-tenant architecture** with Row Level Security

**Development & DevOps**
- **Nx Monorepo** for workspace management
- **Docker Compose** for local development
- **ESLint & Prettier** for code quality
- **Husky & lint-staged** for Git hooks

**Key Libraries**
- **React Hook Form + Zod** for form handling
- **TanStack Query** for server state
- **Socket.io** for real-time features
- **Bull + Redis** for background jobs
- **Sharp** for image processing

### Project Structure

```
Study-Streaks/
├── apps/
│   ├── web/                 # Main student/parent application
│   └── admin/               # School administration dashboard
├── packages/
│   ├── database/            # Prisma schema and database client
│   ├── config/              # Environment and feature configuration
│   └── utils/               # Shared utilities and helpers
├── docs/                    # Comprehensive documentation
├── infrastructure/          # Docker and deployment configs
└── tools/                   # Development and build tools
```

## 🔐 Security & Compliance

### GDPR & Data Protection
- **Data Minimisation**: Collect only essential educational data
- **Consent Management**: Parental consent tracking and withdrawal
- **Right to be Forgotten**: Automated data deletion workflows
- **Data Portability**: Export functionality for data subject requests
- **Audit Logging**: Comprehensive activity tracking

### ICO Children's Code Compliance
- **Age-appropriate Design**: UI/UX designed for children aged 4-11
- **Privacy by Default**: Minimal data processing, maximum privacy
- **Transparency**: Clear privacy notices for children and parents
- **Parental Controls**: Comprehensive oversight and consent management

### Security Features
- **Multi-tenant Isolation**: School-by-school data segregation
- **Role-based Access Control**: Granular permissions system
- **JWT Authentication**: Secure session management
- **API Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive data sanitization

## 📚 Documentation

| Documentation Type | Location | Purpose |
|-------------------|----------|---------|
| **Architecture** | [`docs/architecture/`](docs/architecture/) | System design and technical specifications |
| **Development** | [`docs/development/`](docs/development/) | Setup guides and development workflows |
| **API Reference** | [`docs/api/`](docs/api/) | API endpoints and integration guides |
| **User Guides** | [`docs/user-guides/`](docs/user-guides/) | Role-specific usage instructions |
| **Compliance** | [`docs/compliance/`](docs/compliance/) | GDPR and ICO Children's Code documentation |
| **Database Schema** | [`docs/Database Schema/`](docs/Database%20Schema/) | Entity relationships and business logic |
| **Product Management** | [`docs/Product Management/`](docs/Product%20Management/) | User personas and requirements |

### Quick References
- **[Getting Started Guide](GETTING-STARTED.md)** - First-time setup for new developers
- **[Environment Setup](docs/development/environment-setup.md)** - Development environment
- **[API Documentation](docs/api/README.md)** - REST API reference
- **[Database Schema](docs/Database%20Schema/README.md)** - Data model overview
- **[Contributing Guidelines](CONTRIBUTING.md)** - Development workflow

## 🎯 Current Status

**Phase 1 (Current)**: Core Platform Development
- ✅ Multi-tenant architecture with RLS
- ✅ Authentication and authorization system
- ✅ Database schema and migrations
- ✅ Basic homework club functionality
- 🔄 Gamification system implementation
- 🔄 Real-time features and notifications

**Phase 2 (Planned)**: Enhanced Features
- 📋 Advanced analytics and reporting
- 📋 Parent-teacher communication tools
- 📋 Mobile application development
- 📋 School MIS integrations

**Phase 3 (Future)**: Scale & Optimize
- 📋 Multi-school district management
- 📋 Advanced AI-powered insights
- 📋 Third-party educational tool integrations

## 🤝 Contributing

We welcome contributions from educators, developers, and the community. Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Development workflow and Git practices
- Code standards and quality requirements
- Testing and documentation expectations
- Issue reporting and feature requests

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/CPG-123-description`
3. Follow our [code standards](docs/Boundary%20Policies%20&%20Rules/Code%20Standards.md)
4. Write tests and ensure they pass
5. Submit a pull request with detailed description

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/README.md](docs/README.md)
- **Issues**: [GitHub Issues](https://github.com/tatumdale/Study-Streaks/issues)
- **Support Email**: support@studystreaks.com
- **Developer Community**: [GitHub Discussions](https://github.com/tatumdale/Study-Streaks/discussions)

---

**StudyStreaks** - Transforming homework from a chore into an adventure for UK primary school children.

*Built with ❤️ for educators, students, and families across the United Kingdom.*