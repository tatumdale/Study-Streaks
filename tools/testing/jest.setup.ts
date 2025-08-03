import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';
import { server } from './mocks/server';
import { setupTestEnvironment, cleanupTestEnvironment } from './setup/test-environment';
import { setupTestDatabase, cleanupTestDatabase } from './setup/database-setup';

// Establish API mocking before all tests
beforeAll(async () => {
  server.listen({ onUnhandledRequest: 'error' });
  await setupTestEnvironment();
  await setupTestDatabase();
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  server.resetHandlers();
});

// Clean up after the tests are finished
afterAll(async () => {
  server.close();
  await cleanupTestDatabase();
  await cleanupTestEnvironment();
});

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    };
  },
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}));

// Mock NextAuth config for testing
jest.mock('@study-streaks/auth', () => ({
  authOptions: {
    providers: [],
    callbacks: {
      jwt: jest.fn(),
      session: jest.fn(),
    },
  },
}));

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'test-secret-12345678901234567890123456789012';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5433/study_streaks_test';
process.env.DIRECT_URL = 'postgresql://test:test@localhost:5433/study_streaks_test';

// Mock console methods to reduce noise in tests
const originalConsole = global.console;
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Restore console for debugging when needed
global.restoreConsole = () => {
  global.console = originalConsole;
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock crypto for password hashing tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => '12345678-1234-1234-1234-123456789012',
    randomBytes: (size: number) => Buffer.alloc(size, 0),
    getRandomValues: (arr: any) => arr,
  },
});

// Set up fake timers
jest.useFakeTimers();

// Add custom matchers for StudyStreaks testing
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  
  toHaveValidSchoolIsolation(received: any, expectedSchoolId: string) {
    const pass = received.every((item: any) => item.schoolId === expectedSchoolId);
    if (pass) {
      return {
        message: () =>
          `expected data to not be isolated to school ${expectedSchoolId}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected all data to belong to school ${expectedSchoolId}, but found cross-school data`,
        pass: false,
      };
    }
  },
  
  toBeGDPRCompliant(received: any) {
    const requiredFields = ['id', 'createdAt', 'updatedAt'];
    const prohibitedFields = ['socialSecurityNumber', 'creditCardNumber', 'phoneNumber'];
    
    const hasRequired = requiredFields.every(field => field in received);
    const hasProhibited = prohibitedFields.some(field => field in received);
    
    const pass = hasRequired && !hasProhibited;
    
    if (pass) {
      return {
        message: () => `expected data to not be GDPR compliant`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected data to be GDPR compliant (required fields: ${requiredFields.join(', ')}, prohibited fields: ${prohibitedFields.join(', ')})`,
        pass: false,
      };
    }
  },
  
  toBeAccessible(received: any) {
    // Basic accessibility checks for components
    const hasAriaLabel = received.getAttribute?.('aria-label');
    const hasRole = received.getAttribute?.('role');
    const isButton = received.tagName === 'BUTTON';
    const isInput = received.tagName === 'INPUT';
    
    let pass = true;
    let missing = [];
    
    if (isButton && !hasAriaLabel && !received.textContent) {
      pass = false;
      missing.push('aria-label or text content');
    }
    
    if (isInput && !received.getAttribute?.('aria-label') && !received.getAttribute?.('aria-labelledby')) {
      pass = false;
      missing.push('aria-label or aria-labelledby');
    }
    
    if (pass) {
      return {
        message: () => `expected element to not be accessible`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected element to be accessible, missing: ${missing.join(', ')}`,
        pass: false,
      };
    }
  },
});

// Add UK educational context helpers
global.testHelpers = {
  ukTermDates: {
    autumn: { start: new Date('2024-09-01'), end: new Date('2024-12-20') },
    spring: { start: new Date('2025-01-06'), end: new Date('2025-03-28') },
    summer: { start: new Date('2025-04-14'), end: new Date('2025-07-18') },
  },
  ukYearGroups: [0, 1, 2, 3, 4, 5, 6], // Reception to Year 6
  ukSubjects: ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Art', 'PE'],
  ukSchoolTypes: ['PRIMARY', 'SECONDARY', 'ALL_THROUGH', 'SPECIAL'],
};