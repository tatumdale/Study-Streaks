import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/error-handler';
import { tenantMiddleware } from '@/middleware/tenant';
import { authMiddleware } from '@/middleware/auth';
import { healthRouter } from '@/routes/health';
import { studentsRouter } from '@/routes/students';
import { clubsRouter } from '@/routes/clubs';
import { achievementsRouter } from '@/routes/achievements';

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration for multi-tenant support
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests from web app and admin dashboard
    const allowedOrigins = [
      'http://localhost:3000', // Web app
      'http://localhost:3001', // Admin dashboard
      'https://studystreaks.co.uk',
      'https://admin.studystreaks.co.uk'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    tenant: req.headers['x-tenant-id'],
  });
  next();
});

// Health check (no auth required)
app.use('/api/health', healthRouter);

// Multi-tenant context middleware
app.use('/api', tenantMiddleware);

// Authentication middleware for protected routes
app.use('/api', authMiddleware);

// Protected API routes
app.use('/api/students', studentsRouter);
app.use('/api/clubs', clubsRouter);
app.use('/api/achievements', achievementsRouter);

// Hello World endpoint for testing
app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello World from StudyStreaks API! 🎉',
    service: 'StudyStreaks API Service',
    version: '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    tenant: res.locals.tenantContext?.schoolId || 'unknown',
    features: [
      'Multi-tenant architecture',
      'GDPR-compliant data handling',
      'Study streak tracking',
      'Homework completion monitoring',
      'Achievement system',
      'School club management'
    ]
  });
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`StudyStreaks API Server running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
  });
});

export default app;