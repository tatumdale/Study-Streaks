# Study Streaks Testing Strategy

## Overview

This document provides testing patterns, approaches, and tooling guidelines for Cursor AI when developing the Study Streaks platform. It focuses on **achievable testing for a single developer + AI pair** building an MVP homework motivation platform for UK schools.

**Target**: Solo developer + Cursor AI building multi-tenant educational platform  
**Philosophy**: Essential tests first, comprehensive coverage later  
**Compliance**: UK GDPR, ICO Children's Code, WCAG 2.1 AA

---

## Repository Structure & Test Organisation

### Monorepo Structure
```
study-streaks/
├── apps/
│   ├── web/                     # Next.js frontend
│   │   ├── __tests__/
│   │   │   ├── components/      # React component tests
│   │   │   ├── pages/           # Page integration tests
│   │   │   └── e2e/             # Playwright E2E tests
│   │   └── jest.config.js
│   └── admin/                   # Refine admin interface
│       ├── __tests__/
│       └── jest.config.js
├── packages/
│   ├── database/                # Prisma schema & migrations
│   │   ├── __tests__/
│   │   │   ├── unit/            # Schema validation tests
│   │   │   ├── integration/     # Database operation tests
│   │   │   └── compliance/      # GDPR & data protection tests
│   │   └── jest.config.js
│   ├── ui/                      # Shared components
│   │   ├── __tests__/
│   │   │   ├── accessibility/   # WCAG 2.1 AA tests
│   │   │   └── components/      # Component unit tests
│   │   └── jest.config.js
│   └── auth/                    # Authentication logic
│       ├── __tests__/
│       │   ├── security/        # Auth security tests
│       │   └── compliance/      # Child protection tests
│       └── jest.config.js
├── services/
│   ├── api/                     # Next.js API routes
│   │   ├── __tests__/
│   │   │   ├── unit/            # Business logic tests
│   │   │   ├── integration/     # API endpoint tests
│   │   │   ├── security/        # Security & multi-tenancy tests
│   │   │   └── performance/     # Load testing
│   │   └── jest.config.js
│   └── background/              # Background jobs (Bull/Redis)
│       ├── __tests__/
│       └── jest.config.js
├── tools/
│   ├── testing/                 # Shared test utilities
│   │   ├── helpers/             # Test data factories
│   │   ├── fixtures/            # Mock data
│   │   ├── mocks/               # MSW mocks
│   │   └── setup/               # Test environment setup
│   └── compliance/              # GDPR/Accessibility tools
├── docs/
│   ├── testing/                 # Testing documentation
│   └── compliance/              # Compliance documentation
└── scripts/
    ├── test-setup.sh            # Test environment setup
    └── compliance-check.sh      # Automated compliance checks
```

### Root-Level Test Configuration
```json
// package.json (root)
{
  "workspaces": [
    "apps/*",
    "packages/*", 
    "services/*",
    "tools/*"
  ],
  "scripts": {
    "test": "npm run test --workspaces",
    "test:unit": "npm run test:unit --workspaces", 
    "test:integration": "npm run test:integration --workspaces",
    "test:e2e": "npm run test:e2e --workspaces",
    "test:security": "npm run test:security --workspaces",
    "test:compliance": "npm run test:compliance --workspaces",
    "test:accessibility": "npm run test:accessibility --workspaces",
    "test:watch": "npm run test:watch --workspaces",
    "test:critical": "npm run test:unit --workspaces && npm run test:security --workspaces"
  }
}
```

---

## Testing Tools & Libraries

### Core Testing Stack
```json
{
  "devDependencies": {
    // Testing Frameworks
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    
    // E2E Testing
    "playwright": "^1.40.0",
    "@playwright/test": "^1.40.0",
    
    // API Mocking
    "msw": "^2.0.0",
    
    // Database Testing
    "jest-environment-node": "^29.0.0",
    "@prisma/client": "workspace:*",
    
    // Accessibility Testing
    "@axe-core/playwright": "^4.8.0",
    "jest-axe": "^8.0.0",
    
    // Security Testing
    "audit-ci": "^6.6.0",
    
    // Performance Testing
    "autocannon": "^7.12.0",
    "clinic": "^13.0.0",
    
    // Compliance Testing
    "gdpr-data-mapper": "^1.0.0"
  }
}
```

### Jest Configuration Template
```javascript
// jest.config.js (shared base config)
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tools/testing/setup/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@study-streaks/(.*)$': '<rootDir>/packages/$1/src'
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.{ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

---

## Test Types & Patterns

### 1. Unit Tests (Priority 1)
**Pattern**: Fast, isolated tests for business logic and utilities

```typescript
// Example Pattern: Streak Calculation Logic
describe('StreakCalculationService', () => {
  describe('calculateCurrentStreak', () => {
    it('should handle consecutive completion days', () => {
      const completions = [
        { date: '2025-01-15', completed: true, subject: 'Math' },
        { date: '2025-01-16', completed: true, subject: 'Math' },
        { date: '2025-01-17', completed: true, subject: 'Math' }
      ];
      
      const result = calculateCurrentStreak(completions);
      expect(result.currentStreak).toBe(3);
      expect(result.longestStreak).toBe(3);
    });

    it('should preserve streaks over UK school holidays', () => {
      const completions = [
        { date: '2025-07-18', completed: true }, // Last day before summer
        { date: '2025-09-02', completed: true }  // First day back
      ];
      
      const result = calculateCurrentStreak(completions, { respectHolidays: true });
      expect(result.currentStreak).toBe(2);
    });
  });
});
```

**Folder**: `__tests__/unit/`  
**Focus**: Business logic, calculations, utilities, validation  
**Coverage Target**: 90%+

### 2. Security Tests (Priority 1)
**Pattern**: Multi-tenancy, authentication, data protection

```typescript
// Example Pattern: Multi-Tenant Data Isolation
describe('Multi-Tenant Security', () => {
  describe('StudentService', () => {
    it('should prevent cross-school data access', async () => {
      const school1Student = await createTestStudent({ schoolId: 'school-1' });
      const school2Context = { tenantId: 'school-2' };
      
      const result = await studentService.getStudent(school1Student.id, school2Context);
      expect(result).toBeNull();
    });

    it('should enforce row-level security in database queries', async () => {
      await seedMultiTenantData();
      
      const query = studentService.buildQuery({ schoolId: 'school-1' });
      expect(query.where).toContain({ schoolId: 'school-1' });
    });
  });
});
```

**Folder**: `__tests__/security/`  
**Focus**: Authentication, authorization, data isolation, injection prevention  
**Coverage Target**: 100%

### 3. Compliance Tests (Priority 1)
**Pattern**: UK GDPR, ICO Children's Code, data protection

```typescript
// Example Pattern: GDPR Data Deletion
describe('GDPR Compliance', () => {
  describe('StudentDataDeletion', () => {
    it('should completely remove all student personal data', async () => {
      const student = await createTestStudent({
        name: 'Test Student',
        email: 'test@school.ac.uk',
        dateOfBirth: '2010-05-15'
      });
      
      await createTestStreaks(student.id, 10);
      await createTestBuddyRelationships(student.id, 2);
      
      await gdprService.deleteStudentData(student.id);
      
      const remainingData = await auditService.findStudentDataReferences(student.id);
      expect(remainingData).toEqual([]);
    });
  });

  describe('ICO Children\'s Code Compliance', () => {
    it('should not process data beyond stated purpose', async () => {
      const student = await createTestStudent({ age: 12 });
      
      const processingAudit = await dataProcessingService.auditStudentData(student.id);
      
      expect(processingAudit.purposes).toEqual(['homework_tracking', 'educational_motivation']);
      expect(processingAudit.purposes).not.toContain('marketing');
    });
  });
});
```

**Folder**: `__tests__/compliance/`  
**Focus**: GDPR deletion, data minimisation, ICO Children's Code  
**Coverage Target**: 100%

### 4. Accessibility Tests (Priority 2)
**Pattern**: WCAG 2.1 AA compliance, keyboard navigation, screen readers

```typescript
// Example Pattern: WCAG 2.1 AA Component Testing
describe('Accessibility Compliance', () => {
  describe('HomeworkSubmissionForm', () => {
    it('should meet WCAG 2.1 AA standards', async () => {
      const { container } = render(<HomeworkSubmissionForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation', async () => {
      render(<HomeworkSubmissionForm />);
      
      await user.tab();
      expect(screen.getByLabelText('Subject')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText('Completed')).toHaveFocus();
    });

    it('should provide screen reader support', () => {
      render(<HomeworkSubmissionForm />);
      
      expect(screen.getByLabelText('Subject')).toHaveAttribute('aria-required', 'true');
      expect(screen.getByRole('button', { name: 'Submit Homework' })).toBeInTheDocument();
    });
  });
});
```

**Folder**: `__tests__/accessibility/`  
**Focus**: WCAG 2.1 AA, keyboard navigation, ARIA labels  
**Coverage Target**: All interactive components

### 5. Integration Tests (Priority 2)
**Pattern**: API endpoints, database operations, service communication

```typescript
// Example Pattern: API Endpoint Testing
describe('API Integration Tests', () => {
  describe('POST /api/homework/complete', () => {
    it('should create homework completion and update streak', async () => {
      const student = await createTestStudent();
      const token = generateTestToken({ studentId: student.id, schoolId: student.schoolId });
      
      const response = await request(app)
        .post('/api/homework/complete')
        .set('Authorization', `Bearer ${token}`)
        .send({
          subject: 'Mathematics',
          completedAt: '2025-01-20T10:00:00Z'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.streak.currentStreak).toBe(1);
      
      const updatedStudent = await studentService.getStudent(student.id);
      expect(updatedStudent.totalHomeworkCompleted).toBe(1);
    });
  });
});
```

**Folder**: `__tests__/integration/`  
**Focus**: API endpoints, database operations, service interactions  
**Coverage Target**: All critical user flows

### 6. Component Tests (Priority 2)
**Pattern**: React component testing with user interactions

```typescript
// Example Pattern: Student Dashboard Component
describe('StudentDashboard', () => {
  it('should display current streak and motivational message', async () => {
    const student = mockStudent({ currentStreak: 5 });
    
    render(<StudentDashboard student={student} />);
    
    expect(screen.getByText('5 day streak!')).toBeInTheDocument();
    expect(screen.getByText(/keep it up/i)).toBeInTheDocument();
  });

  it('should handle homework completion interaction', async () => {
    const onComplete = jest.fn();
    render(<StudentDashboard onHomeworkComplete={onComplete} />);
    
    await user.click(screen.getByRole('button', { name: 'Mark Math Complete' }));
    
    expect(onComplete).toHaveBeenCalledWith({
      subject: 'Mathematics',
      completedAt: expect.any(String)
    });
  });
});
```

**Folder**: `__tests__/components/`  
**Focus**: User interactions, state management, accessibility  
**Coverage Target**: All interactive components

### 7. E2E Tests (Priority 3)
**Pattern**: Complete user journeys across the application

```typescript
// Example Pattern: Student Homework Journey
describe('Student Homework Journey', () => {
  test('student can complete homework and see streak update', async ({ page }) => {
    // Login as student
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'student@testschool.ac.uk');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');

    // Navigate to homework
    await page.click('[data-testid="homework-tab"]');
    
    // Complete homework
    await page.click('[data-testid="complete-math-homework"]');
    await page.click('[data-testid="confirm-completion"]');

    // Verify streak updated
    await expect(page.locator('[data-testid="current-streak"]')).toContainText('1');
    
    // Check celebration animation appears
    await expect(page.locator('[data-testid="celebration-confetti"]')).toBeVisible();
  });
});
```

**Folder**: `__tests__/e2e/`  
**Focus**: Complete user flows, cross-browser compatibility  
**Coverage Target**: Critical user journeys only

### 8. Performance Tests (Priority 3)
**Pattern**: Load testing for educational peak usage

```typescript
// Example Pattern: Educational Peak Load Testing
describe('Performance Tests', () => {
  test('should handle after-school homework submission rush', async () => {
    const concurrent = 100; // Students submitting homework 4-6 PM
    
    const submissions = Array(concurrent).fill(null).map(() =>
      request(app)
        .post('/api/homework/complete')
        .set('Authorization', generateTestToken())
        .send({ subject: 'Mathematics', completedAt: new Date().toISOString() })
    );

    const startTime = Date.now();
    const responses = await Promise.all(submissions);
    const endTime = Date.now();

    expect(responses.every(r => r.status === 201)).toBe(true);
    expect(endTime - startTime).toBeLessThan(5000); // Under 5 seconds
  });
});
```

**Folder**: `__tests__/performance/`  
**Focus**: Concurrent users, database performance, memory usage  
**Coverage Target**: Critical endpoints under load

---

## Test Data Management

### Test Data Factory Pattern
```typescript
// tools/testing/helpers/factories.ts
export const createTestSchool = (overrides = {}) => ({
  id: `school-${Date.now()}`,
  name: 'Test Primary School',
  type: 'primary',
  location: 'London',
  yearGroups: [1, 2, 3, 4, 5, 6],
  ...overrides
});

export const createTestStudent = (overrides = {}) => ({
  id: `student-${Date.now()}`,
  name: 'Test Student',
  email: `test${Date.now()}@school.ac.uk`,
  yearGroup: 5,
  schoolId: 'default-school',
  currentStreak: 0,
  longestStreak: 0,
  ...overrides
});

export const createTestHomeworkCompletion = (overrides = {}) => ({
  id: `homework-${Date.now()}`,
  subject: 'Mathematics',
  completedAt: new Date(),
  studentId: 'default-student',
  ...overrides
});
```

### UK-Specific Test Data
```typescript
// tools/testing/fixtures/uk-data.ts
export const ukSchoolData = {
  primary: {
    yearGroups: [1, 2, 3, 4, 5, 6],
    subjects: ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Art', 'PE'],
    termDates: {
      autumn: { start: '2025-09-01', end: '2025-12-20' },
      spring: { start: '2025-01-06', end: '2025-03-28' },
      summer: { start: '2025-04-14', end: '2025-07-18' }
    }
  },
  secondary: {
    yearGroups: [7, 8, 9, 10, 11],
    subjects: ['Mathematics', 'English Language', 'English Literature', 'Science', 'History', 'Geography', 'Modern Languages', 'Art', 'Music', 'PE', 'Computing'],
    keyStages: { ks3: [7, 8, 9], ks4: [10, 11] }
  },
  holidays: [
    { name: 'Christmas Break', start: '2025-12-21', end: '2026-01-05' },
    { name: 'Easter Break', start: '2025-03-29', end: '2025-04-13' },
    { name: 'Summer Holiday', start: '2025-07-19', end: '2025-08-31' }
  ]
};
```

---

## Compliance Testing Patterns

### UK GDPR Compliance Tests
```typescript
// Example Pattern: Data Subject Rights
describe('GDPR Data Subject Rights', () => {
  describe('Right to Erasure (Article 17)', () => {
    it('should delete all personal data when requested', async () => {
      const student = await createTestStudent();
      await createExtensiveStudentData(student.id);
      
      await gdprService.processErasureRequest(student.id);
      
      const dataAudit = await auditService.findAllStudentData(student.id);
      expect(dataAudit.personalData).toEqual([]);
      expect(dataAudit.statisticalData).toBeGreaterThan(0); // Anonymous stats preserved
    });
  });

  describe('Data Minimisation (Article 5)', () => {
    it('should not collect excessive student data', () => {
      const studentSchema = getStudentDataSchema();
      
      const requiredFields = ['name', 'yearGroup', 'schoolId'];
      const actualFields = Object.keys(studentSchema);
      
      expect(actualFields).toEqual(expect.arrayContaining(requiredFields));
      expect(actualFields).not.toContain('parentIncome'); // Excessive data
      expect(actualFields).not.toContain('homeAddress'); // Not needed for MVP
    });
  });
});
```

### ICO Children's Code Compliance
```typescript
// Example Pattern: Children's Data Protection
describe('ICO Children\'s Code Compliance', () => {
  describe('Standard 4: Transparent Privacy Information', () => {
    it('should provide age-appropriate privacy notices', async () => {
      const privacyNotice = await getPrivacyNoticeForAge(12);
      
      expect(privacyNotice.readingLevel).toBeLessThanOrEqual(8); // Age-appropriate
      expect(privacyNotice.wordCount).toBeLessThan(500); // Concise
      expect(privacyNotice).toContain('simple explanation'); // Child-friendly
    });
  });

  describe('Standard 8: Data Minimisation', () => {
    it('should only process data necessary for homework tracking', async () => {
      const dataProcessing = await auditChildDataProcessing(testChildStudent.id);
      
      expect(dataProcessing.purposes).toEqual(['homework_tracking', 'streak_motivation']);
      expect(dataProcessing.purposes).not.toContain('profiling');
      expect(dataProcessing.purposes).not.toContain('targeted_advertising');
    });
  });

  describe('Standard 15: Online Tools and Information Standards', () => {
    it('should provide child-appropriate tools and information', () => {
      const { container } = render(<StudentDashboard age={10} />);
      
      expect(screen.getByText(/well done/i)).toBeInTheDocument(); // Positive language
      expect(screen.queryByText(/failure/i)).not.toBeInTheDocument(); // Avoid negative language
      expect(container.querySelector('[data-testid="age-appropriate-content"]')).toBeInTheDocument();
    });
  });
});
```

### WCAG 2.1 AA Accessibility Patterns
```typescript
// Example Pattern: Comprehensive Accessibility Testing
describe('WCAG 2.1 AA Compliance', () => {
  describe('Perceivable (Principle 1)', () => {
    it('should have sufficient colour contrast', async () => {
      render(<StudentDashboard />);
      
      const streakCounter = screen.getByTestId('streak-counter');
      const contrast = await getColourContrast(streakCounter);
      
      expect(contrast.ratio).toBeGreaterThan(4.5); // AA standard
    });

    it('should provide text alternatives for images', () => {
      render(<AchievementBadge achievement="5_day_streak" />);
      
      const badge = screen.getByRole('img');
      expect(badge).toHaveAttribute('alt', 'Five day streak achievement badge');
    });
  });

  describe('Operable (Principle 2)', () => {
    it('should be fully keyboard navigable', async () => {
      render(<HomeworkForm />);
      
      await user.tab();
      expect(screen.getByLabelText('Subject')).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(screen.getByRole('listbox')).toBeVisible();
    });

    it('should not cause seizures', async () => {
      render(<CelebrationAnimation />);
      
      const animations = screen.getAllByTestId('animated-element');
      animations.forEach(element => {
        expect(element).toHaveStyle('animation-duration: 0.5s'); // Slow enough
        expect(element).not.toHaveClass('flash-animation'); // No flashing
      });
    });
  });

  describe('Understandable (Principle 3)', () => {
    it('should provide clear form labels and instructions', () => {
      render(<HomeworkSubmissionForm />);
      
      expect(screen.getByLabelText('Subject (required)')).toBeInTheDocument();
      expect(screen.getByText('Select the subject you completed homework for')).toBeInTheDocument();
    });

    it('should handle form errors accessibly', async () => {
      render(<HomeworkSubmissionForm />);
      
      await user.click(screen.getByRole('button', { name: 'Submit' }));
      
      expect(screen.getByRole('alert')).toHaveTextContent('Subject is required');
      expect(screen.getByLabelText('Subject (required)')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Robust (Principle 4)', () => {
    it('should work with assistive technologies', () => {
      render(<LeaderboardTable />);
      
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Class leaderboard');
      
      const headers = screen.getAllByRole('columnheader');
      expect(headers[0]).toHaveTextContent('Rank');
      expect(headers[1]).toHaveTextContent('Student');
      expect(headers[2]).toHaveTextContent('Streak');
    });
  });
});
```

---

## Testing Environment Setup

### Docker Test Environment
```yaml
# docker-compose.test.yml
version: '3.8'
services:
  test-db:
    image: postgres:15
    environment:
      POSTGRES_DB: study_streaks_test
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
    ports:
      - "5433:5432"
    volumes:
      - test_db_data:/var/lib/postgresql/data

  test-redis:
    image: redis:7-alpine
    ports:
      - "6380:6379"
    command: redis-server --save ""

volumes:
  test_db_data:
```

### Test Setup Scripts
```bash
#!/bin/bash
# scripts/test-setup.sh

echo "Setting up Study Streaks test environment..."

# Start test services
docker-compose -f docker-compose.test.yml up -d

# Wait for services
echo "Waiting for test database..."
sleep 5

# Setup test database
cd packages/database
npx prisma migrate deploy --schema=./prisma/schema.prisma
npx prisma db seed --schema=./prisma/schema.prisma

# Install dependencies
cd ../..
npm install

# Run database migrations for test
npx prisma generate

echo "Test environment ready!"
echo "Run: npm run test:critical"
```

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: study_streaks_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Setup test database
        run: |
          npx prisma migrate deploy
          npx prisma db seed
        env:
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/study_streaks_test
          
      - name: Run critical tests
        run: npm run test:critical
        
      - name: Run compliance tests
        run: npm run test:compliance
        
      - name: Run accessibility tests
        run: npm run test:accessibility
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Testing Priorities for MVP

### Phase 1: Critical Tests (Week 1-2)
**Must Have - Platform Safety**
- [ ] Multi-tenant data isolation
- [ ] GDPR data deletion functions
- [ ] Basic authentication/authorization
- [ ] Core streak calculation logic
- [ ] Database security (row-level security)

### Phase 2: Important Tests (Week 3-4)
**Should Have - Platform Reliability**
- [ ] API endpoint integration tests
- [ ] React component tests for key UI
- [ ] WCAG 2.1 AA accessibility tests
- [ ] ICO Children's Code compliance
- [ ] Input validation and sanitisation

### Phase 3: Beneficial Tests (Week 5-6)
**Could Have - Enhanced Quality**
- [ ] E2E user journey tests
- [ ] Performance testing (basic load)
- [ ] Advanced security testing
- [ ] Cross-browser compatibility

### Phase 4: Optional Tests (Future)
**Nice to Have - Comprehensive Coverage**
- [ ] Stress testing
- [ ] Advanced performance monitoring
- [ ] Comprehensive E2E scenarios
- [ ] Mobile responsiveness testing

---

## Cursor AI Development Patterns

### Test-First Development with AI
```typescript
// Pattern: Describe test, then ask for implementation
describe('StreakCalculationService', () => {
  it('should calculate consecutive day streaks correctly', () => {
    // TODO: Ask Cursor to implement calculateStreak function
    // Prompt: "Implement calculateStreak function that handles this test"
    expect(calculateStreak(testData)).toEqual(expectedResult);
  });
});
```

### AI Testing Prompts
**For Unit Tests:**
> "Write Jest unit tests for the streak calculation function that handles consecutive days, missed days, weekends, and UK school holidays"

**For Security Tests:**
> "Create tests to verify multi-tenant data isolation for the student service - ensure School A cannot access School B's student data"

**For Compliance Tests:**
> "Write GDPR compliance tests that verify complete student data deletion and audit trail logging"

**For Accessibility Tests:**
> "Generate WCAG 2.1 AA accessibility tests for the homework submission form including keyboard navigation and screen reader support"

### AI Code Review Patterns
```typescript
// Pattern: Include test validation in code reviews
// Prompt for Cursor: "Review this function and suggest additional test cases"
function calculateStreak(completions: HomeworkCompletion[]): StreakResult {
  // Implementation here
}

// Expected AI response: Suggest edge cases, security considerations, accessibility concerns
```

---

## Conclusion

This testing strategy provides **achievable, prioritised testing patterns** for a solo developer + Cursor AI building Study Streaks. 

**Key Principles:**
- **Security First**: Multi-tenancy and data protection are non-negotiable
- **Compliance Focus**: UK GDPR and accessibility requirements built-in
- **Practical Approach**: Essential tests now, comprehensive testing later
- **AI-Friendly**: Clear patterns and prompts for Cursor AI assistance

**Success Metrics:**
- **Platform Security**: 100% critical security test coverage
- **Legal Compliance**: All GDPR and ICO requirements tested
- **User Experience**: WCAG 2.1 AA compliance for all interactive components
- **Development Velocity**: Tests enable confident, rapid development with AI assistance

---

## Advanced Testing Patterns

### Multi-Tenant Testing Utilities
```typescript
// tools/testing/helpers/multi-tenant.ts
export class MultiTenantTestHelper {
  async createIsolatedSchools(count: number = 2) {
    const schools = [];
    for (let i = 0; i < count; i++) {
      const school = await createTestSchool({
        id: `school-${i}`,
        name: `Test School ${i}`,
        tenantId: `tenant-${i}`
      });
      schools.push(school);
    }
    return schools;
  }

  async seedCrossSchoolData(schools: School[]) {
    const seedPromises = schools.map(async (school, index) => {
      await createTestStudents({
        count: 5,
        schoolId: school.id,
        namePrefix: `Student${index}`
      });
      
      await createTestHomework({
        count: 10,
        schoolId: school.id
      });
    });
    
    await Promise.all(seedPromises);
  }

  async verifyCrossSchoolIsolation(schoolA: School, schoolB: School) {
    // Test that School A context cannot access School B data
    const contextA = { tenantId: schoolA.id };
    const contextB = { tenantId: schoolB.id };
    
    const schoolBStudents = await studentService.getStudents(contextA);
    const schoolBData = schoolBStudents.filter(s => s.schoolId === schoolB.id);
    
    expect(schoolBData).toHaveLength(0);
  }
}
```

### GDPR Testing Utilities
```typescript
// tools/testing/helpers/gdpr.ts
export class GDPRTestHelper {
  async createStudentWithFullDataProfile(overrides = {}) {
    const student = await createTestStudent(overrides);
    
    // Create comprehensive data profile
    await Promise.all([
      this.createStreakData(student.id, 30),
      this.createHomeworkData(student.id, 50),
      this.createBuddyRelationships(student.id, 3),
      this.createAchievements(student.id, 8),
      this.createClubMemberships(student.id, 2),
      this.createParentNotifications(student.id, 15)
    ]);
    
    return student;
  }

  async auditStudentDataReferences(studentId: string) {
    const tables = [
      'students', 'streaks', 'homework', 'buddy_relationships',
      'achievements', 'club_memberships', 'notifications', 'audit_logs'
    ];
    
    const results = {};
    
    for (const table of tables) {
      const count = await db.query(
        `SELECT COUNT(*) FROM ${table} WHERE student_id = $1`,
        [studentId]
      );
      results[table] = parseInt(count.rows[0].count);
    }
    
    return results;
  }

  async verifyCompleteDataDeletion(studentId: string) {
    const audit = await this.auditStudentDataReferences(studentId);
    const nonZeroTables = Object.entries(audit)
      .filter(([table, count]) => count > 0)
      .map(([table]) => table);
    
    expect(nonZeroTables).toEqual([]);
  }

  async testDataRetentionPeriods() {
    const retentionPolicies = {
      student_data: '7 years after leaving school',
      homework_records: '2 years',
      streak_data: '1 year after completion',
      audit_logs: '6 years'
    };
    
    return retentionPolicies;
  }
}
```

### Performance Testing Patterns
```typescript
// tools/testing/helpers/performance.ts
export class PerformanceTestHelper {
  async simulateEducationalPeakLoad() {
    // After-school homework submission rush (4-6 PM UK time)
    const peakHourScenarios = [
      { users: 50, duration: '2m', description: 'Small primary school' },
      { users: 200, duration: '5m', description: 'Large secondary school' },
      { users: 500, duration: '10m', description: 'Multi-academy trust' }
    ];
    
    const results = [];
    
    for (const scenario of peakHourScenarios) {
      const result = await this.runLoadTest({
        concurrent: scenario.users,
        duration: scenario.duration,
        endpoints: [
          'POST /api/homework/complete',
          'GET /api/dashboard',
          'GET /api/leaderboard'
        ]
      });
      
      results.push({
        scenario: scenario.description,
        avgResponseTime: result.avgResponseTime,
        errorRate: result.errorRate,
        throughput: result.throughput
      });
    }
    
    return results;
  }

  async testDatabasePerformance() {
    // Test common queries under load
    const testQueries = [
      {
        name: 'Student streak calculation',
        query: () => streakService.calculateStreak(testStudentId),
        expectedTime: 100 // ms
      },
      {
        name: 'Class leaderboard generation',
        query: () => leaderboardService.getClassLeaderboard(testClassId),
        expectedTime: 200 // ms
      },
      {
        name: 'School-wide analytics',
        query: () => analyticsService.getSchoolSummary(testSchoolId),
        expectedTime: 500 // ms
      }
    ];
    
    const results = [];
    
    for (const test of testQueries) {
      const startTime = Date.now();
      await test.query();
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      
      results.push({
        query: test.name,
        duration,
        withinExpected: duration <= test.expectedTime
      });
    }
    
    return results;
  }

  async testMemoryUsage() {
    const initialMemory = process.memoryUsage();
    
    // Simulate processing large dataset
    await this.processLargeDataset();
    
    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    
    // Should not increase memory by more than 50MB for typical operations
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    
    return {
      initial: initialMemory,
      final: finalMemory,
      increase: memoryIncrease
    };
  }
}
```

### Accessibility Testing Utilities
```typescript
// tools/testing/helpers/accessibility.ts
export class AccessibilityTestHelper {
  async testKeyboardNavigation(component: ReactWrapper) {
    const focusableElements = component.find('[tabindex], button, input, select, textarea, a[href]');
    
    for (let i = 0; i < focusableElements.length; i++) {
      await user.tab();
      const focused = document.activeElement;
      expect(focusableElements.at(i).getDOMNode()).toBe(focused);
    }
  }

  async testScreenReaderCompatibility(component: ReactWrapper) {
    const ariaLabels = component.find('[aria-label]');
    const ariaDescriptions = component.find('[aria-describedby]');
    const headings = component.find('h1, h2, h3, h4, h5, h6');
    
    // Verify all interactive elements have labels
    ariaLabels.forEach(element => {
      expect(element.prop('aria-label')).toBeTruthy();
    });
    
    // Verify heading hierarchy
    const headingLevels = headings.map(h => parseInt(h.name().charAt(1)));
    const isValidHierarchy = this.validateHeadingHierarchy(headingLevels);
    expect(isValidHierarchy).toBe(true);
  }

  async testColourContrast(component: ReactWrapper) {
    const textElements = component.find('span, p, h1, h2, h3, h4, h5, h6, button, a');
    
    for (const element of textElements) {
      const styles = window.getComputedStyle(element.getDOMNode());
      const bgColor = styles.backgroundColor;
      const textColor = styles.color;
      
      const contrast = this.calculateContrastRatio(bgColor, textColor);
      expect(contrast).toBeGreaterThanOrEqual(4.5); // WCAG AA standard
    }
  }

  validateHeadingHierarchy(levels: number[]): boolean {
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i-1] + 1) {
        return false; // Skipped heading level
      }
    }
    return true;
  }

  calculateContrastRatio(bg: string, text: string): number {
    // Implementation of WCAG contrast ratio calculation
    // This is a simplified version - use a proper library in real implementation
    return 4.6; // Placeholder
  }
}
```

### Mock Service Worker (MSW) Setup
```typescript
// tools/testing/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // Student authentication
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body as any;
    
    if (email === 'student@testschool.ac.uk' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          user: {
            id: 'student-1',
            email,
            role: 'STUDENT',
            schoolId: 'school-1'
          },
          token: 'mock-jwt-token'
        })
      );
    }
    
    return res(ctx.status(401), ctx.json({ error: 'Invalid credentials' }));
  }),

  // Homework completion
  rest.post('/api/homework/complete', (req, res, ctx) => {
    const { subject, completedAt } = req.body as any;
    
    return res(
      ctx.status(201),
      ctx.json({
        id: 'homework-1',
        subject,
        completedAt,
        streak: {
          currentStreak: 1,
          longestStreak: 5
        }
      })
    );
  }),

  // Leaderboard data
  rest.get('/api/leaderboard/:schoolId', (req, res, ctx) => {
    const { schoolId } = req.params;
    
    return res(
      ctx.status(200),
      ctx.json({
        leaderboard: [
          { rank: 1, studentName: 'Alice', currentStreak: 10 },
          { rank: 2, studentName: 'Bob', currentStreak: 8 },
          { rank: 3, studentName: 'Charlie', currentStreak: 6 }
        ],
        schoolId
      })
    );
  }),

  // Error simulation for testing
  rest.get('/api/error-simulation', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'Internal server error' }));
  })
];

// tools/testing/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Database Testing Utilities
```typescript
// tools/testing/helpers/database.ts
export class DatabaseTestHelper {
  private testSchema: string;

  constructor() {
    this.testSchema = `test_${Date.now()}`;
  }

  async setupTestDatabase() {
    // Create isolated test schema
    await db.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${this.testSchema}"`);
    
    // Set search path to test schema
    await db.$executeRawUnsafe(`SET search_path TO "${this.testSchema}"`);
    
    // Run migrations in test schema
    await this.runMigrations();
  }

  async runMigrations() {
    // Apply database migrations to test schema
    const migrationFiles = await this.getMigrationFiles();
    
    for (const migration of migrationFiles) {
      await db.$executeRawUnsafe(migration.sql);
    }
  }

  async seedTestData(scenario: string) {
    const seedData = await this.getSeedData(scenario);
    
    switch (scenario) {
      case 'multi-tenant':
        await this.seedMultiTenantData();
        break;
      case 'performance':
        await this.seedPerformanceData();
        break;
      case 'gdpr':
        await this.seedGDPRTestData();
        break;
      default:
        await this.seedBasicData();
    }
  }

  async seedMultiTenantData() {
    const schools = await this.createTestSchools(3);
    
    for (const school of schools) {
      await this.createTestStudents({ schoolId: school.id, count: 10 });
      await this.createTestHomework({ schoolId: school.id, count: 50 });
      await this.createTestStreaks({ schoolId: school.id, count: 20 });
    }
  }

  async cleanupTestDatabase() {
    // Drop test schema and all data
    await db.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${this.testSchema}" CASCADE`);
  }

  async verifyRowLevelSecurity() {
    // Test that RLS policies are working correctly
    const testCases = [
      {
        context: { schoolId: 'school-1' },
        expectedTables: ['students', 'homework', 'streaks'],
        forbiddenSchoolIds: ['school-2', 'school-3']
      }
    ];

    for (const testCase of testCases) {
      for (const table of testCase.expectedTables) {
        const results = await db.$queryRawUnsafe(
          `SELECT * FROM ${table} WHERE school_id = $1`,
          [testCase.context.schoolId]
        );
        
        // Verify only correct school data returned
        results.forEach(row => {
          expect(row.school_id).toBe(testCase.context.schoolId);
          expect(testCase.forbiddenSchoolIds).not.toContain(row.school_id);
        });
      }
    }
  }
}
```

### Continuous Integration Extensions
```yaml
# .github/workflows/comprehensive-test.yml
name: Comprehensive Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run security audit
        run: npm audit --audit-level=moderate
      
      - name: Run security tests
        run: npm run test:security
      
      - name: Check for known vulnerabilities
        run: npx audit-ci --config audit-ci.json

  compliance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Run GDPR compliance tests
        run: npm run test:gdpr
      
      - name: Run ICO Children's Code tests
        run: npm run test:ico-childrens-code
      
      - name: Generate compliance report
        run: npm run compliance:report

  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install Playwright
        run: npx playwright install
      
      - name: Run accessibility tests
        run: npm run test:accessibility
      
      - name: Upload accessibility report
        uses: actions/upload-artifact@v3
        with:
          name: accessibility-report
          path: accessibility-report.html

  performance-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Run performance tests
        run: npm run test:performance
      
      - name: Upload performance report
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: performance-report.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Start application
        run: |
          npm run build
          npm run start &
          npx wait-on http://localhost:3000
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload E2E test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: e2e-test-results
          path: test-results/
```

### Test Reporting and Metrics
```typescript
// tools/testing/reporting/test-reporter.ts
export class TestReporter {
  generateComplianceReport() {
    return {
      gdpr: {
        dataSubjectRights: this.testGDPRRights(),
        dataMinimisation: this.testDataMinimisation(),
        lawfulBasis: this.testLawfulBasis(),
        retentionPeriods: this.testRetentionPeriods()
      },
      ico: {
        transparentPrivacy: this.testTransparentPrivacy(),
        dataMinimisation: this.testICODataMinimisation(),
        parentalConsent: this.testParentalConsent(),
        profiling: this.testProfiling()
      },
      accessibility: {
        wcag21AA: this.testWCAG21AA(),
        keyboardNavigation: this.testKeyboardNavigation(),
        screenReader: this.testScreenReader(),
        colourContrast: this.testColourContrast()
      }
    };
  }

  generatePerformanceReport() {
    return {
      loadTesting: {
        peakHours: this.testPeakHours(),
        concurrentUsers: this.testConcurrentUsers(),
        responseTime: this.testResponseTime()
      },
      databasePerformance: {
        queryOptimisation: this.testQueryPerformance(),
        indexUsage: this.testIndexUsage(),
        connectionPooling: this.testConnectionPooling()
      },
      memoryUsage: {
        heapSize: this.testHeapSize(),
        garbageCollection: this.testGarbageCollection(),
        memoryLeaks: this.testMemoryLeaks()
      }
    };
  }

  generateSecurityReport() {
    return {
      authentication: {
        jwtSecurity: this.testJWTSecurity(),
        sessionManagement: this.testSessionManagement(),
        passwordSecurity: this.testPasswordSecurity()
      },
      authorization: {
        roleBasedAccess: this.testRoleBasedAccess(),
        resourceProtection: this.testResourceProtection(),
        multiTenancy: this.testMultiTenancy()
      },
      dataProtection: {
        inputValidation: this.testInputValidation(),
        sqlInjection: this.testSQLInjection(),
        xssProtection: this.testXSSProtection()
      }
    };
  }
}
```

This comprehensive testing strategy provides Study Streaks with:

1. **Clear testing structure** organised by priority and test type
2. **Practical patterns** that work with Cursor AI assistance  
3. **Compliance-first approach** covering UK GDPR and ICO requirements
4. **Accessibility testing** built into the development process
5. **Performance testing** appropriate for educational platforms
6. **Security testing** focusing on multi-tenant data protection
7. **Automated CI/CD integration** for continuous quality assurance

The strategy balances **thoroughness with achievability** for a solo developer + AI pair, ensuring the platform meets all legal requirements while maintaining development velocity.