# Testing Guide

## Overview

StudyStreaks follows a comprehensive testing strategy to ensure code quality, security, and compliance with UK educational data protection requirements. Our testing approach includes unit tests, integration tests, end-to-end tests, and specialized security/compliance testing.

## Testing Philosophy

### Core Principles

1. **Test Pyramid**: More unit tests, fewer integration tests, minimal E2E tests
2. **Security First**: All tests validate security and privacy requirements
3. **GDPR Compliance**: Tests ensure data protection and consent mechanisms
4. **Multi-Tenant Safe**: All tests verify tenant isolation
5. **Child Safety**: Tests validate age-appropriate functionality

### Testing Strategy

```mermaid
graph TB
    subgraph "E2E Tests (Few)"
        E2E[End-to-End Tests<br/>Playwright]
        VISUAL[Visual Regression<br/>Percy/Chromatic]
    end

    subgraph "Integration Tests (Some)"
        API[API Integration<br/>Jest + Supertest]
        DB[Database Tests<br/>Prisma + Test DB]
        AUTH[Authentication Flow<br/>NextAuth Testing]
    end

    subgraph "Unit Tests (Many)"
        COMP[Component Tests<br/>React Testing Library]
        UTIL[Utility Functions<br/>Jest]
        LOGIC[Business Logic<br/>Pure Functions]
    end

    subgraph "Specialized Tests"
        SEC[Security Tests<br/>OWASP Checks]
        GDPR[GDPR Compliance<br/>Data Protection]
        PERF[Performance Tests<br/>Load Testing]
    end

    E2E --> API
    API --> COMP
    COMP --> UTIL
    SEC --> ALL[All Layers]
    GDPR --> ALL
    PERF --> ALL
```

## Testing Technology Stack

### Testing Frameworks

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **Jest** | Unit & Integration testing | `jest.config.ts` |
| **React Testing Library** | Component testing | Built into Jest |
| **Playwright** | End-to-end testing | `playwright.config.ts` |
| **MSW** | API mocking | Mock Service Worker |
| **Prisma Test Environment** | Database testing | Isolated test DB |

### Additional Tools

- **jest-axe**: Accessibility testing
- **@testing-library/jest-dom**: DOM assertions
- **supertest**: HTTP API testing
- **@faker-js/faker**: Test data generation
- **dotenv**: Test environment management

## Test Configuration

### Jest Configuration

```typescript
// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  
  // Test patterns
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/**/*.{test,spec}.{ts,tsx}'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Module mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@study-streaks/(.*)$': '<rootDir>/packages/$1/src'
  },
  
  // Coverage settings
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'packages/*/src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts'
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Test environment
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
};

export default config;
```

### Jest Setup File

```typescript
// jest.setup.ts
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        schoolId: 'test-school-id',
        roles: ['teacher']
      }
    },
    status: 'authenticated'
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock environment variables
process.env = {
  ...process.env,
  NEXTAUTH_SECRET: 'test-secret',
  DATABASE_URL: 'postgresql://test:test@localhost:5433/test_db',
  REDIS_URL: 'redis://localhost:6380',
};

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Unit Testing

### Component Testing

```typescript
// src/components/__tests__/StudentCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { StudentCard } from '../StudentCard';
import type { Student } from '@study-streaks/database';

// Mock data factory
const createMockStudent = (overrides?: Partial<Student>): Student => ({
  id: 'student-1',
  schoolId: 'school-1',
  firstName: 'John',
  lastName: 'Doe',
  yearGroup: 3,
  classId: 'class-1',
  dateOfBirth: new Date('2015-06-15'),
  ...overrides,
});

describe('StudentCard', () => {
  const mockStudent = createMockStudent();
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders student information correctly', () => {
    render(
      <StudentCard
        student={{
          ...mockStudent,
          class: { name: 'Class 3A' },
          _count: { homeworkCompletions: 5 }
        }}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Year 3')).toBeInTheDocument();
    expect(screen.getByText('Class: Class 3A')).toBeInTheDocument();
    expect(screen.getByText('Homework completed: 5')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    render(
      <StudentCard
        student={{
          ...mockStudent,
          class: { name: 'Class 3A' },
          _count: { homeworkCompletions: 5 }
        }}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockStudent);
  });

  it('is accessible', async () => {
    const { container } = render(
      <StudentCard
        student={{
          ...mockStudent,
          class: { name: 'Class 3A' },
          _count: { homeworkCompletions: 5 }
        }}
        onSelect={mockOnSelect}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Utility Function Testing

```typescript
// packages/utils/src/__tests__/validation.test.ts
import { validateUKPostcode, validateYearGroup, sanitizeInput } from '../validation';

describe('validation utilities', () => {
  describe('validateUKPostcode', () => {
    it('accepts valid UK postcodes', () => {
      const validPostcodes = [
        'SW1A 1AA',
        'M1 1AA',
        'B33 8TH',
        'W1A 0AX',
        'EC1A 1BB'
      ];

      validPostcodes.forEach(postcode => {
        expect(validateUKPostcode(postcode)).toBe(true);
      });
    });

    it('rejects invalid postcodes', () => {
      const invalidPostcodes = [
        '12345',
        'INVALID',
        'SW1A1AA', // Missing space
        'SW1A  1AA', // Double space
        ''
      ];

      invalidPostcodes.forEach(postcode => {
        expect(validateUKPostcode(postcode)).toBe(false);
      });
    });
  });

  describe('validateYearGroup', () => {
    it('accepts valid year groups (0-6)', () => {
      for (let i = 0; i <= 6; i++) {
        expect(validateYearGroup(i)).toBe(true);
      }
    });

    it('rejects invalid year groups', () => {
      [-1, 7, 10, -5].forEach(yearGroup => {
        expect(validateYearGroup(yearGroup)).toBe(false);
      });
    });
  });

  describe('sanitizeInput', () => {
    it('removes potentially dangerous content', () => {
      const dangerous = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeInput(dangerous);
      expect(sanitized).toBe('Hello');
      expect(sanitized).not.toContain('<script>');
    });

    it('preserves safe content', () => {
      const safe = 'Hello, this is safe content!';
      const sanitized = sanitizeInput(safe);
      expect(sanitized).toBe(safe);
    });
  });
});
```

### Business Logic Testing

```typescript
// packages/database/src/__tests__/streak-calculation.test.ts
import { calculateStreak, determineStreakStatus } from '../streak-calculation';
import { addDays, subDays } from 'date-fns';

describe('streak calculation', () => {
  const today = new Date('2024-03-15');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(today);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('calculateStreak', () => {
    it('calculates current streak correctly', () => {
      const completions = [
        { completionDate: today },
        { completionDate: subDays(today, 1) },
        { completionDate: subDays(today, 2) },
        // Gap here
        { completionDate: subDays(today, 5) },
      ];

      const streak = calculateStreak(completions);
      expect(streak.current).toBe(3);
      expect(streak.longest).toBe(3);
    });

    it('handles empty completions', () => {
      const streak = calculateStreak([]);
      expect(streak.current).toBe(0);
      expect(streak.longest).toBe(0);
    });

    it('calculates longest streak correctly', () => {
      const completions = [
        { completionDate: today },
        { completionDate: subDays(today, 1) },
        // Gap
        { completionDate: subDays(today, 10) },
        { completionDate: subDays(today, 11) },
        { completionDate: subDays(today, 12) },
        { completionDate: subDays(today, 13) },
      ];

      const streak = calculateStreak(completions);
      expect(streak.current).toBe(2);
      expect(streak.longest).toBe(4);
    });
  });
});
```

## Integration Testing

### API Route Testing

```typescript
// src/app/api/students/__tests__/route.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '../route';
import { getServerSession } from 'next-auth';
import { getTenantClient } from '@study-streaks/database';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@study-streaks/database');

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const mockGetTenantClient = getTenantClient as jest.MockedFunction<
  typeof getTenantClient
>;

describe('/api/students', () => {
  const mockSession = {
    user: {
      id: 'user-1',
      email: 'teacher@school.com',
      schoolId: 'school-1',
      roles: ['teacher']
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession);
  });

  describe('GET /api/students', () => {
    it('returns students for authenticated teacher', async () => {
      const mockStudents = [
        {
          id: 'student-1',
          firstName: 'John',
          lastName: 'Doe',
          yearGroup: 3,
          class: { name: 'Class 3A' }
        }
      ];

      const mockClient = {
        student: {
          findMany: jest.fn().mockResolvedValue(mockStudents)
        }
      };
      mockGetTenantClient.mockReturnValue(mockClient as any);

      const request = new Request('http://localhost:3000/api/students');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.students).toEqual(mockStudents);
      expect(mockClient.student.findMany).toHaveBeenCalledWith({
        include: { class: true, parentStudents: { include: { parent: true } } }
      });
    });

    it('returns 401 for unauthenticated requests', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/students');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('filters students by query parameters', async () => {
      const mockClient = {
        student: {
          findMany: jest.fn().mockResolvedValue([])
        }
      };
      mockGetTenantClient.mockReturnValue(mockClient as any);

      const request = new Request(
        'http://localhost:3000/api/students?yearGroup=3&classId=class-1'
      );
      const response = await GET(request);

      expect(mockClient.student.findMany).toHaveBeenCalledWith({
        where: {
          yearGroup: 3,
          classId: 'class-1'
        },
        include: { class: true, parentStudents: { include: { parent: true } } }
      });
    });
  });

  describe('POST /api/students', () => {
    it('creates student with valid data', async () => {
      const studentData = {
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '2015-03-15T00:00:00.000Z',
        yearGroup: 3,
        classId: 'class-1',
        parentConsent: {
          consentGiven: true,
          parentId: 'parent-1',
          consentDate: '2024-03-15T00:00:00.000Z'
        }
      };

      const mockCreatedStudent = { id: 'student-2', ...studentData };
      const mockClient = {
        student: {
          create: jest.fn().mockResolvedValue(mockCreatedStudent)
        }
      };
      mockGetTenantClient.mockReturnValue(mockClient as any);

      const request = new Request('http://localhost:3000/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.student).toEqual(mockCreatedStudent);
    });

    it('validates GDPR consent requirements', async () => {
      const studentData = {
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '2015-03-15T00:00:00.000Z',
        yearGroup: 3,
        classId: 'class-1',
        parentConsent: {
          consentGiven: false, // Invalid - consent required
          parentId: 'parent-1',
          consentDate: '2024-03-15T00:00:00.000Z'
        }
      };

      const request = new Request('http://localhost:3000/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('CONSENT_REQUIRED');
    });
  });
});
```

### Database Testing

```typescript
// packages/database/src/__tests__/integration/tenant-isolation.test.ts
import { PrismaClient } from '../generated';
import { getTenantClient } from '../client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL
    }
  }
});

describe('tenant isolation', () => {
  const school1Id = 'school-1';
  const school2Id = 'school-2';

  beforeEach(async () => {
    // Setup test data
    await prisma.school.createMany({
      data: [
        { id: school1Id, name: 'School 1', email: 'admin@school1.com' },
        { id: school2Id, name: 'School 2', email: 'admin@school2.com' }
      ]
    });

    await prisma.user.createMany({
      data: [
        { id: 'user-1', schoolId: school1Id, email: 'user1@school1.com' },
        { id: 'user-2', schoolId: school2Id, email: 'user2@school2.com' }
      ]
    });
  });

  afterEach(async () => {
    // Cleanup
    await prisma.user.deleteMany();
    await prisma.school.deleteMany();
  });

  it('isolates data between tenants', async () => {
    const client1 = getTenantClient(school1Id);
    const client2 = getTenantClient(school2Id);

    const users1 = await client1.user.findMany();
    const users2 = await client2.user.findMany();

    expect(users1).toHaveLength(1);
    expect(users1[0].schoolId).toBe(school1Id);

    expect(users2).toHaveLength(1);
    expect(users2[0].schoolId).toBe(school2Id);
  });

  it('prevents cross-tenant data access', async () => {
    const client1 = getTenantClient(school1Id);

    // Try to access user from different school
    const user = await client1.user.findUnique({
      where: { id: 'user-2' } // This user belongs to school2
    });

    expect(user).toBeNull();
  });
});
```

## End-to-End Testing

### User Journey Testing

```typescript
// e2e/student-homework-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Student Homework Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'student@school1.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard
    await expect(page.locator('[data-testid="student-dashboard"]')).toBeVisible();
  });

  test('complete homework submission flow', async ({ page }) => {
    // Navigate to homework clubs
    await page.click('[data-testid="homework-clubs-nav"]');
    await expect(page.locator('[data-testid="clubs-list"]')).toBeVisible();

    // Select maths club
    await page.click('[data-testid="club-maths"]');
    await expect(page.locator('h1')).toContainText('Maths Club');

    // Submit homework
    await page.click('[data-testid="submit-homework"]');
    
    // Upload evidence
    const fileInput = page.locator('[data-testid="evidence-upload"]');
    await fileInput.setInputFiles('./test-files/homework-photo.jpg');
    
    // Add notes
    await page.fill('[data-testid="homework-notes"]', 'Completed multiplication worksheet');
    
    // Submit
    await page.click('[data-testid="submit-button"]');
    
    // Check success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Homework submitted successfully!'
    );
    
    // Check streak update
    await expect(page.locator('[data-testid="current-streak"]')).toContainText('2');
  });

  test('displays age-appropriate interface for primary school students', async ({ page }) => {
    // Check for child-friendly elements
    await expect(page.locator('[data-testid="student-avatar"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-stars"]')).toBeVisible();
    await expect(page.locator('[data-testid="buddy-section"]')).toBeVisible();
    
    // Check text is simple and clear
    const headings = page.locator('h1, h2, h3');
    const headingTexts = await headings.allTextContents();
    
    // Ensure no complex terminology
    headingTexts.forEach(text => {
      expect(text).not.toMatch(/administrative|configuration|implementation/i);
    });
  });

  test('enforces GDPR privacy controls', async ({ page }) => {
    // Navigate to profile
    await page.click('[data-testid="profile-menu"]');
    await page.click('[data-testid="my-profile"]');
    
    // Check minimal data display
    await expect(page.locator('[data-testid="student-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="year-group"]')).toBeVisible();
    
    // Ensure sensitive data is not shown
    await expect(page.locator('[data-testid="date-of-birth"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="address"]')).not.toBeVisible();
    
    // Check data usage notice
    await expect(page.locator('[data-testid="privacy-notice"]')).toContainText(
      'We only use your information to help with your homework'
    );
  });
});
```

### Multi-Device Testing

```typescript
// e2e/responsive-design.spec.ts
import { test, expect, devices } from '@playwright/test';

const mobileDevice = devices['iPhone 12'];
const tabletDevice = devices['iPad'];

test.describe('Responsive Design', () => {
  test('adapts to mobile devices', async ({ browser }) => {
    const context = await browser.newContext({
      ...mobileDevice,
    });
    const page = await context.newPage();

    await page.goto('/');
    
    // Check mobile navigation
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="desktop-nav"]')).not.toBeVisible();
    
    // Check touch-friendly buttons
    const buttons = page.locator('button');
    for (const button of await buttons.all()) {
      const boundingBox = await button.boundingBox();
      if (boundingBox) {
        // Minimum touch target size (44x44px)
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('works well on tablets', async ({ browser }) => {
    const context = await browser.newContext({
      ...tabletDevice,
    });
    const page = await context.newPage();

    await page.goto('/dashboard');
    
    // Check tablet layout
    const gridContainer = page.locator('[data-testid="dashboard-grid"]');
    await expect(gridContainer).toHaveCSS('display', 'grid');
    
    // Check that content is properly sized
    const contentWidth = await gridContainer.evaluate(el => el.clientWidth);
    expect(contentWidth).toBeGreaterThan(768); // Tablet minimum width
  });
});
```

## Specialized Testing

### Security Testing

```typescript
// src/__tests__/security/xss-prevention.test.ts
import { render, screen } from '@testing-library/react';
import { sanitizeInput } from '@study-streaks/utils';
import { StudentNotesForm } from '../components/StudentNotesForm';

describe('XSS Prevention', () => {
  it('sanitizes user input to prevent XSS attacks', () => {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(1)">',
      'javascript:alert(1)',
      '<iframe src="javascript:alert(1)"></iframe>',
      '<svg onload="alert(1)">',
    ];

    maliciousInputs.forEach(input => {
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('onload');
    });
  });

  it('prevents XSS in form components', () => {
    const maliciousNote = '<script>alert("xss")</script>Hello';
    
    render(
      <StudentNotesForm 
        initialValue={maliciousNote}
        onSubmit={jest.fn()}
      />
    );

    // Check that script tag is not rendered
    expect(screen.queryByText(/<script>/)).not.toBeInTheDocument();
    // Check that safe content is preserved
    expect(screen.getByDisplayValue(/Hello/)).toBeInTheDocument();
  });
});
```

### GDPR Compliance Testing

```typescript
// src/__tests__/compliance/gdpr-compliance.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConsentManager } from '../components/ConsentManager';
import { DataExportService } from '../services/DataExportService';

describe('GDPR Compliance', () => {
  describe('Consent Management', () => {
    it('requires explicit consent for data processing', async () => {
      const onConsentChange = jest.fn();
      
      render(
        <ConsentManager 
          studentId="student-1"
          onConsentChange={onConsentChange}
        />
      );

      // Check that consent is required
      expect(screen.getByText(/parental consent required/i)).toBeInTheDocument();
      
      // Give consent
      fireEvent.click(screen.getByLabelText(/i give consent/i));
      fireEvent.click(screen.getByText(/submit consent/i));

      await waitFor(() => {
        expect(onConsentChange).toHaveBeenCalledWith({
          consentGiven: true,
          consentDate: expect.any(Date),
          consentGivenBy: expect.any(String)
        });
      });
    });

    it('allows consent withdrawal', async () => {
      const onConsentWithdraw = jest.fn();
      
      render(
        <ConsentManager 
          studentId="student-1"
          hasConsent={true}
          onConsentWithdraw={onConsentWithdraw}
        />
      );

      fireEvent.click(screen.getByText(/withdraw consent/i));
      
      await waitFor(() => {
        expect(onConsentWithdraw).toHaveBeenCalled();
      });
    });
  });

  describe('Data Export (Right to Portability)', () => {
    it('exports student data in structured format', async () => {
      const exportService = new DataExportService();
      const studentData = await exportService.exportStudentData('student-1');

      expect(studentData).toHaveProperty('personalData');
      expect(studentData).toHaveProperty('educationalData');
      expect(studentData).toHaveProperty('exportDate');
      expect(studentData).toHaveProperty('dataFormat', 'JSON');

      // Check data minimization
      expect(studentData.personalData).not.toHaveProperty('dateOfBirth');
      expect(studentData.personalData).not.toHaveProperty('address');
    });

    it('excludes data from other students (privacy protection)', async () => {
      const exportService = new DataExportService();
      const studentData = await exportService.exportStudentData('student-1');

      // Check that no other student data is included
      const homeworkData = studentData.educationalData.homeworkCompletions;
      homeworkData.forEach(completion => {
        expect(completion.studentId).toBe('student-1');
      });
    });
  });

  describe('Data Retention', () => {
    it('automatically deletes data after retention period', async () => {
      const retentionService = new DataRetentionService();
      const expiredStudents = await retentionService.findExpiredStudents();

      // Check that expired students are identified
      expect(expiredStudents).toBeInstanceOf(Array);
      
      // Verify retention period calculation
      expiredStudents.forEach(student => {
        const retentionEnd = new Date(student.dataRetentionUntil);
        expect(retentionEnd).toBeInstanceOf(Date);
        expect(retentionEnd.getTime()).toBeLessThan(Date.now());
      });
    });
  });
});
```

### Performance Testing

```typescript
// src/__tests__/performance/load-testing.test.ts
import { performanceTest } from '../utils/performance-test-utils';

describe('Performance Testing', () => {
  it('handles concurrent user sessions', async () => {
    const concurrentUsers = 50;
    const testDuration = 30000; // 30 seconds

    const results = await performanceTest({
      concurrent: concurrentUsers,
      duration: testDuration,
      endpoint: '/api/students',
      authToken: process.env.TEST_AUTH_TOKEN
    });

    // Check response times
    expect(results.averageResponseTime).toBeLessThan(500); // ms
    expect(results.maxResponseTime).toBeLessThan(2000); // ms
    
    // Check error rate
    expect(results.errorRate).toBeLessThan(0.01); // Less than 1%
    
    // Check throughput
    expect(results.requestsPerSecond).toBeGreaterThan(10);
  });

  it('efficiently handles large datasets', async () => {
    // Test with 1000 students
    const startTime = performance.now();
    
    const response = await fetch('/api/students?limit=1000');
    const data = await response.json();
    
    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(response.status).toBe(200);
    expect(data.students).toHaveLength(1000);
    expect(duration).toBeLessThan(3000); // Less than 3 seconds
  });
});
```

## Test Data Management

### Test Database Setup

```typescript
// tests/setup/database.ts
import { PrismaClient } from '@study-streaks/database';
import { faker } from '@faker-js/faker';

export class TestDatabaseManager {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: { url: process.env.TEST_DATABASE_URL }
      }
    });
  }

  async setupTestSchool() {
    const school = await this.prisma.school.create({
      data: {
        id: 'test-school-1',
        name: 'Test Primary School',
        email: 'admin@testschool.edu.uk',
        address: '123 Test Street',
        postcode: 'TE1 2ST',
        phone: '+44 20 1234 5678',
        schoolType: 'PRIMARY',
        minYearGroup: 0,
        maxYearGroup: 6,
      }
    });

    return school;
  }

  async createTestStudents(schoolId: string, count: number = 10) {
    const students = [];
    
    for (let i = 0; i < count; i++) {
      const student = await this.prisma.student.create({
        data: {
          id: `test-student-${i + 1}`,
          schoolId,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          yearGroup: faker.number.int({ min: 0, max: 6 }),
          dateOfBirth: faker.date.birthdate({ min: 4, max: 11, mode: 'age' }),
          pupilId: `PUPIL${String(i + 1).padStart(3, '0')}`,
          classId: 'test-class-1',
          consentGiven: true,
          consentGivenBy: 'test-parent-1',
          consentDate: new Date(),
          dataRetentionUntil: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000),
        }
      });
      students.push(student);
    }

    return students;
  }

  async cleanup() {
    // Clean up in correct order to respect foreign key constraints
    await this.prisma.homeworkCompletion.deleteMany();
    await this.prisma.student.deleteMany();
    await this.prisma.teacher.deleteMany();
    await this.prisma.parent.deleteMany();
    await this.prisma.user.deleteMany();
    await this.prisma.class.deleteMany();
    await this.prisma.club.deleteMany();
    await this.prisma.school.deleteMany();
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}
```

### Mock Data Factories

```typescript
// tests/factories/student.factory.ts
import { faker } from '@faker-js/faker';
import type { Student } from '@study-streaks/database';

export const createStudentFactory = () => ({
  id: faker.string.uuid(),
  schoolId: 'test-school-1',
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  yearGroup: faker.number.int({ min: 0, max: 6 }),
  dateOfBirth: faker.date.birthdate({ min: 4, max: 11, mode: 'age' }),
  pupilId: faker.string.alphanumeric(8).toUpperCase(),
  classId: 'test-class-1',
  consentGiven: true,
  consentGivenBy: 'test-parent-1',
  consentDate: faker.date.recent(),
  dataRetentionUntil: faker.date.future({ years: 7 }),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
});

export const createStudentWithOverrides = (
  overrides: Partial<Student>
): Student => ({
  ...createStudentFactory(),
  ...overrides,
});
```

## Running Tests

### NPM Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:db": "jest --testMatch='**/__tests__/integration/**/*.test.ts'",
    "test:security": "jest --testMatch='**/__tests__/security/**/*.test.ts'",
    "test:compliance": "jest --testMatch='**/__tests__/compliance/**/*.test.ts'"
  }
}
```

### Continuous Integration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run unit tests
        run: pnpm run test:ci
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
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
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Setup test database
        run: pnpm run db:push
        env:
          TEST_DATABASE_URL: postgresql://postgres:test@localhost:5432/test
      
      - name: Run integration tests
        run: pnpm run test:db

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps
      
      - name: Run E2E tests
        run: pnpm run test:e2e
      
      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

This comprehensive testing guide ensures StudyStreaks maintains high quality, security, and compliance standards while supporting the unique requirements of UK primary education.