-- Create saved_jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
  saved_job_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id INTEGER NOT NULL REFERENCES jobs_enhanced(id) ON DELETE CASCADE,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job ON saved_jobs(job_id);

-- Fix job_applications to make candidate_id nullable
ALTER TABLE job_applications ALTER COLUMN candidate_id DROP NOT NULL;
