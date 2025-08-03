import { prisma, supabase } from "./client";
import type { 
  User, 
  School, 
  Class, 
  Homework, 
  HomeworkSubmission,
  Streak,
  UserRole,
  YearGroup,
  HomeworkType 
} from "./generated";

/**
 * Database utility functions for StudyStreaks
 */

// ============================================================================
// USER UTILITIES
// ============================================================================

export async function createSchoolUser(data: {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  schoolId: string;
  yearGroup?: YearGroup;
  parentEmail?: string;
  dateOfBirth?: Date;
}) {
  return prisma.user.create({
    data: {
      ...data,
      consentGiven: true,
      parentalConsent: data.dateOfBirth ? calculateAge(data.dateOfBirth) < 16 : false,
    },
  });
}

export async function getUserWithSchool(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      school: true,
      teachingClasses: {
        include: {
          students: {
            include: {
              student: true,
            },
          },
        },
      },
      studentClasses: {
        include: {
          class: {
            include: {
              teacher: true,
            },
          },
        },
      },
    },
  });
}

export async function getUsersByRole(schoolId: string, role: UserRole) {
  return prisma.user.findMany({
    where: {
      schoolId,
      role,
    },
    orderBy: [
      { lastName: "asc" },
      { firstName: "asc" },
    ],
  });
}

// ============================================================================
// CLASS UTILITIES
// ============================================================================

export async function createClassWithStudents(data: {
  name: string;
  yearGroup: YearGroup;
  schoolId: string;
  teacherId: string;
  studentIds: string[];
  maxStudents?: number;
}) {
  const { studentIds, ...classData } = data;
  
  return prisma.$transaction(async (tx) => {
    // Create the class
    const newClass = await tx.class.create({
      data: classData,
    });

    // Add students to the class
    if (studentIds.length > 0) {
      await tx.classStudent.createMany({
        data: studentIds.map((studentId) => ({
          classId: newClass.id,
          studentId,
        })),
      });
    }

    return newClass;
  });
}

export async function getClassWithStudents(classId: string) {
  return prisma.class.findUnique({
    where: { id: classId },
    include: {
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      students: {
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              yearGroup: true,
              avatar: true,
            },
          },
        },
        where: {
          isActive: true,
        },
      },
      school: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function addStudentToClass(classId: string, studentId: string) {
  return prisma.classStudent.create({
    data: {
      classId,
      studentId,
    },
  });
}

export async function removeStudentFromClass(classId: string, studentId: string) {
  return prisma.classStudent.updateMany({
    where: {
      classId,
      studentId,
    },
    data: {
      isActive: false,
    },
  });
}

// ============================================================================
// HOMEWORK UTILITIES
// ============================================================================

export async function createHomeworkAssignment(data: {
  title: string;
  description: string;
  type: HomeworkType;
  dueDate: Date;
  estimatedMinutes: number;
  classId: string;
  teacherId: string;
  schoolId: string;
  instructions?: string;
  maxPoints?: number;
  isOptional?: boolean;
  allowLateSubmission?: boolean;
}) {
  return prisma.homework.create({
    data,
  });
}

export async function getHomeworkWithSubmissions(homeworkId: string) {
  return prisma.homework.findUnique({
    where: { id: homeworkId },
    include: {
      class: {
        include: {
          students: {
            include: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      submissions: {
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
}

export async function submitHomework(data: {
  homeworkId: string;
  studentId: string;
  content: string;
  timeSpentMinutes: number;
  attachments?: any[];
}) {
  const homework = await prisma.homework.findUnique({
    where: { id: data.homeworkId },
  });

  if (!homework) {
    throw new Error("Homework not found");
  }

  const isLate = new Date() > homework.dueDate;

  return prisma.homeworkSubmission.create({
    data: {
      ...data,
      isLate,
      attachments: data.attachments ? JSON.stringify(data.attachments) : null,
    },
  });
}

export async function getStudentHomework(studentId: string, options?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  return prisma.homework.findMany({
    where: {
      class: {
        students: {
          some: {
            studentId,
            isActive: true,
          },
        },
      },
    },
    include: {
      submissions: {
        where: {
          studentId,
        },
      },
      class: {
        select: {
          name: true,
          yearGroup: true,
        },
      },
      teacher: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      dueDate: "asc",
    },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  });
}

// ============================================================================
// STREAK UTILITIES
// ============================================================================

export async function updateStudentStreak(studentId: string, type: string = "HOMEWORK") {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingStreak = await prisma.streak.findUnique({
    where: {
      studentId_type: {
        studentId,
        type: type as any,
      },
    },
  });

  if (!existingStreak) {
    return prisma.streak.create({
      data: {
        studentId,
        type: type as any,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
        streakStartDate: today,
      },
    });
  }

  const lastActivity = existingStreak.lastActivityDate;
  if (!lastActivity) {
    return prisma.streak.update({
      where: {
        id: existingStreak.id,
      },
      data: {
        currentStreak: 1,
        longestStreak: Math.max(1, existingStreak.longestStreak),
        lastActivityDate: today,
        streakStartDate: today,
        status: "ACTIVE",
      },
    });
  }

  const daysDifference = Math.floor(
    (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDifference === 0) {
    // Same day, no change needed
    return existingStreak;
  } else if (daysDifference === 1) {
    // Consecutive day, extend streak
    const newStreak = existingStreak.currentStreak + 1;
    return prisma.streak.update({
      where: {
        id: existingStreak.id,
      },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, existingStreak.longestStreak),
        lastActivityDate: today,
        status: "ACTIVE",
      },
    });
  } else {
    // Streak broken, start new
    return prisma.streak.update({
      where: {
        id: existingStreak.id,
      },
      data: {
        currentStreak: 1,
        lastActivityDate: today,
        streakStartDate: today,
        status: "ACTIVE",
      },
    });
  }
}

export async function getStudentStreaks(studentId: string) {
  return prisma.streak.findMany({
    where: {
      studentId,
    },
    orderBy: {
      currentStreak: "desc",
    },
  });
}

// ============================================================================
// ANALYTICS UTILITIES
// ============================================================================

export async function logAnalyticsEvent(data: {
  event: string;
  userId?: string;
  properties?: Record<string, any>;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  return prisma.analyticsEvent.create({
    data: {
      ...data,
      properties: data.properties ? JSON.stringify(data.properties) : null,
    },
  });
}

export async function getSchoolAnalytics(schoolId: string, options?: {
  startDate?: Date;
  endDate?: Date;
  events?: string[];
}) {
  const whereClause: any = {
    user: {
      schoolId,
    },
  };

  if (options?.startDate || options?.endDate) {
    whereClause.timestamp = {};
    if (options.startDate) whereClause.timestamp.gte = options.startDate;
    if (options.endDate) whereClause.timestamp.lte = options.endDate;
  }

  if (options?.events) {
    whereClause.event = {
      in: options.events,
    };
  }

  return prisma.analyticsEvent.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          role: true,
          yearGroup: true,
        },
      },
    },
    orderBy: {
      timestamp: "desc",
    },
  });
}

// ============================================================================
// AUDIT UTILITIES
// ============================================================================

export async function logAuditEvent(data: {
  event: string;
  userId?: string;
  details?: Record<string, any>;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  return prisma.auditLog.create({
    data: {
      event: data.event as any,
      userId: data.userId,
      details: data.details ? JSON.stringify(data.details) : null,
      entityType: data.entityType,
      entityId: data.entityId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  });
}

// ============================================================================
// SUPABASE UTILITIES
// ============================================================================

export async function subscribeToHomeworkUpdates(
  schoolId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`school-${schoolId}-homework`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "homework",
        filter: `school_id=eq.${schoolId}`,
      },
      callback
    )
    .subscribe();
}

export async function subscribeToStreakUpdates(
  studentId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`student-${studentId}-streaks`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "streaks",
        filter: `student_id=eq.${studentId}`,
      },
      callback
    )
    .subscribe();
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    return age - 1;
  }
  
  return age;
}

export function isGDPRCompliantAge(dateOfBirth: Date): {
  requiresParentalConsent: boolean;
  canGiveDigitalConsent: boolean;
  age: number;
} {
  const age = calculateAge(dateOfBirth);
  
  return {
    requiresParentalConsent: age < 16,
    canGiveDigitalConsent: age >= 13,
    age,
  };
}