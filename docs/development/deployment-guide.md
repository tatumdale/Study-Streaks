# Deployment Guide

## Overview

This guide covers the deployment strategies and procedures for StudyStreaks across different environments. The platform is designed for high availability, security, and compliance with UK educational data protection requirements.

## Deployment Architecture

### Environment Strategy

```mermaid
graph LR
    DEV[Development<br/>Local Docker]
    STAGING[Staging<br/>Production-like]
    PROD[Production<br/>High Availability]
    
    DEV --> STAGING
    STAGING --> PROD
    
    subgraph "Infrastructure"
        VERCEL[Vercel<br/>App Hosting]
        SUPABASE[Supabase<br/>Database]
        AWS[AWS<br/>File Storage]
        REDIS[Redis Cloud<br/>Caching]
    end
    
    STAGING --> VERCEL
    PROD --> VERCEL
    STAGING --> SUPABASE
    PROD --> SUPABASE
```

### Deployment Targets

| Environment | Purpose | Infrastructure | Data |
|-------------|---------|----------------|------|
| **Development** | Local development | Docker Compose | Test data |
| **Staging** | Pre-production testing | Vercel + Supabase | Anonymized prod data |
| **Production** | Live platform | Vercel + AWS + Redis | Live school data |

## Production Infrastructure

### Core Services

#### 1. Application Hosting (Vercel)

**Configuration:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_SECRET_KEY": "@supabase-secret-key"
  },
  "build": {
    "env": {
      "SKIP_ENV_VALIDATION": "true"
    }
  }
}
```

**Benefits:**
- Global CDN for optimal performance
- Automatic HTTPS with edge caching
- Serverless functions for API routes
- Built-in monitoring and analytics

#### 2. Database (Supabase)

**Production Configuration:**
```sql
-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policies
CREATE POLICY tenant_isolation_users ON users
  FOR ALL USING (school_id = current_setting('app.current_tenant')::UUID);

CREATE POLICY tenant_isolation_students ON students
  FOR ALL USING (school_id = current_setting('app.current_tenant')::UUID);
```

**Features:**
- PostgreSQL 15 with global distribution
- Automatic backups and point-in-time recovery
- Built-in authentication and real-time subscriptions
- Database-level security with RLS

#### 3. File Storage (AWS S3)

**S3 Configuration:**
```json
{
  "bucket": "studystreaks-production-files",
  "region": "eu-west-2",
  "versioning": "Enabled",
  "encryption": {
    "type": "aws:kms",
    "kmsKeyId": "alias/studystreaks-s3-key"
  },
  "lifecycle": {
    "rules": [
      {
        "id": "homework-evidence-lifecycle",
        "status": "Enabled",
        "transitions": [
          {
            "days": 30,
            "storageClass": "STANDARD_IA"
          },
          {
            "days": 90,
            "storageClass": "GLACIER"
          }
        ]
      }
    ]
  }
}
```

#### 4. Caching (Redis Cloud)

**Redis Configuration:**
```bash
# Connection settings
REDIS_URL=rediss://username:password@endpoint:port
REDIS_TLS_ENABLED=true
REDIS_MAX_CONNECTIONS=100

# Memory optimization
maxmemory-policy allkeys-lru
timeout 300
```

## Environment Setup

### Staging Environment

#### 1. Vercel Staging Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Setup staging environment
vercel --prod=false

# Configure environment variables
vercel env add DATABASE_URL staging
vercel env add NEXTAUTH_SECRET staging
vercel env add SUPABASE_URL staging
```

#### 2. Database Setup

```bash
# Create staging database
npx supabase projects create studystreaks-staging

# Run migrations
npx prisma migrate deploy

# Seed with test data
npm run db:seed:staging
```

### Production Environment

#### 1. Infrastructure Provisioning

```bash
# Create production project
vercel --prod

# Setup custom domain
vercel domains add studystreaks.co.uk
vercel domains add admin.studystreaks.co.uk

# Configure DNS
# Add CNAME records pointing to Vercel
```

#### 2. Environment Variables

```bash
# Production environment configuration
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SECRET_KEY production
vercel env add REDIS_URL production
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production
vercel env add ENCRYPTION_KEY production
```

#### 3. Security Configuration

```bash
# SSL/TLS Configuration
vercel certs add studystreaks.co.uk

# Security headers
vercel env add SECURITY_HEADERS production
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run tests
        run: pnpm run test:ci
      
      - name: Run security checks
        run: pnpm audit --audit-level high

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project Artifacts
        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}

  post-deploy:
    needs: deploy-production
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Health check
        run: |
          curl -f https://studystreaks.co.uk/api/health || exit 1
      
      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'StudyStreaks deployed to production successfully!'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## Database Migrations

### Migration Strategy

#### 1. Development Migrations

```bash
# Create new migration
npx prisma migrate dev --name add-new-feature

# Reset development database
npx prisma migrate reset
```

#### 2. Production Migrations

```bash
# Generate migration
npx prisma migrate dev --create-only --name production-change

# Review migration SQL
cat prisma/migrations/*/migration.sql

# Deploy to production
npx prisma migrate deploy
```

#### 3. Migration Best Practices

```sql
-- Always use transactions for data migrations
BEGIN;

-- Add new column with default value
ALTER TABLE students ADD COLUMN new_field VARCHAR(255) DEFAULT '';

-- Backfill existing data if needed
UPDATE students SET new_field = 'default_value' WHERE new_field = '';

-- Add constraints after data is populated
ALTER TABLE students ALTER COLUMN new_field SET NOT NULL;

COMMIT;
```

### Zero-Downtime Deployments

#### 1. Backwards Compatible Changes

```sql
-- Good: Add nullable column
ALTER TABLE students ADD COLUMN optional_field TEXT;

-- Good: Add new table
CREATE TABLE new_feature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. Breaking Changes (Multi-step)

```sql
-- Step 1: Add new column
ALTER TABLE students ADD COLUMN new_email VARCHAR(255);

-- Step 2: Deploy application code that writes to both columns
-- (Deploy application)

-- Step 3: Backfill data
UPDATE students SET new_email = email WHERE new_email IS NULL;

-- Step 4: Deploy application code that reads from new column
-- (Deploy application)

-- Step 5: Remove old column
ALTER TABLE students DROP COLUMN email;
```

## Monitoring & Observability

### Application Monitoring

#### 1. Vercel Analytics

```typescript
// Enable analytics in next.config.js
module.exports = {
  experimental: {
    instrumentationHook: true,
  },
  analytics: {
    id: process.env.VERCEL_ANALYTICS_ID,
  },
};
```

#### 2. Error Tracking (Sentry)

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  integrations: [
    new Sentry.Replay({
      maskAllText: true, // GDPR compliance
      blockAllMedia: true,
    }),
  ],
  
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.01,
  
  beforeSend(event) {
    // Remove sensitive data
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});
```

#### 3. Custom Metrics

```typescript
// lib/monitoring.ts
export class MetricsCollector {
  static trackHomeworkSubmission(studentId: string, clubId: string) {
    // Custom metrics for educational insights
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'homework_submitted',
          properties: {
            studentId: hash(studentId), // Anonymized
            clubId,
            timestamp: new Date().toISOString(),
          },
        }),
      });
    }
  }
}
```

### Database Monitoring

```sql
-- Query performance monitoring
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Connection monitoring
SELECT 
  count(*) as active_connections,
  state
FROM pg_stat_activity
GROUP BY state;
```

### Infrastructure Monitoring

```bash
# Health check endpoint
# /api/health
{
  "status": "healthy",
  "timestamp": "2024-03-15T10:30:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "storage": "healthy"
  },
  "version": "1.2.3"
}
```

## Security in Production

### Environment Security

#### 1. Environment Variables

```bash
# Production secrets management
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production --sensitive

# Verify no secrets in logs
vercel logs --since=1h | grep -i "password\|secret\|key" && echo "WARNING: Secrets found in logs!"
```

#### 2. HTTPS Configuration

```typescript
// next.config.js security headers
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  }
];
```

#### 3. Rate Limiting

```typescript
// API rate limiting in production
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});
```

## Backup & Recovery

### Database Backups

#### 1. Automated Backups (Supabase)

```bash
# Verify backup configuration
curl -X GET \
  'https://api.supabase.com/v1/projects/{project-id}/config/database' \
  -H 'Authorization: Bearer {access-token}'

# Manual backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

#### 2. File Storage Backups

```bash
# S3 backup script
#!/bin/bash
aws s3 sync s3://studystreaks-production-files s3://studystreaks-backups/$(date +%Y%m%d)/

# Cross-region replication
aws s3api put-bucket-replication \
  --bucket studystreaks-production-files \
  --replication-configuration file://replication.json
```

### Disaster Recovery

#### 1. Recovery Procedures

```bash
# Database recovery
psql $RECOVERY_DATABASE_URL < backup-20240315.sql

# File recovery
aws s3 sync s3://studystreaks-backups/20240315/ s3://studystreaks-production-files/

# Application redeploy
vercel --prod
```

#### 2. Recovery Testing

```bash
# Quarterly DR test script
#!/bin/bash
echo "Starting disaster recovery test..."

# Create test environment
vercel env add TEST_DATABASE_URL test

# Restore from backup
psql $TEST_DATABASE_URL < latest-backup.sql

# Run health checks
curl -f https://test.studystreaks.co.uk/api/health

echo "DR test completed successfully"
```

## Performance Optimization

### Build Optimization

```typescript
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  
  images: {
    domains: ['studystreaks-assets.s3.amazonaws.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};
```

### Database Optimization

```sql
-- Production indexes
CREATE INDEX CONCURRENTLY idx_students_school_year 
ON students(school_id, year_group);

CREATE INDEX CONCURRENTLY idx_homework_student_date 
ON homework_completions(student_id, completion_date DESC);

-- Connection pooling
-- pgbouncer configuration in Supabase
```

### CDN Configuration

```typescript
// Vercel edge functions for caching
export const config = {
  runtime: 'edge',
  regions: ['lhr1', 'fra1'], // London, Frankfurt for UK coverage
};

export default async function handler(req: Request) {
  const response = await fetch(/* API call */);
  
  return new Response(response.body, {
    headers: {
      ...response.headers,
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
    },
  });
}
```

## Compliance & Governance

### GDPR Compliance in Production

#### 1. Data Processing Records

```typescript
// Audit logging in production
export async function logDataAccess(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resourceType,
      resourceId,
      timestamp: new Date(),
      ipAddress: getClientIP(),
      userAgent: getUserAgent(),
    },
  });
}
```

#### 2. Data Retention Automation

```typescript
// Automated data retention job
export async function cleanupExpiredData() {
  const expiredStudents = await prisma.student.findMany({
    where: {
      dataRetentionUntil: {
        lt: new Date(),
      },
    },
  });

  for (const student of expiredStudents) {
    // Log deletion for compliance
    await logDataAccess(
      'system',
      'DELETE',
      'student',
      student.id
    );

    // Delete associated data
    await prisma.homeworkCompletion.deleteMany({
      where: { studentId: student.id },
    });

    await prisma.student.delete({
      where: { id: student.id },
    });
  }
}
```

### Security Compliance

#### 1. Vulnerability Scanning

```bash
# Production security scan
npm audit --audit-level high
snyk test --severity-threshold=high

# Container scanning
docker scan studystreaks:latest
```

#### 2. Penetration Testing

```bash
# Automated security testing
zap-baseline.py -t https://studystreaks.co.uk

# Manual testing checklist
# - Authentication bypass attempts
# - SQL injection testing
# - XSS vulnerability testing
# - CSRF protection verification
# - Rate limiting validation
```

## Troubleshooting

### Common Deployment Issues

#### 1. Build Failures

```bash
# Debug build issues
vercel build --debug

# Check build logs
vercel logs --since=1h

# Environment variable issues
vercel env ls
```

#### 2. Database Connection Issues

```bash
# Test database connectivity
npx prisma db push --preview-feature

# Check connection pool
SELECT count(*) FROM pg_stat_activity;

# Reset connections
pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';
```

#### 3. Performance Issues

```bash
# Check API response times
curl -w "%{time_total}" https://studystreaks.co.uk/api/health

# Database query analysis
EXPLAIN ANALYZE SELECT * FROM students WHERE school_id = 'school-1';

# Memory usage monitoring
NODE_OPTIONS="--max-old-space-size=1024" npm start
```

### Emergency Procedures

#### 1. Service Outage

```bash
# Rollback deployment
vercel rollback

# Check service status
curl -f https://studystreaks.co.uk/api/health

# Emergency communication
# Send status update to schools via email/SMS
```

#### 2. Security Incident

```bash
# Immediate response
# 1. Isolate affected systems
# 2. Preserve evidence
# 3. Notify stakeholders
# 4. Begin incident response

# Evidence collection
vercel logs --since=24h > incident-logs.txt
pg_dump $DATABASE_URL > incident-db-backup.sql
```

This deployment guide ensures StudyStreaks can be reliably deployed to production while maintaining security, performance, and compliance standards required for UK educational institutions.