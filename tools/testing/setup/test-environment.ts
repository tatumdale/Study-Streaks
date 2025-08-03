/**
 * Test Environment Setup for StudyStreaks
 * Handles test environment initialization and cleanup
 */

import { config } from 'dotenv';
import path from 'path';

// Load test environment variables
config({ path: path.resolve(process.cwd(), '.env.test') });

/**
 * Setup test environment before all tests
 */
export async function setupTestEnvironment(): Promise<void> {
  // Set test-specific environment variables
  process.env.NODE_ENV = 'test';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
  process.env.NEXTAUTH_SECRET = 'test-secret-12345678901234567890123456789012';
  
  // Database URLs for testing
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5433/study_streaks_test';
  process.env.DIRECT_URL = process.env.TEST_DIRECT_URL || 'postgresql://test:test@localhost:5433/study_streaks_test';
  
  // Disable logging in tests
  process.env.LOG_LEVEL = 'error';
  
  // Test-specific configurations
  process.env.SKIP_ENV_VALIDATION = 'true';
  process.env.DISABLE_TELEMETRY = 'true';
  
  // Mock external services
  process.env.AWS_ACCESS_KEY_ID = 'test';
  process.env.AWS_SECRET_ACCESS_KEY = 'test';
  process.env.S3_BUCKET = 'test-bucket';
  process.env.S3_REGION = 'eu-west-2';
  
  // Email service mocking
  process.env.EMAIL_PROVIDER = 'mock';
  process.env.SMTP_HOST = 'localhost';
  process.env.SMTP_PORT = '1025'; // MailHog test server
  
  // Security settings for tests
  process.env.BCRYPT_ROUNDS = '4'; // Faster hashing for tests
  process.env.JWT_EXPIRY = '1h';
  
  console.log('Test environment setup completed');
}

/**
 * Cleanup test environment after all tests
 */
export async function cleanupTestEnvironment(): Promise<void> {
  // Reset environment variables
  delete process.env.TEST_DATABASE_URL;
  delete process.env.TEST_DIRECT_URL;
  delete process.env.SKIP_ENV_VALIDATION;
  delete process.env.DISABLE_TELEMETRY;
  
  console.log('Test environment cleanup completed');
}

/**
 * Get test-specific configuration values
 */
export function getTestConfig() {
  return {
    database: {
      url: process.env.DATABASE_URL,
      directUrl: process.env.DIRECT_URL,
    },
    auth: {
      secret: process.env.NEXTAUTH_SECRET,
      url: process.env.NEXTAUTH_URL,
    },
    app: {
      port: parseInt(process.env.PORT || '3000'),
      env: process.env.NODE_ENV,
    },
    testing: {
      timeout: parseInt(process.env.TEST_TIMEOUT || '10000'),
      retries: parseInt(process.env.TEST_RETRIES || '2'),
      verbose: process.env.TEST_VERBOSE === 'true',
    },
  };
}

/**
 * Validate that all required test environment variables are set
 */
export function validateTestEnvironment(): void {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required test environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Reset environment to clean state for individual tests
 */
export function resetTestEnvironment(): void {
  // Reset any test-specific state
  jest.clearAllMocks();
  jest.restoreAllMocks();
  
  // Reset fake timers
  jest.clearAllTimers();
  jest.runOnlyPendingTimers();
}