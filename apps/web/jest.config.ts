import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  displayName: '@study-streaks/web',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/../../tools/testing/jest.setup.ts'],
  testEnvironment: 'jsdom',
  
  // Transform configuration
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
  },
  
  // Module configuration
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@study-streaks/(.*)$': '<rootDir>/../../packages/$1/src',
    '^@testing/(.*)$': '<rootDir>/../../tools/testing/$1',
  },
  
  // Test file patterns
  testMatch: [
    '<rootDir>/__tests__/**/*.(test|spec).{ts,tsx,js,jsx}',
    '<rootDir>/src/**/__tests__/**/*.(test|spec).{ts,tsx,js,jsx}',
    '<rootDir>/src/**/*.(test|spec).{ts,tsx,js,jsx}',
  ],
  
  // Coverage configuration
  coverageDirectory: '../../coverage/apps/web',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    // Higher thresholds for critical components
    './src/app/auth/**': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  
  // Test environment setup
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  
  // Global test setup
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],
  
  // Watch configuration
  watchPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
  
  // Verbose output for debugging
  verbose: false,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
};

export default createJestConfig(config);
