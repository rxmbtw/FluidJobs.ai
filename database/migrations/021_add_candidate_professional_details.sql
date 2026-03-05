-- Migration to add professional details to candidates table
-- Created for Phase 1 Candidate Tracker

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS last_working_day VARCHAR(255);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS mode_of_job VARCHAR(50);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS currently_employed VARCHAR(10);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS current_salary VARCHAR(50);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS expected_salary VARCHAR(50);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS notice_period VARCHAR(50);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS joining_date VARCHAR(50);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50);

-- Create index for filtering if needed
CREATE INDEX IF NOT EXISTS idx_candidates_job_title ON candidates(job_title);
