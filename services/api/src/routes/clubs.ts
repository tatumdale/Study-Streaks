import { Router } from 'express';
import { z } from 'zod';
import { requirePermission } from '@/middleware/auth';
import { getTenantContext } from '@/middleware/tenant';
import { getUserContext } from '@/middleware/auth';
import { createApiError } from '@/middleware/error-handler';
import { logger } from '@/utils/logger';

const router = Router();

// Validation schemas
const GetClubsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  active: z.coerce.boolean().optional(),
  teacherId: z.string().uuid().optional(),
});

const CreateClubSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  teacherId: z.string().uuid(),
  yearGroups: z.array(z.number().min(0).max(6)),
  maxMembers: z.number().min(1).max(100).default(30),
  meetingDays: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'])),
  meetingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
});

/**
 * Get clubs with pagination and filtering
 * GET /api/clubs
 */
router.get('/', requirePermission('clubs:read'), async (req, res, next) => {
  try {
    const tenantContext = getTenantContext(res);
    const userContext = getUserContext(res);
    
    // Validate query parameters
    const query = GetClubsSchema.parse(req.query);
    
    logger.info('Clubs list requested', {
      schoolId: tenantContext.schoolId,
      userId: userContext.userId,
      filters: query,
    });

    // TODO: Implement actual database query with Prisma
    // const clubs = await prisma.club.findMany({
    //   where: {
    //     schoolId: tenantContext.schoolId,
    //     ...(query.active !== undefined && { isActive: query.active }),
    //     ...(query.teacherId && { teacherId: query.teacherId }),
    //   },
    //   include: {
    //     teacher: {
    //       select: { firstName: true, lastName: true, email: true }
    //     },
    //     _count: {
    //       select: { students: true }
    //     },
    //   },
    //   skip: (query.page - 1) * query.limit,
    //   take: query.limit,
    // });

    // Mock response for now
    const mockClubs = [
      {
        id: 'club-001',
        name: 'Homework Heroes',
        description: 'Daily homework completion club for Year 3 students',
        teacherId: 'teacher-001',
        teacher: {
          firstName: 'Ms.',
          lastName: 'Johnson',
          email: 'ms.johnson@school.edu',
        },
        yearGroups: [3],
        maxMembers: 25,
        currentMembers: 18,
        meetingDays: ['monday', 'wednesday', 'friday'],
        meetingTime: '15:30',
        isActive: true,
        totalStreaks: 156,
        averageStreak: 8.7,
        schoolId: tenantContext.schoolId,
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-08-02T14:30:00Z',
      },
      {
        id: 'club-002',
        name: 'Study Streakers',
        description: 'Multi-year group homework motivation club',
        teacherId: 'teacher-002',
        teacher: {
          firstName: 'Mr.',
          lastName: 'Smith',
          email: 'mr.smith@school.edu',
        },
        yearGroups: [4, 5, 6],
        maxMembers: 30,
        currentMembers: 22,
        meetingDays: ['tuesday', 'thursday'],
        meetingTime: '16:00',
        isActive: true,
        totalStreaks: 203,
        averageStreak: 9.2,
        schoolId: tenantContext.schoolId,
        createdAt: '2024-02-01T09:00:00Z',
        updatedAt: '2024-08-01T16:45:00Z',
      },
    ];

    const response = {
      clubs: mockClubs,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: mockClubs.length,
        totalPages: Math.ceil(mockClubs.length / query.limit),
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
 * Get club by ID with member details
 * GET /api/clubs/:id
 */
router.get('/:id', requirePermission('clubs:read'), async (req, res, next) => {
  try {
    const tenantContext = getTenantContext(res);
    const userContext = getUserContext(res);
    const { id } = req.params;

    logger.info('Club details requested', {
      schoolId: tenantContext.schoolId,
      userId: userContext.userId,
      clubId: id,
    });

    // TODO: Implement actual database query
    // const club = await prisma.club.findFirst({
    //   where: {
    //     id,
    //     schoolId: tenantContext.schoolId,
    //   },
    //   include: {
    //     teacher: true,
    //     students: {
    //       include: {
    //         student: {
    //           select: {
    //             firstName: true,
    //             lastName: true,
    //             yearGroup: true,
    //             currentStreak: true,
    //           }
    //         }
    //       }
    //     },
    //     clubAchievements: true,
    //   },
    // });

    // Mock response
    const mockClub = {
      id,
      name: 'Homework Heroes',
      description: 'Daily homework completion club for Year 3 students',
      teacherId: 'teacher-001',
      teacher: {
        id: 'teacher-001',
        firstName: 'Ms.',
        lastName: 'Johnson',
        email: 'ms.johnson@school.edu',
      },
      yearGroups: [3],
      maxMembers: 25,
      meetingDays: ['monday', 'wednesday', 'friday'],
      meetingTime: '15:30',
      isActive: true,
      schoolId: tenantContext.schoolId,
      members: [
        {
          id: 'student-001',
          firstName: 'Emma',
          lastName: 'Thompson',
          yearGroup: 3,
          currentStreak: 5,
          joinedAt: '2024-01-20T09:00:00Z',
          totalHomeworkInClub: 47,
        },
        {
          id: 'student-003',
          firstName: 'Oliver',
          lastName: 'Davis',
          yearGroup: 3,
          currentStreak: 12,
          joinedAt: '2024-01-22T09:00:00Z',
          totalHomeworkInClub: 51,
        },
      ],
      statistics: {
        totalMembers: 18,
        averageStreak: 8.7,
        totalHomeworkCompleted: 842,
        topStreak: 15,
        clubCreatedDays: 202,
      },
      achievements: [
        {
          id: 'club-ach-001',
          name: 'First Month Complete',
          description: 'All members completed homework for a full month',
          earnedAt: '2024-02-15T00:00:00Z',
        },
        {
          id: 'club-ach-002',
          name: 'Streak Champions',
          description: 'Club average streak exceeded 5 days',
          earnedAt: '2024-03-01T00:00:00Z',
        },
      ],
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-08-02T14:30:00Z',
    };

    res.json(mockClub);
  } catch (error) {
    next(error);
  }
});

/**
 * Create new club
 * POST /api/clubs
 */
router.post('/', requirePermission('clubs:write'), async (req, res, next) => {
  try {
    const tenantContext = getTenantContext(res);
    const userContext = getUserContext(res);
    
    // Validate request body
    const data = CreateClubSchema.parse(req.body);
    
    logger.info('Club creation requested', {
      schoolId: tenantContext.schoolId,
      userId: userContext.userId,
      clubData: data,
    });

    // TODO: Implement actual club creation with Prisma
    // const club = await prisma.club.create({
    //   data: {
    //     ...data,
    //     schoolId: tenantContext.schoolId,
    //     createdById: userContext.userId,
    //     isActive: true,
    //   },
    //   include: {
    //     teacher: {
    //       select: { firstName: true, lastName: true, email: true }
    //     },
    //   },
    // });

    // Mock response
    const mockClub = {
      id: 'club-new-001',
      ...data,
      schoolId: tenantContext.schoolId,
      isActive: true,
      currentMembers: 0,
      totalStreaks: 0,
      averageStreak: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.status(201).json(mockClub);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createApiError(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400));
    }
    next(error);
  }
});

/**
 * Add student to club
 * POST /api/clubs/:id/members
 */
router.post('/:id/members', requirePermission('clubs:write'), async (req, res, next) => {
  try {
    const tenantContext = getTenantContext(res);
    const userContext = getUserContext(res);
    const { id: clubId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      throw createApiError('Student ID is required', 400);
    }

    logger.info('Club member addition requested', {
      schoolId: tenantContext.schoolId,
      userId: userContext.userId,
      clubId,
      studentId,
    });

    // TODO: Implement actual club membership with Prisma
    // const membership = await prisma.clubMembership.create({
    //   data: {
    //     clubId,
    //     studentId,
    //     joinedAt: new Date(),
    //   },
    //   include: {
    //     student: {
    //       select: { firstName: true, lastName: true, yearGroup: true }
    //     },
    //     club: {
    //       select: { name: true, maxMembers: true }
    //     }
    //   },
    // });

    // Mock response
    const mockMembership = {
      clubId,
      studentId,
      joinedAt: new Date().toISOString(),
      student: {
        firstName: 'New',
        lastName: 'Student',
        yearGroup: 3,
      },
      club: {
        name: 'Homework Heroes',
        maxMembers: 25,
      },
    };

    res.status(201).json(mockMembership);
  } catch (error) {
    next(error);
  }
});

export { router as clubsRouter };