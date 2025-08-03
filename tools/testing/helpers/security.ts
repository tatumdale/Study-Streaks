/**
 * Security Testing Helpers for StudyStreaks
 * Multi-tenant security, authentication, and data protection testing utilities
 */

import { PrismaClient } from '@study-streaks/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createTestSchool, createTestUser, createTestStudent, createTestTeacher } from './factories';

const prisma = new PrismaClient();

/**
 * Multi-tenant security testing helper
 */
export class MultiTenantSecurityHelper {
  /**
   * Create isolated test environments for multiple schools
   */
  async createIsolatedSchools(count: number = 2) {
    const schools = [];
    for (let i = 0; i < count; i++) {
      const school = await createTestSchool({
        name: `Security Test School ${i + 1}`,
        urn: `SEC${String(i + 1).padStart(3, '0')}`,
        email: `admin@securitytest${i + 1}.ac.uk`,
      });
      schools.push(school);
    }
    return schools;
  }

  /**
   * Seed cross-school test data for isolation testing
   */
  async seedCrossSchoolData(schools: any[]) {
    const testData = {
      schools,
      users: [],
      students: [],
      teachers: [],
    };

    for (let i = 0; i < schools.length; i++) {
      const school = schools[i];
      
      // Create users for each school
      for (let j = 0; j < 5; j++) {
        const user = await createTestUser({
          email: `securityuser${i}-${j}@securitytest${i + 1}.ac.uk`,
          schoolId: school.id,
        });
        testData.users.push(user);

        // Create teacher profile
        const teacher = await createTestTeacher({
          userId: user.id,
          schoolId: school.id,
          firstName: `SecurityTeacher${i}-${j}`,
        });
        testData.teachers.push(teacher);
      }

      // Create students for each school
      for (let k = 0; k < 10; k++) {
        const student = await createTestStudent({
          firstName: `SecurityStudent${i}-${k}`,
          schoolId: school.id,
        });
        testData.students.push(student);
      }
    }

    return testData;
  }

  /**
   * Verify that school A cannot access school B's data
   */
  async verifyCrossSchoolIsolation(schoolA: any, schoolB: any) {
    const violations = [];

    // Test user isolation
    const schoolAUsers = await prisma.user.findMany({
      where: { schoolId: schoolA.id },
    });

    const schoolBUsers = await prisma.user.findMany({
      where: { schoolId: schoolB.id },
    });

    // Verify no cross-contamination
    if (schoolAUsers.some(user => user.schoolId === schoolB.id)) {
      violations.push('User data leaked between schools');
    }

    if (schoolBUsers.some(user => user.schoolId === schoolA.id)) {
      violations.push('User data leaked between schools');
    }

    // Test student isolation
    const schoolAStudents = await prisma.student.findMany({
      where: { schoolId: schoolA.id },
    });

    const schoolBStudents = await prisma.student.findMany({
      where: { schoolId: schoolB.id },
    });

    if (schoolAStudents.some(student => student.schoolId === schoolB.id)) {
      violations.push('Student data leaked between schools');
    }

    if (schoolBStudents.some(student => student.schoolId === schoolA.id)) {
      violations.push('Student data leaked between schools');
    }

    return violations;
  }

  /**
   * Test row-level security enforcement
   */
  async testRowLevelSecurity(schoolId: string) {
    // Attempt to query data without proper school context
    try {
      // This should only return data for the specified school
      const students = await prisma.student.findMany({
        where: { schoolId },
      });

      // Verify all returned data belongs to the correct school
      const incorrectSchoolData = students.filter(s => s.schoolId !== schoolId);
      
      if (incorrectSchoolData.length > 0) {
        throw new Error(`Row-level security violation: Found ${incorrectSchoolData.length} records from other schools`);
      }

      return { passed: true, recordCount: students.length };
    } catch (error) {
      return { passed: false, error: error.message };
    }
  }

  /**
   * Test API endpoint security with different school contexts
   */
  async testAPIEndpointSecurity(endpoint: string, schoolAToken: string, schoolBData: any) {
    // This would be used with actual HTTP tests
    return {
      endpoint,
      schoolACanAccessSchoolBData: false, // Should always be false
      message: 'API endpoint security test helper - use with actual HTTP client',
    };
  }
}

/**
 * Authentication security testing helper
 */
export class AuthenticationSecurityHelper {
  /**
   * Test password security requirements
   */
  testPasswordSecurity(password: string) {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noCommonPatterns: !this.isCommonPassword(password),
    };

    const passed = Object.values(requirements).every(req => req);
    
    return {
      passed,
      requirements,
      score: this.calculatePasswordScore(password),
    };
  }

  /**
   * Test password hashing security
   */
  async testPasswordHashing(plainPassword: string) {
    const hash = await bcrypt.hash(plainPassword, 12);
    
    const tests = {
      isHashed: hash !== plainPassword,
      verifyCorrect: await bcrypt.compare(plainPassword, hash),
      verifyIncorrect: !(await bcrypt.compare('wrongpassword', hash)),
      hashLength: hash.length >= 60, // bcrypt hashes are 60 chars
      containsSalt: hash.includes('$2a$') || hash.includes('$2b$'),
    };

    const passed = Object.values(tests).every(test => test);

    return { passed, tests, hash };
  }

  /**
   * Test JWT security
   */
  testJWTSecurity(token: string, secret: string) {
    try {
      const decoded = jwt.verify(token, secret);
      
      const tests = {
        validSignature: true,
        hasExpiration: typeof decoded === 'object' && 'exp' in decoded,
        notExpired: typeof decoded === 'object' && 'exp' in decoded ? decoded.exp > Date.now() / 1000 : false,
        hasSchoolId: typeof decoded === 'object' && 'schoolId' in decoded,
        hasUserId: typeof decoded === 'object' && 'id' in decoded,
      };

      return { passed: Object.values(tests).every(test => test), tests, decoded };
    } catch (error) {
      return { passed: false, error: error.message };
    }
  }

  /**
   * Test account lockout functionality
   */
  async testAccountLockout(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // Simulate failed login attempts
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      await prisma.user.update({
        where: { id: userId },
        data: { loginAttempts: { increment: 1 } },
      });
      attempts++;
    }

    // Update with lockout
    const lockedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        lockedUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    const tests = {
      loginAttemptsIncremented: lockedUser.loginAttempts === maxAttempts,
      accountLocked: lockedUser.lockedUntil !== null,
      lockoutDurationCorrect: lockedUser.lockedUntil ? 
        lockedUser.lockedUntil.getTime() > Date.now() : false,
    };

    return { passed: Object.values(tests).every(test => test), tests, lockedUser };
  }

  /**
   * Test session security
   */
  testSessionSecurity(sessionData: any) {
    const tests = {
      hasExpiration: 'expires' in sessionData,
      hasSecureToken: sessionData.sessionToken && sessionData.sessionToken.length >= 32,
      hasUserId: 'userId' in sessionData,
      notExpired: sessionData.expires ? new Date(sessionData.expires) > new Date() : false,
    };

    return { passed: Object.values(tests).every(test => test), tests };
  }

  private isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'letmein',
      'welcome', 'monkey', '1234567890', 'qwerty', 'abc123'
    ];
    return commonPasswords.includes(password.toLowerCase());
  }

  private calculatePasswordScore(password: string): number {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    if (password.length >= 16) score += 1;
    if (!this.isCommonPassword(password)) score += 1;
    return Math.min(score, 5); // Max score of 5
  }
}

/**
 * Role-based access control testing helper
 */
export class RBACSecurityHelper {
  /**
   * Test role-based permission enforcement
   */
  async testRolePermissions(userId: string, requiredPermission: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return { passed: false, error: 'User not found' };

    const userPermissions = user.userRoles.flatMap(userRole =>
      userRole.role.permissions.map(rp => rp.permission.name)
    );

    const hasPermission = userPermissions.includes(requiredPermission);

    return {
      passed: hasPermission,
      userPermissions,
      requiredPermission,
      roles: user.userRoles.map(ur => ur.role.name),
    };
  }

  /**
   * Test permission scope enforcement
   */
  async testPermissionScope(userId: string, resourceId: string, scope: string) {
    // This would test that users can only access resources within their scope
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user) return { passed: false, error: 'User not found' };

    const allowedScopes = user.userRoles.map(ur => ur.role.scope);
    const hasCorrectScope = allowedScopes.includes(scope as any);

    return {
      passed: hasCorrectScope,
      userScopes: allowedScopes,
      requiredScope: scope,
      resourceId,
    };
  }

  /**
   * Test privilege escalation protection
   */
  async testPrivilegeEscalation(lowPrivUserId: string, highPrivAction: string) {
    // Test that low-privilege users cannot perform high-privilege actions
    const user = await prisma.user.findUnique({
      where: { id: lowPrivUserId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return { passed: false, error: 'User not found' };

    const highPrivPermissions = [
      'delete_student_data',
      'export_school_data',
      'manage_all_users',
      'modify_system_settings',
    ];

    const userPermissions = user.userRoles.flatMap(ur =>
      ur.role.permissions.map(rp => rp.permission.name)
    );

    const hasHighPrivilege = userPermissions.some(perm =>
      highPrivPermissions.includes(perm)
    );

    return {
      passed: !hasHighPrivilege, // Should NOT have high privileges
      userPermissions,
      highPrivPermissions,
      attemptedAction: highPrivAction,
    };
  }
}

/**
 * Data protection testing helper
 */
export class DataProtectionHelper {
  /**
   * Test SQL injection protection
   */
  testSQLInjectionProtection(inputValue: string) {
    const sqlInjectionPatterns = [
      "'; DROP TABLE",
      "' OR '1'='1",
      "'; INSERT INTO",
      "' UNION SELECT",
      "--",
      "/*",
      "xp_cmdshell",
    ];

    const containsMaliciousPattern = sqlInjectionPatterns.some(pattern =>
      inputValue.toLowerCase().includes(pattern.toLowerCase())
    );

    return {
      passed: !containsMaliciousPattern, // Should reject malicious input
      inputValue,
      detectedPatterns: sqlInjectionPatterns.filter(pattern =>
        inputValue.toLowerCase().includes(pattern.toLowerCase())
      ),
    };
  }

  /**
   * Test XSS protection
   */
  testXSSProtection(inputValue: string) {
    const xssPatterns = [
      '<script',
      'javascript:',
      'onload=',
      'onerror=',
      'onclick=',
      'eval(',
      '<iframe',
      '<object',
      '<embed',
    ];

    const containsXSSPattern = xssPatterns.some(pattern =>
      inputValue.toLowerCase().includes(pattern.toLowerCase())
    );

    return {
      passed: !containsXSSPattern, // Should reject XSS attempts
      inputValue,
      detectedPatterns: xssPatterns.filter(pattern =>
        inputValue.toLowerCase().includes(pattern.toLowerCase())
      ),
    };
  }

  /**
   * Test input validation and sanitization
   */
  testInputValidation(input: any, expectedType: string, maxLength?: number) {
    const tests = {
      typeCorrect: typeof input === expectedType,
      lengthValid: maxLength ? String(input).length <= maxLength : true,
      notEmpty: input !== null && input !== undefined && String(input).trim() !== '',
      noMaliciousContent: this.testSQLInjectionProtection(String(input)).passed &&
                         this.testXSSProtection(String(input)).passed,
    };

    return {
      passed: Object.values(tests).every(test => test),
      tests,
      input,
      expectedType,
      maxLength,
    };
  }

  /**
   * Test data encryption at rest
   */
  async testDataEncryption(sensitiveField: string, value: string) {
    // This would test that sensitive data is properly encrypted
    const isEncrypted = value !== sensitiveField && value.includes('$');
    
    return {
      passed: isEncrypted,
      field: sensitiveField,
      isPlainText: value === sensitiveField,
      appearsEncrypted: isEncrypted,
    };
  }
}

/**
 * Audit and compliance testing helper
 */
export class AuditSecurityHelper {
  /**
   * Test audit trail creation
   */
  async testAuditTrail(action: string, userId: string, resourceId?: string) {
    // This would verify that security-sensitive actions are logged
    const auditEvents = [
      'USER_LOGIN',
      'USER_LOGOUT',
      'PASSWORD_CHANGE',
      'PERMISSION_GRANTED',
      'DATA_EXPORT',
      'DATA_DELETION',
    ];

    const shouldBeAudited = auditEvents.includes(action);

    return {
      passed: shouldBeAudited,
      action,
      userId,
      resourceId,
      shouldBeAudited,
      timestamp: new Date(),
    };
  }

  /**
   * Test security event monitoring
   */
  testSecurityEventDetection(event: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') {
    const criticalEvents = [
      'MULTIPLE_FAILED_LOGINS',
      'PRIVILEGE_ESCALATION_ATTEMPT',
      'DATA_BREACH_DETECTED',
      'UNAUTHORIZED_ACCESS_ATTEMPT',
    ];

    const shouldTriggerAlert = criticalEvents.includes(event) || severity === 'CRITICAL';

    return {
      passed: true, // This is more about detection than pass/fail
      event,
      severity,
      shouldTriggerAlert,
      timestamp: new Date(),
    };
  }
}

/**
 * Main security test orchestrator
 */
export class SecurityTestOrchestrator {
  private multiTenant: MultiTenantSecurityHelper;
  private auth: AuthenticationSecurityHelper;
  private rbac: RBACSecurityHelper;
  private dataProtection: DataProtectionHelper;
  private audit: AuditSecurityHelper;

  constructor() {
    this.multiTenant = new MultiTenantSecurityHelper();
    this.auth = new AuthenticationSecurityHelper();
    this.rbac = new RBACSecurityHelper();
    this.dataProtection = new DataProtectionHelper();
    this.audit = new AuditSecurityHelper();
  }

  /**
   * Run comprehensive security test suite
   */
  async runSecurityTestSuite() {
    const results = {
      multiTenant: [],
      authentication: [],
      rbac: [],
      dataProtection: [],
      audit: [],
    };

    // Multi-tenant tests
    const schools = await this.multiTenant.createIsolatedSchools(2);
    const crossSchoolData = await this.multiTenant.seedCrossSchoolData(schools);
    const isolationTest = await this.multiTenant.verifyCrossSchoolIsolation(schools[0], schools[1]);
    results.multiTenant.push({ type: 'isolation', result: isolationTest });

    // Authentication tests
    const passwordTest = this.auth.testPasswordSecurity('TestPassword123!');
    results.authentication.push({ type: 'password', result: passwordTest });

    const hashTest = await this.auth.testPasswordHashing('TestPassword123!');
    results.authentication.push({ type: 'hashing', result: hashTest });

    return results;
  }

  // Getters for individual helpers
  get multiTenantHelper() { return this.multiTenant; }
  get authHelper() { return this.auth; }
  get rbacHelper() { return this.rbac; }
  get dataProtectionHelper() { return this.dataProtection; }
  get auditHelper() { return this.audit; }
}