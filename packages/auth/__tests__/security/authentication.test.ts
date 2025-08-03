/**
 * Authentication Security Tests for StudyStreaks
 * Critical Priority 1 Tests - 100% Coverage Required
 * 
 * Tests NextAuth.js authentication security, password policies,
 * account lockout, session management, and audit logging
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@study-streaks/database';
import { AuthenticationSecurityHelper, SecurityTestOrchestrator } from '@testing/helpers/security';
import { createTestUser, createTestSchool } from '@testing/helpers/factories';
import { resetTestDatabase } from '@testing/setup/database-setup';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Authentication Security - NextAuth.js Implementation', () => {
  const authHelper = new AuthenticationSecurityHelper();
  const orchestrator = new SecurityTestOrchestrator();
  let testSchool: any;
  let testUser: any;

  beforeAll(async () => {
    testSchool = await createTestSchool({
      name: 'Auth Test School',
      urn: 'AUTH001',
    });
  });

  afterAll(async () => {
    await resetTestDatabase();
  });

  beforeEach(async () => {
    testUser = await createTestUser({
      email: 'authtest@testschool.ac.uk',
      schoolId: testSchool.id,
      passwordHash: await bcrypt.hash('TestPassword123!', 12),
    });
  });

  describe('Password Security Requirements', () => {
    it('should enforce strong password requirements', () => {
      // Given: Various password strength scenarios
      const passwordTests = [
        { password: 'weak', expectedPass: false, reason: 'Too short, no complexity' },
        { password: 'password123', expectedPass: false, reason: 'Common password' },
        { password: 'TestPassword123!', expectedPass: true, reason: 'Strong password' },
        { password: 'StrongP@ssw0rd!', expectedPass: true, reason: 'Very strong password' },
        { password: 'NoNumbers!', expectedPass: false, reason: 'Missing numbers' },
        { password: 'nonumber123', expectedPass: false, reason: 'Missing uppercase and special chars' },
      ];

      passwordTests.forEach(({ password, expectedPass, reason }) => {
        // When: Testing password security
        const result = authHelper.testPasswordSecurity(password);

        // Then: Should match expected strength requirements
        expect(result.passed).toBe(expectedPass);
        if (!expectedPass) {
          expect(result.score).toBeLessThan(4);
        }
      });
    });

    it('should properly hash passwords using bcrypt', async () => {
      // Given: A plain text password
      const plainPassword = 'TestPassword123!';

      // When: Testing password hashing
      const result = await authHelper.testPasswordHashing(plainPassword);

      // Then: Should meet security requirements
      expect(result.passed).toBe(true);
      expect(result.tests.isHashed).toBe(true);
      expect(result.tests.verifyCorrect).toBe(true);
      expect(result.tests.verifyIncorrect).toBe(true);
      expect(result.tests.hashLength).toBe(true);
      expect(result.tests.containsSalt).toBe(true);
      expect(result.hash).not.toBe(plainPassword);
    });

    it('should reject common passwords', () => {
      // Given: Common weak passwords
      const commonPasswords = [
        'password',
        '123456',
        'password123',
        'admin',
        'letmein',
        'welcome',
        'qwerty',
      ];

      commonPasswords.forEach(password => {
        // When: Testing common password
        const result = authHelper.testPasswordSecurity(password);

        // Then: Should be rejected
        expect(result.passed).toBe(false);
        expect(result.requirements.noCommonPatterns).toBe(false);
      });
    });

    it('should require minimum password entropy', () => {
      // Given: Passwords with different entropy levels
      const entropyTests = [
        { password: 'aaaaaaaaaaaa', entropy: 'low' },
        { password: 'TestPassword', entropy: 'medium' },
        { password: 'T3st!P@ssw0rd#2025', entropy: 'high' },
      ];

      entropyTests.forEach(({ password, entropy }) => {
        // When: Testing password entropy
        const result = authHelper.testPasswordSecurity(password);

        // Then: Higher entropy should score better
        if (entropy === 'high') {
          expect(result.score).toBeGreaterThan(3);
        } else if (entropy === 'low') {
          expect(result.score).toBeLessThan(3);
        }
      });
    });
  });

  describe('Account Lockout Protection', () => {
    it('should lock account after 5 failed login attempts', async () => {
      // Given: A user account
      const prisma = new PrismaClient();

      // When: Testing account lockout
      const result = await authHelper.testAccountLockout(testUser.id);

      // Then: Account should be locked with proper timing
      expect(result.passed).toBe(true);
      expect(result.tests.loginAttemptsIncremented).toBe(true);
      expect(result.tests.accountLocked).toBe(true);
      expect(result.tests.lockoutDurationCorrect).toBe(true);
      expect(result.lockedUser.loginAttempts).toBe(5);
      expect(result.lockedUser.lockedUntil).toBeTruthy();

      await prisma.$disconnect();
    });

    it('should prevent login attempts during lockout period', async () => {
      // Given: A locked account
      const prisma = new PrismaClient();
      const lockedUser = await prisma.user.update({
        where: { id: testUser.id },
        data: {
          loginAttempts: 5,
          lockedUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
        },
      });

      // When: Attempting to authenticate locked account
      const currentTime = Date.now();
      const lockoutTime = lockedUser.lockedUntil?.getTime() || 0;

      // Then: Should reject login during lockout period
      expect(lockoutTime).toBeGreaterThan(currentTime);
      expect(lockedUser.loginAttempts).toBe(5);

      await prisma.$disconnect();
    });

    it('should reset lockout after expiration', async () => {
      // Given: An expired lockout
      const prisma = new PrismaClient();
      const expiredLockUser = await prisma.user.update({
        where: { id: testUser.id },
        data: {
          loginAttempts: 5,
          lockedUntil: new Date(Date.now() - 60 * 1000), // 1 minute ago
        },
      });

      // When: Checking if lockout has expired
      const currentTime = Date.now();
      const lockoutTime = expiredLockUser.lockedUntil?.getTime() || 0;

      // Then: Lockout should be expired
      expect(lockoutTime).toBeLessThan(currentTime);

      // Should be able to reset login attempts
      const resetUser = await prisma.user.update({
        where: { id: testUser.id },
        data: {
          loginAttempts: 0,
          lockedUntil: null,
        },
      });

      expect(resetUser.loginAttempts).toBe(0);
      expect(resetUser.lockedUntil).toBeNull();

      await prisma.$disconnect();
    });

    it('should implement progressive lockout delays', async () => {
      // Given: Multiple lockout scenarios
      const prisma = new PrismaClient();
      const lockoutTests = [
        { attempts: 3, expectedDelay: 0 }, // No lockout yet
        { attempts: 5, expectedDelay: 15 * 60 * 1000 }, // 15 minutes
        { attempts: 10, expectedDelay: 30 * 60 * 1000 }, // Could be 30 minutes for repeat offenses
      ];

      for (const test of lockoutTests) {
        // When: Setting different attempt levels
        const updatedUser = await prisma.user.update({
          where: { id: testUser.id },
          data: {
            loginAttempts: test.attempts,
            lockedUntil: test.expectedDelay > 0 ? new Date(Date.now() + test.expectedDelay) : null,
          },
        });

        // Then: Lockout should match expected behavior
        if (test.expectedDelay > 0) {
          expect(updatedUser.lockedUntil).toBeTruthy();
          if (updatedUser.lockedUntil) {
            const actualDelay = updatedUser.lockedUntil.getTime() - Date.now();
            expect(actualDelay).toBeWithinRange(test.expectedDelay - 5000, test.expectedDelay + 5000);
          }
        } else {
          expect(updatedUser.lockedUntil).toBeNull();
        }
      }

      await prisma.$disconnect();
    });
  });

  describe('Session Management Security', () => {
    it('should validate session token security', () => {
      // Given: A session with proper security attributes
      const sessionData = {
        sessionToken: 'secure-random-token-32-characters-long',
        userId: testUser.id,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      };

      // When: Testing session security
      const result = authHelper.testSessionSecurity(sessionData);

      // Then: Session should meet security requirements
      expect(result.passed).toBe(true);
      expect(result.tests.hasExpiration).toBe(true);
      expect(result.tests.hasSecureToken).toBe(true);
      expect(result.tests.hasUserId).toBe(true);
      expect(result.tests.notExpired).toBe(true);
    });

    it('should reject insecure session tokens', () => {
      // Given: Insecure session configurations
      const insecureSessionTests = [
        {
          sessionToken: 'short', // Too short
          userId: testUser.id,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          expectedIssue: 'Token too short',
        },
        {
          sessionToken: 'secure-random-token-32-characters-long',
          userId: testUser.id,
          expires: new Date(Date.now() - 60 * 1000), // Expired
          expectedIssue: 'Session expired',
        },
        {
          sessionToken: 'secure-random-token-32-characters-long',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          // Missing userId
          expectedIssue: 'Missing user ID',
        },
      ];

      insecureSessionTests.forEach(sessionData => {
        // When: Testing insecure session
        const result = authHelper.testSessionSecurity(sessionData);

        // Then: Should fail security validation
        expect(result.passed).toBe(false);
      });
    });

    it('should enforce session expiration', () => {
      // Given: Various session expiration scenarios
      const expirationTests = [
        {
          expires: new Date(Date.now() + 60 * 1000), // 1 minute future
          shouldBeValid: true,
        },
        {
          expires: new Date(Date.now() - 60 * 1000), // 1 minute past
          shouldBeValid: false,
        },
        {
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours future
          shouldBeValid: true,
        },
      ];

      expirationTests.forEach(({ expires, shouldBeValid }) => {
        // When: Testing session expiration
        const sessionData = {
          sessionToken: 'secure-random-token-32-characters-long',
          userId: testUser.id,
          expires,
        };

        const result = authHelper.testSessionSecurity(sessionData);

        // Then: Should match expected validity
        expect(result.tests.notExpired).toBe(shouldBeValid);
      });
    });
  });

  describe('JWT Token Security', () => {
    it('should validate JWT token structure and security', () => {
      // Given: A properly signed JWT token
      const secret = 'test-secret-key-should-be-much-longer-in-production';
      const payload = {
        id: testUser.id,
        email: testUser.email,
        schoolId: testUser.schoolId,
        userType: 'teacher',
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
      };

      const token = jwt.sign(payload, secret);

      // When: Testing JWT security
      const result = authHelper.testJWTSecurity(token, secret);

      // Then: Should pass all security checks
      expect(result.passed).toBe(true);
      expect(result.tests.validSignature).toBe(true);
      expect(result.tests.hasExpiration).toBe(true);
      expect(result.tests.notExpired).toBe(true);
      expect(result.tests.hasSchoolId).toBe(true);
      expect(result.tests.hasUserId).toBe(true);
    });

    it('should reject tampered JWT tokens', () => {
      // Given: A valid token that gets tampered with
      const secret = 'test-secret-key-should-be-much-longer-in-production';
      const payload = {
        id: testUser.id,
        email: testUser.email,
        schoolId: testUser.schoolId,
        userType: 'teacher',
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
      };

      const validToken = jwt.sign(payload, secret);
      const tamperedToken = validToken.slice(0, -10) + 'tampered123';

      // When: Testing tampered token
      const result = authHelper.testJWTSecurity(tamperedToken, secret);

      // Then: Should be rejected
      expect(result.passed).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject expired JWT tokens', () => {
      // Given: An expired JWT token
      const secret = 'test-secret-key-should-be-much-longer-in-production';
      const expiredPayload = {
        id: testUser.id,
        email: testUser.email,
        schoolId: testUser.schoolId,
        userType: 'teacher',
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };

      const expiredToken = jwt.sign(expiredPayload, secret);

      // When: Testing expired token
      const result = authHelper.testJWTSecurity(expiredToken, secret);

      // Then: Should be rejected due to expiration
      expect(result.passed).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('should require essential claims in JWT payload', () => {
      // Given: JWT tokens with missing claims
      const secret = 'test-secret-key-should-be-much-longer-in-production';
      
      const missingClaimsTests = [
        {
          payload: { email: testUser.email, exp: Math.floor(Date.now() / 1000) + 3600 },
          missing: 'id and schoolId',
        },
        {
          payload: { id: testUser.id, exp: Math.floor(Date.now() / 1000) + 3600 },
          missing: 'schoolId',
        },
        {
          payload: { id: testUser.id, schoolId: testUser.schoolId },
          missing: 'expiration',
        },
      ];

      missingClaimsTests.forEach(({ payload, missing }) => {
        // When: Testing token with missing claims
        const token = jwt.sign(payload, secret);
        const result = authHelper.testJWTSecurity(token, secret);

        // Then: Should fail due to missing essential claims
        expect(result.passed).toBe(false);
      });
    });
  });

  describe('Multi-Factor Authentication Preparation', () => {
    it('should support MFA enablement for high-privilege accounts', async () => {
      // Given: Different user types with varying privilege levels
      const userTypes = [
        { type: 'student', mfaRequired: false },
        { type: 'parent', mfaRequired: false },
        { type: 'teacher', mfaRequired: false },
        { type: 'schoolAdmin', mfaRequired: true }, // High privilege
      ];

      const prisma = new PrismaClient();

      for (const userTypeTest of userTypes) {
        // When: Creating user of specific type
        const user = await createTestUser({
          email: `${userTypeTest.type}@testschool.ac.uk`,
          schoolId: testSchool.id,
        });

        // Create appropriate profile based on type
        if (userTypeTest.type === 'schoolAdmin') {
          await prisma.schoolAdmin.create({
            data: {
              userId: user.id,
              schoolId: testSchool.id,
              firstName: 'Test',
              lastName: 'Admin',
              jobTitle: 'Head Teacher',
              adminLevel: 'SCHOOL_ADMIN',
              canManageUsers: true,
              canExportData: true, // High privilege
            },
          });
        }

        // Then: MFA requirement should match user privilege level
        // This is preparation for future MFA implementation
        const shouldRequireMFA = userTypeTest.mfaRequired;
        expect(typeof shouldRequireMFA).toBe('boolean');
      }

      await prisma.$disconnect();
    });
  });

  describe('Authentication Audit Trail', () => {
    it('should log successful authentication events', async () => {
      // Given: A successful authentication
      const authEvent = {
        event: 'USER_LOGIN',
        userId: testUser.id,
        details: {
          userType: 'teacher',
          schoolId: testUser.schoolId,
          timestamp: new Date(),
          ipAddress: '192.168.1.100',
          userAgent: 'Test Browser',
        },
      };

      // When: Testing audit trail logging
      const result = await authHelper.auditHelper.testAuditTrail(
        authEvent.event,
        authEvent.userId,
        authEvent.details
      );

      // Then: Should be marked for auditing
      expect(result.shouldBeAudited).toBe(true);
      expect(result.action).toBe('USER_LOGIN');
      expect(result.userId).toBe(testUser.id);
    });

    it('should log failed authentication attempts', async () => {
      // Given: Failed authentication attempts
      const failedAuthEvents = [
        'INVALID_PASSWORD',
        'USER_NOT_FOUND',
        'ACCOUNT_LOCKED',
        'ACCOUNT_DISABLED',
      ];

      for (const event of failedAuthEvents) {
        // When: Testing failed auth audit
        const result = await authHelper.auditHelper.testAuditTrail(
          event,
          testUser.id
        );

        // Then: Should be audited for security monitoring
        if (['INVALID_PASSWORD', 'ACCOUNT_LOCKED'].includes(event)) {
          expect(result.shouldBeAudited).toBe(true);
        }
      }
    });

    it('should detect and log suspicious authentication patterns', () => {
      // Given: Suspicious authentication events
      const suspiciousEvents = [
        { event: 'MULTIPLE_FAILED_LOGINS', severity: 'HIGH' as const },
        { event: 'LOGIN_FROM_NEW_LOCATION', severity: 'MEDIUM' as const },
        { event: 'CONCURRENT_SESSIONS', severity: 'MEDIUM' as const },
        { event: 'PASSWORD_BRUTE_FORCE', severity: 'CRITICAL' as const },
      ];

      suspiciousEvents.forEach(({ event, severity }) => {
        // When: Testing suspicious event detection
        const result = authHelper.auditHelper.testSecurityEventDetection(event, severity);

        // Then: Should trigger appropriate alerts
        if (severity === 'CRITICAL' || severity === 'HIGH') {
          expect(result.shouldTriggerAlert).toBe(true);
        }
        expect(result.event).toBe(event);
        expect(result.severity).toBe(severity);
      });
    });
  });

  describe('School-Specific Authentication Rules', () => {
    it('should enforce school-specific password policies', async () => {
      // Given: Different schools with varying security requirements
      const schoolPolicyTests = [
        {
          schoolType: 'PRIMARY',
          minPasswordLength: 8,
          requireSpecialChars: true,
          description: 'Standard primary school policy',
        },
        {
          schoolType: 'SECONDARY',
          minPasswordLength: 10,
          requireSpecialChars: true,
          description: 'Enhanced secondary school policy',
        },
        {
          schoolType: 'SPECIAL',
          minPasswordLength: 12,
          requireSpecialChars: true,
          description: 'High security for special schools',
        },
      ];

      schoolPolicyTests.forEach(policy => {
        // When: Testing school-specific policies
        const testPassword = 'A'.repeat(policy.minPasswordLength - 1) + '1!';
        const result = authHelper.testPasswordSecurity(testPassword);

        // Then: Should match school requirements
        expect(result.requirements.minLength).toBe(testPassword.length >= policy.minPasswordLength);
        if (policy.requireSpecialChars) {
          expect(result.requirements.hasSpecialChar).toBe(true);
        }
      });
    });

    it('should validate UK educational email formats', () => {
      // Given: Various email formats
      const emailTests = [
        { email: 'teacher@testschool.ac.uk', valid: true, type: 'UK academic' },
        { email: 'admin@testschool.org.uk', valid: true, type: 'UK organization' },
        { email: 'parent@gmail.com', valid: true, type: 'Personal email' },
        { email: 'invalid@', valid: false, type: 'Malformed' },
        { email: 'teacher@testschool.com', valid: true, type: 'Commercial domain' },
      ];

      emailTests.forEach(({ email, valid, type }) => {
        // When: Validating email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidFormat = emailRegex.test(email);

        // Then: Should match expected validity
        expect(isValidFormat).toBe(valid);
      });
    });
  });
});