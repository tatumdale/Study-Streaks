-- StudyStreaks Database Initialization Script
-- This script sets up the basic database structure for development

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create development user if not exists
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'studystreaks_dev') THEN
      CREATE ROLE studystreaks_dev WITH LOGIN PASSWORD 'devpass123';
   END IF;
END
$$;

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