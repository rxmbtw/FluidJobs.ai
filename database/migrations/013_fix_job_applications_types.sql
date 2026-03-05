-- Fix job_applications table to use VARCHAR for candidate_id and user_id
-- to match the candidates table structure

-- Drop existing constraints and indexes
DROP INDEX IF EXISTS idx_job_applications_candidate;
ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS job_applications_user_id_fkey;

-- Change data types
ALTER TABLE job_applications ALTER COLUMN candidate_id TYPE VARCHAR(50);
ALTER TABLE job_applications ALTER COLUMN user_id TYPE VARCHAR(50);

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_candidate ON job_applications(candidate_id);

-- Add comment
COMMENT ON COLUMN job_applications.candidate_id IS 'References candidates.candidate_id (VARCHAR)';
COMMENT ON COLUMN job_applications.user_id IS 'User identifier (VARCHAR to match candidate_id)';