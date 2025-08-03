import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error details
  logger.error('API Error', {
    error: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    tenant: res.locals.tenantContext?.schoolId,
  });

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Create error response
  const errorResponse: any = {
    error: true,
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
  };

  // In development, include stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      path: req.path,
      method: req.method,
    };
  }

  // Don't expose sensitive information in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    errorResponse.message = 'Something went wrong. Please try again later.';
  }

  res.status(statusCode).json(errorResponse);
};

export const createApiError = (
  message: string, 
  statusCode: number = 500,
  isOperational: boolean = true
): ApiError => {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  return error;
};