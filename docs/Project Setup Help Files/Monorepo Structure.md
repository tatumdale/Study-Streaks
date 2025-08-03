# Study Streaks - Recommended Monorepo Structure

## Root Structure

```
study-streaks/
├── apps/                           # Applications
├── packages/                       # Shared packages
├── services/                       # Backend services
├── tools/                          # Development & compliance tools
├── docs/                          # Documentation
├── scripts/                       # Automation scripts
├── configs/                       # Shared configurations
├── .github/                       # GitHub workflows
└── infrastructure/                # Deployment configs
```

## Apps Directory

```
apps/
├── web/                           # Main student/teacher web app (React/Next.js)
│   ├── src/
│   │   ├── components/            # App-specific components
│   │   ├── pages/                 # Next.js pages
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── stores/                # Zustand stores
│   │   ├── services/              # API calls
│   │   └── utils/                 # App utilities
│   ├── __tests__/
│   │   ├── components/            # React component tests
│   │   ├── pages/                 # Page integration tests
│   │   ├── e2e/                   # Playwright E2E tests
│   │   └── accessibility/         # A11y tests
│   ├── public/
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── jest.config.js
│
├── admin/                         # School admin dashboard (Refine.dev)
│   ├── src/
│   │   ├── pages/                 # Admin pages
│   │   ├── components/            # Admin components
│   │   ├── resources/             # CRUD resources
│   │   └── providers/             # Data providers
│   ├── __tests__/
│   │   ├── admin-flows/           # Admin workflow tests
│   │   ├── security/              # Admin security tests
│   │   └── compliance/            # GDPR admin tests
│   └── jest.config.js
│
├── mobile/                        # React Native app (future)
│   ├── src/
│   ├── __tests__/
│   └── jest.config.js
│
└── storybook/                     # Design system documentation
    ├── stories/
    ├── .storybook/
    └── __tests__/
```

## Packages Directory

```
packages/
├── ui/                            # Shared design system (shadcn/ui + custom)
│   ├── src/
│   │   ├── components/            # Reusable components
│   │   │   ├── ui/                # shadcn/ui base components
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   └── form.tsx
│   │   │   ├── composite/         # Complex composed components
│   │   │   │   ├── StreakDisplay/
│   │   │   │   ├── ProgressBar/
│   │   │   │   ├── HomeworkCard/
│   │   │   │   ├── Leaderboard/
│   │   │   │   └── ImageCropper/  # React Image Crop wrapper
│   │   │   └── animations/        # Animation components
│   │   │       ├── ConfettiCelebration/  # React Confetti
│   │   │       ├── LottieLoader/         # Lottie React
│   │   │       └── MotionWrapper/        # Framer Motion
│   │   ├── hooks/                 # Shared UI hooks
│   │   │   ├── use-debounce.ts    # Use Debounce
│   │   │   ├── use-intersection.ts # React Intersection Observer
│   │   │   └── use-gesture.ts     # React Use Gesture
│   │   ├── lib/                   # UI utilities
│   │   │   ├── utils.ts           # clsx, cn helpers
│   │   │   ├── animations.ts      # Animation presets
│   │   │   └── accessibility.ts   # A11y helpers
│   │   ├── themes/                # Tenant theming system
│   │   │   ├── default.ts
│   │   │   ├── school-blue.ts
│   │   │   └── school-green.ts
│   │   └── icons/                 # Icon components
│   ├── __tests__/
│   │   ├── accessibility/         # WCAG 2.1 AA compliance
│   │   ├── visual-regression/     # Visual testing
│   │   ├── components/            # Component unit tests
│   │   └── animations/            # Animation tests
│   ├── .storybook/                # Storybook config
│   ├── stories/                   # Component stories
│   └── dist/                      # Built components
│
├── database/                      # Database schema & utilities
│   ├── prisma/
│   │   ├── schema.prisma          # Multi-tenant schema
│   │   ├── migrations/
│   │   └── seed/                  # Test data seeds
│   ├── src/
│   │   ├── client.ts              # Prisma client
│   │   ├── types.ts               # Generated types
│   │   └── utils/                 # DB utilities
│   ├── __tests__/
│   │   ├── schema/                # Schema validation
│   │   ├── migrations/            # Migration tests
│   │   ├── compliance/            # GDPR compliance
│   │   └── performance/           # Query performance
│   └── scripts/
│       ├── backup.sh
│       └── migrate.sh
│
├── auth/                          # Authentication & authorization
│   ├── src/
│   │   ├── providers/             # Auth providers (Auth0, etc.)
│   │   ├── middleware/            # Auth middleware
│   │   ├── rbac/                  # Role-based access control
│   │   ├── compliance/            # Child protection compliance
│   │   └── types.ts
│   ├── __tests__/
│   │   ├── security/              # Security testing
│   │   ├── compliance/            # Child protection tests
│   │   └── rbac/                  # Permission tests
│   └── docs/
│
├── gamification/                  # Streak & reward logic
│   ├── src/
│   │   ├── streaks/               # Streak calculation
│   │   ├── levels/                # Level progression
│   │   ├── badges/                # Achievement system
│   │   ├── leaderboards/          # Ranking logic
│   │   └── rewards/               # Prize management
│   ├── __tests__/
│   │   ├── algorithms/            # Algorithm tests
│   │   ├── fairness/              # Fair play tests
│   │   └── psychology/            # Educational psychology compliance
│   └── docs/
│
├── analytics/                     # Analytics & reporting
│   ├── src/
│   │   ├── collectors/            # Data collection
│   │   ├── processors/            # Data processing
│   │   ├── dashboards/            # Dashboard logic
│   │   └── privacy/               # Privacy-compliant analytics
│   ├── __tests__/
│   │   ├── privacy/               # GDPR compliance
│   │   ├── accuracy/              # Data accuracy tests
│   │   └── performance/           # Processing performance
│   └── docs/
│
├── integrations/                  # MIS/LMS integrations
│   ├── src/
│   │   ├── google-classroom/
│   │   ├── microsoft-teams/
│   │   ├── sims/                  # UK school information systems
│   │   ├── moodle/
│   │   └── generic/               # Generic API connectors
│   ├── __tests__/
│   │   ├── integration/           # Integration tests
│   │   ├── security/              # Security tests
│   │   └── compliance/            # Education compliance
│   └── docs/
│
├── email/                         # React Email templates & sending
│   ├── src/
│   │   ├── templates/             # React Email templates
│   │   │   ├── welcome.tsx        # Welcome email
│   │   │   ├── streak-reminder.tsx # Streak reminders
│   │   │   ├── homework-assigned.tsx
│   │   │   └── weekly-progress.tsx
│   │   ├── providers/             # Email service providers
│   │   │   ├── nodemailer.ts      # Nodemailer config
│   │   │   └── aws-ses.ts         # AWS SES (migration ready)
│   │   ├── lib/                   # Email utilities
│   │   │   ├── template-engine.ts # Template rendering
│   │   │   ├── personalization.ts # Dynamic content
│   │   │   └── scheduling.ts      # Email scheduling
│   │   └── types/                 # Email types
│   ├── __tests__/
│   │   ├── templates/             # Template tests
│   │   ├── delivery/              # Delivery tests
│   │   └── compliance/            # Communication compliance
│   └── docs/
│
├── config/                        # Shared configuration
│   ├── src/
│   │   ├── env.ts                 # Environment validation
│   │   ├── constants.ts           # App constants
│   │   ├── features.ts            # Feature flags
│   │   └── compliance.ts          # Compliance settings
│   └── __tests__/
│
└── utils/                         # Shared utilities
    ├── src/
    │   ├── validation/             # Schema validation (Zod)
    │   ├── formatting/             # Date, number formatting
    │   ├── encryption/             # Data encryption
    │   └── sanitization/           # Input sanitization
    ├── __tests__/
    │   ├── security/               # Security utility tests
    │   └── validation/             # Validation tests
    └── docs/
```

## Services Directory

```
services/
├── api/                           # Main API service
│   ├── src/
│   │   ├── routes/                # API routes
│   │   │   ├── auth/
│   │   │   ├── students/
│   │   │   ├── teachers/
│   │   │   ├── homework/
│   │   │   ├── streaks/
│   │   │   └── analytics/
│   │   ├── middleware/            # Express middleware
│   │   ├── controllers/           # Route controllers
│   │   ├── services/              # Business logic
│   │   └── types/                 # API types
│   ├── __tests__/
│   │   ├── unit/                  # Business logic tests
│   │   ├── integration/           # API endpoint tests
│   │   ├── security/              # Security tests
│   │   ├── performance/           # Load testing
│   │   └── compliance/            # Multi-tenancy tests
│   ├── docs/                      # API documentation
│   └── Dockerfile
│
├── background/                    # Background job processing
│   ├── src/
│   │   ├── jobs/
│   │   │   ├── streak-calculation/
│   │   │   ├── notification-dispatch/
│   │   │   ├── data-export/       # GDPR exports
│   │   │   └── analytics-processing/
│   │   ├── queues/                # Bull/Redis queues
│   │   └── schedulers/            # Cron jobs
│   ├── __tests__/
│   │   ├── jobs/                  # Job tests
│   │   ├── reliability/           # Queue reliability
│   │   └── performance/           # Processing performance
│   └── Dockerfile
│
├── websocket/                     # Real-time features
│   ├── src/
│   │   ├── events/                # WebSocket events
│   │   ├── rooms/                 # Socket rooms
│   │   └── auth/                  # Socket authentication
│   ├── __tests__/
│   │   ├── realtime/              # Real-time tests
│   │   └── security/              # Socket security
│   └── Dockerfile
│
└── compliance/                    # Compliance microservice
    ├── src/
    │   ├── gdpr/                  # GDPR compliance
    │   ├── coppa/                 # COPPA compliance (if US expansion)
    │   ├── ico-children/          # ICO Children's Code
    │   ├── audit/                 # Audit logging
    │   └── reporting/             # Compliance reporting
    ├── __tests__/
    │   ├── gdpr/                  # GDPR tests
    │   ├── audit/                 # Audit tests
    │   └── reporting/             # Report tests
    └── Dockerfile
```

## Tools Directory

```
tools/
├── testing/                      # Testing utilities
│   ├── helpers/
│   │   ├── test-data-factory.ts   # Test data generation
│   │   ├── db-setup.ts            # Test DB setup
│   │   └── auth-helpers.ts        # Auth test helpers
│   ├── fixtures/
│   │   ├── students.json
│   │   ├── homework.json
│   │   └── schools.json
│   ├── mocks/
│   │   ├── api/                   # MSW API mocks
│   │   ├── auth/                  # Auth mocks
│   │   └── integrations/          # External service mocks
│   └── setup/
│       ├── jest.setup.ts
│       ├── playwright.setup.ts
│       └── test-env.ts
│
├── compliance/                    # Compliance automation
│   ├── gdpr-scanner.ts           # GDPR compliance scanning
│   ├── accessibility-checker.ts  # A11y automated testing
│   ├── security-scanner.ts       # Security vulnerability scanning
│   └── audit-logger.ts           # Compliance audit logging
│
├── build/                        # Build tools
│   ├── webpack/                  # Custom webpack configs
│   ├── esbuild/                  # esbuild configurations
│   └── scripts/                  # Build scripts
│
└── devtools/                     # Development tools
    ├── seed-database.ts          # Database seeding
    ├── generate-test-data.ts     # Test data generation
    ├── compliance-dashboard.ts   # Compliance monitoring
    └── performance-monitor.ts    # Performance monitoring
```

## Configs Directory

```
configs/
├── eslint/                       # ESLint configurations
│   ├── base.js
│   ├── react.js
│   ├── node.js
│   └── accessibility.js
├── prettier/                     # Prettier configurations
├── typescript/                   # TypeScript configurations
│   ├── base.json
│   ├── react.json
│   └── node.json
├── jest/                         # Jest configurations
│   ├── base.config.js
│   ├── react.config.js
│   └── node.config.js
├── tailwind/                     # Tailwind configurations
│   ├── base.config.js
│   └── themes/                   # Tenant theme configs
└── compliance/                   # Compliance configurations
    ├── gdpr.config.js
    ├── accessibility.config.js
    └── security.config.js
```

## Infrastructure Directory

```
infrastructure/
├── docker/                       # Docker configurations
│   ├── development/
│   ├── staging/
│   └── production/
├── kubernetes/                   # K8s manifests
│   ├── base/
│   ├── staging/
│   └── production/
├── terraform/                    # Infrastructure as Code
│   ├── modules/
│   ├── environments/
│   └── compliance/               # Compliance infrastructure
└── monitoring/                   # Monitoring configurations
    ├── prometheus/
    ├── grafana/
    └── alerting/
```

## Migration Strategy

### Phase 1: Foundation Setup
1. **Create monorepo structure** with Lerna/Nx
2. **Move existing React app** to `apps/web`
3. **Set up shared configs** in `configs/`
4. **Establish basic CI/CD** in `.github/workflows`

### Phase 2: Core Packages
1. **Extract UI components** to `packages/ui`
2. **Set up database package** with Prisma
3. **Create auth package** with basic RBAC
4. **Build config package** for environment management

### Phase 3: Services & Features
1. **Build API service** with Express/Fastify
2. **Implement gamification package** for streaks
3. **Add compliance package** for GDPR
4. **Set up background services**

### Phase 4: Advanced Features
1. **Add analytics package**
2. **Build integration packages**
3. **Implement notification system**
4. **Add admin dashboard**

## Package Manager Recommendation

**Use pnpm with workspaces** for:
- **Efficient disk usage** (shared dependencies)
- **Faster installs** (parallel processing)
- **Better monorepo support** (workspace protocols)
- **Strict dependency management** (no phantom dependencies)

## Key Benefits of This Structure

1. **Educational Focus**: Purpose-built for UK schools with compliance baked in
2. **Scalability**: Clear separation of concerns and packages
3. **Compliance-First**: GDPR, ICO, and accessibility compliance integrated
4. **Multi-Tenancy**: Built for school-based tenancy from day one
5. **Testing Strategy**: Comprehensive testing at every level
6. **Developer Experience**: Clear structure with good tooling
7. **Performance**: Optimized for educational workloads

This structure provides a solid foundation for building Study Streaks while ensuring compliance, scalability, and maintainability from the start.