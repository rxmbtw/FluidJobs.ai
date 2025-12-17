-- Add no_of_openings column to jobs_enhanced table
ALTER TABLE jobs_enhanced 
ADD COLUMN IF NOT EXISTS no_of_openings INTEGER DEFAULT 1;

-- Add no_of_openings column to job_drafts table
ALTER TABLE job_drafts 
ADD COLUMN IF NOT EXISTS no_of_openings INTEGER DEFAULT 1;
