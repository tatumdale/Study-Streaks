import { Request, Response, NextFunction } from 'express';
import { createApiError } from './error-handler';
import { logger } from '@/utils/logger';

export interface UserContext {
  userId: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'HEAD_TEACHER' | 'TEACHER' | 'TEACHING_ASSISTANT' | 'PARENT' | 'STUDENT';
  schoolId: string;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Locals {
      userContext?: UserContext;
    }
  }
}

/**
 * Authentication middleware that validates user tokens and extracts user context
 * Integrates with NextAuth.js for token validation
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Skip auth for health check and some public endpoints
    const publicPaths = ['/api/health', '/api/hello'];
    if (publicPaths.includes(req.path)) {
      return next();
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw createApiError('Authorization header required', 401);
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      throw createApiError('Valid token required', 401);
    }

    // TODO: Implement NextAuth.js JWT validation
    // For now, create a mock user context for development
    if (process.env.NODE_ENV === 'development') {
      const mockUserContext: UserContext = {
        userId: 'dev-user-001',
        email: 'developer@studystreaks.local',
        role: 'SCHOOL_ADMIN',
        schoolId: res.locals.tenantContext?.schoolId || 'dev-school-001',
        permissions: [
          'students:read',
          'students:write',
          'clubs:read',
          'clubs:write',
          'achievements:read',
          'achievements:write',
          'analytics:read'
        ]
      };

      res.locals.userContext = mockUserContext;
      
      logger.debug('Mock user context created for development', {
        userId: mockUserContext.userId,
        role: mockUserContext.role,
        schoolId: mockUserContext.schoolId,
      });

      return next();
    }

    // Production JWT validation would go here
    // const decoded = await validateJwtToken(token);
    // const userContext = await loadUserContext(decoded.userId);
    // res.locals.userContext = userContext;

    throw createApiError('Authentication not fully implemented', 501);

  } catch (error) {
    next(error);
  }
};

/**
 * Authorization middleware factory for role-based access control
 */
export const requireRole = (allowedRoles: UserContext['role'][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userContext = res.locals.userContext;

    if (!userContext) {
      return next(createApiError('User context not found', 401));
    }

    if (!allowedRoles.includes(userContext.role)) {
      return next(createApiError('Insufficient permissions', 403));
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userContext = res.locals.userContext;

    if (!userContext) {
      return next(createApiError('User context not found', 401));
    }

    if (!userContext.permissions.includes(permission)) {
      return next(createApiError(`Permission required: ${permission}`, 403));
    }

    next();
  };
};

/**
 * Helper function to get user context from response locals
 */
export const getUserContext = (res: Response): UserContext => {
  if (!res.locals.userContext) {
    throw createApiError('User context not found', 500);
  }
  return res.locals.userContext;
};