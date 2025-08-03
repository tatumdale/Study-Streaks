# StudyStreaks Database Design

## Overview

The StudyStreaks database is designed with a multi-tenant architecture using PostgreSQL with Row Level Security (RLS) to ensure complete data isolation between schools. The schema supports the core educational workflows while maintaining strict GDPR compliance and ICO Children's Code requirements.

## Core Design Principles

### 1. Multi-Tenancy with Row Level Security
- **Tenant Isolation**: Every data row includes a `schoolId` for tenant separation
- **Database-Level Security**: PostgreSQL RLS policies enforce data boundaries
- **Application-Level Validation**: Multiple layers of tenant context validation
- **Audit Compliance**: Complete traceability of data access and modifications

### 2. GDPR & Privacy by Design
- **Data Minimization**: Only essential educational data is collected
- **Consent Tracking**: Comprehensive parental consent management
- **Right to be Forgotten**: Automated data deletion workflows
- **Data Retention**: Automated cleanup based on retention policies

### 3. Educational Data Model
- **UK Primary School Focus**: Reception to Year 6 (ages 4-11)
- **Subject-Based Structure**: Homework clubs organized by academic subjects
- **Progressive Levels**: Skill-based advancement within each subject area
- **Buddy System Support**: Small group collaboration features

## Entity Relationship Overview

```mermaid
erDiagram
    School ||--o{ User : contains
    School ||--o{ Class : has
    School ||--o{ Club : offers
    School ||--o{ HomeworkCompletion : tracks
    
    User ||--o{ Teacher : "can be"
    User ||--o{ Student : "can be"
    User ||--o{ Parent : "can be"
    User ||--o{ SchoolAdmin : "can be"
    
    User ||--o{ UserRole : has
    Role ||--o{ UserRole : assigned
    Role ||--o{ RolePermission : grants
    Permission ||--o{ RolePermission : defines
    
    Class ||--o{ Student : enrolls
    Class ||--o{ TeacherClass : "taught by"
    Teacher ||--o{ TeacherClass : teaches
    
    Club ||--o{ HomeworkCompletion : tracks
    Student ||--o{ HomeworkCompletion : submits
    
    Parent ||--o{ ParentStudent : "guardian of"
    Student ||--o{ ParentStudent : "child of"
```

## Core Entity Categories

### 1. Tenant & Identity Management

#### School Entity
- **Purpose**: Root tenant entity representing each primary school
- **Key Features**:
  - UK school identifiers (URN, DfE numbers)
  - School configuration and branding
  - Multi-tenant isolation boundary
  - GDPR compliance settings

#### User Management
- **Base User**: Authentication and account management
- **Teacher Profile**: Professional identity and qualifications
- **Student Profile**: Educational record with minimal PII
- **Parent Profile**: Contact information and preferences
- **School Admin**: Administrative access and oversight

### 2. Educational Structure

#### Class Management
- **Year Group Support**: Reception through Year 6
- **Mixed-Age Classes**: Support for combined year groups
- **Key Stage Alignment**: EYFS, KS1, KS2 categorization
- **Teacher Assignments**: Multiple teachers per class support

#### Subject-Based Clubs
- **Core Subjects**: Mathematics, English, Science clubs
- **Topic Areas**: Cross-curricular project clubs
- **Progressive Levels**: Skill-based advancement tracking
- **Evidence Types**: Various homework submission formats

### 3. Gamification & Progress Tracking

#### Homework Completion System
- **Evidence Capture**: Photo, audio, written work submissions
- **Verification Workflow**: Teacher review and approval process
- **Time Tracking**: Completion duration and punctuality
- **Parent Involvement**: Optional parent notes and support

#### Achievement System
- **Streak Tracking**: Consecutive completion monitoring
- **Experience Points**: Gamified progress measurement
- **Badge System**: Achievement recognition and motivation
- **Leaderboards**: Class and school-wide progress displays

### 4. Role-Based Access Control (RBAC)

#### Permission Framework
- **Granular Permissions**: Resource and action-specific access
- **Role Templates**: Pre-defined roles for common use cases
- **Custom Roles**: School-specific role customization
- **Temporal Access**: Time-limited role assignments

#### Security Contexts
- **School Scope**: All permissions automatically school-bounded
- **Class Scope**: Teacher access limited to assigned classes
- **Student Scope**: Parent access limited to their children
- **Data Scope**: Fine-grained data access controls

## Data Protection & Compliance

### GDPR Implementation

#### Consent Management
```sql
-- Student consent tracking
student_consent {
  studentId: String
  consentGiven: Boolean
  consentGivenBy: String (parent identifier)
  consentDate: DateTime
  consentWithdrawn: Boolean
  withdrawalDate: DateTime?
}
```

#### Data Retention
```sql
-- Automatic data retention management
data_retention_policy {
  entityType: String
  retentionPeriod: Integer (years)
  deletionDate: DateTime
  isActive: Boolean
}
```

### ICO Children's Code Compliance

#### Age-Appropriate Data Collection
- **Minimal Data**: Only essential educational information
- **No Profiling**: No behavioral analysis or targeting
- **Parental Controls**: Complete oversight of child data
- **Transparency**: Clear, child-friendly privacy notices

#### Privacy by Default
- **Default Settings**: Most privacy-protective options enabled
- **Data Sharing**: Explicit consent required for any sharing
- **Location Data**: No geolocation tracking or storage
- **Marketing**: No marketing or promotional communications

## Database Schema Highlights

### Multi-Tenant Architecture

```sql
-- Every entity includes tenant isolation
CREATE TABLE users (
  id UUID PRIMARY KEY,
  school_id UUID NOT NULL, -- Tenant boundary
  email TEXT UNIQUE NOT NULL,
  -- ... other fields
);

-- Row Level Security policy example
CREATE POLICY tenant_isolation ON users
  FOR ALL TO authenticated_user
  USING (school_id = current_setting('app.current_tenant')::UUID);
```

### Audit Trail Implementation

```sql
-- Comprehensive audit logging
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  school_id UUID NOT NULL,
  user_id UUID,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- CREATE, UPDATE, DELETE, READ
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);
```

### Performance Optimizations

#### Indexing Strategy
```sql
-- Multi-tenant aware indexes
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_students_school_year ON students(school_id, year_group);
CREATE INDEX idx_homework_school_date ON homework_completions(school_id, completion_date);

-- Composite indexes for common queries
CREATE INDEX idx_teacher_classes ON teacher_classes(school_id, teacher_id, is_active);
CREATE INDEX idx_parent_students ON parent_students(school_id, parent_id, is_primary_contact);
```

#### Query Optimization
- **Prepared Statements**: All queries use parameterized statements
- **Connection Pooling**: Efficient database connection management
- **Query Caching**: Prisma-level query result caching
- **Batch Operations**: Bulk inserts and updates for efficiency

## Data Security Measures

### Encryption Standards
- **At Rest**: AES-256 encryption for sensitive data columns
- **In Transit**: TLS 1.3 for all database connections
- **Application Level**: Additional encryption for PII data
- **Key Management**: Secure key rotation and storage

### Access Controls
- **Database Users**: Separate users for different application contexts
- **Connection Limits**: Restricted connection counts per user
- **IP Restrictions**: Database access limited to application servers
- **SSL Enforcement**: Required encrypted connections

### Backup & Recovery
- **Automated Backups**: Daily encrypted backups with retention policy
- **Point-in-Time Recovery**: Granular recovery capabilities
- **Disaster Recovery**: Geographic backup distribution
- **Testing**: Regular backup restoration testing

## Data Migration & Maintenance

### Schema Evolution
- **Prisma Migrations**: Version-controlled database schema changes
- **Backward Compatibility**: Safe migration paths for existing data
- **Data Validation**: Comprehensive validation during migrations
- **Rollback Procedures**: Safe rollback mechanisms for failed migrations

### Data Lifecycle Management
- **Archival Process**: Automated archival of historical data
- **Deletion Workflows**: GDPR-compliant data deletion procedures
- **Data Export**: Structured data export for portability rights
- **Anonymization**: Data anonymization for analytics purposes

## Monitoring & Observability

### Database Monitoring
- **Performance Metrics**: Query performance and resource utilization
- **Connection Monitoring**: Active connection tracking and limits
- **Error Tracking**: Database error logging and alerting
- **Capacity Planning**: Storage and performance trend analysis

### Compliance Monitoring
- **Access Auditing**: Regular access pattern analysis
- **Data Usage Tracking**: Monitor data access for compliance
- **Policy Enforcement**: Automated policy compliance checking
- **Reporting**: Regular compliance status reporting

This database design provides a robust, secure, and compliant foundation for the StudyStreaks platform while supporting the unique requirements of UK primary education.