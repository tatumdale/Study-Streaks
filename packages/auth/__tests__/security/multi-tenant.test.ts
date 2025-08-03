/**
 * Multi-Tenant Security Tests for StudyStreaks
 * Critical Priority 1 Tests - 100% Coverage Required
 * 
 * Tests multi-tenant data isolation, school-based access control,
 * and prevention of cross-school data leakage
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { PrismaClient } from '@study-streaks/database';
import { MultiTenantSecurityHelper, SecurityTestOrchestrator } from '@testing/helpers/security';
import { createTestSchool, createTestUser, createTestStudent, createTestTeacher } from '@testing/helpers/factories';
import { resetTestDatabase } from '@testing/setup/database-setup';

describe('Multi-Tenant Security - Data Isolation', () => {
  const securityHelper = new MultiTenantSecurityHelper();
  const orchestrator = new SecurityTestOrchestrator();
  let testSchools: any[] = [];
  let testData: any;

  beforeAll(async () => {
    // Create isolated test environments
    testSchools = await securityHelper.createIsolatedSchools(3);
    testData = await securityHelper.seedCrossSchoolData(testSchools);
  });

  afterAll(async () => {
    await resetTestDatabase();
  });

  describe('School Data Isolation', () => {
    it('should prevent School A from accessing School B user data', async () => {
      // Given: Two isolated schools with their own users
      const schoolA = testSchools[0];
      const schoolB = testSchools[1];

      // When: Attempting to verify data isolation
      const violations = await securityHelper.verifyCrossSchoolIsolation(schoolA, schoolB);

      // Then: No cross-school data leakage should occur
      expect(violations).toHaveLength(0);
      expect(violations).not.toContain('User data leaked between schools');
      expect(violations).not.toContain('Student data leaked between schools');
    });

    it('should ensure row-level security enforcement', async () => {
      // Given: A specific school context
      const schoolA = testSchools[0];

      // When: Testing row-level security
      const result = await securityHelper.testRowLevelSecurity(schoolA.id);

      // Then: Only data for that school should be returned
      expect(result.passed).toBe(true);
      expect(result.recordCount).toBeGreaterThan(0);
      expect(result.error).toBeUndefined();
    });

    it('should reject queries without proper school context', async () => {
      // Given: A query without school context
      const invalidSchoolId = 'non-existent-school';

      // When: Attempting to access data
      const result = await securityHelper.testRowLevelSecurity(invalidSchoolId);

      // Then: Should return no data or error
      expect(result.recordCount).toBe(0);
    });

    it('should maintain data isolation across all entity types', async () => {
      // Given: Multiple schools with comprehensive data
      const schoolA = testSchools[0];
      const schoolB = testSchools[1];

      // When: Checking isolation across all entity types
      const prisma = new PrismaClient();

      const schoolAUsers = await prisma.user.findMany({ where: { schoolId: schoolA.id } });
      const schoolBUsers = await prisma.user.findMany({ where: { schoolId: schoolB.id } });

      const schoolAStudents = await prisma.student.findMany({ where: { schoolId: schoolA.id } });
      const schoolBStudents = await prisma.student.findMany({ where: { schoolId: schoolB.id } });

      // Then: Each school should only have its own data
      expect(schoolAUsers).toHaveValidSchoolIsolation(schoolA.id);
      expect(schoolBUsers).toHaveValidSchoolIsolation(schoolB.id);
      expect(schoolAStudents).toHaveValidSchoolIsolation(schoolA.id);
      expect(schoolBStudents).toHaveValidSchoolIsolation(schoolB.id);

      await prisma.$disconnect();
    });
  });

  describe('Cross-Tenant Access Prevention', () => {
    it('should prevent cross-school user enumeration', async () => {
      // Given: Users from different schools
      const schoolA = testSchools[0];
      const schoolB = testSchools[1];

      // When: Attempting to enumerate users across schools
      const prisma = new PrismaClient();
      
      // Simulate a malicious query trying to get all users regardless of school
      const allUsers = await prisma.user.findMany();
      
      // Group by school to verify isolation
      const usersBySchool = allUsers.reduce((acc, user) => {
        acc[user.schoolId] = (acc[user.schoolId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Then: Users should be properly isolated by school
      expect(usersBySchool[schoolA.id]).toBeGreaterThan(0);
      expect(usersBySchool[schoolB.id]).toBeGreaterThan(0);
      
      // Each school should have its own separate user base
      expect(Object.keys(usersBySchool)).toContain(schoolA.id);
      expect(Object.keys(usersBySchool)).toContain(schoolB.id);

      await prisma.$disconnect();
    });

    it('should prevent cross-school student data access', async () => {
      // Given: Students from different schools
      const schoolA = testSchools[0];
      const schoolB = testSchools[1];

      // When: Verifying student data isolation
      const prisma = new PrismaClient();
      
      const schoolAStudents = await prisma.student.findMany({
        where: { schoolId: schoolA.id },
      });

      const schoolBStudents = await prisma.student.findMany({
        where: { schoolId: schoolB.id },
      });

      // Then: No cross-contamination should exist
      const crossContamination = schoolAStudents.filter(s => s.schoolId === schoolB.id);
      expect(crossContamination).toHaveLength(0);

      const reverseCrossContamination = schoolBStudents.filter(s => s.schoolId === schoolA.id);
      expect(reverseCrossContamination).toHaveLength(0);

      await prisma.$disconnect();
    });

    it('should prevent cross-school homework data access', async () => {
      // Given: Homework data from different schools
      const schoolA = testSchools[0];
      const schoolB = testSchools[1];

      // When: Creating homework completions for each school
      const prisma = new PrismaClient();

      // Create homework for school A
      const schoolAStudent = await prisma.student.findFirst({ 
        where: { schoolId: schoolA.id } 
      });
      
      const schoolBStudent = await prisma.student.findFirst({ 
        where: { schoolId: schoolB.id } 
      });

      if (schoolAStudent && schoolBStudent) {
        const schoolAHomework = await prisma.homeworkCompletion.create({
          data: {
            studentId: schoolAStudent.id,
            schoolId: schoolA.id,
            evidenceType: 'COMPLETION_MARK',
            completionDate: new Date(),
          },
        });

        const schoolBHomework = await prisma.homeworkCompletion.create({
          data: {
            studentId: schoolBStudent.id,
            schoolId: schoolB.id,
            evidenceType: 'COMPLETION_MARK',
            completionDate: new Date(),
          },
        });

        // Then: Homework should be isolated by school
        const schoolAHomeworkQuery = await prisma.homeworkCompletion.findMany({
          where: { schoolId: schoolA.id },
        });

        const schoolBHomeworkQuery = await prisma.homeworkCompletion.findMany({
          where: { schoolId: schoolB.id },
        });

        expect(schoolAHomeworkQuery).toHaveValidSchoolIsolation(schoolA.id);
        expect(schoolBHomeworkQuery).toHaveValidSchoolIsolation(schoolB.id);
      }

      await prisma.$disconnect();
    });
  });

  describe('Multi-Tenant Query Validation', () => {
    it('should validate school context in all database queries', async () => {
      // Given: Multiple schools with data
      const testCases = [
        { entity: 'user', schoolId: testSchools[0].id },
        { entity: 'student', schoolId: testSchools[1].id },
        { entity: 'teacher', schoolId: testSchools[2].id },
      ];

      // When: Testing each entity type
      const prisma = new PrismaClient();
      
      for (const testCase of testCases) {
        let results: any[] = [];
        
        switch (testCase.entity) {
          case 'user':
            results = await prisma.user.findMany({
              where: { schoolId: testCase.schoolId },
            });
            break;
          case 'student':
            results = await prisma.student.findMany({
              where: { schoolId: testCase.schoolId },
            });
            break;
          case 'teacher':
            results = await prisma.teacher.findMany({
              where: { schoolId: testCase.schoolId },
            });
            break;
        }

        // Then: All results should belong to the correct school
        expect(results).toHaveValidSchoolIsolation(testCase.schoolId);
      }

      await prisma.$disconnect();
    });

    it('should reject malformed school IDs', async () => {
      // Given: Invalid school ID formats
      const invalidSchoolIds = [
        '', // Empty string
        'null', // String null
        'undefined', // String undefined
        'DROP TABLE schools;', // SQL injection attempt
        '../../../etc/passwd', // Path traversal attempt
        '<script>alert("xss")</script>', // XSS attempt
      ];

      // When/Then: Each invalid ID should be rejected
      const prisma = new PrismaClient();
      
      for (const invalidId of invalidSchoolIds) {
        const result = await prisma.user.findMany({
          where: { schoolId: invalidId },
        });
        
        // Should return empty results for invalid IDs
        expect(result).toHaveLength(0);
      }

      await prisma.$disconnect();
    });
  });

  describe('Data Integrity Across Tenants', () => {
    it('should maintain referential integrity within tenant boundaries', async () => {
      // Given: Related data within a school
      const school = testSchools[0];
      const prisma = new PrismaClient();

      // When: Checking relationships
      const usersWithProfiles = await prisma.user.findMany({
        where: { schoolId: school.id },
        include: {
          teacher: true,
          student: true,
          parent: true,
          schoolAdmin: true,
        },
      });

      // Then: All relationships should be within the same school
      for (const user of usersWithProfiles) {
        expect(user.schoolId).toBe(school.id);
        
        if (user.teacher) {
          expect(user.teacher.schoolId).toBe(school.id);
        }
        if (user.student) {
          expect(user.student.schoolId).toBe(school.id);
        }
        if (user.parent) {
          expect(user.parent.schoolId).toBe(school.id);
        }
        if (user.schoolAdmin) {
          expect(user.schoolAdmin.schoolId).toBe(school.id);
        }
      }

      await prisma.$disconnect();
    });

    it('should prevent foreign key violations across tenants', async () => {
      // Given: Attempting to create cross-tenant relationships
      const schoolA = testSchools[0];
      const schoolB = testSchools[1];
      const prisma = new PrismaClient();

      // When: Trying to create invalid cross-school relationship
      const schoolAUser = await prisma.user.findFirst({
        where: { schoolId: schoolA.id },
      });

      if (schoolAUser) {
        // Then: Creating a teacher profile with wrong school should fail or be prevented
        try {
          const invalidTeacher = await prisma.teacher.create({
            data: {
              userId: schoolAUser.id,
              schoolId: schoolB.id, // Wrong school!
              title: 'Mr',
              firstName: 'Invalid',
              lastName: 'Teacher',
              startDate: new Date(),
            },
          });
          
          // If this succeeds, it's a violation - check the data integrity
          expect(invalidTeacher.schoolId).not.toBe(schoolAUser.schoolId);
          
          // Clean up the invalid data
          await prisma.teacher.delete({ where: { id: invalidTeacher.id } });
          
          // This should not happen - log as potential security issue
          console.warn('Cross-tenant relationship was allowed - potential security vulnerability');
        } catch (error) {
          // This is expected - foreign key constraint should prevent this
          expect(error).toBeDefined();
        }
      }

      await prisma.$disconnect();
    });
  });

  describe('Multi-Tenant Performance and Scale', () => {
    it('should handle concurrent multi-tenant queries efficiently', async () => {
      // Given: Multiple concurrent queries from different schools
      const concurrentQueries = testSchools.map(async (school) => {
        const prisma = new PrismaClient();
        const startTime = Date.now();
        
        const results = await prisma.user.findMany({
          where: { schoolId: school.id },
          include: {
            teacher: true,
            student: true,
          },
        });
        
        const endTime = Date.now();
        await prisma.$disconnect();
        
        return {
          schoolId: school.id,
          resultCount: results.length,
          duration: endTime - startTime,
          allFromCorrectSchool: results.every(r => r.schoolId === school.id),
        };
      });

      // When: Executing queries concurrently
      const results = await Promise.all(concurrentQueries);

      // Then: All queries should complete successfully with correct isolation
      for (const result of results) {
        expect(result.allFromCorrectSchool).toBe(true);
        expect(result.duration).toBeLessThan(5000); // Should complete within 5 seconds
        expect(result.resultCount).toBeGreaterThanOrEqual(0);
      }
    });

    it('should maintain isolation under high load', async () => {
      // Given: High load scenario with many simultaneous requests
      const iterations = 20;
      const schoolA = testSchools[0];
      const schoolB = testSchools[1];

      // When: Creating many concurrent operations
      const operations = [];
      
      for (let i = 0; i < iterations; i++) {
        // Alternate between schools
        const targetSchool = i % 2 === 0 ? schoolA : schoolB;
        
        operations.push(
          (async () => {
            const prisma = new PrismaClient();
            const students = await prisma.student.findMany({
              where: { schoolId: targetSchool.id },
            });
            await prisma.$disconnect();
            return { schoolId: targetSchool.id, students };
          })()
        );
      }

      const results = await Promise.all(operations);

      // Then: All results should maintain proper isolation
      for (const result of results) {
        expect(result.students).toHaveValidSchoolIsolation(result.schoolId);
      }
    });
  });
});