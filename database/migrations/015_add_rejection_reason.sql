-- Add rejection_reason column to jobs_enhanced table
ALTER TABLE jobs_enhanced 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_enhanced_rejection_reason ON jobs_enhanced(rejection_reason) WHERE rejection_reason IS NOT NULL;