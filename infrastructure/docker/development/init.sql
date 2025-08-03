-- StudyStreaks Database Initialization Script
-- This script sets up the basic database structure for development

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create development user if not exists (password set via environment variables)
-- Note: Password is configured through POSTGRES_PASSWORD environment variable

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE studystreaks_dev TO studystreaks_dev;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO studystreaks_dev;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO studystreaks_dev;

-- Set up Row Level Security for multi-tenancy (Prisma will handle the actual RLS policies)
ALTER DATABASE studystreaks_dev SET row_security = on;

-- Create a simple health check table
CREATE TABLE IF NOT EXISTS health_check (
    id SERIAL PRIMARY KEY,
    status TEXT DEFAULT 'healthy',
    checked_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO health_check (status) VALUES ('initialized') ON CONFLICT DO NOTHING;