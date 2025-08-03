import { Router } from 'express';
import { z } from 'zod';
import { requirePermission } from '@/middleware/auth';
import { getTenantContext } from '@/middleware/tenant';
import { getUserContext } from '@/middleware/auth';
import { createApiError } from '@/middleware/error-handler';
import { logger } from '@/utils/logger';

const router = Router();

// Validation schemas
const GetAchievementsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  category: z.enum(['streak', 'homework', 'club', 'special']).optional(),
  active: z.coerce.boolean().optional(),
});

const CreateAchievementSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  category: z.enum(['streak', 'homework', 'club', 'special']),
  criteria: z.object({
    type: z.enum(['streak_days', 'homework_count', 'club_participation', 'custom']),
    value: z.number().min(1),
    timeframe: z.enum(['day', 'week', 'month', 'term', 'year', 'all_time']).optional(),
  }),
  reward: z.object({
    type: z.enum(['badge', 'certificate', 'points', 'prize']),
    value: z.string(),
    description: z.string().optional(),
  }),
  yearGroups: z.array(z.number().min(0).max(6)).optional(),
  isActive: z.boolean().default(true),
});

/**
 * Get achievements with pagination and filtering
 * GET /api/achievements
 */
router.get('/', requirePermission('achievements:read'), async (req, res, next) => {
  try {
    const tenantContext = getTenantContext(res);
    const userContext = getUserContext(res);
    
    // Validate query parameters
    const query = GetAchievementsSchema.parse(req.query);
    
    logger.info('Achievements list requested', {
      schoolId: tenantContext.schoolId,
      userId: userContext.userId,
      filters: query,
    });

    // TODO: Implement actual database query with Prisma
    // const achievements = await prisma.achievement.findMany({
    //   where: {
    //     schoolId: tenantContext.schoolId,
    //     ...(query.category && { category: query.category }),
    //     ...(query.active !== undefined && { isActive: query.active }),
    //   },
    //   include: {
    //     _count: {
    //       select: { studentAchievements: true }
    //     },
    //   },
    //   skip: (query.page - 1) * query.limit,
    //   take: query.limit,
    // });

    // Mock response for now
    const mockAchievements = [
      {
        id: 'ach-001',
        name: 'First Week Streak',
        description: 'Complete homework for 7 consecutive days',
        category: 'streak',
        criteria: {
          type: 'streak_days',
          value: 7,
          timeframe: 'all_time',
        },
        reward: {
          type: 'badge',
          value: 'week-warrior-badge',
          description: 'Digital badge showing a seven-day calendar',
        },
        yearGroups: [1, 2, 3, 4, 5, 6],
        isActive: true,
        timesEarned: 45,
        schoolId: tenantContext.schoolId,
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z',
      },
      {
        id: 'ach-002',
        name: 'Month Champion',
        description: 'Complete homework every school day for a full month',
        category: 'homework',
        criteria: {
          type: 'homework_count',
          value: 20,
          timeframe: 'month',
        },
        reward: {
          type: 'certificate',
          value: 'month-champion-certificate',
          description: 'Printable certificate of achievement',
        },
        yearGroups: [3, 4, 5, 6],
        isActive: true,
        timesEarned: 12,
        schoolId: tenantContext.schoolId,
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-02-01T09:00:00Z',
      },
      {
        id: 'ach-003',
        name: 'Club Star',
        description: 'Attend 90% of club meetings in a term',
        category: 'club',
        criteria: {
          type: 'club_participation',
          value: 90,
          timeframe: 'term',
        },
        reward: {
          type: 'points',
          value: '50',
          description: '50 house points towards your team',
        },
        yearGroups: [3, 4, 5, 6],
        isActive: true,
        timesEarned: 28,
        schoolId: tenantContext.schoolId,
        createdAt: '2024-01-20T09:00:00Z',
        updatedAt: '2024-01-20T09:00:00Z',
      },
    ];

    const response = {
      achievements: mockAchievements,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: mockAchievements.length,
        totalPages: Math.ceil(mockAchievements.length / query.limit),
      },
      tenant: {
        schoolId: tenantContext.schoolId,
        schoolName: tenantContext.schoolName,
      },
      statistics: {
        totalAchievements: mockAchievements.length,
        activeAchievements: mockAchievements.filter(a => a.isActive).length,
        totalTimesEarned: mockAchievements.reduce((sum, a) => sum + a.timesEarned, 0),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * Get achievement by ID
 * GET /api/achievements/:id
 */
router.get('/:id', requirePermission('achievements:read'), async (req, res, next) => {
  try {
    const tenantContext = getTenantContext(res);
    const userContext = getUserContext(res);
    const { id } = req.params;

    logger.info('Achievement details requested', {
      schoolId: tenantContext.schoolId,
      userId: userContext.userId,
      achievementId: id,
    });

    // TODO: Implement actual database query
    // const achievement = await prisma.achievement.findFirst({
    //   where: {
    //     id,
    //     schoolId: tenantContext.schoolId,
    //   },
    //   include: {
    //     studentAchievements: {
    //       include: {
    //         student: {
    //           select: { firstName: true, lastName: true, yearGroup: true }
    //         }
    //       },
    //       orderBy: { earnedAt: 'desc' },
    //       take: 20,
    //     },
    //   },
    // });

    // Mock response
    const mockAchievement = {
      id,
      name: 'First Week Streak',
      description: 'Complete homework for 7 consecutive days',
      category: 'streak',
      criteria: {
        type: 'streak_days',
        value: 7,
        timeframe: 'all_time',
      },
      reward: {
        type: 'badge',
        value: 'week-warrior-badge',
        description: 'Digital badge showing a seven-day calendar',
      },
      yearGroups: [1, 2, 3, 4, 5, 6],
      isActive: true,
      schoolId: tenantContext.schoolId,
      recentEarners: [
        {
          studentId: 'student-001',
          firstName: 'Emma',
          lastName: 'Thompson',
          yearGroup: 3,
          earnedAt: '2024-08-01T18:30:00Z',
        },
        {
          studentId: 'student-002',
          firstName: 'James',
          lastName: 'Wilson',
          yearGroup: 4,
          earnedAt: '2024-07-28T19:15:00Z',
        },
        {
          studentId: 'student-003',
          firstName: 'Oliver',
          lastName: 'Davis',
          yearGroup: 3,
          earnedAt: '2024-07-25T17:45:00Z',
        },
      ],
      statistics: {
        timesEarned: 45,
        averageTimeToEarn: 8.2, // days
        popularYearGroup: 3,
        firstEarned: '2024-01-22T00:00:00Z',
        lastEarned: '2024-08-01T18:30:00Z',
      },
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z',
    };

    res.json(mockAchievement);
  } catch (error) {
    next(error);
  }
});

/**
 * Create new achievement
 * POST /api/achievements
 */
router.post('/', requirePermission('achievements:write'), async (req, res, next) => {
  try {
    const tenantContext = getTenantContext(res);
    const userContext = getUserContext(res);
    
    // Validate request body
    const data = CreateAchievementSchema.parse(req.body);
    
    logger.info('Achievement creation requested', {
      schoolId: tenantContext.schoolId,
      userId: userContext.userId,
      achievementData: data,
    });

    // TODO: Implement actual achievement creation with Prisma
    // const achievement = await prisma.achievement.create({
    //   data: {
    //     ...data,
    //     schoolId: tenantContext.schoolId,
    //     createdById: userContext.userId,
    //   },
    // });

    // Mock response
    const mockAchievement = {
      id: 'ach-new-001',
      ...data,
      schoolId: tenantContext.schoolId,
      timesEarned: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    res.status(201).json(mockAchievement);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(createApiError(`Validation error: ${error.errors.map(e => e.message).join(', ')}`, 400));
    }
    next(error);
  }
});

/**
 * Get student achievements
 * GET /api/achievements/student/:studentId
 */
router.get('/student/:studentId', requirePermission('achievements:read'), async (req, res, next) => {
  try {
    const tenantContext = getTenantContext(res);
    const userContext = getUserContext(res);
    const { studentId } = req.params;

    logger.info('Student achievements requested', {
      schoolId: tenantContext.schoolId,
      userId: userContext.userId,
      studentId,
    });

    // TODO: Implement actual database query
    // const studentAchievements = await prisma.studentAchievement.findMany({
    //   where: {
    //     studentId,
    //     student: {
    //       schoolId: tenantContext.schoolId,
    //     },
    //   },
    //   include: {
    //     achievement: true,
    //   },
    //   orderBy: { earnedAt: 'desc' },
    // });

    // Mock response
    const mockStudentAchievements = {
      studentId,
      student: {
        firstName: 'Emma',
        lastName: 'Thompson',
        yearGroup: 3,
      },
      achievements: [
        {
          id: 'ach-001',
          name: 'First Week Streak',
          category: 'streak',
          earnedAt: '2024-01-22T18:30:00Z',
          reward: {
            type: 'badge',
            value: 'week-warrior-badge',
          },
        },
        {
          id: 'ach-002',
          name: 'Month Champion',
          category: 'homework',
          earnedAt: '2024-02-01T19:15:00Z',
          reward: {
            type: 'certificate',
            value: 'month-champion-certificate',
          },
        },
      ],
      statistics: {
        totalAchievements: 2,
        streakAchievements: 1,
        homeworkAchievements: 1,
        clubAchievements: 0,
        specialAchievements: 0,
        latestAchievement: '2024-02-01T19:15:00Z',
      },
    };

    res.json(mockStudentAchievements);
  } catch (error) {
    next(error);
  }
});

export { router as achievementsRouter };