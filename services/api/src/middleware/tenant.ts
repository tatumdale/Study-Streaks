import { Request, Response, NextFunction } from 'express';
import { createApiError } from './error-handler';
import { logger } from '@/utils/logger';

export interface TenantContext {
  schoolId: string;
  schoolName?: string;
  domain?: string;
  settings?: Record<string, any>;
}

declare global {
  namespace Express {
    interface Locals {
      tenantContext?: TenantContext;
    }
  }
}

/**
 * Multi-tenant middleware that extracts and validates tenant context
 * from various sources (headers, subdomain, JWT token)
 */
export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let schoolId: string | undefined;

    // Method 1: Extract from X-Tenant-ID header (for API clients)
    const tenantHeader = req.headers['x-tenant-id'] as string;
    if (tenantHeader) {
      schoolId = tenantHeader;
    }

    // Method 2: Extract from subdomain (e.g., school123.studystreaks.co.uk)
    if (!schoolId) {
      const host = req.get('host');
      if (host && host.includes('.studystreaks.')) {
        const subdomain = host.split('.')[0];
        if (subdomain && subdomain !== 'www' && subdomain !== 'admin') {
          schoolId = subdomain;
        }
      }
    }

    // Method 3: Extract from Authorization token (will be implemented with NextAuth)
    if (!schoolId && req.headers.authorization) {
      // TODO: Extract from JWT token when NextAuth integration is complete
      // const token = req.headers.authorization.replace('Bearer ', '');
      // schoolId = extractSchoolIdFromToken(token);
    }

    // For development: allow a default tenant if none specified
    if (!schoolId && process.env.NODE_ENV === 'development') {
      schoolId = process.env.DEFAULT_TENANT_ID || 'dev-school-001';
      logger.warn('Using default tenant for development', { schoolId });
    }

    if (!schoolId) {
      throw createApiError('Tenant identification required', 400);
    }

    // Validate tenant exists (simplified for now)
    const tenantContext: TenantContext = {
      schoolId,
      schoolName: `School ${schoolId}`, // TODO: Load from database
      domain: req.get('host'),
      settings: {
        gdprCompliance: true,
        dataRetentionDays: 2555, // 7 years
        allowParentAccess: true,
      }
    };

    // Store tenant context for use in routes
    res.locals.tenantContext = tenantContext;

    logger.debug('Tenant context established', {
      schoolId: tenantContext.schoolId,
      host: req.get('host'),
      method: req.method,
      path: req.path,
    });

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to get tenant context from response locals
 */
export const getTenantContext = (res: Response): TenantContext => {
  if (!res.locals.tenantContext) {
    throw createApiError('Tenant context not found', 500);
  }
  return res.locals.tenantContext;
};