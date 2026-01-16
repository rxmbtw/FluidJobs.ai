-- Fix saved_jobs table to use candidate_id instead of user_id
ALTER TABLE saved_jobs DROP CONSTRAINT IF EXISTS saved_jobs_user_id_fkey;
ALTER TABLE saved_jobs DROP CONSTRAINT IF EXISTS saved_jobs_user_id_job_id_key;

-- Change user_id to candidate_id with VARCHAR type
ALTER TABLE saved_jobs RENAME COLUMN user_id TO candidate_id;
ALTER TABLE saved_jobs ALTER COLUMN candidate_id TYPE VARCHAR(50);

-- Add foreign key to candidates table
ALTER TABLE saved_jobs ADD CONSTRAINT saved_jobs_candidate_id_fkey 
  FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id) ON DELETE CASCADE;

-- Add unique constraint
ALTER TABLE saved_jobs ADD CONSTRAINT saved_jobs_candidate_id_job_id_key 
  UNIQUE(candidate_id, job_id);

-- Recreate indexes
DROP INDEX IF EXISTS idx_saved_jobs_user;
CREATE INDEX idx_saved_jobs_candidate ON saved_jobs(candidate_id);
