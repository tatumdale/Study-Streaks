import { http, HttpResponse } from 'msw';
import { createTestAuthToken, createTestStudent, createTestHomeworkCompletion } from '../helpers/factories';

/**
 * Mock Service Worker handlers for StudyStreaks API
 * Provides realistic API responses for testing
 */

export const handlers = [
  // Authentication endpoints
  http.post('/api/auth/signin', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    // Mock successful authentication
    if (body.email === 'teacher@testschool.ac.uk' && body.password === 'password123') {
      const token = createTestAuthToken({ 
        userType: 'teacher',
        email: body.email 
      });
      
      return HttpResponse.json({
        user: token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    
    if (body.email === 'student@testschool.ac.uk' && body.password === 'password123') {
      const token = createTestAuthToken({ 
        userType: 'student',
        email: body.email 
      });
      
      return HttpResponse.json({
        user: token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    
    if (body.email === 'parent@testschool.ac.uk' && body.password === 'password123') {
      const token = createTestAuthToken({ 
        userType: 'parent',
        email: body.email 
      });
      
      return HttpResponse.json({
        user: token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    
    if (body.email === 'admin@testschool.ac.uk' && body.password === 'password123') {
      const token = createTestAuthToken({ 
        userType: 'schoolAdmin',
        email: body.email 
      });
      
      return HttpResponse.json({
        user: token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    
    // Mock authentication failure
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post('/api/auth/signout', () => {
    return HttpResponse.json({ success: true });
  }),

  // Session endpoint
  http.get('/api/auth/session', ({ request }) => {
    const authHeader = request.headers.get('authorization');
    
    if (authHeader?.includes('Bearer mock-jwt-token')) {
      const token = createTestAuthToken();
      
      return HttpResponse.json({
        user: token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    
    return HttpResponse.json(null);
  }),

  // Student endpoints
  http.get('/api/students', ({ request }) => {
    const url = new URL(request.url);
    const schoolId = request.headers.get('X-School-ID');
    
    if (!schoolId) {
      return HttpResponse.json(
        { error: 'School ID required' },
        { status: 403 }
      );
    }
    
    const students = Array.from({ length: 10 }, () => 
      createTestStudent({ schoolId })
    );
    
    return HttpResponse.json({ students });
  }),

  http.get('/api/students/:id', ({ params, request }) => {
    const schoolId = request.headers.get('X-School-ID');
    const studentId = params.id as string;
    
    if (!schoolId) {
      return HttpResponse.json(
        { error: 'School ID required' },
        { status: 403 }
      );
    }
    
    const student = createTestStudent({ 
      id: studentId,
      schoolId 
    });
    
    return HttpResponse.json({ student });
  }),

  // Homework completion endpoints
  http.post('/api/homework/complete', async ({ request }) => {
    const schoolId = request.headers.get('X-School-ID');
    const userId = request.headers.get('X-User-ID');
    
    if (!schoolId || !userId) {
      return HttpResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json() as {
      clubId: string;
      evidenceType: string;
      evidenceUrl?: string;
      notes?: string;
      timeSpentMinutes?: number;
    };
    
    const completion = createTestHomeworkCompletion({
      schoolId,
      studentId: userId,
      clubId: body.clubId,
      evidenceType: body.evidenceType,
      evidenceUrl: body.evidenceUrl,
      notes: body.notes,
      timeSpentMinutes: body.timeSpentMinutes,
    });
    
    return HttpResponse.json(
      { 
        completion,
        streak: {
          currentStreak: 1,
          longestStreak: 5,
          lastCompletionDate: completion.completionDate
        }
      },
      { status: 201 }
    );
  }),

  http.get('/api/homework/completions', ({ request }) => {
    const url = new URL(request.url);
    const schoolId = request.headers.get('X-School-ID');
    const studentId = url.searchParams.get('studentId');
    
    if (!schoolId) {
      return HttpResponse.json(
        { error: 'School ID required' },
        { status: 403 }
      );
    }
    
    const completions = Array.from({ length: 15 }, () => 
      createTestHomeworkCompletion({ 
        schoolId,
        studentId: studentId || undefined
      })
    );
    
    return HttpResponse.json({ completions });
  }),

  // Dashboard endpoints
  http.get('/api/dashboard/stats', ({ request }) => {
    const schoolId = request.headers.get('X-School-ID');
    const userType = request.headers.get('X-User-Type');
    
    if (!schoolId) {
      return HttpResponse.json(
        { error: 'School ID required' },
        { status: 403 }
      );
    }
    
    const baseStats = {
      totalStudents: 150,
      activeClubs: 8,
      totalCompletions: 1250,
      averageStreak: 3.2,
    };
    
    switch (userType) {
      case 'teacher':
        return HttpResponse.json({
          ...baseStats,
          myClasses: 2,
          myStudents: 28,
          pendingVerifications: 5,
        });
      
      case 'student':
        return HttpResponse.json({
          currentStreak: 7,
          longestStreak: 15,
          totalCompletions: 42,
          clubsJoined: 3,
          rank: 15,
          nextAchievement: '10 Day Streak',
        });
      
      case 'parent':
        return HttpResponse.json({
          children: [
            {
              id: 'student-1',
              name: 'Test Child',
              currentStreak: 5,
              totalCompletions: 23,
              rank: 8,
            }
          ],
        });
      
      case 'schoolAdmin':
        return HttpResponse.json({
          ...baseStats,
          totalTeachers: 12,
          totalParents: 95,
          systemHealth: 'good',
          recentActivity: 'high',
        });
      
      default:
        return HttpResponse.json(baseStats);
    }
  }),

  // Leaderboard endpoint
  http.get('/api/leaderboard', ({ request }) => {
    const url = new URL(request.url);
    const schoolId = request.headers.get('X-School-ID');
    const classId = url.searchParams.get('classId');
    const yearGroup = url.searchParams.get('yearGroup');
    
    if (!schoolId) {
      return HttpResponse.json(
        { error: 'School ID required' },
        { status: 403 }
      );
    }
    
    const leaderboard = Array.from({ length: 10 }, (_, i) => ({
      rank: i + 1,
      studentId: `student-${i + 1}`,
      studentName: `Student ${i + 1}`,
      currentStreak: Math.max(1, 15 - i),
      totalCompletions: Math.max(1, 50 - i * 3),
      points: Math.max(1, 500 - i * 25),
    }));
    
    return HttpResponse.json({ leaderboard });
  }),

  // Multi-tenant security test endpoints
  http.get('/api/security/cross-tenant-test', ({ request }) => {
    const requestedSchoolId = new URL(request.url).searchParams.get('schoolId');
    const userSchoolId = request.headers.get('X-School-ID');
    
    // This should fail if requesting different school data
    if (requestedSchoolId && requestedSchoolId !== userSchoolId) {
      return HttpResponse.json(
        { error: 'Access denied: Cross-tenant access not allowed' },
        { status: 403 }
      );
    }
    
    return HttpResponse.json({ 
      message: 'Access granted',
      schoolId: userSchoolId 
    });
  }),

  // GDPR compliance test endpoints
  http.delete('/api/gdpr/student/:studentId', ({ params, request }) => {
    const schoolId = request.headers.get('X-School-ID');
    const studentId = params.studentId as string;
    
    if (!schoolId) {
      return HttpResponse.json(
        { error: 'School ID required' },
        { status: 403 }
      );
    }
    
    // Mock GDPR deletion process
    return HttpResponse.json({
      message: 'Student data deletion completed',
      studentId,
      deletedRecords: {
        student: 1,
        homeworkCompletions: 25,
        streaks: 8,
        achievements: 5,
        auditLogs: 15,
      },
      retainedRecords: {
        anonymizedStats: 1,
      },
    });
  }),

  http.get('/api/gdpr/audit/:studentId', ({ params, request }) => {
    const schoolId = request.headers.get('X-School-ID');
    const studentId = params.studentId as string;
    
    if (!schoolId) {
      return HttpResponse.json(
        { error: 'School ID required' },
        { status: 403 }
      );
    }
    
    return HttpResponse.json({
      studentId,
      dataReferences: {
        students: 1,
        homeworkCompletions: 25,
        streaks: 8,
        achievements: 5,
        parentStudents: 2,
        auditLogs: 15,
      },
      totalRecords: 56,
      lastAuditDate: new Date().toISOString(),
    });
  }),

  // Error simulation endpoints for testing
  http.get('/api/test/server-error', () => {
    return HttpResponse.json(
      { error: 'Internal server error for testing' },
      { status: 500 }
    );
  }),

  http.get('/api/test/unauthorized', () => {
    return HttpResponse.json(
      { error: 'Unauthorized access' },
      { status: 401 }
    );
  }),

  http.get('/api/test/forbidden', () => {
    return HttpResponse.json(
      { error: 'Forbidden access' },
      { status: 403 }
    );
  }),

  // Fallback for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return HttpResponse.json(
      { error: `Unhandled request: ${request.method} ${request.url}` },
      { status: 404 }
    );
  }),
];