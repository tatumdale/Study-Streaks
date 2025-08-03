/**
 * Database Setup for Testing
 * Handles test database initialization, seeding, and cleanup
 */

import { PrismaClient } from '@study-streaks/database';
import { createTestSchool, createTestUser, createTestStudent, createTestTeacher } from '../helpers/factories';

let testPrisma: PrismaClient | null = null;

/**
 * Get test database client instance
 */
export function getTestDatabase(): PrismaClient {
  if (!testPrisma) {
    testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.TEST_VERBOSE === 'true' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }
  return testPrisma;
}

/**
 * Setup test database before all tests
 */
export async function setupTestDatabase(): Promise<void> {
  const prisma = getTestDatabase();
  
  try {
    // Connect to database
    await prisma.$connect();
    
    // Clean existing test data
    await cleanupTestData();
    
    // Seed basic test data
    await seedBasicTestData();
    
    console.log('Test database setup completed');
  } catch (error) {
    console.error('Test database setup failed:', error);
    throw error;
  }
}

/**
 * Cleanup test database after all tests
 */
export async function cleanupTestDatabase(): Promise<void> {
  if (!testPrisma) return;
  
  try {
    await cleanupTestData();
    await testPrisma.$disconnect();
    testPrisma = null;
    console.log('Test database cleanup completed');
  } catch (error) {
    console.error('Test database cleanup failed:', error);
    throw error;
  }
}

/**
 * Clean all test data from database
 */
export async function cleanupTestData(): Promise<void> {
  const prisma = getTestDatabase();
  
  // Delete in order to respect foreign key constraints
  const deleteQueries = [
    // Clean up completion and tracking data
    prisma.homeworkCompletion.deleteMany(),
    
    // Clean up relationships
    prisma.parentStudent.deleteMany(),
    prisma.teacherClass.deleteMany(),
    prisma.userRole.deleteMany(),
    
    // Clean up user profiles
    prisma.student.deleteMany(),
    prisma.teacher.deleteMany(),
    prisma.parent.deleteMany(),
    prisma.schoolAdmin.deleteMany(),
    
    // Clean up school entities
    prisma.club.deleteMany(),
    prisma.class.deleteMany(),
    
    // Clean up auth data
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.user.deleteMany(),
    
    // Clean up core entities
    prisma.school.deleteMany(),
    
    // Clean up RBAC data
    prisma.rolePermission.deleteMany(),
    prisma.role.deleteMany(),
    prisma.permission.deleteMany(),
  ];
  
  // Execute deletes in transaction
  await prisma.$transaction(deleteQueries);
}

/**
 * Seed basic test data for most tests
 */
export async function seedBasicTestData(): Promise<void> {
  const prisma = getTestDatabase();
  
  // Create basic permissions
  await seedBasicPermissions();
  
  // Create basic roles
  await seedBasicRoles();
  
  // Create test schools
  const testSchool1 = await createTestSchool({
    id: 'test-school-1',
    name: 'Test Primary School',
    urn: 'TEST001',
    email: 'admin@testschool1.ac.uk',
  });
  
  const testSchool2 = await createTestSchool({
    id: 'test-school-2',
    name: 'Another Test School',
    urn: 'TEST002',
    email: 'admin@testschool2.ac.uk',
  });
  
  // Create test users for each school
  await createBasicTestUsers(testSchool1.id);
  await createBasicTestUsers(testSchool2.id);
}

/**
 * Seed basic permissions for testing
 */
async function seedBasicPermissions(): Promise<void> {
  const prisma = getTestDatabase();
  
  const permissions = [
    // Student permissions
    { name: 'view_own_homework', resource: 'homework', action: 'read', scope: 'own', category: 'ACADEMIC' },
    { name: 'submit_homework', resource: 'homework', action: 'create', scope: 'own', category: 'ACADEMIC' },
    { name: 'view_own_progress', resource: 'progress', action: 'read', scope: 'own', category: 'ACADEMIC' },
    
    // Teacher permissions
    { name: 'view_class_students', resource: 'students', action: 'read', scope: 'class', category: 'ACADEMIC' },
    { name: 'manage_class_homework', resource: 'homework', action: 'manage', scope: 'class', category: 'ACADEMIC' },
    { name: 'view_class_progress', resource: 'progress', action: 'read', scope: 'class', category: 'ACADEMIC' },
    
    // Parent permissions
    { name: 'view_child_homework', resource: 'homework', action: 'read', scope: 'child', category: 'ACADEMIC' },
    { name: 'view_child_progress', resource: 'progress', action: 'read', scope: 'child', category: 'ACADEMIC' },
    
    // Admin permissions
    { name: 'manage_school_users', resource: 'users', action: 'manage', scope: 'school', category: 'USER_MANAGEMENT', riskLevel: 'HIGH' },
    { name: 'view_school_analytics', resource: 'analytics', action: 'read', scope: 'school', category: 'DATA_ACCESS' },
    { name: 'export_school_data', resource: 'data', action: 'export', scope: 'school', category: 'DATA_ACCESS', riskLevel: 'CRITICAL' },
  ];
  
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { 
        resource_action_scope: {
          resource: permission.resource,
          action: permission.action,
          scope: permission.scope,
        }
      },
      update: {},
      create: permission,
    });
  }
}

/**
 * Seed basic roles for testing
 */
async function seedBasicRoles(): Promise<void> {
  const prisma = getTestDatabase();
  
  const roles = [
    { name: 'Student', scope: 'INDIVIDUAL', isDefault: true, applicableUserTypes: ['STUDENT'] },
    { name: 'Teacher', scope: 'CLASS', isDefault: true, applicableUserTypes: ['TEACHER'] },
    { name: 'Parent', scope: 'INDIVIDUAL', isDefault: true, applicableUserTypes: ['PARENT'] },
    { name: 'School Admin', scope: 'SCHOOL', isDefault: true, applicableUserTypes: ['SCHOOL_ADMIN'] },
  ];
  
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
}

/**
 * Create basic test users for a school
 */
async function createBasicTestUsers(schoolId: string): Promise<void> {
  // Create test teacher
  const teacherUser = await createTestUser({
    email: `teacher@${schoolId.replace('test-school-', 'testschool')}.ac.uk`,
    schoolId,
  });
  
  await createTestTeacher({
    userId: teacherUser.id,
    schoolId,
    firstName: 'Test',
    lastName: 'Teacher',
    title: 'Mrs',
  });
  
  // Create test student (without user account for privacy)
  await createTestStudent({
    schoolId,
    firstName: 'Test',
    lastName: 'Student',
    yearGroup: 5,
  });
}

/**
 * Create multi-tenant test data for isolation testing
 */
export async function seedMultiTenantTestData(): Promise<{
  school1: any;
  school2: any;
  school1Users: any[];
  school2Users: any[];
}> {
  const prisma = getTestDatabase();
  
  // Clean existing data first
  await cleanupTestData();
  await seedBasicTestData();
  
  const school1 = await prisma.school.findUnique({ where: { id: 'test-school-1' } });
  const school2 = await prisma.school.findUnique({ where: { id: 'test-school-2' } });
  
  if (!school1 || !school2) {
    throw new Error('Test schools not found');
  }
  
  // Create additional users for each school
  const school1Users = [];
  const school2Users = [];
  
  for (let i = 0; i < 5; i++) {
    // School 1 users
    const user1 = await createTestUser({
      email: `user${i}@testschool1.ac.uk`,
      schoolId: school1.id,
    });
    school1Users.push(user1);
    
    // School 2 users
    const user2 = await createTestUser({
      email: `user${i}@testschool2.ac.uk`,
      schoolId: school2.id,
    });
    school2Users.push(user2);
  }
  
  return {
    school1,
    school2,
    school1Users,
    school2Users,
  };
}

/**
 * Create GDPR test data for compliance testing
 */
export async function seedGDPRTestData(): Promise<{
  student: any;
  personalData: any[];
}> {
  const prisma = getTestDatabase();
  
  // Create comprehensive student data
  const student = await createTestStudent({
    firstName: 'GDPR',
    lastName: 'TestStudent',
    yearGroup: 4,
    dateOfBirth: new Date('2015-05-15'),
    consentGiven: true,
    consentDate: new Date(),
  });
  
  // Create various types of personal data
  const personalData = [];
  
  // Create homework completions
  for (let i = 0; i < 10; i++) {
    const completion = await prisma.homeworkCompletion.create({
      data: {
        studentId: student.id,
        schoolId: student.schoolId,
        completionDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        evidenceType: 'COMPLETION_MARK',
        isVerified: true,
      },
    });
    personalData.push(completion);
  }
  
  return {
    student,
    personalData,
  };
}

/**
 * Reset database to clean state for individual tests
 */
export async function resetTestDatabase(): Promise<void> {
  await cleanupTestData();
  await seedBasicTestData();
}