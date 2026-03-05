-- Migration: Add Job Settings Fields to jobs_enhanced table
-- This migration adds fields that exist in Job Settings but are missing from Create Job form

-- Add department field
ALTER TABLE jobs_enhanced 
  ADD COLUMN IF NOT EXISTS department VARCHAR(100);

-- Add requirements array field
ALTER TABLE jobs_enhanced 
  ADD COLUMN IF NOT EXISTS requirements TEXT[];

-- Add currency field (defaults to INR)
ALTER TABLE jobs_enhanced 
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';

-- Add hiring manager reference
ALTER TABLE jobs_enhanced 
  ADD COLUMN IF NOT EXISTS hiring_manager_id INTEGER REFERENCES users(id);

-- Add assigned recruiters array
ALTER TABLE jobs_enhanced 
  ADD COLUMN IF NOT EXISTS assigned_recruiters INTEGER[];

-- Add interview stages array
ALTER TABLE jobs_enhanced 
  ADD COLUMN IF NOT EXISTS interview_stages TEXT[];

-- Add company field if not exists (from schema but not used)
ALTER TABLE jobs_enhanced 
  ADD COLUMN IF NOT EXISTS company VARCHAR(255);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_enhanced_department ON jobs_enhanced(department);
CREATE INDEX IF NOT EXISTS idx_jobs_enhanced_hiring_manager ON jobs_enhanced(hiring_manager_id);

-- Add comments for documentation
COMMENT ON COLUMN jobs_enhanced.department IS 'Department or team the job belongs to';
COMMENT ON COLUMN jobs_enhanced.requirements IS 'Array of job requirements/qualifications';
COMMENT ON COLUMN jobs_enhanced.currency IS 'Salary currency (INR, USD, EUR, GBP, etc.)';
COMMENT ON COLUMN jobs_enhanced.hiring_manager_id IS 'User ID of the hiring manager';
COMMENT ON COLUMN jobs_enhanced.assigned_recruiters IS 'Array of user IDs for assigned recruiters';
COMMENT ON COLUMN jobs_enhanced.interview_stages IS 'Array of interview stage names in order';

-- Set default interview stages for existing jobs without stages
UPDATE jobs_enhanced 
SET interview_stages = ARRAY[
  'Screening',
  'Technical Assessment',
  'L1 Technical',
  'L2 Technical',
  'HR Round',
  'Management Round'
]
WHERE interview_stages IS NULL OR array_length(interview_stages, 1) IS NULL;

-- Set default currency for existing jobs
UPDATE jobs_enhanced 
SET currency = 'INR'
WHERE currency IS NULL;
