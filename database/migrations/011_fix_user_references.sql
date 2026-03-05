-- Fix saved_jobs table to use user_id
ALTER TABLE saved_jobs DROP CONSTRAINT IF EXISTS saved_jobs_candidate_id_fkey;
ALTER TABLE saved_jobs DROP COLUMN IF EXISTS candidate_id;
ALTER TABLE saved_jobs ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id);

-- Fix job_applications to make candidate_id nullable
ALTER TABLE job_applications ALTER COLUMN candidate_id DROP NOT NULL;
