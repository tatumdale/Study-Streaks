import { Router } from 'express';
import { z } from 'zod';
import { requirePermission } from '@/middleware/auth';
import { getTenantContext } from '@/middleware/tenant';
import { getUserContext } from '@/middleware/auth';
import { createApiError } from '@/middleware/error-handler';
import { logger } from '@/utils/logger';

const router = Router();

// Validation schemas
const GetStudentsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  yearGroup: z.coerce.number().min(0).max(6).optional(),
  classId: z.string().uuid().optional(),
  search: z.string().optional(),
});

const CreateStudentSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  yearGroup: z.number().min(0).max(6),
  classId: z.string().uuid(),
  parentEmail: z.string().email(),
  dateOfBirth: z.string().datetime(),
  consentGiven: z.boolean(),
});

/**
 * Get students with pagination and filtering
 * GET /api/students
 */
router.get('/', requirePermission('students:read'), async (req, res, next) => {
  try {
    const tenantContext = getTenantContext(res);
    const userContext = getUserContext(res);
    
    // Validate query parameters
    const query = GetStudentsSchema.parse(req.query);
    
    logger.info('Students list requested', {
      schoolId: tenantContext.schoolId,
      userId: userContext.userId,
      filters: query,
    });

    // TODO: Implement actual database query with Prisma
    // const students = await prisma.student.findMany({
    //   where: {
    //     schoolId: tenantContext.schoolId,
    //     ...(query.yearGroup && { yearGroup: query.yearGroup }),
    //     ...(query.classId && { classId: query.classId }),
    //     ...(query.search && {
    //       OR: [
    //         { firstName: { contains: query.search, mode: 'insensitive' } },
    //         { lastName: { contains: query.search, mode: 'insensitive' } },
    //       ]
    //     }),
    //   },
    //   include: {
    //     class: true,
    //     homeworkCompletions: {
    //       take: 1,
    //       orderBy: { completedAt: 'desc' }
    //     },
    //   },
    //   skip: (query.page - 1) * query.limit,
    //   take: query.limit,
    // });

    // Mock response for now
    const mockStudents = [
      {
        id: 'student-001',
        firstName: 'Emma',
        lastName: 'Thompson',
        yearGroup: 3,
        schoolId: tenantContext.schoolId,
        class: {
          id: 'class-001',
          name: '3A',
          yearGroup: 3,
        },
        currentStreak: 5,
        longestStreak: 12,
        lastHomeworkCompleted: '2024-08-02T18:30:00Z',
        createdAt: '2024-01-15T09:00:00Z',
      },
      {
        id: 'student-002', 
        firstName: 'James',
        lastName: 'Wilson',
        yearGroup: 4,
        schoolId: tenantContext.schoolId,
        class: {
          id: 'class-002',
          name: '4B',
          yearGroup: 4,
        },
        currentStreak: 3,
        longestStreak: 8,
        lastHomeworkCompleted: '2024-08-01T19:15:00Z',
        createdAt: '2024-01-15T09:00:00Z',
      },
    ];

    const response = {
      students: mockStudents,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: mockStudents.length,
        totalPages: Math.ceil(mockStudents.length / query.limit),
      },
      tenant: {
        schoolId: tenantContext.schoolId,
        schoolName: tenantContext.schoolName,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * Get student by ID
 * GET /api/students/:id
 */
router.get('/:id', requirePermission('students:read'), async (req, res, next) => {
  try {
    const tenantContext = getTenantContext(res);
    const userContext = getUserContext(res);
    const { id } = req.params;

    logger.info('Student details requested', {
      schoolId: tenantContext.schoolId,
      userId: userContext.userId,
      studentId: id,
    });

    // TODO: Implement actual database query
    // const student = await prisma.student.findFirst({
    //   where: {
    //     id,
    //     schoolId: tenantContext.schoolId,
    //   },
    //   include: {
    //     class: true,
    //     homeworkCompletions: {
    //       orderBy: { completedAt: 'desc' },
    //       take: 10,
    //     },
    //     parentStudents: {
    //       include: { parent: true }
    //     },
    //   },
    // });

    // Mock response
    const mockStudent = {
      id,
      firstName: 'Emma',
      lastName: 'Thompson',
      yearGroup: 3,
      dateOfBirth: '2015-03-15T00:00:00Z',
      schoolId: tenantContext.schoolId,
      class: {
        id: 'class-001',
        name: '3A',
        yearGroup: 3,
        teacherId: 'teacher-001',
      },
      currentStreak: 5,
      longestStreak: 12,
      totalHomeworkCompleted: 47,
      lastHomeworkCompleted: '2024-08-02T18:30:00Z',
      achievements: [
        { id: 'ach-001', name: 'First Week Streak', earnedAt: '2024-01-22T00:00:00Z' },
        { id: 'ach-002', name: 'Month Champion', earnedAt: '2024-02-01T00:00:00Z' },
      ],
      parents: [
        {
          id: 'parent-001',
          firstName: 'Sarah',
          lastName: 'Thompson',
          email: 'sarah.thompson@email.com',
          relationship: 'Mother',
        },
      ],
      gdprConsent: {
        consentGiven: true,
        consentDate: '2024-01-15T09:00:00Z',
        consentGivenBy: 'parent-001',
        dataRetentionUntil: '2031-01-15T09:00:00Z',
      },
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-08-02T18:30:00Z',
    };

    res.json(mockStudent);
  } catch (error) {
    next(error);
  }
});

/**
 * Create new student
 * POST /api/students
 */
router.post('/', requirePermission('students:write'), async (req, res, next) => {
  try {
    const tenantContext = getTenantContext(res);
    const userContext = getUserContext(res);
    
    // Validate request body
    const data = CreateStudentSchema.parse(req.body);
    
    logger.info('Student creation requested', {
      schoolId: tenantContext.schoolId,
      userId: userContext.userId,
      studentData: { ...data, parentEmail: '[REDACTED]' },
    });

    // TODO: Implement actual student creation with Prisma
    // const student = await prisma.student.create({
    //   data: {
    //     ...data,
    //     schoolId: tenantContext.schoolId,
    //     createdById: userContext.userId,
    //     dataRetentionUntil: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000), // 7 years
    //   },
    //   include: {
    //     class: true,
    //   },
    // });

    // Mock response
    const mockStudent = {
      id: 'student-new-001',
      ...data,
      schoolId: tenantContext.schoolId,
      currentStreak: 0,
      longestStreak: 0,
      totalHomeworkCompleted: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.status(201).json(mockStudent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createApiError(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400));
    }
    next(error);
  }
});

export { router as studentsRouter };